import { fastify, FastifyInstance } from "fastify";

import "dotenv/config"
import fastifyJwt from "@fastify/jwt";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastifyCors from "@fastify/cors";
import { jsonSchemaTransform, serializerCompiler, validatorCompiler, ZodTypeProvider } from "fastify-type-provider-zod";
import { createUser } from "./http/routes/user/create-user";
import { userLogin } from "./http/routes/auth/user-login";
import { createContact } from "./http/routes/contacts/create-contact";
import { deleteContact } from "./http/routes/contacts/delete-contact";
import { updateContact } from "./http/routes/contacts/update-contact";
import { findAllContactsFromUser } from "./http/routes/contacts/find-contacts-by-userid";
import { auth } from "./middlewares/jwtAuth";

const app: FastifyInstance = fastify().withTypeProvider<ZodTypeProvider>()

app.register(fastifySwagger, {
    openapi: {
        info: {
            title: 'Contact list',
            description: 'API de uma agenda de contatos',
            version: '1.0.0',
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    transform: jsonSchemaTransform
})

app.register(fastifySwaggerUi, {
    routePrefix: '/docs'
})

app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET as string
})

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.register(fastifyCors)
app.register(auth)

//user routes
app.register(createUser)

//auth routes
app.register(userLogin)

//contacts routes
app.register(createContact)
app.register(findAllContactsFromUser)
app.register(updateContact)
app.register(deleteContact)

app.listen({ port: 3100 }).then(() => {
    console.log('Server is runing on port 3100')
})
