import AdminSidebar from "@/components/common/AdminSidebar";
import { createSupabaseServer } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const supabase = await createSupabaseServer();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const ADMIN_EMAIL = "rohaan@email.com";

    if (!user || user.email !== ADMIN_EMAIL) {
        redirect("/login");
    }

    return (
        <div className="flex w-full h-screen bg-gray-50">
            <AdminSidebar />
            <main className="flex-1 overflow-auto">
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}