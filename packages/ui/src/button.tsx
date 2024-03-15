"use client";

import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
}

export const Button = ({ children }: ButtonProps) => {
  return (
    <button
      className="py-0"
      onClick={() => alert(`Hello from your ui library!`)}
    >
      {children}
    </button>
  );
};
