'use client';
import React from 'react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'dark' | 'success';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
    routeTo?: string;
    isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    className,
    children,
    routeTo,
    isLoading = false,
    ...props
}) => {
    const router = useRouter();

    const baseClasses = "rounded-xl text-sm font-semibold transition cursor-pointer flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-white text-black hover:bg-gray-100",
        secondary: "bg-black text-white hover:bg-gray-800",
        dark: "bg-gray-800 text-white hover:bg-gray-700",
        outline: "border border-green-600 text-green-600 hover:bg-green-600 hover:text-white",
        success: "bg-green-600 text-white hover:bg-green-700 shadow-lg",
    };

    const sizes = {
        sm: "w-[120px] h-10 px-3 py-2",
        md: "w-[160px] h-12 px-4 py-3",
        lg: "w-[200px] h-14 px-6 py-4"
    };

    return (
        <>
            {
                routeTo ? (
                    <button
                        className={cn(baseClasses, variants[variant], sizes[size], className)}
                        {...props}
                        onClick={() => {
                            if (routeTo) {
                                router.push(routeTo);
                            }
                        }}
                        disabled={isLoading || props.disabled}
                    >
                        {isLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        ) : (
                            children
                        )}
                    </button>
                ) : (
                    <button
                        className={cn(baseClasses, variants[variant], sizes[size], className)}
                        {...props}
                        disabled={isLoading || props.disabled}
                    >
                        {isLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        ) : (
                            children
                        )}
                    </button>
                )
            }
        </>
    );
};

export default Button;