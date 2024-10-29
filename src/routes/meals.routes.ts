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
    const mealIdSchema = z.object({ id: z.string().uuid() })
    const { id } = mealIdSchema.parse(request.params)

    const meal = await knex('meals')
      .where('user_id', user?.id)
      .andWhere('id', id)
      .first()

    reply.send(meal)
  })
  app.get('/metrics', { preHandler: checkSession }, async (request, reply) => {
    const { user } = request

    const meals = await knex('meals')
      .where({ user_id: user?.id })
      .orderBy('date', 'desc')

    const totalMealsOnDiet = await knex('meals')
      .count('id', { as: 'total' })
      .where({ user_id: user?.id, is_on_diet: true })
      .first()

    const totalMealsOutsideOfTheDiet = await knex('meals')
      .count('id', { as: 'total' })
      .where({ user_id: user?.id, is_on_diet: false })
      .first()

    const { bestSequenceOnDiet } = meals.reduce(
      (acc, meal) => {
        if (meal.is_on_diet) {
          acc.currentSequence += 1
        } else {
          acc.currentSequence = 0
        }
        if (acc.currentSequence > acc.bestSequenceOnDiet) {
          acc.bestSequenceOnDiet = acc.currentSequence
        }

        return acc
      },
      {
        bestSequenceOnDiet: 0,
        currentSequence: 0,
      },
    )

    reply.status(200).send({
      mealsTotalQuantity: meals.length,
      totalMealsOnDiet: totalMealsOnDiet?.total,
      totalMealsOutsideOfTheDiet: totalMealsOutsideOfTheDiet?.total,
      bestSequenceOnDiet,
    })
  })
  app.put('/:id', { preHandler: checkSession }, async (request, reply) => {
    const { user } = request
    const mealIdSchema = z.object({ id: z.string().uuid() })
    const { id } = mealIdSchema.parse(request.params)

    const updateMealSchema = z.object({
      name: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      isOnDiet: z.boolean(),
    })

    try {
      const { name, description, date, isOnDiet } = updateMealSchema.parse(
        request.body,
      )
      await knex('meals').where({ user_id: user?.id, id }).update({
        name,
        description,
        date,
        is_on_diet: isOnDiet,
      })
      reply.status(204).send()
    } catch (err) {
      reply.status(500).send({
        message: 'Internal Server error',
      })
    }
  })
  app.delete('/:id', { preHandler: checkSession }, async (request, reply) => {
    const { user } = request
    const mealIdSchema = z.object({ id: z.string().uuid() })
    const { id } = mealIdSchema.parse(request.params)

    try {
      await knex('meals').delete().where({ user_id: user?.id, id })
      reply.status(204).send()
    } catch (err) {
      reply.status(500).send({
        message: 'Internal Server error',
      })
    }
  })
}
