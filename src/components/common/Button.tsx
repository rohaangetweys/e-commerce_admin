'use client';
import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'dark' | 'success';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    className,
    children,
    ...props
}) => {
    const baseClasses = "rounded-xl text-sm font-semibold transition cursor-pointer flex justify-center items-center";

    const variants = {
        primary: "bg-white text-black hover:bg-gray-100",
        secondary: "bg-black text-white hover:bg-gray-800",
        dark: "bg-[#333333] text-white hover:bg-[#555555]",
        outline: "border border-[#1ABA1A] text-[#1ABA1A] hover:bg-[#1ABA1A] hover:text-white",
        success: "bg-[#1ABA1A] text-white hover:bg-[#388E3C] shadow-lg",
    };

    const sizes = {
        sm: "w-[120px] h-10",
        md: "w-[160px] h-12",
        lg: "w-[200px] h-14"
    };

    return (
        <button
            className={cn(baseClasses, variants[variant], sizes[size], className)}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;