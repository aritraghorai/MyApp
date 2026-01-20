import { Elysia, t } from "elysia";
import { authPlugin } from "@/backend/auth-plugin";
import { prisma } from "@/lib/prisma";
import { calculateWordCount, parseTodos } from "@/lib/todo-parser";

export const notes = new Elysia()
    .use(authPlugin)
