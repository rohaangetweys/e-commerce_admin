import { createSupabaseServer } from '@/utils/supabase/server';
import DashboardContent from '@/components/dashboard/DashboardContent';
import { Order } from '@/utils/supabase/orders';

export default async function DashboardPage() {
    const supabase = await createSupabaseServer();

    const [
        usersResponse,
        productsResponse,
        categoriesResponse,
        ordersResponse,
        recentOrdersResponse,
        revenueDataResponse
    ] = await Promise.all([
        supabase.from('users').select('id'),
        supabase.from('products').select('id'),
        supabase.from('categories').select('id'),
        supabase.from('orders').select('id'),

        supabase.from('orders')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5),

        supabase.from('orders')
            .select('total, created_at')
            .eq('status', 'completed')
    ]);

    const stats = {
        users: usersResponse.data?.length || 0,
        products: productsResponse.data?.length || 0,
        categories: categoriesResponse.data?.length || 0,
        orders: ordersResponse.data?.length || 0
    };

    const completedOrders = ordersResponse.data?.length ?
        ordersResponse.data.filter((order: any) => order.status === 'completed').length : 0;

    const totalRevenue = revenueDataResponse.data?.reduce((sum: number, order: any) =>
        sum + order.total, 0) || 0;

    const averageOrderValue = completedOrders > 0 ?
        totalRevenue / completedOrders : 0;

    const totalVisitors = 1000;
    const conversionRate = completedOrders > 0 ?
        (completedOrders / totalVisitors) * 100 : 0;

    const metrics = {
        totalRevenue,
        conversionRate,
        averageOrderValue,
        completedOrders
    };

    return (
        <DashboardContent
            stats={stats}
            recentOrders={recentOrdersResponse.data as Order[] || []}
            metrics={metrics}
        />
    );
}