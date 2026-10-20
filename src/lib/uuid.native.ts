import { randomUUID } from 'expo-crypto';

/** UUID v4 su iOS/Android: Hermes non ha `crypto.randomUUID`, quindi si usa expo-crypto (casualità sicura). */
export const uuid = (): string => randomUUID();
