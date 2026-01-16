import { Elysia, t } from "elysia";
import { prisma } from "@/lib/prisma";
import { DEFAULT_TEMPLATES, renderTemplate, validateTemplate } from "@/lib/template-engine";
import { authPlugin } from "../auth-plugin";

/**
 * Template Management Routes
 */
export const noteTemplates = new Elysia({ prefix: "/notes/templates" })
    .use(authPlugin)
    .model({
        createTemplate: t.Object({
            name: t.String(),
            content: t.String(),
            category: t.Optional(t.String()),
        }),
        updateTemplate: t.Object({
            name: t.Optional(t.String()),
            content: t.Optional(t.String()),
            category: t.Optional(t.String()),
        }),
        applyTemplate: t.Object({
            date: t.Optional(t.String()), // ISO date string
            variables: t.Optional(t.Record(t.String(), t.String())),
        }),
    })
    // Get all templates (user + defaults)
    .get(
        "/",
        async ({ user }) => {
            // Get user's custom templates
            const userTemplates = await prisma.noteTemplate.findMany({
                where: { userId: user.id },
                orderBy: { name: "asc" },
            });

            // Add default templates
            const defaultTemplates = Object.values(DEFAULT_TEMPLATES).map((template) => ({
                id: `default-${template.name.toLowerCase().replace(/\s+/g, "-")}`,
                name: template.name,
                content: template.content,
                category: template.category,
                isDefault: true,
                userId: user.id,
                createdAt: new Date(),
                updatedAt: new Date(),
            }));

            return [...defaultTemplates, ...userTemplates];
        },
        { auth: true }
    )
    // Get specific template
    .get(
        "/:id",
        async ({ params: { id }, user, set }) => {
            // Check if it's a default template
            if (id.startsWith("default-")) {
                const templateKey = Object.keys(DEFAULT_TEMPLATES).find(
                    (key) =>
                        `default-${DEFAULT_TEMPLATES[key as keyof typeof DEFAULT_TEMPLATES].name.toLowerCase().replace(/\s+/g, "-")}` === id
                );

                if (templateKey) {
                    const template = DEFAULT_TEMPLATES[templateKey as keyof typeof DEFAULT_TEMPLATES];
                    return {
                        id,
                        ...template,
                        isDefault: true,
                        userId: user.id,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    };
                }
            }

            const template = await prisma.noteTemplate.findUnique({ where: { id } });

            if (!template) {
                set.status = 404;
                return { error: "Template not found" };
            }

            if (template.userId !== user.id) {
                set.status = 403;
                return { error: "Forbidden" };
            }

            return template;
        },
        {
            auth: true,
            params: t.Object({ id: t.String() }),
        }
    )
    // Create custom template
    .post(
        "/",
        async ({ body, user, set }) => {
            const { name, content, category } = body;

            // Validate template syntax
            const errors = validateTemplate(content);
            if (errors.length > 0) {
                set.status = 400;
                return { error: "Invalid template", details: errors };
            }

            // Check if template with same name exists
            const existing = await prisma.noteTemplate.findFirst({
                where: {
                    userId: user.id,
                    name,
                },
            });

            if (existing) {
                set.status = 400;
                return { error: "Template with this name already exists" };
            }

            return await prisma.noteTemplate.create({
                data: {
                    name,
                    content,
                    category: category || "Custom",
                    userId: user.id,
                },
            });
        },
        {
            auth: true,
            body: "createTemplate",
        }
    )
    // Update template
    .patch(
        "/:id",
        async ({ params: { id }, body, user, set }) => {
            const template = await prisma.noteTemplate.findUnique({ where: { id } });

            if (!template) {
                set.status = 404;
                return { error: "Template not found" };
            }

            if (template.userId !== user.id) {
                set.status = 403;
                return { error: "Forbidden" };
            }

            // Validate content if provided
            if (body.content) {
                const errors = validateTemplate(body.content);
                if (errors.length > 0) {
                    set.status = 400;
                    return { error: "Invalid template", details: errors };
                }
            }

            return await prisma.noteTemplate.update({
                where: { id },
                data: body,
            });
        },
        {
            auth: true,
            params: t.Object({ id: t.String() }),
            body: "updateTemplate",
        }
    )
    // Delete template
    .delete(
        "/:id",
        async ({ params: { id }, user, set }) => {
            const template = await prisma.noteTemplate.findUnique({ where: { id } });

            if (!template) {
                set.status = 404;
                return { error: "Template not found" };
            }

            if (template.userId !== user.id) {
                set.status = 403;
                return { error: "Forbidden" };
            }

            return await prisma.noteTemplate.delete({ where: { id } });
        },
        {
            auth: true,
            params: t.Object({ id: t.String() }),
        }
    )
    // Apply template (render with variables)
    .post(
        "/:id/apply",
        async ({ params: { id }, body, user, set }) => {
            let templateContent: string;

            // Check if it's a default template
            if (id.startsWith("default-")) {
                const templateKey = Object.keys(DEFAULT_TEMPLATES).find(
                    (key) =>
                        `default-${DEFAULT_TEMPLATES[key as keyof typeof DEFAULT_TEMPLATES].name.toLowerCase().replace(/\s+/g, "-")}` === id
                );

                if (!templateKey) {
                    set.status = 404;
                    return { error: "Template not found" };
                }

                templateContent = DEFAULT_TEMPLATES[templateKey as keyof typeof DEFAULT_TEMPLATES].content;
            } else {
                const template = await prisma.noteTemplate.findUnique({ where: { id } });

                if (!template) {
                    set.status = 404;
                    return { error: "Template not found" };
                }

                if (template.userId !== user.id) {
                    set.status = 403;
                    return { error: "Forbidden" };
                }

                templateContent = template.content;
            }

            // Render template with variables
            const date = body.date ? new Date(body.date) : new Date();
            const rendered = renderTemplate(templateContent, {
                date,
                ...body.variables,
            });

            return { content: rendered };
        },
        {
            auth: true,
            params: t.Object({ id: t.String() }),
            body: "applyTemplate",
        }
    );
