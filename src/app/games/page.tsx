import { Suspense } from "react";
import type { Metadata } from "next";
import { getCatalog } from "@/lib/catalog";
import CatalogClient from "./catalog-client";

export const metadata: Metadata = {
  title: "Catalog — ELITEPLAY",
  description: "Browse all cheap legit Steam keys. Filter by genre, sort by price, rating, or discount.",
};

export default async function CatalogPage() {
  const catalog = await getCatalog();
  return (
    <Suspense fallback={<main className="mx-auto max-w-7xl flex-1 px-4 py-10"><p className="text-muted">Loading games…</p></main>}>
      <CatalogClient games={catalog} />
    </Suspense>
  );
}
