const API_VERSION = '2024-01';

function shopifyFetch(domain: string, token: string, path: string, params?: Record<string, string>) {
	const url = new URL(`https://${domain}/admin/api/${API_VERSION}${path}.json`);
	if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
	return fetch(url.toString(), {
		headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' }
	});
}

function shopifyGraphQL(domain: string, token: string, query: string, variables?: Record<string, unknown>) {
	return fetch(`https://${domain}/admin/api/${API_VERSION}/graphql.json`, {
		method: 'POST',
		headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' },
		body: JSON.stringify({ query, variables })
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

const PRODUCTS_QUERY = `
query fetchProducts($cursor: String) {
  products(first: 250, after: $cursor, query: "status:active bundles:false") {
    pageInfo { hasNextPage endCursor }
    edges {
      node {
        id
        title
        images(first: 20) {
          edges {
            node {
              id
              url
              altText
            }
          }
        }
        media(first: 20) {
          edges {
            node {
              ... on MediaImage {
                id
                image { url }
              }
            }
          }
        }
        variants(first: 100) {
          edges {
            node {
              id
              title
              sku
              inventoryQuantity
              image { id url }
            }
          }
        }
      }
    }
  }
}
`;

function gidToId(gid: string): number {
	return parseInt(gid.split('/').pop() ?? '0', 10);
}

export async function fetchProducts(domain: string, token: string): Promise<ShopifyProduct[]> {
	const products: ShopifyProduct[] = [];
	let cursor: string | null = null;

	while (true) {
		const res = await shopifyGraphQL(domain, token, PRODUCTS_QUERY, { cursor });
		if (!res.ok) throw new Error(`Shopify GraphQL failed: ${res.status}`);
		const json = await res.json();

		if (json.errors) throw new Error(`Shopify GraphQL error: ${JSON.stringify(json.errors)}`);

		const conn = json.data.products;

		for (const { node } of conn.edges) {
			const productId = gidToId(node.id);

			// Build images array compatible with existing resolveVariantImage logic
			const images = node.images.edges.map(({ node: img }: any) => ({
				id: gidToId(img.id),
				src: img.url,
				variant_ids: [] as number[]
			}));

			const variants: ShopifyVariant[] = node.variants.edges.map(({ node: v }: any) => ({
				id: gidToId(v.id),
				product_id: productId,
				title: v.title,
				sku: v.sku ?? '',
				inventory_quantity: v.inventoryQuantity ?? 0,
				inventory_item_id: 0,
				image_id: v.image ? gidToId(v.image.id) : null,
				_variantImageUrl: v.image?.url ?? null
			}));

			// Populate variant_ids on images so resolveVariantImage works
			for (const variant of variants) {
				if ((variant as any)._variantImageUrl) {
					const matchImg = images.find((img: any) => img.src === (variant as any)._variantImageUrl);
					if (matchImg) matchImg.variant_ids.push(variant.id);
				}
			}

			products.push({ id: productId, title: node.title, status: 'active', images, variants });
		}

		if (!conn.pageInfo.hasNextPage) break;
		cursor = conn.pageInfo.endCursor;
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

	let pageInfo: string | null = null;
	while (true) {
		const params: Record<string, string> = pageInfo
			? { limit: '250', page_info: pageInfo }
			: { limit: '250', status: 'any', created_at_min: d90, fields: 'line_items,created_at,cancel_reason' };

		const res = await shopifyFetch(domain, token, '/orders', params);
		if (!res.ok) throw new Error(`Shopify orders fetch failed: ${res.status}`);
		const data = await res.json();

		for (const order of data.orders) {
			if (order.cancel_reason) continue;
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

export function calcRecommendation(sales30: number, currentStock: number, leadDays: number, coverDays = 30): number {
	const dailyVelocity = sales30 / 30;
	return Math.max(0, Math.ceil(dailyVelocity * (leadDays + coverDays) - currentStock));
}

export function resolveVariantImage(product: ShopifyProduct, variant: ShopifyVariant): string | null {
	// Direct variant image from GraphQL
	if ((variant as any)._variantImageUrl) return (variant as any)._variantImageUrl;

	if (variant.image_id) {
		const img = product.images.find((i) => i.id === variant.image_id);
		if (img) return img.src;
	}
	const byVariant = product.images.find((i) => i.variant_ids?.includes(variant.id));
	if (byVariant) return byVariant.src;
	return product.images[0]?.src ?? null;
}
