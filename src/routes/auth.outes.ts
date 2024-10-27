import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { compareHash } from '../utils/password'
import { randomUUID } from 'crypto'

export async function authRoutes(app: FastifyInstance) {
  app.post('/login', async (request, reply) => {
    const userCredentialsSchema = z.object({
      email: z.string(),
      password: z.string(),
    })

    const userCredentials = userCredentialsSchema.safeParse(request.body)
    if (!userCredentials.success) {
      return reply.status(401).send({
        message: 'there was an error with your request',
      })
    }
    const { email, password } = userCredentials.data
    const user = await knex('users').where({ email }).first()
    if (!user) {
      return reply.status(401).send({
        message: 'Unauthorized! check the user credentials!',
      })
    }

    const passwordMatch = await compareHash(password, user.password)
    if (!passwordMatch) {
      return reply.status(401).send({
        message: 'check the user credentials!',
      })
    }
    const sessionId = randomUUID()
    await knex('users').update('session_id', sessionId).where('email', email)
    reply.setCookie('session_id', sessionId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    })
  })
}
