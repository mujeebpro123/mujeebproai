// synthetic-journey-edit:c0d09649-81f7-48db-b50f-a437657387d7
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-obsidian to-jewel/50" />
        <div className="relative z-10 text-center px-4">
          <p className="text-champagne uppercase tracking-[0.3em] text-sm mb-4">Artisanal Coffee</p>
          <h1 className="font-serif text-5xl md:text-7xl font-light leading-tight mb-6">
            The Journey of
            <br />
            <span className="italic text-champagne">Excellence</span>
          </h1>
          <p className="text-ivory/80 max-w-xl mx-auto mb-8 text-lg">
            Discover rare beans, masterful roasting, and a private tasting experience crafted for connoisseurs.
          </p>
          <Link href="/services" className="btn-outline inline-flex items-center gap-2">
            Explore Services <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Brand Statement */}
      <section className="section-padding">
        <div className="container max-w-4xl text-center">
          <p className="text-champagne uppercase tracking-[0.3em] text-sm mb-6">Our Philosophy</p>
          <h2 className="font-serif text-4xl md:text-5xl font-light leading-tight mb-8">
            Where every cup tells a story of origin, patience, and artistry.
          </h2>
          <p className="text-ivory/70 text-lg leading-relaxed">
            We source the finest beans from sustainable farms, roast them in small batches, and serve them with a dedication that borders on obsession.
          </p>
        </div>
      </section>

      {/* Signature Offering */}
      <section className="section-padding bg-ivory text-obsidian">
        <div className="container grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-champagne uppercase tracking-[0.3em] text-sm mb-4">Signature</p>
            <h2 className="font-serif text-4xl font-light mb-6">The 786 Blend</h2>
            <p className="text-obsidian/70 mb-8">
              A harmonious fusion of Ethiopian Yirgacheffe and Colombian Supremo, roasted to a perfect medium-dark. Notes of dark chocolate, jasmine, and a hint of citrus.
            </p>
            <Link href="/contact" className="btn-dark inline-flex items-center gap-2">
              Reserve a Tasting <ArrowRight size={16} />
            </Link>
          </div>
          <div className="aspect-square bg-jewel/20 rounded-full flex items-center justify-center">
            <span className="font-serif text-8xl text-champagne">786</span>
          </div>
        </div>
      </section>

      {/* Provenance */}
      <section className="section-padding">
        <div className="container grid md:grid-cols-3 gap-8">
          <div className="border border-champagne/20 p-8">
            <h3 className="font-serif text-2xl mb-4 text-champagne">Ethiopia</h3>
            <p className="text-ivory/70">High-altitude farms in Yirgacheffe produce beans with floral and tea-like complexity.</p>
          </div>
          <div className="border border-champagne/20 p-8">
            <h3 className="font-serif text-2xl mb-4 text-champagne">Colombia</h3>
            <p className="text-ivory/70">Volcanic soils and shade-grown cultivation yield a balanced, caramel-sweet cup.</p>
          </div>
          <div className="border border-champagne/20 p-8">
            <h3 className="font-serif text-2xl mb-4 text-champagne">Sumatra</h3>
            <p className="text-ivory/70">Wet-hulled beans bring earthy depth and a full, syrupy body.</p>
          </div>
        </div>
      </section>

      {/* Private Service */}
      <section className="section-padding bg-jewel/30">
        <div className="container max-w-4xl text-center">
          <p className="text-champagne uppercase tracking-[0.3em] text-sm mb-4">Private Service</p>
          <h2 className="font-serif text-4xl md:text-5xl font-light mb-6">Bespoke Coffee Curation</h2>
          <p className="text-ivory/80 text-lg mb-8">
            Our concierge team designs personalized coffee programs for hotels, restaurants, and private residences.
          </p>
          <Link href="/contact" className="btn-outline inline-flex items-center gap-2">
            Enquire Now <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Testimonial */}
      <section className="section-padding">
        <div className="container max-w-3xl text-center">
          <p className="text-champagne text-6xl mb-6">“</p>
          <blockquote className="font-serif text-2xl md:text-3xl font-light italic leading-relaxed">
            The 786 Blend transformed our morning ritual. It is not just coffee; it is a moment of pure luxury.
          </blockquote>
          <p className="mt-6 text-sm uppercase tracking-widest text-ivory/60">— A Discerning Client</p>
        </div>
      </section>

      {/* Enquiry CTA */}
      <section className="section-padding border-t border-champagne/20">
        <div className="container text-center">
          <h2 className="font-serif text-4xl font-light mb-4">Begin Your Journey</h2>
          <p className="text-ivory/70 mb-8">Contact our concierge to arrange a private tasting or consultation.</p>
          <Link href="/contact" className="btn-outline inline-flex items-center gap-2">
            Contact Us <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}