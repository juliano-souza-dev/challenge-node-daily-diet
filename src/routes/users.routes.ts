import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/register', (request, reply) => {
    const userRegisterSchema = z.object({
      name: z.string(),
      email: z.string(),
      password: z.string(),
    })

    const newUser = userRegisterSchema.safeParse(request.body)

    if (!newUser.success) {
      return reply.status(401).send({
        error: 'invalid Data!',
      })
    }
    return reply.status(201).send()
  })
}
