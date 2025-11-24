import UsersContent from '@/components/users/UsersContent';
import { createSupabaseServer } from '@/utils/supabase/server';
import { User } from '@/utils/supabase/users';

export default async function UsersPage() {
    const supabase = await createSupabaseServer();

    const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching users:', error);
        throw error;
    }

    return <UsersContent initialUsers={users as User[]} />;
}