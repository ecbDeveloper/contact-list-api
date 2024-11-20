import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../../../lib/prisma-client';

export const findAllContactsFromUser: FastifyPluginAsyncZod = async app => {
    app.get('/contacts', {
        schema: {
            tags: ['contacts'],
            summary: 'Get all contacts from user',
            response: {
                200: z.array(
                    z.object({
                        id: z.string(),
                        name: z.string(),
                        email: z.string(),
                        phone: z.string()
                    })
                ),
                404: z.object({
                    message: z.string()
                })
            }
        }
    },
        async (req, reply) => {
            const userId = await req.getUserIdFromToken()

            const contactsData = await prisma.contacts.findMany({
                where: { userId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true
                }
            });
            if (contactsData.length === 0) {
                return reply.status(404).send({ message: 'User has no contacts' })
            }

            return reply.status(200).send(contactsData)
        });
} 