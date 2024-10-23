import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from 'zod';
import { prisma } from "../../../lib/prisma-client";
import bcrypt from 'bcryptjs'

export const userLogin: FastifyPluginAsyncZod = async app => {
    app.post('/login',
        {
            schema: {
                tags: ['Auth'],
                summary: 'User Login',
                body: z.object({
                    email: z.string().email().min(1),
                    password: z.string().min(6)
                }),
                response: {
                    200: z.object({
                        id: z.string(),
                        name: z.string(),
                        email: z.string(),
                        token: z.string()
                    }),
                    401: z.object({
                        message: z.string()
                    }),
                    404: z.object({
                        message: z.string()
                    })
                }
            }
        },
        async (req, reply) => {
            const { email, password } = req.body

            const userData = await prisma.user.findFirst({
                where: { email }
            });
            if (!userData) {
                return reply.status(404).send({ message: 'Invalid email or password' })
            }

            const isPasswordValid = bcrypt.compareSync(password, userData.password)
            if (!isPasswordValid) {
                return reply.status(401).send({ message: 'Invalid email or password' })
            }

            const token = await reply.jwtSign(
                {
                    sub: userData.id
                },
                {
                    sign: {
                        expiresIn: '1d',
                    }
                });

            return reply.status(200).send({ id: userData.id, email, name: userData.name, token })
        }
    )
}