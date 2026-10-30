async function check(id) {
  const r = await fetch("http://127.0.0.1:3000/games/" + id, { signal: AbortSignal.timeout(90000) });
  const t = await r.text();
  const sec = t.split("Game features")[1]?.split("</section>")[0] ?? "";
  console.log(
    id, "STATUS", r.status,
    "| N_CARDS", (sec.match(/<li/g) || []).length,
    "| SELENGKAPNYA", sec.includes("Selengkapnya"),
  );
}
async function main() {
  await check("gta-v");
  await check("elden-ring");
}
main();
