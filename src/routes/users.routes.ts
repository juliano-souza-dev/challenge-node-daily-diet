import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { generateHash } from '../utils/password'
import { randomUUID } from 'crypto'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/register', async (request, reply) => {
    const userRegisterSchema = z.object({
      name: z.string(),
      email: z.string(),
      password: z.string(),
    })

    const isValidUser = userRegisterSchema.safeParse(request.body)

    if (!isValidUser.success) {
      return reply.status(401).send({
        error: 'invalid Data!',
      })
    }

    const user = isValidUser.data

    try {
      const userAlreadyExists = await knex('users')
        .where({ email: user.email })
        .first()

      if (userAlreadyExists) {
        return reply.status(401).send({
          message: 'not allowed! The email is already in use',
        })
      }
      await knex('users').insert({
        name: user.name,
        email: user.email,
        password: await generateHash(user.password),
      })
    } catch (err) {
      return reply.status(500).send({
        message: 'There was an erro with your request!',
      })
    }
    const sessionId = randomUUID()
    reply.setCookie('session_id', sessionId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    })
    return reply.status(201).send()
  })
}
