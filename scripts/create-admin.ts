/**
 * Create an admin user, or reset the password of an existing one.
 *   npm run admin:create -- <email> <password> [name]
 * Falls back to ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME from .env.
 */
import 'dotenv/config';
import { eq, sql } from 'drizzle-orm';
import { createDb } from '../src/lib/server/db/index';
import { adminSessions, adminUsers } from '../src/lib/server/db/schema';
import { hashPassword } from '../src/lib/server/password';

const [, , argEmail, argPassword, ...argName] = process.argv;
const email = argEmail || process.env.ADMIN_EMAIL;
const password = argPassword || process.env.ADMIN_PASSWORD;
const name = argName.join(' ') || process.env.ADMIN_NAME || 'Beheerder';

if (!email || !password) throw new Error('Usage: npm run admin:create -- <email> <password> [name]');
if (password.length < 10) throw new Error('Use a password of at least 10 characters.');

const db = createDb(process.env.DATABASE_URL!);
const passwordHash = await hashPassword(password);
const [existing] = await db.select().from(adminUsers).where(sql`lower(${adminUsers.email}) = lower(${email})`);

if (existing) {
	await db.update(adminUsers).set({ passwordHash, name }).where(eq(adminUsers.id, existing.id));
	await db.delete(adminSessions).where(eq(adminSessions.userId, existing.id));
	console.log(`Password updated for ${email} (all sessions signed out).`);
} else {
	await db.insert(adminUsers).values({ email, name, passwordHash });
	console.log(`Admin user created: ${email}`);
}
