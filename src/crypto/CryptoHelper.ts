export async function createPasswordHash(password: string): Promise<string> {
   const data = new TextEncoder().encode(password)
   const hashArrayBuffer = await crypto.subtle.digest('SHA-256', data)
   return arrayBufferToHexString(hashArrayBuffer)
}

export function generateAccessTokenHash(): string {
   const uintArray = crypto.getRandomValues(new Uint8Array(24))
   return arrayBufferToHexString(uintArray)
}

export function arrayBufferToHexString(buffer: ArrayBuffer): string {
   const hashArray = Array.from(new Uint8Array(buffer))
   const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join(
      '',
   )
   return hashHex
}

export async function verifyPassword(
   cleartextPassword: string,
   hashedPassword: string,
): Promise<boolean> {
   const hashedPasswordFromInput = await createPasswordHash(cleartextPassword)
   return hashedPassword === hashedPasswordFromInput
}
