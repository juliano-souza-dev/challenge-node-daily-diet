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

  it('should be able to create a new user', async () => {
    await request(app.server)
      .post('/users/register')
      .send({
        name: 'joh doe',
        email: 'johdoe@mail.com',
        password: '123456',
      })
      .expect(201)
  })
  it('shoud not be able to create a new user, when the email already registered', async () => {
    const user = {
      name: 'joh doe',
      email: 'johdoe@mail.com',
      password: '123456',
    }
    await request(app.server).post('/users/register').send(user)

    const result = await request(app.server)
      .post('/users/register')
      .send(user)
      .expect(401)
    expect(result.body).toHaveProperty('message')
  })
  it.only('should be able to authenticate a valid user', async () => {
    const user = {
      name: 'Joh Doe',
      email: 'johdoe@mail.com',
      password: '123456',
    }
    await request(app.server).post('/users/register').send(user)

    const userCredentials = {
      email: 'johdoe@mail.com',
      password: '123456',
    }
    const authenticateRequest = await request(app.server)
      .post('/auth/login')
      .send(userCredentials)
      .send(userCredentials)
      .expect(200)

    const cookie = authenticateRequest.get('Set-cookie')
    expect(cookie).toBeDefined()
  })
})
