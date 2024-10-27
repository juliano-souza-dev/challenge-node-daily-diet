import { execSync } from 'child_process'
import { beforeEach, describe, beforeAll, afterAll, it } from 'vitest'
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
    const result = await request(app.server)
      .post('/users/register')
      .send({
        name: 'joh doe',
        email: 'johdoe@mail.com',
        password: '123456',
      })
      .expect(201)

    console.log('----', result.body)
  })
})
