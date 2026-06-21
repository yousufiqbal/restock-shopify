import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';

// Read .env manually
const env = Object.fromEntries(
	readFileSync(new URL('../.env', import.meta.url), 'utf8')
		.split('\n')
		.filter(l => l && !l.startsWith('#'))
		.map(l => l.split('=').map(p => p.trim().replace(/^"|"$/g, '')))
		.filter(([k]) => k)
);

const url = env.DATABASE_URL;
const authToken = env.DATABASE_AUTH_TOKEN || undefined;

if (!url) throw new Error('DATABASE_URL not set in .env');
console.log('Connecting to:', url);

const client = createClient({ url, authToken });

const statements = [
	`CREATE TABLE IF NOT EXISTS "user" (
		"id" text PRIMARY KEY NOT NULL,
		"name" text NOT NULL,
		"email" text NOT NULL,
		"email_verified" integer DEFAULT false NOT NULL,
		"image" text,
		"two_factor_enabled" integer DEFAULT false,
		"created_at" integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
		"updated_at" integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
	)`,
	`CREATE UNIQUE INDEX IF NOT EXISTS "user_email_unique" ON "user" ("email")`,
	`CREATE TABLE IF NOT EXISTS "account" (
		"id" text PRIMARY KEY NOT NULL,
		"account_id" text NOT NULL,
		"provider_id" text NOT NULL,
		"user_id" text NOT NULL,
		"access_token" text,
		"refresh_token" text,
		"id_token" text,
		"access_token_expires_at" integer,
		"refresh_token_expires_at" integer,
		"scope" text,
		"password" text,
		"created_at" integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
		"updated_at" integer NOT NULL,
		FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade
	)`,
	`CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "account" ("user_id")`,
	`CREATE TABLE IF NOT EXISTS "session" (
		"id" text PRIMARY KEY NOT NULL,
		"expires_at" integer NOT NULL,
		"token" text NOT NULL,
		"created_at" integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
		"updated_at" integer NOT NULL,
		"ip_address" text,
		"user_agent" text,
		"user_id" text NOT NULL,
		FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade
	)`,
	`CREATE UNIQUE INDEX IF NOT EXISTS "session_token_unique" ON "session" ("token")`,
	`CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "session" ("user_id")`,
	`CREATE TABLE IF NOT EXISTS "verification" (
		"id" text PRIMARY KEY NOT NULL,
		"identifier" text NOT NULL,
		"value" text NOT NULL,
		"expires_at" integer NOT NULL,
		"created_at" integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
		"updated_at" integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
	)`,
	`CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON "verification" ("identifier")`,
	`CREATE TABLE IF NOT EXISTS "stores" (
		"id" text PRIMARY KEY NOT NULL,
		"name" text NOT NULL,
		"domain" text NOT NULL,
		"api_token" text NOT NULL,
		"air_lead_days" integer DEFAULT 15 NOT NULL,
		"sea_lead_days" integer DEFAULT 60 NOT NULL,
		"created_at" text DEFAULT (datetime('now')) NOT NULL
	)`,
	`CREATE UNIQUE INDEX IF NOT EXISTS "stores_domain_unique" ON "stores" ("domain")`,
	`CREATE TABLE IF NOT EXISTS "restock_sessions" (
		"id" text PRIMARY KEY NOT NULL,
		"store_id" text NOT NULL,
		"started_at" text DEFAULT (datetime('now')) NOT NULL,
		"completed_at" text,
		"notes" text,
		FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE cascade
	)`,
	`CREATE TABLE IF NOT EXISTS "restock_items" (
		"id" text PRIMARY KEY NOT NULL,
		"session_id" text NOT NULL,
		"product_id" text NOT NULL,
		"variant_id" text NOT NULL,
		"product_title" text NOT NULL,
		"variant_title" text,
		"sku" text,
		"product_image_url" text,
		"variant_image_url" text,
		"sales_30" real DEFAULT 0 NOT NULL,
		"sales_60" real DEFAULT 0 NOT NULL,
		"sales_90" real DEFAULT 0 NOT NULL,
		"current_stock" integer DEFAULT 0 NOT NULL,
		"rec_air" integer DEFAULT 0 NOT NULL,
		"rec_sea" integer DEFAULT 0 NOT NULL,
		"actual_restock" integer,
		"skip" integer DEFAULT false NOT NULL,
		"position" integer DEFAULT 0 NOT NULL,
		"variant_position" integer DEFAULT 0 NOT NULL,
		FOREIGN KEY ("session_id") REFERENCES "restock_sessions"("id") ON DELETE cascade
	)`,
	`CREATE TABLE IF NOT EXISTS "two_factor" (
		"id" text PRIMARY KEY NOT NULL,
		"secret" text NOT NULL,
		"backup_codes" text NOT NULL,
		"user_id" text NOT NULL,
		FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade
	)`,
	`CREATE INDEX IF NOT EXISTS "twoFactor_secret_idx" ON "two_factor" ("secret")`,
	`CREATE INDEX IF NOT EXISTS "twoFactor_userId_idx" ON "two_factor" ("user_id")`
];

for (const stmt of statements) {
	await client.execute(stmt);
}

// Add two_factor_enabled to existing user rows (ignore if already exists)
try { await client.execute(`ALTER TABLE "user" ADD COLUMN "two_factor_enabled" integer DEFAULT false`); } catch {}
// Also clean up stale columns added by old migration (ignore errors)
try { await client.execute(`ALTER TABLE "user" DROP COLUMN "two_factor_secret"`); } catch {}
// Add variant_position to existing restock_items (ignore if already exists)
try { await client.execute(`ALTER TABLE "restock_items" ADD COLUMN "variant_position" integer DEFAULT 0 NOT NULL`); } catch {}
try { await client.execute(`ALTER TABLE "user" DROP COLUMN "two_factor_backup_codes"`); } catch {}
try { await client.execute(`ALTER TABLE "session" DROP COLUMN "two_factor_verified"`); } catch {}

console.log('Turso database initialized successfully.');
await client.close();
