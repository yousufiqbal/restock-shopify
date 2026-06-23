// Amazon SP-API client — EU endpoint, UK marketplace
// Requires env vars: AMAZON_AWS_ACCESS_KEY_ID, AMAZON_AWS_SECRET_ACCESS_KEY

const SP_ENDPOINT = 'https://sellingpartnerapi-eu.amazon.com';
const LWA_TOKEN_URL = 'https://api.amazon.com/auth/o2/token';
const AWS_REGION = 'eu-west-1';
const AWS_SERVICE = 'execute-api';

// Cache LWA access tokens (valid for ~55 min)
const tokenCache = new Map<string, { token: string; exp: number }>();

export async function getLwaToken(clientId: string, clientSecret: string, refreshToken: string): Promise<string> {
	const key = `${clientId}:${refreshToken.slice(-12)}`;
	const cached = tokenCache.get(key);
	if (cached && Date.now() < cached.exp) return cached.token;

	const res = await fetch(LWA_TOKEN_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			grant_type: 'refresh_token',
			refresh_token: refreshToken,
			client_id: clientId,
			client_secret: clientSecret
		})
	});
	if (!res.ok) throw new Error(`LWA token exchange failed: ${res.status} ${await res.text()}`);
	const { access_token, expires_in } = (await res.json()) as { access_token: string; expires_in: number };
	tokenCache.set(key, { token: access_token, exp: Date.now() + (expires_in - 60) * 1000 });
	return access_token;
}

// ---- AWS Sig V4 ----

async function sha256hex(msg: string): Promise<string> {
	const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(msg));
	return Array.from(new Uint8Array(buf))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

async function hmacSHA256(key: ArrayBuffer, msg: string): Promise<ArrayBuffer> {
	const k = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, [
		'sign'
	]);
	return crypto.subtle.sign('HMAC', k, new TextEncoder().encode(msg));
}

async function sigV4Headers(
	method: string,
	url: URL,
	accessToken: string,
	awsKeyId: string,
	awsSecret: string,
	body = '',
	extraHeaders: Record<string, string> = {}
): Promise<Record<string, string>> {
	const now = new Date();
	const amzdate = now
		.toISOString()
		.replace(/[:\-]|\.\d{3}/g, '')
		.slice(0, 15) + 'Z';
	const datestamp = amzdate.slice(0, 8);

	const baseHeaders: Record<string, string> = {
		host: url.host,
		'x-amz-access-token': accessToken,
		'x-amz-date': amzdate,
		...extraHeaders
	};

	const sortedKeys = Object.keys(baseHeaders).sort();
	const canonicalHeaders = sortedKeys.map((k) => `${k}:${baseHeaders[k]}\n`).join('');
	const signedHeaders = sortedKeys.join(';');
	const payloadHash = await sha256hex(body);

	const canonicalRequest = [
		method,
		url.pathname,
		url.searchParams.toString(),
		canonicalHeaders,
		signedHeaders,
		payloadHash
	].join('\n');

	const scope = `${datestamp}/${AWS_REGION}/${AWS_SERVICE}/aws4_request`;
	const stringToSign = ['AWS4-HMAC-SHA256', amzdate, scope, await sha256hex(canonicalRequest)].join('\n');

	let sigKey: ArrayBuffer = new TextEncoder().encode(`AWS4${awsSecret}`).buffer as ArrayBuffer;
	for (const part of [datestamp, AWS_REGION, AWS_SERVICE, 'aws4_request']) {
		sigKey = await hmacSHA256(sigKey, part);
	}
	const sig = Array.from(new Uint8Array(await hmacSHA256(sigKey, stringToSign)))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');

	return {
		...baseHeaders,
		Authorization: `AWS4-HMAC-SHA256 Credential=${awsKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${sig}`
	};
}

export interface SpApiCreds {
	accessToken: string;
	awsKeyId: string;
	awsSecret: string;
}

async function spGet(path: string, params: Record<string, string>, creds: SpApiCreds): Promise<Response> {
	const url = new URL(`${SP_ENDPOINT}${path}`);
	Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
	const headers = await sigV4Headers('GET', url, creds.accessToken, creds.awsKeyId, creds.awsSecret);
	return fetch(url.toString(), { headers });
}

async function spPost(path: string, body: unknown, creds: SpApiCreds): Promise<Response> {
	const url = new URL(`${SP_ENDPOINT}${path}`);
	const bodyStr = JSON.stringify(body);
	const headers = await sigV4Headers('POST', url, creds.accessToken, creds.awsKeyId, creds.awsSecret, bodyStr, {
		'content-type': 'application/json'
	});
	return fetch(url.toString(), { method: 'POST', headers, body: bodyStr });
}

// ---- Product Listings ----

export interface AmazonListing {
	sku: string;
	asin: string;
	title: string;
	imageUrl: string | null;
	currentStock: number;
}

