/**
 * PBKDF2-SHA256 through WebCrypto, so the same code runs on Cloudflare Workers and in Node
 * (scripts). 100 000 iterations is the maximum the Workers runtime allows.
 * Format: pbkdf2$<iterations>$<salt b64>$<hash b64>
 */
const ITERATIONS = 100_000;
const enc = new TextEncoder();

const b64 = (bytes: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(bytes)));
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function derive(password: string, salt: Uint8Array, iterations: number) {
	const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
	return crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations }, key, 256);
}

export async function hashPassword(password: string): Promise<string> {
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const hash = await derive(password, salt, ITERATIONS);
	return `pbkdf2$${ITERATIONS}$${b64(salt)}$${b64(hash)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
	const [scheme, iter, salt, hash] = stored.split('$');
	if (scheme !== 'pbkdf2' || !iter || !salt || !hash) return false;
	const actual = new Uint8Array(await derive(password, unb64(salt), Number(iter)));
	return timingSafeEqual(actual, unb64(hash));
}

export function timingSafeEqual(a: Uint8Array, b: Uint8Array) {
	if (a.length !== b.length) return false;
	let diff = 0;
	for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
	return diff === 0;
}

/** Same cost as a real check, for unknown e-mails, so response time does not reveal accounts. */
export async function burnPasswordCheck(password: string) {
	await derive(password, new Uint8Array(16), ITERATIONS);
}
