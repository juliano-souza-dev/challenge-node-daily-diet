// eslint-disable-next-line
import { FastifyRequest } from 'fastify'
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string
      name: string
      email: string
      password: string
      created_at: Date
      updated_at: Date
    }
  }
}
