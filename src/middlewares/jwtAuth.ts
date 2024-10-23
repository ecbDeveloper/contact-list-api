import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fastifyPlugin from "fastify-plugin";

export const auth = fastifyPlugin(async (app: FastifyInstance) => {
    app.addHook('preHandler', async (req: FastifyRequest) => {
        req.getUserIdFromToken = async () => {
            try {
                const { sub } = await req.jwtVerify<{ sub: string }>()
                return sub
            } catch (error) {
                throw new Error('Invalid JWT token')
            }
        }
    })
})