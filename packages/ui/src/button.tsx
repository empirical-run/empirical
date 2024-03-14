"use client";

import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  className?: string;
}

export const Button = ({ children, className }: ButtonProps) => {
  return (
    <button
      className={className}
      onClick={() => alert(`Hello from your ui library!`)}
    >
      {children}
    </button>
  );
};
