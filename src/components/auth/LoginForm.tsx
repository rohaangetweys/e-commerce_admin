"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginForm() {
    const router = useRouter();
    const supabase = createClient();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setErrorMsg(error.message);
            setLoading(false);
            return;
        }

        router.push("/");
        router.refresh();
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
            <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4 bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>

                <div>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                {errorMsg && (
                    <p className="text-red-500 text-sm text-center">{errorMsg}</p>
                )}

                <button
                    type="submit"
                    className="w-full bg-black text-white p-3 rounded hover:bg-gray-800 disabled:opacity-50 transition duration-200"
                    disabled={loading}
                >
                    {loading ? "Signing in..." : "Login"}
                </button>
            </form>
        </div>
    );
}