import { createSupabaseServer } from '@/utils/supabase/server';
import ProductsContent from '@/components/products/ProductsContent';
import { Product } from '@/utils/supabase/products';

export default async function ProductsPage() {
    const supabase = await createSupabaseServer();

    const { data: products, error } = await supabase
        .from('products')
        .select(`
            *,
            category:categories(name)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching products:', error);
        throw error;
    }

    return <ProductsContent initialProducts={products as Product[]} />;
}