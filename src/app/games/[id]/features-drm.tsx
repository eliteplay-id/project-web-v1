"use client";

import { useState } from "react";
import {
  AudioLines,
  BadgeDollarSign,
  Captions,
  ChevronDown,
  ChevronUp,
  Cloud,
  CloudUpload,
  Crosshair,
  Eye,
  Gamepad,
  Gamepad2,
  GamepadDirectional,
  Globe,
  Hammer,
  Handshake,
  Headphones,
  Layers,
  Lock,
  MonitorCog,
  MonitorPlay,
  MonitorSmartphone,
  Network,
  Palette,
  Radio,
  Save,
  Share2,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Split,
  Swords,
  Tablet,
  TimerOff,
  Trophy,
  Tv,
  Type,
  User,
  Users,
  UsersRound,
  Vibrate,
  Volume2,
  Wifi,
  Medal,
  Joystick,
  type LucideIcon,
} from "lucide-react";

/**
 * Section "Game features" plek referensi: kartu-kartu vertikal berjejer
 * (ikon di ATAS, label 1-2 baris di bawah), di bawah section Visuals.
 * Grid responsif 2 kolom HP → 3 tablet → 6 desktop.
 *
 * - Tiap feature punya ikon SENDIRI (tidak ada yang kembar): Single-player
 *   = User, Multi = Users, Online Co-op = UsersRound, PvP = Swords,
 *   Online PvP = Crosshair, Co-op = Handshake, LAN = Network, dst.
 * - Kalau item banyak (>6) → tampil 6 pertama + tombol "Selengkapnya
 *   (N lainnya)", klik = expand semua, klik lagi = "Tutup".
 * - DRM (teks panjang, bukan ikon) = kartu kuning gembok di akhir, satu
 *   kartu per info DRM (dipisah koma/"and"), ikut collapse yang sama.
 */

const FEATURE_ICONS: { match: RegExp; Icon: LucideIcon }[] = [
  { match: /online pvp/i, Icon: Crosshair },
  { match: /pvp/i, Icon: Swords },
  { match: /online co-op/i, Icon: UsersRound },
  { match: /lan co-op/i, Icon: Network },
  { match: /shared\/split screen co-op/i, Icon: Split },
  { match: /shared\/split screen/i, Icon: MonitorPlay },
  { match: /remote play together/i, Icon: Radio },
  { match: /cross-platform/i, Icon: Globe },
  { match: /co-op/i, Icon: Handshake },
  { match: /multi-player|multiplayer/i, Icon: Users },
  { match: /single-player/i, Icon: User },
  { match: /steam achievements/i, Icon: Trophy },
  { match: /achievements/i, Icon: Medal },
  { match: /dualshock/i, Icon: Gamepad },
  { match: /dualsense/i, Icon: GamepadDirectional },
  { match: /full controller/i, Icon: Gamepad2 },
  { match: /partial controller/i, Icon: Joystick },
  { match: /controller/i, Icon: Vibrate },
  { match: /steam cloud/i, Icon: Cloud },
  { match: /cloud/i, Icon: CloudUpload },
  { match: /steam workshop/i, Icon: Hammer },
  { match: /steam trading cards|trading cards/i, Icon: Layers },
  { match: /family sharing/i, Icon: Share2 },
  { match: /remote play on tv/i, Icon: Tv },
  { match: /remote play on tablet/i, Icon: Tablet },
  { match: /remote play on phone/i, Icon: Smartphone },
  { match: /remote play/i, Icon: MonitorSmartphone },
  { match: /hdr/i, Icon: MonitorCog },
  { match: /in-app purchases|microtransaction/i, Icon: BadgeDollarSign },
  { match: /camera comfort/i, Icon: Eye },
  { match: /custom volume/i, Icon: Volume2 },
  { match: /playable without timed/i, Icon: TimerOff },
  { match: /save anytime/i, Icon: Save },
  { match: /surround sound/i, Icon: AudioLines },
  { match: /stereo sound/i, Icon: Headphones },
  { match: /adjustable text/i, Icon: Type },
  { match: /color alternatives|colour alternatives|color blind/i, Icon: Palette },
  { match: /adjustable difficulty/i, Icon: SlidersHorizontal },
  { match: /subtitle|caption/i, Icon: Captions },
  { match: /online/i, Icon: Wifi },
];

function iconFor(feature: string): LucideIcon {
  return FEATURE_ICONS.find((f) => f.match.test(feature))?.Icon ?? Sparkles;
}

function splitDrm(drm: string): string[] {
  return drm
    .split(/\s*,\s*|\s+and\s+/i)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Jumlah kartu sebelum di-collapse (pas 1 baris desktop). */
const COLLAPSED_COUNT = 6;

export function FeaturesDrm({ features, drm }: { features: string[]; drm: string | null }) {
  const [expanded, setExpanded] = useState(false);
  const drmParts = drm ? splitDrm(drm) : [];
  const total = features.length + drmParts.length;
  if (total === 0) return null;

  const collapsed = !expanded && total > COLLAPSED_COUNT;
  // DRM selalu kelihatan (info penting): saat collapse tampil
  // 5 feature pertama + 1 DRM = tetap 1 baris desktop.
  const visibleFeatures = collapsed ? features.slice(0, drmParts.length > 0 ? COLLAPSED_COUNT - 1 : COLLAPSED_COUNT) : features;
  const visibleDrm = collapsed ? drmParts.slice(0, 1) : drmParts;
  const hiddenCount = total - visibleFeatures.length - visibleDrm.length;

  return (
    <section aria-labelledby="game-features">
      <h2 id="game-features" className="text-2xl font-bold tracking-[-0.02em]">
        Game features
      </h2>
      <ul className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {visibleFeatures.map((f) => {
          const Icon = iconFor(f);
          return (
            <li
              key={f}
              title={f}
              className="flex min-h-[104px] flex-col items-center justify-center gap-2.5 rounded-lg border border-white/20 bg-white/[0.03] px-2 py-4 text-center"
            >
              <Icon className="h-5 w-5 text-white/85" aria-hidden="true" />
              <span className="line-clamp-2 text-[11px] font-semibold leading-snug text-white/85">{f}</span>
            </li>
          );
        })}
        {visibleDrm.map((d) => (
          <li
            key={d}
            title={drm ?? d}
            className="flex min-h-[104px] flex-col items-center justify-center gap-2.5 rounded-lg border border-amber-400/30 bg-amber-400/[0.07] px-2 py-4 text-center"
          >
            <Lock className="h-5 w-5 text-amber-300" aria-hidden="true" />
            <span className="line-clamp-2 text-[11px] font-semibold leading-snug text-amber-100/90">{d}</span>
          </li>
        ))}
      </ul>
      {total > COLLAPSED_COUNT && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-4 py-2 text-xs font-bold text-white/80 transition-colors hover:border-elite-cyan hover:text-elite-cyan"
        >
          {expanded ? (
            <>
              Tutup <ChevronUp className="h-4 w-4" aria-hidden="true" />
            </>
          ) : (
            <>
              Selengkapnya ({hiddenCount} lainnya) <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </button>
      )}
    </section>
  );
}
