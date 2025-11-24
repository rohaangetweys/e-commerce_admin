import { createClient } from './client';

export interface User {
    id: string;
    email: string;
    full_name: string;
    created_at: string;
    updated_at: string;
    is_active: boolean;
}

export const usersService = {
    async getUsers() {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as User[];
    },

    async createUser(userData: { email: string; full_name: string }) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('users')
            .insert([userData])
            .select()
            .single();

        if (error) throw error;
        return data as User;
    },

    async updateUser(id: string, updates: Partial<User>) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('users')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as User;
    },

    async toggleUserStatus(id: string, isActive: boolean) {
        return this.updateUser(id, { is_active: isActive });
    }
};