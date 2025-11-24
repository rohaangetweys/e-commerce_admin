import { createClient } from './client';

export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    compare_price?: number;
    free_shipping: boolean;
    free_gift: boolean;
    sku: string;
    category_id: string;
    brand: string;
    main_img_url: string;
    image_urls: string[];
    variant_type1_name: string;
    variant_type1_options: string[];
    variant_type2_name: string;
    variant_type2_options: string[];
    variant_prices: Record<string, number>;
    is_active: boolean;
    is_new: boolean;
    stock_quantity: number;
    created_at: string;
    updated_at: string;

    category?: {
        name: string;
    };
}

export const productsService = {
    async getProducts() {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('products')
            .select(`
        *,
        category:categories(name)
      `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Product[];
    },

    async getProduct(id: string) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('products')
            .select(`
        *,
        category:categories(name)
      `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Product;
    },

    async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'category'>) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('products')
            .insert([product])
            .select(`
        *,
        category:categories(name)
      `)
            .single();

        if (error) throw error;
        return data as Product;
    },

    async updateProduct(id: string, updates: Partial<Product>) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('products')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select(`
        *,
        category:categories(name)
      `)
            .single();

        if (error) throw error;
        return data as Product;
    },

    async deleteProduct(id: string) {
        const supabase = createClient();
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async toggleProductStatus(id: string, isActive: boolean) {
        return this.updateProduct(id, { is_active: isActive });
    },

    async getProductsByCategory(categoryId: string) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('products')
            .select(`
        *,
        category:categories(name)
      `)
            .eq('category_id', categoryId)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Product[];
    }
};