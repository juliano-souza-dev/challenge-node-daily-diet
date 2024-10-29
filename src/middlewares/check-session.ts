import type { FastifyReply, FastifyRequest } from 'fastify'
import { knex } from '../database'

export async function checkSession(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { sessionId } = request.cookies

  if (!sessionId) {
    return reply.status(401).send({
      error: 'unauthorized',
      message: 'The session cookie was not set',
    })
  }
  const user = await knex('users').where('session_id', sessionId).first()
  if (!user) {
    return reply.status(400).send({
      message: 'user not found!',
    })
  }
  request.user = user
}
