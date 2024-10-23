import { FastifyPluginAsyncZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { prisma } from "../../../lib/prisma-client"
import { FastifyRequest } from "fastify"

const paramsSchema = z.object({
    id: z.string().uuid()
});

export const updateContact: FastifyPluginAsyncZod = async app => {
    app.put('/contact/:id',
        {
            schema: {
                tags: ['contacts'],
                summary: 'Create Contact',
                params: z.object({
                    id: z.string().uuid()
                }),
                body: z.object({
                    name: z.string(),
                    email: z.string(),
                    phone: z.string()
                }),
                response: {
                    201: z.object({
                        id: z.string(),
                        name: z.string(),
                        email: z.string(),
                        phone: z.string(),
                        message: z.string()
                    }),
                    400: z.object({
                        id: z.string(),
                        message: z.string()
                    }),
                    404: z.object({
                        id: z.string(),
                        message: z.string()
                    }),
                }
            }
        },
        async (req, reply) => {
            const userId = await req.getUserIdFromToken();
            const { id } = req.params;
            const { name, email, phone } = req.body;

            const contact = await prisma.contacts.findFirst({
                where: {
                    id,
                    userId
                }
            });
            if (!contact) {
                return reply.status(404).send({ id, message: 'User not found' })
            }

            const contactData = await prisma.contacts.update({
                data: {
                    name,
                    email,
                    phone
                },
                where: {
                    id
                }
            });
            if (!contactData) {
                return reply.status(400).send({ id, message: 'Bad Request' })
            }

            return reply.status(200).send({ id, name, email, phone, message: 'User updated successfully' })
        }
    )
}