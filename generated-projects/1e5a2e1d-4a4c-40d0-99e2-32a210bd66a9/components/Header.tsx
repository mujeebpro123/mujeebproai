import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-obsidian/80 backdrop-blur-md border-b border-champagne/20">
      <div className="container flex items-center justify-between py-4 px-4">
        <Link href="/" className="font-serif text-2xl tracking-widest text-ivory">
          786 Journey Coffee
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm uppercase tracking-widest text-ivory/80 hover:text-champagne transition">
            Home
          </Link>
          <Link href="/services" className="text-sm uppercase tracking-widest text-ivory/80 hover:text-champagne transition">
            Services
          </Link>
          <Link href="/contact" className="text-sm uppercase tracking-widest text-ivory/80 hover:text-champagne transition">
            Contact
          </Link>
        </nav>
        <Link href="/contact" className="btn-outline hidden md:inline-block">
          Concierge
        </Link>
        <Link href="/contact" className="md:hidden text-champagne text-sm uppercase tracking-widest">
          Concierge
        </Link>
      </div>
    </header>
  );
}