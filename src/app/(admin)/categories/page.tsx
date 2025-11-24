import { createSupabaseServer } from '@/utils/supabase/server';
import { Category } from '@/utils/supabase/categories';
import CategoriesContent from '@/components/categories/CategoriesContent';

export default async function CategoriesPage() {
    const supabase = await createSupabaseServer();

    const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

    if (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }

    return <CategoriesContent initialCategories={categories as Category[]} />;
}