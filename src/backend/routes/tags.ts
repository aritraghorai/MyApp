import { prisma } from "@/lib/prisma";
import { Elysia, t } from "elysia";
import { authPlugin } from "../auth-plugin";

export const tags = new Elysia({ prefix: "/tags" })
    .use(authPlugin)
    .model({
        tag: t.Object({
            name: t.String(),
        }),
    })
    .get("/", async ({ user }) => {
        return await prisma.tag.findMany({
            where: {
                userId: user.id
            },
            orderBy: { name: "asc" },
        });
    }, {
        auth: true,
    })
    .get("/:id", async ({ params: { id }, set }) => {
        const tag = await prisma.tag.findUnique({
            where: { id },
        });
        if (!tag) {
            set.status = 404;
            return "Tag not found";
        }
        return tag;
    }, {
        auth: true,
        params: t.Object({
            id: t.String(),
        }),
    })
    .post("/", async ({ body, user }) => {
        return await prisma.tag.create({
            data: {
                ...body,
                userId: user.id
            },
        });
    }, {
        auth: true,
        body: "tag",
    })
    .patch("/:id", async ({ params: { id }, body, set }) => {
        try {
            return await prisma.tag.update({
                where: { id },
                data: body,
            });
        } catch (e) {
            set.status = 404;
            return "Tag not found";
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
            return await prisma.tag.delete({
                where: { id },
            });
        } catch (e) {
            set.status = 404;
            return "Tag not found";
        }
    }, {
        auth: true,
        params: t.Object({
            id: t.String(),
        }),
    });
