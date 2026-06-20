const API_VERSION = '2024-01';

function shopifyFetch(domain: string, token: string, path: string, params?: Record<string, string>) {
	const url = new URL(`https://${domain}/admin/api/${API_VERSION}${path}.json`);
	if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
	return fetch(url.toString(), {
		headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' }
	});
}

export interface ShopifyVariant {
	id: number;
	product_id: number;
	title: string;
	sku: string;
	inventory_quantity: number;
	inventory_item_id: number;
	image_id: number | null;
}

export interface ShopifyProduct {
	id: number;
	title: string;
	status: string;
	images: Array<{ id: number; src: string; variant_ids: number[] }>;
	variants: ShopifyVariant[];
}

export async function fetchProducts(domain: string, token: string): Promise<ShopifyProduct[]> {
	const products: ShopifyProduct[] = [];
	let pageInfo: string | null = null;

	while (true) {
		const params: Record<string, string> = { limit: '250', status: 'active', fields: 'id,title,status,images,variants' };
		if (pageInfo) params.page_info = pageInfo;

		const res = await shopifyFetch(domain, token, '/products', params);
		if (!res.ok) throw new Error(`Shopify products fetch failed: ${res.status}`);

		const data = await res.json();
		products.push(...data.products);

		const link = res.headers.get('link') ?? '';
		const next = link.match(/<[^>]+page_info=([^>&"]+)[^>]*>;\s*rel="next"/);
		if (next) {
			pageInfo = next[1];
		} else {
			break;
		}
	}

	return products;
}

export async function fetchSales(
	domain: string,
	token: string,
	variantIds: number[]
): Promise<Map<number, { s30: number; s60: number; s90: number }>> {
	const now = new Date();
	const d30 = new Date(now.getTime() - 30 * 86400000).toISOString();
	const d60 = new Date(now.getTime() - 60 * 86400000).toISOString();
	const d90 = new Date(now.getTime() - 90 * 86400000).toISOString();

	const map = new Map<number, { s30: number; s60: number; s90: number }>();
	for (const id of variantIds) map.set(id, { s30: 0, s60: 0, s90: 0 });

	// Fetch orders from 90 days back, paginated
	let pageInfo: string | null = null;
	while (true) {
		const params: Record<string, string> = {
			limit: '250',
			status: 'any',
			financial_status: 'paid',
			created_at_min: d90,
			fields: 'line_items,created_at'
		};
		if (pageInfo) params.page_info = pageInfo;

		const res = await shopifyFetch(domain, token, '/orders', params);
		if (!res.ok) throw new Error(`Shopify orders fetch failed: ${res.status}`);
		const data = await res.json();

		for (const order of data.orders) {
			const orderDate = new Date(order.created_at);
			for (const item of order.line_items) {
				const varId = item.variant_id;
				if (!map.has(varId)) continue;
				const entry = map.get(varId)!;
				const qty = item.quantity;
				entry.s90 += qty;
				if (orderDate >= new Date(d60)) entry.s60 += qty;
				if (orderDate >= new Date(d30)) entry.s30 += qty;
			}
		}

		const link = res.headers.get('link') ?? '';
		const next = link.match(/<[^>]+page_info=([^>&"]+)[^>]*>;\s*rel="next"/);
		if (next) pageInfo = next[1]; else break;
	}

	return map;
}

export function calcRecommendation(sales30: number, currentStock: number, leadDays: number): number {
	const dailyVelocity = sales30 / 30;
	return Math.max(0, Math.ceil(dailyVelocity * leadDays - currentStock));
}

/** Resolve variant image: use variant-specific image if available, else product's first image */
export function resolveVariantImage(
	product: ShopifyProduct,
	variant: ShopifyVariant
): string | null {
	if (variant.image_id) {
		const img = product.images.find((i) => i.id === variant.image_id);
		if (img) return img.src;
	}
	// find image that lists this variant
	const byVariant = product.images.find((i) => i.variant_ids?.includes(variant.id));
	if (byVariant) return byVariant.src;
	// fallback to first product image
	return product.images[0]?.src ?? null;
}
