import AdminSidebar from "@/components/layout/AdminSidebar";
import { createSupabaseServer } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Toaster } from "react-hot-toast";

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
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    success: {
                        duration: 3000
                    },
                }}
            />
        </div>
    );
}