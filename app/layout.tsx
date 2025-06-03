import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth/auth-provider";

export const metadata: Metadata = {
  title: "Aromalife",
  description:
    "Descubre nuestra exclusiva colección de fragancias y perfumes. Encuentra el aroma perfecto que refleje tu personalidad en Aromalife.",
  keywords:
    "perfumes, fragancias, aromas, tienda de perfumes, colonias, esencias",
  generator: "Next.js",
  icons: {
    icon: "https://res.cloudinary.com/dti5zalsf/image/upload/v1748554391/Dame_ese_logo_azul_s_ql9yey.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
