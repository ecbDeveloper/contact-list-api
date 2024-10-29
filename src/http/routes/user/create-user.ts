import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { prisma } from "../../../lib/prisma-client";
import bcrypt from 'bcryptjs';
import { z } from 'zod';

export const createUser: FastifyPluginAsyncZod = async app => {
    app.post('/user',
        {
            schema: {
                tags: ['users'],
                summary: 'Create User',
                body: z.object({
                    name: z.string().min(1),
                    email: z.string().email().min(1),
                    password: z.string().min(6)
                }),
                response: {
                    201: z.object({
                        id: z.string(),
                        token: z.string(),
                        message: z.string(),
                    }),
                    409: z.object({
                        message: z.string()
                    })
                }
            }
        },
        async (req, reply) => {
            const { name, email, password } = req.body;
            const verifyIfUserExists = await prisma.user.findFirst({
                where: {
                    email
                }
            })
            if (verifyIfUserExists) {
                return reply.status(409).send({ message: 'User already exists' })

            }

            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(password, salt);


            const userData = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword
                }
            });

            const token = await reply.jwtSign(
                {
                    sub: userData.id
                },
                {
                    sign: {
                        expiresIn: '1d',
                    }
                });

            return reply.status(201).send({ id: userData.id, token, message: 'User created successfully' })
        });
}