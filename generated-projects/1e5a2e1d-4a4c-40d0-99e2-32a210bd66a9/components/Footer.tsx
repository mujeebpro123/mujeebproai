import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-champagne/20 py-8">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4 px-4">
        <p className="text-sm text-ivory/60">© 2024 786 Journey Coffee. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="/" className="text-sm text-ivory/60 hover:text-champagne transition">
            Home
          </Link>
          <Link href="/services" className="text-sm text-ivory/60 hover:text-champagne transition">
            Services
          </Link>
          <Link href="/contact" className="text-sm text-ivory/60 hover:text-champagne transition">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}