import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { checkSession } from '../middlewares/check-session'
import { randomUUID } from 'crypto'

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

    const { user } = request
    const { name, description, date, isOnDiet } = mealValidate.data

    await knex('meals').insert({
      id: randomUUID(),
      name,
      description,
      date,
      is_on_diet: isOnDiet,
      user_id: user?.id,
    })

    return reply.status(201).send()
  })
  app.get('/', { preHandler: checkSession }, async (request, reply) => {
    const { user } = request
    const meals = await knex('meals').where('user_id', user?.id)
    reply.send(meals)
  })
  app.get('/:id', { preHandler: checkSession }, async (request, reply) => {
    const { user } = request

    const meal = await knex('meals').where('user_id', user?.id).first()

    reply.send(meal)
  })
}
