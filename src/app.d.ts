import type { Db } from '$lib/server/db';
import type { Storage } from '$lib/server/storage';

declare global {
	namespace App {
		interface Locals {
			db: Db;
			storage: () => Storage;
			user: { id: string; email: string; name: string } | null;
		}
		interface Error {
			message: string;
		}
		interface Platform {
			env?: Record<string, unknown>;
			context?: ExecutionContext;
			caches?: CacheStorage & { default: Cache };
		}
	}
}

export {};
