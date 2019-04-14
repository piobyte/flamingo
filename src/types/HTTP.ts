import * as http from 'http';
import Fastify = require('fastify');

export type Request = Fastify.FastifyRequest<
  http.IncomingMessage,
  Fastify.DefaultQuery,
  Fastify.DefaultParams,
  Fastify.DefaultHeaders,
  Fastify.DefaultBody
>;
export type Reply = Fastify.FastifyReply<http.ServerResponse>;
