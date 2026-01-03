import { prisma } from "@/lib/prisma";
import { Elysia, t } from "elysia";
import { authPlugin } from "../auth-plugin";

export const categories = new Elysia({ prefix: "/categories" })
    .use(authPlugin)
    .model({
        category: t.Object({
            name: t.String(),
        }),
    })
    .get("/", async ({ user }) => {
        return await prisma.category.findMany({
            where: {
                userId: user.id
            },
            orderBy: { name: "asc" },
        });
    }, {
        auth: true,
    })
    .get("/:id", async ({ params: { id }, set }) => {
        const category = await prisma.category.findUnique({
            where: { id },
        });
        if (!category) {
            set.status = 404;
            return "Category not found";
        }
        return category;
    }, {
        auth: true,
        params: t.Object({
            id: t.String(),
        }),
    })
    .post("/", async ({ body, user }) => {
        return await prisma.category.create({
            data: {
                ...body,
                userId: user.id
            },
        });
    }, {
        auth: true,
        body: "category",
    })
    .patch("/:id", async ({ params: { id }, body, set }) => {
        try {
            return await prisma.category.update({
                where: { id },
                data: body,
            });
        } catch (e) {
            set.status = 404;
            return "Category not found";
        }
    }, {
        auth: true,
        params: t.Object({
            id: t.String(),
        }),
        body: t.Partial(t.Object({
            name: t.String(),
        })),
    })
    .delete("/:id", async ({ params: { id }, set }) => {
        try {
            return await prisma.category.delete({
                where: { id },
            });
        } catch (e) {
            set.status = 404;
            return "Category not found";
        }
    }, {
        auth: true,
        params: t.Object({
            id: t.String(),
        }),
    });
