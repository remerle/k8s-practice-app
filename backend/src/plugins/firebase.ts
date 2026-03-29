import fp from 'fastify-plugin';
import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import admin from 'firebase-admin';
import { config } from '../config.js';

declare module 'fastify' {
  interface FastifyInstance {
    verifyFirebaseToken: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

const firebasePlugin: FastifyPluginAsync = async (app) => {
  admin.initializeApp({
    projectId: config.firebaseProjectId,
  });

  app.decorate('verifyFirebaseToken', async (request: FastifyRequest, reply: FastifyReply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      reply.status(401).send({ error: 'Missing or invalid authorization header' });
      return;
    }

    const token = authHeader.slice(7);
    try {
      await admin.auth().verifyIdToken(token);
    } catch (err) {
      reply.status(401).send({ error: 'Invalid or expired token' });
    }
  });
};

export default fp(firebasePlugin, { name: 'firebase' });
