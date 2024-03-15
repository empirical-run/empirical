import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn } from "../components/ui/lib";
import { ThemeProvider } from "../components/ui/theme-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", });
export const metadata: Metadata = {
  title: "Empirical evaluation app",
  description: "Empirical evaluation app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <body
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
            inter.variable,
          )}
        >
        <ThemeProvider 
          attribute="class"
          defaultTheme="dark">
            {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
