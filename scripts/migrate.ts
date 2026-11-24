/** Applies the SQL migrations in ./drizzle to the Neon database (npm run db:migrate). */
import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is not set');

const db = drizzle({ client: neon(url) });
await migrate(db, { migrationsFolder: './drizzle' });
console.log('Migrations applied.');
