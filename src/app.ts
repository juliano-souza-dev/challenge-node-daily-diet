import fastify from 'fastify'
import { usersRoutes } from './routes/users.routes'
import fastifyCookie from '@fastify/cookie'
import { authRoutes } from './routes/auth.outes'

export const app = fastify()
app.register(fastifyCookie)
app.register(usersRoutes, {
  prefix: '/users',
})
app.register(authRoutes, {
  prefix: '/auth',
})
