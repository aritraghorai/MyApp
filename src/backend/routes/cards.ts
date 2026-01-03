import { prisma } from "@/lib/prisma";
import { Elysia, t } from "elysia";
import { authPlugin } from "../auth-plugin";

export const cards = new Elysia({ prefix: "/cards" })
    .use(authPlugin)
    .model({
        card: t.Object({
            title: t.String(),
            content: t.Optional(t.String()),
            isCreditCard: t.Boolean(),
            dueDate: t.Optional(t.String()), // ISO Date string
            limit: t.Optional(t.Number()),
        }),
    })
    .get("/", async () => {
        return await prisma.card.findMany({
            orderBy: { createdAt: "desc" },
        });
    }, {
        auth: true,
    })
    .get("/:id", async ({ params: { id }, set }) => {
        const card = await prisma.card.findUnique({
            where: { id },
        });
        if (!card) {
            set.status = 404;
            return "Card not found";
        }
        return card;
    }, {
        auth: true,
        params: t.Object({
            id: t.String(),
        }),
    })
    .post("/", async ({ body }) => {
        const { dueDate, ...rest } = body;
        return await prisma.card.create({
            data: {
                ...rest,
                dueDate: dueDate ? new Date(dueDate) : undefined,
            },
        });
    }, {
        auth: true,
        body: "card",
    })
    .patch("/:id", async ({ params: { id }, body, set }) => {
        try {
            const { dueDate, ...rest } = body;
            return await prisma.card.update({
                where: { id },
                data: {
                    ...rest,
                    dueDate: dueDate ? new Date(dueDate) : undefined,
                },
            });
        } catch (e) {
            set.status = 404;
            return "Card not found";
        }
    }, {
        auth: true,
        params: t.Object({
            id: t.String(),
        }),
        body: t.Partial(t.Object({
            title: t.String(),
            content: t.Optional(t.String()),
            isCreditCard: t.Boolean(),
            dueDate: t.Optional(t.String()),
            limit: t.Optional(t.Number()),
        })),
    })
    .delete("/:id", async ({ params: { id }, set }) => {
        try {
            return await prisma.card.delete({
                where: { id },
            });
        } catch (e) {
            set.status = 404;
            return "Card not found";
        }
    }, {
        auth: true,
        params: t.Object({
            id: t.String(),
        }),
    });
