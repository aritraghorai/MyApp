import { prisma } from "@/lib/prisma";
import { Elysia, t } from "elysia";
import { authPlugin } from "../auth-plugin";
import { getBilldingPeriodByDate } from "@/lib/utils";

export const transactions = new Elysia({ prefix: "/transactions" })
    .use(authPlugin)
    .model({
        transaction: t.Object({
            amount: t.Number(),
            type: t.Enum({
                OUTFLOW: "OUTFLOW",
                INCOME: "INCOME",
            }),
            description: t.Optional(t.String()),
            date: t.Optional(t.String()), // ISO Date string
            categoryId: t.String(),
            accountId: t.String(),
            destinationAccountId: t.Optional(t.String()),
            personId: t.String(),
            tagIds: t.Optional(t.Array(t.String())),
        }),
        paymentTransaction: t.Object({
            amount: t.Number(),
            type: t.Enum({
                CC_PAYMENT: "CC_PAYMENT",
            }),
            categoryId: t.String(),
            accountId: t.String(),
            fromAccountId: t.String(),
            billingCycle: t.String(),
            personId: t.String(),
        }),
    })
    .get("/", async ({ query, user }) => {
        const { page = 1, limit = 20, accountId, categoryId, personId, fromDate, toDate, billingCycle } = query;
        const skip = (Number(page) - 1) * Number(limit);

        const where: any = {
            userId: user.id,
        };

        if (accountId) where.accountId = accountId;
        if (categoryId) where.categoryId = categoryId;
        if (personId) where.personId = personId;
        if (billingCycle) where.billingCycle = billingCycle;
        if (fromDate || toDate) {
            where.date = {};
            if (fromDate) where.date.gte = new Date(fromDate);
            if (toDate) where.date.lte = new Date(toDate);
        }

        const [data, total] = await Promise.all([
            prisma.transaction.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { date: "desc" },
                include: {
                    category: true,
                    account: true,
                    person: true,
                    fromAccount: true,
                    tags: {
                        include: {
                            tag: true
                        }
                    }
                }
            }),
            prisma.transaction.count({ where }),
        ]);

        return {
            data,
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            },
        };
    }, {
        auth: true,
        query: t.Object({
            page: t.Optional(t.Numeric()),
            limit: t.Optional(t.Numeric()),
            accountId: t.Optional(t.String()),
            categoryId: t.Optional(t.String()),
            personId: t.Optional(t.String()),
            fromDate: t.Optional(t.String()),
            toDate: t.Optional(t.String()),
            billingCycle: t.Optional(t.String()),
        }),
    })
    .get("/:id", async ({ params: { id }, user, set }) => {
        const transaction = await prisma.transaction.findUnique({
            where: { id },
            include: {
                category: true,
                account: true,
                person: true,
                fromAccount: true,
                tags: {
                    include: {
                        tag: true
                    }
                }
            }
        });

        if (!transaction) {
            set.status = 404;
            return "Transaction not found";
        }
        if (transaction.userId !== user.id) {
            set.status = 403;
            return "Forbidden";
        }

        return transaction;
    }, {
        auth: true,
        params: t.Object({
            id: t.String(),
        }),
    })
    .post("/", async ({ body, user, set }) => {
        const { tagIds, date, type, ...rest } = body;

        const accountId = rest.accountId;

        const card = await prisma.expenseAccount.findUnique({ where: { id: accountId } });
        if (!card) {
            set.status = 404;
            return "Account not found";
        }

        const tranDate = date ? new Date(date) : new Date();
        let billingCycle = "";
        if (card.type === "CREDIT_CARD") {
            billingCycle = getBilldingPeriodByDate(tranDate, card.dueDay!);
        } else {
            billingCycle = getBilldingPeriodByDate(tranDate, -1);
        }


        const transaction = await prisma.transaction.create({
            data: {
                ...rest,
                date: date ? new Date(date) : undefined,
                userId: user.id,
                type,
                billingCycle,
            },
        });

        if (tagIds && tagIds.length > 0) {
            await prisma.expenseTag.createMany({
                data: tagIds.map(tagId => ({
                    expenseId: transaction.id,
                    transactionId: transaction.id,
                    tagId
                }))
            });
        }

        return await prisma.transaction.findUnique({
            where: { id: transaction.id },
            include: {
                category: true,
                account: true,
                person: true,
                fromAccount: true,
                tags: {
                    include: {
                        tag: true
                    }
                }
            }
        });
    }, {
        auth: true,
        body: "transaction",
    })
    .patch("/:id", async ({ params: { id }, body, user, set }) => {
        const existing = await prisma.transaction.findUnique({ where: { id } });
        if (!existing) {
            set.status = 404;
            return "Transaction not found";
        }
        if (existing.userId !== user.id) {
            set.status = 403;
            return "Forbidden";
        }

        const { tagIds, date, ...rest } = body;

        await prisma.transaction.update({
            where: { id },
            data: {
                ...rest,
                date: date ? new Date(date) : undefined,
            },
        });

        if (tagIds) {
            await prisma.expenseTag.deleteMany({ where: { expenseId: id } });
            if (tagIds.length > 0) {
                await prisma.expenseTag.createMany({
                    data: tagIds.map(tagId => ({
                        expenseId: id,
                        transactionId: id,
                        tagId
                    }))
                });
            }
        }

        return await prisma.transaction.findUnique({
            where: { id },
            include: {
                category: true,
                account: true,
                person: true,
                fromAccount: true,
                tags: {
                    include: {
                        tag: true
                    }
                }
            }
        });
    }, {
        auth: true,
        params: t.Object({
            id: t.String(),
        }),
        body: t.Partial(t.Object({
            amount: t.Number(),
            type: t.Enum({
                OUTFLOW: "OUTFLOW",
                CC_PAYMENT: "CC_PAYMENT",
                INCOME: "INCOME",
            }),
            description: t.Optional(t.String()),
            date: t.Optional(t.String()),
            categoryId: t.String(),
            accountId: t.String(),
            destinationAccountId: t.Optional(t.String()),
            personId: t.String(),
            tagIds: t.Optional(t.Array(t.String())),
        })),
    })
    .delete("/:id", async ({ params: { id }, user, set }) => {
        const existing = await prisma.transaction.findUnique({ where: { id } });
        if (!existing) {
            set.status = 404;
            return "Transaction not found";
        }
        if (existing.userId !== user.id) {
            set.status = 403;
            return "Forbidden";
        }

        return await prisma.transaction.delete({
            where: { id },
        });
    }, {
        auth: true,
        params: t.Object({
            id: t.String(),
        }),
    }).post("/payment", async ({ user, body }) => {
        const { ...rest } = body;
        const transaction = await prisma.transaction.create({
            data: {
                ...rest,
                date: new Date(),
                userId: user.id,
                type: "CC_PAYMENT",
            },
        });

        return await prisma.transaction.findUnique({
            where: { id: transaction.id },
            include: {
                category: true,
                account: true,
                fromAccount: true,
                tags: {
                    include: {
                        tag: true
                    }
                }
            }
        });
    }, {
        auth: true,
        body: "paymentTransaction"
    }).get("/by-cycle", async ({ user, query: { billingCycle } }) => {
        const transactions = await prisma.transaction.findMany({
            where: {
                AND: [
                    {
                        userId: user.id,
                    }, {
                        billingCycle: billingCycle
                    }
                ]
            },
            include: {
                category: true,
                account: true,
                fromAccount: true,
                tags: {
                    include: {
                        tag: true
                    }
                }
            }
        });
        return transactions;
    }, {
        auth: true,
        query: t.Object({
            billingCycle: t.String()
        })
    })
