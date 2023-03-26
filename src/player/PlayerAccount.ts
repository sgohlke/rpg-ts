export interface PlayerAccount {
   playerId: string
   name: string
   userName: string
   userPassword: string //hashed, do not store cleartext passwords!!!
}
