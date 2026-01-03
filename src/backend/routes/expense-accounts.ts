import { prisma } from "@/lib/prisma";
import { Elysia, t } from "elysia";
import { authPlugin } from "../auth-plugin";

export const expenseAccounts = new Elysia({ prefix: "/expense-accounts" })
    .use(authPlugin)
    .model({
        expenseAccount: t.Object({
            name: t.String(),
            type: t.Enum({
                CASH: "CASH",
                BANK: "BANK",
                CREDIT_CARD: "CREDIT_CARD",
            }),
            balance: t.Number(),
            limit: t.Optional(t.Number()),
            closingDay: t.Optional(t.Number()),
            dueDay: t.Optional(t.Number()),
        }),
    })
    .get("/", async () => {
        return await prisma.expenseAccount.findMany({
            orderBy: { createdAt: "desc" },
        });
    }, {
        auth: true,
    })
    .get("/:id", async ({ params: { id }, set }) => {
        const account = await prisma.expenseAccount.findUnique({
            where: { id },
        });
        if (!account) {
            set.status = 404;
            return "Account not found";
        }
        return account;
    }, {
        auth: true,
        params: t.Object({
            id: t.String(),
        }),
    })
    .post("/", async ({ body }) => {
        return await prisma.expenseAccount.create({
            data: body,
        });
    }, {
        auth: true,
        body: "expenseAccount",
    })
    .patch("/:id", async ({ params: { id }, body, set }) => {
        try {
            return await prisma.expenseAccount.update({
                where: { id },
                data: body,
            });
        } catch (e) {
            set.status = 404;
            return "Account not found";
        }
    }, {
        auth: true,
        params: t.Object({
            id: t.String(),
        }),
        body: t.Partial(t.Object({
            name: t.String(),
            type: t.Enum({
                CASH: "CASH",
                BANK: "BANK",
                CREDIT_CARD: "CREDIT_CARD",
            }),
            balance: t.Number(),
            limit: t.Optional(t.Number()),
            closingDay: t.Optional(t.Number()),
            dueDay: t.Optional(t.Number()),
        })),
    })
    .delete("/:id", async ({ params: { id }, set }) => {
        try {
            return await prisma.expenseAccount.delete({
                where: { id },
            });
        } catch (e) {
            set.status = 404;
            return "Account not found";
        }
    }, {
        auth: true,
        params: t.Object({
            id: t.String(),
        }),
    });
