import 'fastify';

declare module 'fastify' {
    export interface FastifyRequest {
        getUserIdFromToken: () => Promise<string>
    }
}