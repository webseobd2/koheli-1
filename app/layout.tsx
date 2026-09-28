import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import ReduxProvider from "@/providers/ReduxProvider";
import { BASE_URL } from "@/lib/accessEnv";
import { ICategory, IProduct } from "@/types";

const inter = Inter({ subsets: ["latin"] });
// Nothing
export async function generateMetadata(): Promise<Metadata> {
  try {
    // Fetch site settings
    const res = await fetch(`${BASE_URL}/api/site-settings`, {
      cache: "no-store",
    });
    const settingData = await res.json();
    const setting = settingData?.data;

    // Fallback metadata if settings are not available
    const fallbackMetadata: Metadata = {
      title: "Koholi - Your Online Shopping Destination",
      description: "description",
    };

    if (!setting) {
      return fallbackMetadata;
    }

    return {
      title: setting.metaTitle || setting.siteName || fallbackMetadata.title,
      description: setting.metaDescription || fallbackMetadata.description,
      // Additional metadata
      keywords:
        setting.keywords ||
        "shopping, furniture, electronics, fashion, bangladesh, online store",
      authors: [{ name: setting.siteName || "Koholi" }],
      creator: setting.siteName || "Koholi",
      publisher: setting.siteName || "Koholi",
    };
  } catch (error) {
    console.error("Error generating metadata:", error);

    // Return fallback metadata on error
    return {
      title: "Koholi - Your Online Shopping Destination",
      description:
        "Shop furniture, electronics, and fashion at the best prices in Bangladesh",
    };
  }
}
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // GET PRODUCTS
  const productRes = await fetch(`${BASE_URL}/api/products`, {
    method: "GET",
    cache: "no-store",
  });
  const productsData = await productRes.json();
  const products: IProduct[] = productsData?.data;

  // GET CATEGORYS
  const catResponse = await fetch(`${BASE_URL}/api/categories`,
    {
      next: {
        revalidate: 3600,
      },
    }
  );
  const categoriesData = await catResponse.json();
  const categories: ICategory[] = categoriesData?.data || [];

  // App SETTING
  const res = await fetch(`${BASE_URL}/api/site-settings`, {
    cache: "no-store",
  });
  const setting = await res.json();

  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxProvider
          products={products}
          categories={categories}
          setting={setting?.data}
        >
          <main className="min-h-screen">{children}</main>
          <Toaster />
        </ReduxProvider>
      </body>
    </html>
  );
}
