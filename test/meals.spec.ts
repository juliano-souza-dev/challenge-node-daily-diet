import { execSync } from 'child_process'
import { beforeEach, describe, beforeAll, afterAll, it, expect } from 'vitest'
import { app } from '../src/app'
import request from 'supertest'

describe('users suit test', () => {
  beforeAll(async () => {
    await app.ready()
  })
  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })
  afterAll(() => {
    app.close()
  })
  it('should be able to create a new meal', async () => {
    const userResponse = await request(app.server).post('/users').send({
      name: 'John Doe',
      email: 'johndoe@gmail.com',
      password: '123',
    })

    const cookie = userResponse.get('Set-Cookie')
    const meal = {
      name: 'Breakfast',
      description: 'First meal',
      date: new Date(),
      isOnDiet: true,
    }

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookie!)
      .send(meal)
      .expect(201)
  })
  it('Should be able to list the user meals', async () => {
    const userResponse = await request(app.server).post('/users').send({
      name: 'John Doe',
      email: 'johndoe@gmail.com',
      password: '123',
    })

    const cookie = userResponse.get('Set-Cookie')

    const meal = {
      name: 'Breakfast',
      description: 'First meal',
      date: new Date(),
      isOnDiet: true,
    }
    const meal2 = {
      name: 'dinner',
      description: 'last meal',
      date: new Date().setHours(18, 0, 0),
      isOnDiet: true,
    }

    await request(app.server).post('/meals').set('Cookie', cookie!).send(meal)
    await request(app.server).post('/meals').set('Cookie', cookie!).send(meal2)

    const response = await request(app.server)
      .get('/meals')
      .set('Cookie', cookie!)
      .expect(200)

    expect(response.body).toHaveLength(2)
  })
  it('should be able to list a specific meal', async () => {
    const userResponse = await request(app.server).post('/users').send({
      name: 'John Doe',
      email: 'johndoe@gmail.com',
      password: '123',
    })

    const cookie = userResponse.get('Set-Cookie')
    await request(app.server)
      .post('/meals')
      .set('Cookie', cookie!)
      .send({
        name: 'dinner',
        description: 'last meal',
        date: new Date().setHours(18, 0, 0),
        isOnDiet: true,
      })

    const response = await request(app.server)
      .get('/meals')
      .set('Cookie', cookie!)

    const { id } = response.body[0]

    const responseMeal = await request(app.server)
      .get(`/meals/${id}`)
      .set('Cookie', cookie!)
      .expect(200)
    expect(responseMeal.body).toHaveProperty('id')
  })
  it('should be able to delete a specific meal', async () => {
    const userResponse = await request(app.server).post('/users').send({
      name: 'John Doe',
      email: 'johndoe@gmail.com',
      password: '123',
    })

    const cookie = userResponse.get('Set-Cookie')
    await request(app.server)
      .post('/meals')
      .set('Cookie', cookie!)
      .send({
        name: 'dinner',
        description: 'last meal',
        date: new Date().setHours(18, 0, 0),
        isOnDiet: true,
      })

    const response = await request(app.server)
      .get('/meals')
      .set('Cookie', cookie!)

    const { id } = response.body[0]

    await request(app.server)
      .delete(`/meals/${id}`)
      .set('Cookie', cookie!)
      .expect(204)
  })
  it('should be able to edit a specific meal', async () => {
    const userResponse = await request(app.server).post('/users').send({
      name: 'John Doe',
      email: 'johndoe@gmail.com',
      password: '123',
    })

    const cookie = userResponse.get('Set-Cookie')
    await request(app.server)
      .post('/meals')
      .set('Cookie', cookie!)
      .send({
        name: 'dinner',
        description: 'last meal',
        date: new Date().setHours(18, 0, 0),
        isOnDiet: true,
      })

    const response = await request(app.server)
      .get('/meals')
      .set('Cookie', cookie!)

    const { id } = response.body[0]

    await request(app.server)
      .put(`/meals/${id}`)
      .set('Cookie', cookie!)
      .send({
        name: 'dinner',
        description: 'last meal',
        date: new Date().setHours(18, 0, 0),
        isOnDiet: true,
      })
      .expect(204)
  })

  it('Should be able to get the metrics about the users meal', async () => {
    const userResponse = await request(app.server).post('/users').send({
      name: 'John Doe',
      email: 'johndoe@gmail.com',
      password: '123',
    })

    const cookie = userResponse.get('Set-Cookie')

    const meal = {
      name: 'Breakfast',
      description: 'First meal',
      date: new Date(),
      isOnDiet: true,
    }
    const meal2 = {
      name: 'dinner',
      description: 'last meal',
      date: new Date().setHours(18, 0, 0),
      isOnDiet: true,
    }
    const meal3 = {
      name: 'other',
      description: 'other meal',
      date: new Date().setHours(18, 0, 0),
      isOnDiet: false,
    }

    await request(app.server).post('/meals').set('Cookie', cookie!).send(meal)
    await request(app.server).post('/meals').set('Cookie', cookie!).send(meal2)
    await request(app.server).post('/meals').set('Cookie', cookie!).send(meal3)

    const result = await request(app.server)
      .get('/meals/metrics')
      .set('Cookie', cookie!)

    expect(result.body).toEqual({
      mealsTotalQuantity: 3,
      totalMealsOnDiet: 2,
      totalMealsOutsideOfTheDiet: 1,
      bestSequenceOnDiet: 2,
    })
  })
})
