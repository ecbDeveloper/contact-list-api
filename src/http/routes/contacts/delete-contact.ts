import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../../lib/prisma-client";


export const deleteContact: FastifyPluginAsyncZod = async app => {
    app.delete('/contact/:id',
        {
            schema: {
                tags: ['contacts'],
                summary: 'Delete Contact',
                params: z.object({
                    id: z.string().uuid()
                }),
                response: {
                    201: z.object({
                        id: z.string(),
                        message: z.string()
                    }),
                    400: z.object({
                        message: z.string()
                    }),
                    404: z.object({
                        message: z.string()
                    })
                }
            }
        },
        async (req, reply) => {
            const { id } = req.params;
            const userId = await req.getUserIdFromToken()

            const contact = await prisma.contacts.findFirst({
                where: {
                    id,
                    userId
                }
            });
            if (!contact) {
                return reply.status(404).send({ message: 'User not found' })
            }


            const contactData = await prisma.contacts.delete({
                where: {
                    id
                }
            });
            if (!contactData) {
                return reply.status(400).send({ message: 'Bad Request' })
            }

            return reply.status(200).send({ id, message: 'User deleted successfully' })
        }
    )
} 