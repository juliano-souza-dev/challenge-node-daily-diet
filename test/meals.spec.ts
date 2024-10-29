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

    console.log(response.body[0])
  })
})
