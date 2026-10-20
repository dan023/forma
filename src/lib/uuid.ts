/** UUID v4. Bun/Node (script e test) hanno la Web Crypto; sul telefono si usa `uuid.native.ts`. */
export const uuid = (): string => globalThis.crypto.randomUUID();
