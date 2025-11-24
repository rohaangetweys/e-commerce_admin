import { createSupabaseServer } from '@/utils/supabase/server';
import SalesContent from '@/components/sales/SalesContent';
import { Order } from '@/utils/supabase/orders';

export default async function SalesPage() {
    const supabase = await createSupabaseServer();

    const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }

    return <SalesContent initialOrders={orders as Order[]} />;
}