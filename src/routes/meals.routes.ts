import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { checkSession } from '../middlewares/check-session'

export async function mealsRoutes(app: FastifyInstance) {
  app.post('/', { preHandler: checkSession }, async (request, reply) => {
    const createMealSchema = z.object({
      name: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      isOnDiet: z.boolean(),
    })

    const mealValidate = createMealSchema.safeParse(request.body)
    if (!mealValidate.success) {
      return reply.status(400).send({
        error: 'Bad Request',
      })
    }
    const { sessionId } = request.cookies
    const user = await knex('users').where('session_id', sessionId).first()
    if (!user) {
      return reply.status(404).send({
        message: 'user not found!',
      })
    }

    const { name, description, date, isOnDiet } = mealValidate.data

    await knex('meals').insert({
      name,
      description,
      date,
      is_on_diet: isOnDiet,
      user_id: user.id,
    })

    return reply.status(201).send()
  })
  app.get('/', { preHandler: checkSession }, async (request, reply) => {
    const { sessionId } = request.cookies
    const user = await knex('users').where('session_id', sessionId).first()
    if (!user) {
      return reply.status(400).send({
        message: 'user not found!',
      })
    }
    const meals = await knex('meals').where('user_id', user.id)
    reply.send(meals)
  })
}
