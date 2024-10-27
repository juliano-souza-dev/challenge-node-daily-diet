import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { generateHash } from '../utils/password'

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
      await knex('users').insert({
        name: user.name,
        email: user.email,
        password: await generateHash(user.password),
      })
    } catch (err) {
      return reply.status(500).send({
        error: 'There was an erro with your request!',
      })
    }
    return reply.status(201).send()
  })
}
