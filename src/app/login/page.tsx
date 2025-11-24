import LoginForm from "@/components/auth/LoginForm";
import { createSupabaseServer } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function LoginPage() {
    const supabase = await createSupabaseServer();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const ADMIN_EMAIL = "rohaan@email.com";

    if (user && user.email === ADMIN_EMAIL) {
        redirect("/");
    }

    return <LoginForm />;
}