import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../../lib/prisma-client";

export const createContact: FastifyPluginAsyncZod = async app => {
    app.post('/contact',
        {
            schema: {
                tags: ['contacts'],
                summary: 'Create Contact',
                body: z.object({
                    name: z.string().min(1),
                    email: z.string().email().min(1),
                    phone: z.string().min(9)
                }),
                response: {
                    201: z.object({
                        id: z.string(),
                        name: z.string(),
                        email: z.string(),
                        phone: z.string()
                    }),
                    409: z.object({
                        message: z.string()
                    })
                }
            }
        },
        async (req, reply) => {
            const { name, email, phone } = req.body
            const userId = await req.getUserIdFromToken()

            const verifyIfExistsContact = await prisma.contacts.findFirst({
                where: {
                    userId,
                    OR: [{ email }, { phone }],
                }
            })
            if (verifyIfExistsContact) {
                return reply.status(409).send({ message: "Contact already exists in user's contact list" })
            }


            const contactData = await prisma.contacts.create({
                data: {
                    name,
                    email,
                    phone,
                    userId
                }
            })

            return reply.status(201).send({ id: contactData.id, name, email, phone })
        });
}