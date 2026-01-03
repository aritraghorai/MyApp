import { useQuery } from "@tanstack/react-query";
import { getTreaty } from "../routes/api.$";

export function useMetadata() {
    const tagsQuery = useQuery({
        queryKey: ["tags"],
        queryFn: async () => {
            const { data, error } = await getTreaty().tags.get();
            if (error) throw error;
            return data;
        },
    });

    const categoriesQuery = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            // @ts-ignore
            const { data, error } = await getTreaty().categories.index.get();
            if (error) throw error;
            return data;
        },
    });

    const peopleQuery = useQuery({
        queryKey: ["people"],
        queryFn: async () => {
            // @ts-ignore
            const { data, error } = await getTreaty().people.index.get();
            if (error) throw error;
            return data;
        },
    });

    const createTag = async (name: string) => {
        const { error } = await getTreaty().tags.post({ name });
        if (error) throw error;
        tagsQuery.refetch();
    };

    const updateTag = async (id: string, name: string) => {
        const { error } = await getTreaty().tags({ id }).patch({ name });
        if (error) throw error;
        tagsQuery.refetch();
    };

    const deleteTag = async (id: string) => {
        const { error } = await getTreaty().tags({ id }).delete();
        if (error) throw error;
        tagsQuery.refetch();
    };

    const createCategory = async (name: string) => {
        // @ts-ignore
        const { error } = await getTreaty().categories.index.post({ name });
        if (error) throw error;
        categoriesQuery.refetch();
    };

    const updateCategory = async (id: string, name: string) => {
        // @ts-ignore
        const { error } = await getTreaty().categories({ id }).patch({ name });
        if (error) throw error;
        categoriesQuery.refetch();
    };

    const deleteCategory = async (id: string) => {
        // @ts-ignore
        const { error } = await getTreaty().categories({ id }).delete();
        if (error) throw error;
        categoriesQuery.refetch();
    };

    const createPerson = async (name: string) => {
        // @ts-ignore
        const { error } = await getTreaty().people.index.post({ name });
        if (error) throw error;
        peopleQuery.refetch();
    };

    const updatePerson = async (id: string, name: string) => {
        // @ts-ignore
        const { error } = await getTreaty().people({ id }).patch({ name });
        if (error) throw error;
        peopleQuery.refetch();
    };

    const deletePerson = async (id: string) => {
        // @ts-ignore
        const { error } = await getTreaty().people({ id }).delete();
        if (error) throw error;
        peopleQuery.refetch();
    };

    return {
        tags: {
            data: tagsQuery.data,
            isLoading: tagsQuery.isLoading,
            error: tagsQuery.error,
            create: createTag,
            update: updateTag,
            delete: deleteTag,
        },
        categories: {
            data: categoriesQuery.data,
            isLoading: categoriesQuery.isLoading,
            error: categoriesQuery.error,
            create: createCategory,
            update: updateCategory,
            delete: deleteCategory,
        },
        people: {
            data: peopleQuery.data,
            isLoading: peopleQuery.isLoading,
            error: peopleQuery.error,
            create: createPerson,
            update: updatePerson,
            delete: deletePerson,
        },
    };
}
