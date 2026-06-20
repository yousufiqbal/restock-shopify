// Emergency 2FA reset for the admin account.
// Use when the authenticator AND backup codes are lost.
// Run: node scripts/reset-2fa.mjs [email]
// If no email given, resets the only user in the DB.

import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
	readFileSync(new URL('../.env', import.meta.url), 'utf8')
		.split('\n').filter(l => l && !l.startsWith('#'))
		.map(l => l.split('=').map(p => p.trim().replace(/^"|"$/g, '')))
		.filter(([k]) => k)
);

const url = env.DATABASE_URL;
const authToken = env.DATABASE_AUTH_TOKEN || undefined;
if (!url) throw new Error('DATABASE_URL not set in .env');

const client = createClient({ url, authToken });

const email = process.argv[2];

// Find target user
let userRow;
if (email) {
	const r = await client.execute({ sql: `SELECT id, email FROM "user" WHERE email = ?`, args: [email] });
	userRow = r.rows[0];
} else {
	const r = await client.execute(`SELECT id, email FROM "user"`);
	if (r.rows.length > 1) {
		console.error('Multiple users found. Pass an email: node scripts/reset-2fa.mjs you@example.com');
		console.error('Users:', r.rows.map((u) => u.email).join(', '));
		await client.close();
		process.exit(1);
	}
	userRow = r.rows[0];
}

if (!userRow) {
	console.error(email ? `No user with email ${email}` : 'No users found.');
	await client.close();
	process.exit(1);
}

// Clear 2FA: delete secret rows, flip the flag, kill all sessions (force fresh login)
await client.execute({ sql: `DELETE FROM "two_factor" WHERE user_id = ?`, args: [userRow.id] });
await client.execute({ sql: `UPDATE "user" SET two_factor_enabled = 0 WHERE id = ?`, args: [userRow.id] });
await client.execute({ sql: `DELETE FROM "session" WHERE user_id = ?`, args: [userRow.id] });

console.log(`2FA reset for ${userRow.email}. Next login will force re-enrollment at /auth/setup-2fa.`);
await client.close();
