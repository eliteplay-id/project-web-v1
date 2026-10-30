import type { BuyerReview } from "@/lib/steam";

/**
 * Review pembeli Eliteplay — DUMMY untuk tampilan awal.
 * Nanti diganti database setelah toko jalan: daftar ini dihapus,
 * buyerReviewsFor() baca dari tabel reviews (filter gameId + approved).
 */
const dummy: BuyerReview[] = [
  { name: "Rizky", gameId: "gta-v", stars: 5, text: "Key masuk 3 menit, langsung aktif di Steam. Termurah yang nemu.", date: "Oct 2026" },
  { name: "Salsa", gameId: "gta-v", stars: 5, text: "Sempat gagal redeem sekali, admin ganti key baru dalam 10 menit.", date: "Oct 2026" },
  { name: "Dimas", gameId: "elden-ring", stars: 5, text: "Deluxe lebih murah dari Steam standard. Gila sih ini.", date: "Oct 2026" },
  { name: "Putri", gameId: "elden-ring", stars: 4, text: "Key valid, cuma email agak telat pas flash sale. Overall puas.", date: "Oct 2026" },
  { name: "Bagas", gameId: "baldurs-gate-3", stars: 5, text: "100 jam++ dan key-nya no drama. Recommended seller.", date: "Oct 2026" },
  { name: "Nadia", gameId: "baldurs-gate-3", stars: 5, text: "Beli malem, main malem itu juga. Prosesnya gampang.", date: "Sep 2026" },
  { name: "Fajar", gameId: "rdr-2", stars: 5, text: "Rockstar launcher langsung nyangkut. Harga setengah Steam.", date: "Oct 2026" },
  { name: "Intan", gameId: "cyberpunk-2077", stars: 4, text: "Game-nya bagus banget pasca update 2.0, key-nya aman.", date: "Sep 2026" },
  { name: "Yoga", gameId: "stardew-valley", stars: 5, text: "Buat kado adik, redeem lancar jaya. Makasih!", date: "Oct 2026" },
  { name: "Kirana", gameId: "hogwarts-legacy", stars: 5, text: "Akhirnya bisa ke Hogwarts tanpa nunggu diskon Steam.", date: "Oct 2026" },
  { name: "Reza", gameId: "palworld", stars: 4, text: "Main bareng 3 temen, server stabil. Key oke.", date: "Oct 2026" },
  { name: "Tania", gameId: "fc-25", stars: 4, text: "Ultimate Team langsung kebuka. Pengiriman cepat.", date: "Sep 2026" },
  { name: "Galih", gameId: "black-myth-wukong", stars: 5, text: "Visualnya gila di RTX 4060. Key ori, no VPN.", date: "Oct 2026" },
  { name: "Wulan", gameId: "ets-2", stars: 5, text: "Nyetir santai tiap malem. DLC-nya juga ready di sini.", date: "Oct 2026" },
  { name: "Andra", gameId: "hades", stars: 5, text: "Roguelike terbaik, 50 run masih nagih. Seller fast respon.", date: "Oct 2026" },
  { name: "Citra", gameId: "tekken-8", stars: 5, text: "Rank online langsung gas. Key fresh, bukan curian.", date: "Oct 2026" },
];

/** Ambil review pembeli untuk 1 game (nanti: query database). */
export function buyerReviewsFor(gameId: string): BuyerReview[] {
  const list = dummy.filter((r) => r.gameId === gameId);
  if (list.length > 0) return list;
  // Game baru tanpa review: tampilkan 2 ulasan umum agar section tidak kosong.
  return dummy.slice(0, 2).map((r) => ({ ...r, gameId }));
}
