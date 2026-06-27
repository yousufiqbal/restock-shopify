import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export * from './auth.schema';

export const stores = sqliteTable('stores', {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	name: text('name').notNull(),
	domain: text('domain').notNull().unique(),
	apiToken: text('api_token').notNull(),
	airLeadDays: integer('air_lead_days').notNull().default(15),
	seaLeadDays: integer('sea_lead_days').notNull().default(60),
	createdAt: text('created_at').notNull().default(sql`(datetime('now'))`)
});

export const restockSessions = sqliteTable('restock_sessions', {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	storeId: text('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
	startedAt: text('started_at').notNull().default(sql`(datetime('now'))`),
	completedAt: text('completed_at'),
	notes: text('notes'),
	totalProducts: integer('total_products').notNull().default(0)
});

export const inventorySessions = sqliteTable('inventory_sessions', {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	storeId: text('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
	startedAt: text('started_at').notNull().default(sql`(datetime('now'))`),
	completedAt: text('completed_at'),
	notes: text('notes'),
	totalProducts: integer('total_products').notNull().default(0)
});

export const inventoryItems = sqliteTable('inventory_items', {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	sessionId: text('session_id').notNull().references(() => inventorySessions.id, { onDelete: 'cascade' }),
	productId: text('product_id').notNull(),
	variantId: text('variant_id').notNull(),
	inventoryItemId: text('inventory_item_id').notNull(),
	locationId: text('location_id').notNull(),
	productTitle: text('product_title').notNull(),
	variantTitle: text('variant_title'),
	sku: text('sku'),
	productImageUrl: text('product_image_url'),
	variantImageUrl: text('variant_image_url'),
	currentStock: integer('current_stock').notNull().default(0),
	newStock: integer('new_stock'),
	position: integer('position').notNull().default(0),
	variantPosition: integer('variant_position').notNull().default(0)
});

export const restockItems = sqliteTable('restock_items', {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	sessionId: text('session_id').notNull().references(() => restockSessions.id, { onDelete: 'cascade' }),
	productId: text('product_id').notNull(),
	variantId: text('variant_id').notNull(),
	productTitle: text('product_title').notNull(),
	variantTitle: text('variant_title'),
	sku: text('sku'),
	productImageUrl: text('product_image_url'),
	variantImageUrl: text('variant_image_url'),
	sales30: real('sales_30').notNull().default(0),
	sales60: real('sales_60').notNull().default(0),
	sales90: real('sales_90').notNull().default(0),
	currentStock: integer('current_stock').notNull().default(0),
	recAir: integer('rec_air').notNull().default(0),
	recSea: integer('rec_sea').notNull().default(0),
	actualRestock: integer('actual_restock'),
	skip: integer('skip', { mode: 'boolean' }).notNull().default(false),
	position: integer('position').notNull().default(0),
	variantPosition: integer('variant_position').notNull().default(0),
	orderedAt: text('ordered_at')
});
