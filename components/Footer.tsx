import Link from "next/link";
import { MapPin, Phone, Sprout } from "lucide-react";

const links = [
  { label: "Mandi marketplace", href: "/buyer/marketplace" },
  { label: "Sell your crop", href: "/farmer/crops/new" },
  { label: "Bulk sourcing", href: "/buyer/bulk-order" },
  { label: "Rider dispatch", href: "/rider/deliveries" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-emerald-900/60 bg-[#062c18] text-emerald-100">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.35fr_1fr_1fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-xl bg-amber-400 text-xl text-emerald-950"><Sprout className="size-5" /></span>
            <span className="text-xl font-black tracking-tight text-white font-serif">FarmFresh</span>
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-emerald-100/70">
            India&apos;s direct farm network for fair prices, fresh produce, and dependable local delivery.
          </p>
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-300">Explore</p>
          <div className="mt-3 grid gap-2">
            {links.map((link) => <Link key={link.href} href={link.href} className="text-sm font-medium text-emerald-100/75 hover:text-amber-300">{link.label}</Link>)}
          </div>
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-300">Kisan support</p>
          <div className="mt-3 space-y-2 text-sm text-emerald-100/75">
            <p className="flex items-center gap-2"><Phone className="size-4 text-amber-300" />1800-180-1551</p>
            <p className="flex items-center gap-2"><MapPin className="size-4 text-amber-300" />Serving farms across India</p>
          </div>
        </div>
      </div>
      <div className="border-t border-emerald-800/70 py-3 text-center text-xs text-emerald-200/55">© 2026 FarmFresh Krishi Network · Direct from farm to home</div>
    </footer>
  );
}
