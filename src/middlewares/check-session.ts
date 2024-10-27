import type { FastifyReply, FastifyRequest } from 'fastify'

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
}
