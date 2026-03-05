declare module "silk-wasm" {
  export function decode(data: Uint8Array, sampleRate: number): Promise<{ data: Uint8Array; duration: number }>;
  export function isSilk(data: Uint8Array): boolean;
}
