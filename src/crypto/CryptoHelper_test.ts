import {
   arrayBufferToHexString,
   assert,
   assertEquals,
   createPasswordHash,
   generateAccessTokenHash,
   verifyPassword,
} from '../index.ts'

Deno.test('Correct password hash is created', async () => {
   assertEquals(
      await createPasswordHash('12345'),
      '5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5',
   )
})

Deno.test('Correct hex string is created for given array buffer', () => {
   const buffer = Uint8Array.from(
      atob('QSBzaW1wbGUgbWVzc2FnZQ=='),
      (c) => c.charCodeAt(0),
   )
   assertEquals(
      arrayBufferToHexString(buffer),
      '412073696d706c65206d657373616765',
   )
})

Deno.test('Password verification is working', async () => {
   assertEquals(
      await verifyPassword(
         '12345',
         '5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5',
      ),
      true,
   )
   assertEquals(
      await verifyPassword(
         '123456',
         '5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5',
      ),
      false,
   )
})

Deno.test('Correct access token hash is created and non equal token is created', () => {
   const firstToken = generateAccessTokenHash()
   assert(firstToken)
   const secondToken = generateAccessTokenHash()
   assert(secondToken)
   assertEquals(firstToken !== secondToken, true)
})
