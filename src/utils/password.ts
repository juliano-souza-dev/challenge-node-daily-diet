import { hash, compare } from 'bcrypt'
const saltsRound = 10
export async function generateHash(
  password: string,
  sRounds: number = saltsRound,
) {
  return await hash(password, sRounds)
}

export async function compareHash(password: string, hash: string) {
  const match = await compare(password, hash)

  if (match) return true
  return false
}
