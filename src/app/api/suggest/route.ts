import { getCatalog } from "@/lib/catalog";
import { coverOf } from "@/data/games";

/** Saran game ringan untuk dropdown search navbar: id + judul + harga + cover. */
export async function GET() {
  const catalog = await getCatalog();
  return Response.json({
    items: catalog.map((g) => ({
      id: g.id,
      title: g.title,
      price: g.price,
      original: g.original,
      cover: coverOf(g),
      genres: g.genres,
    })),
  });
}
