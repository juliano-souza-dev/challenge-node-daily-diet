import { config } from 'dotenv'

import z from 'zod'

config({ path: process.env.NODE_ENV === 'teste' ? '.env.test' : '.env' })

const envConfigSchema = z.object({
  DATABASE_URL: z.string(),
  PORT: z.coerce.number().default(3333),
  DATABASE_CLIENT: z.string(),
  NODE_ENV: z
    .enum(['production', 'development', 'test'])
    .default('development'),
})

const _env = envConfigSchema.safeParse(process.env)

if (!_env.success) {
  console.error('⚠️ Invalid environment variables', _env.error.format())
  throw new Error('Invalid enviroment variables!')
}
export const env = _env.data