export async function fetchAmazonListings(
	sellerId: string,
	marketplaceId: string,
	creds: SpApiCreds
): Promise<AmazonListing[]> {
	const listings: AmazonListing[] = [];
	let nextToken: string | undefined;

	while (true) {
		const params: Record<string, string> = {
			marketplaceIds: marketplaceId,
			includedData: 'summaries,fulfillmentAvailability',
			pageSize: '20'
		};
		if (nextToken) params.nextToken = nextToken;

		const res = await spGet(
			`/listings/2021-08-01/items/${encodeURIComponent(sellerId)}`,
			params,
			creds
		);
		if (!res.ok) {
			const txt = await res.text();
			throw new Error(`Listings API ${res.status}: ${txt}`);
		}

		const data = (await res.json()) as {
			nextToken?: string;
			items?: Array<{
				sku: string;
				summaries?: Array<{
					itemName?: string;
					asin?: string;
					mainImage?: { link: string };
					status?: string[];
				}>;
				fulfillmentAvailability?: Array<{ fulfillmentChannelCode: string; quantity?: number }>;
			}>;
		};

		for (const item of data.items ?? []) {
			const summary = item.summaries?.[0];
			if (!summary) continue;
			if (summary.status?.includes('INACTIVE') || summary.status?.includes('DELETED')) continue;

			const totalStock =
				item.fulfillmentAvailability?.reduce((sum, f) => sum + (f.quantity ?? 0), 0) ?? 0;

			listings.push({
				sku: item.sku,
				asin: summary.asin ?? item.sku,
				title: summary.itemName ?? item.sku,
				imageUrl: summary.mainImage?.link ?? null,
				currentStock: totalStock
			});
		}

		if (!data.nextToken) break;
		nextToken = data.nextToken;
	}

	return listings;
}

// ---- Reports (for sales data) ----

export async function createOrdersReport(
	marketplaceId: string,
	creds: SpApiCreds
): Promise<string> {
	const now = new Date();
	const d90 = new Date(now.getTime() - 90 * 86400000).toISOString();

	const res = await spPost(
		'/reports/2021-06-30/reports',
		{
			reportType: 'GET_FLAT_FILE_ALL_ORDERS_DATA_BY_ORDER_DATE_TIME_DATA',
			marketplaceIds: [marketplaceId],
			dataStartTime: d90,
			dataEndTime: now.toISOString()
		},
		creds
	);
	if (!res.ok) throw new Error(`Create report failed: ${res.status} ${await res.text()}`);
	const { reportId } = (await res.json()) as { reportId: string };
	return reportId;
}

export async function getReportStatus(
	reportId: string,
	creds: SpApiCreds
): Promise<{ status: string; documentId?: string }> {
	const res = await spGet(`/reports/2021-06-30/reports/${reportId}`, {}, creds);
	if (!res.ok) throw new Error(`Report status ${res.status}: ${await res.text()}`);
	const data = (await res.json()) as { processingStatus: string; reportDocumentId?: string };
	return { status: data.processingStatus, documentId: data.reportDocumentId };
}

export async function downloadReport(documentId: string, creds: SpApiCreds): Promise<string> {
	const res = await spGet(`/reports/2021-06-30/documents/${documentId}`, {}, creds);
	if (!res.ok) throw new Error(`Report doc ${res.status}: ${await res.text()}`);
	const { url } = (await res.json()) as { url: string };
	// Pre-signed S3 URL — no auth needed
	const docRes = await fetch(url);
	if (!docRes.ok) throw new Error(`Download report ${docRes.status}`);
	return docRes.text();
}

export function parseSalesReport(tsv: string): Map<string, { s30: number; s60: number; s90: number }> {
	const lines = tsv.split('\n');
	if (lines.length < 2) return new Map();

	const headers = lines[0].split('\t').map((h) => h.trim().toLowerCase());
	const skuIdx = headers.indexOf('sku');
	const qtyIdx = headers.indexOf('quantity');
	const dateIdx = headers.indexOf('purchase-date');
	const statusIdx = headers.indexOf('order-status');

	if (skuIdx === -1 || qtyIdx === -1 || dateIdx === -1) return new Map();

	const now = Date.now();
	const d30 = now - 30 * 86400000;
	const d60 = now - 60 * 86400000;
	const map = new Map<string, { s30: number; s60: number; s90: number }>();

	for (let i = 1; i < lines.length; i++) {
		const cols = lines[i].split('\t');
		if (cols.length <= Math.max(skuIdx, qtyIdx, dateIdx)) continue;

		const status = statusIdx !== -1 ? cols[statusIdx]?.toLowerCase() : '';
		if (status === 'cancelled' || status === 'pending') continue;

		const sku = cols[skuIdx]?.trim();
		const qty = parseInt(cols[qtyIdx] ?? '0', 10);
		const purchaseTs = new Date(cols[dateIdx]?.trim() ?? '').getTime();

		if (!sku || isNaN(qty) || qty <= 0 || isNaN(purchaseTs)) continue;

		if (!map.has(sku)) map.set(sku, { s30: 0, s60: 0, s90: 0 });
		const entry = map.get(sku)!;
		entry.s90 += qty;
		if (purchaseTs >= d60) entry.s60 += qty;
		if (purchaseTs >= d30) entry.s30 += qty;
	}

	return map;
}
