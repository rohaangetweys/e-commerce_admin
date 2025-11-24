import { createClient } from './client';

export interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image_url: string;
    is_active: boolean;
    sort_order: number;
    created_at: string;
    item_count?: number
}

export const categoriesService = {
    async getCategories() {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('sort_order', { ascending: true })
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Category[];
    },

    async getCategory(id: string) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Category;
    },

    async createCategory(category: Omit<Category, 'id' | 'created_at'>) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('categories')
            .insert([category])
            .select()
            .single();

        if (error) throw error;
        return data as Category;
    },

    async updateCategory(id: string, updates: Partial<Category>) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('categories')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Category;
    },

    async deleteCategory(id: string) {
        const supabase = createClient();
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async toggleCategoryStatus(id: string, isActive: boolean) {
        return this.updateCategory(id, { is_active: isActive });
    }
};