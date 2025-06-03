"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { NavItems } from "@/components/nav/nav-items";
import { BackButton } from "@/components/ui/back-button";
import { InstagramIcon } from "@/components/ui/instagram-icon";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";
import { ShoppingCart, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserService } from "@/services/users/user.service";

interface MainLayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
}

export function MainLayout({
  children,
  showBackButton = true,
}: MainLayoutProps) {
  const pathname = usePathname();
  const isHomePage = pathname === "/home";
  const isWelcomePage = pathname === "/";
  const [adminWhatsApp, setAdminWhatsApp] = useState<string>("");

  useEffect(() => {
    const loadAdminWhatsApp = async () => {
      try {
        const adminPhoneData = await UserService.getAdminPhone();
        setAdminWhatsApp(`https://wa.me/${adminPhoneData.fullPhone}`);
      } catch (error) {
        console.error("Error loading admin WhatsApp:", error);
        // Fallback to hardcoded link if admin info can't be loaded
        setAdminWhatsApp("https://api.whatsapp.com/message/BEKRCLLN2IM7F1");
      }
    };

    loadAdminWhatsApp();
  }, []);
  const { isAuthenticated } = useAuthStore();
  const { cart } = useCartStore();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4 ml-4">
            {" "}
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="https://res.cloudinary.com/dti5zalsf/image/upload/v1748554391/Dame_ese_logo_azul_s_ql9yey.png"
                width={40}
                height={40}
                alt="Aromalife Logo"
                className="object-contain min-w-[40px]"
              />
              <div className="hidden xs:flex flex-col">
                <span className="text-[#4BBDB7] text-lg font-light leading-tight tracking-wider">
                  AROMALIFE
                </span>
                <span className="text-[#333333] text-xs font-light tracking-wider">
                  VELAS DECORATIVAS
                </span>
              </div>
            </Link>
          </div>
          <NavItems />
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t py-6 md:py-0">
        <div className="w-full flex items-center justify-center md:h-16">
          <div className="flex items-center justify-center gap-8">
            <Link
              href="https://www.instagram.com/velasaromalife"
              className="text-gray-600 hover:text-gray-800 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <InstagramIcon size={28} />
            </Link>
            <Link
              href={
                adminWhatsApp ||
                "https://api.whatsapp.com/message/BEKRCLLN2IM7F1"
              }
              className="text-gray-600 hover:text-gray-800 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              <WhatsAppIcon size={28} />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
