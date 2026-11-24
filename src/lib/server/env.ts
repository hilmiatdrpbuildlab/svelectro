import { env } from '$env/dynamic/private';

function required(name: string): string {
	const v = env[name];
	if (!v) throw new Error(`Missing environment variable ${name}`);
	return v;
}

export const serverEnv = {
	get databaseUrl() {
		return required('DATABASE_URL');
	},
	get authSecret() {
		return required('AUTH_SECRET');
	},
	get storage() {
		return {
			endpoint: required('NEON_STORAGE_ENDPOINT').replace(/\/+$/, ''),
			region: env.NEON_STORAGE_REGION || 'eu-central-1',
			accessKeyId: required('NEON_STORAGE_ACCESS_KEY_ID'),
			secretAccessKey: required('NEON_STORAGE_SECRET_ACCESS_KEY'),
			bucket: env.NEON_STORAGE_BUCKET || 'media',
			privateBucket: env.NEON_STORAGE_PRIVATE_BUCKET || 'private'
		};
	}
};
