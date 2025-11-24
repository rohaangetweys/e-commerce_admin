import { createClient } from './client';

export interface OrderItem {
    id: string;
    name: string;
    price: number;
    main_img_url: string;
    slug: string;
    quantity: number;
    sku: string;
}

export interface Order {
    id: string;
    user_id: string | null;
    email: string;
    phone: string | null;
    shipping_first_name: string;
    shipping_last_name: string;
    shipping_address: string;
    shipping_city: string;
    shipping_state: string;
    shipping_zip: string;
    shipping_country: string;
    shipping_method: string;
    shipping_cost: number;
    payment_method: string;
    subtotal: number;
    tax: number;
    total: number;
    status: 'pending' | 'completed';
    items: OrderItem[];
    created_at: string;
    updated_at: string;
}

export interface CreateOrderData {
    email: string;
    phone?: string;
    shipping_first_name: string;
    shipping_last_name: string;
    shipping_address: string;
    shipping_city: string;
    shipping_state: string;
    shipping_zip: string;
    shipping_country: string;
    shipping_method: string;
    shipping_cost: number;
    payment_method: string;
    subtotal: number;
    tax: number;
    total: number;
    items: OrderItem[];
    user_id: string;
}

export const ordersService = {
    async createOrder(orderData: CreateOrderData) {
        const supabase = createClient();
        
        console.log('Creating order with user_id:', orderData.user_id);

        const { data, error } = await supabase
            .from('orders')
            .insert([orderData])
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }
        return data as Order;
    },

    async getOrders() {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Order[];
    },

    async getOrder(id: string) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Order;
    },

    async getUserOrders(userId: string) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Order[];
    },

    async updateOrderStatus(id: string, status: Order['status']) {
        const supabase = createClient();
        
        const { error: updateError } = await supabase
            .from('orders')
            .update({ 
                status,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (updateError) {
            console.error('Supabase update error:', updateError);
            throw updateError;
        }
        
        const { data, error: fetchError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError) {
            console.error('Supabase fetch error:', fetchError);
            throw fetchError;
        }
        
        if (!data) {
            throw new Error('Order not found after update');
        }
        
        return data as Order;
    },

    async deleteOrder(id: string) {
        const supabase = createClient();
        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};