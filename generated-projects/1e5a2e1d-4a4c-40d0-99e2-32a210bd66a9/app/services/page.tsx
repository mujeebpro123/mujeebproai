import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ServicesPage() {
  return (
    <div className="pt-24">
      <section className="section-padding">
        <div className="container">
          <p className="text-champagne uppercase tracking-[0.3em] text-sm mb-4">Our Services</p>
          <h1 className="font-serif text-5xl font-light mb-12">Crafted for the Discerning</h1>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="border border-champagne/20 p-8">
              <h2 className="font-serif text-2xl mb-4 text-champagne">Private Tastings</h2>
              <p className="text-ivory/70 mb-6">
                An intimate guided tasting of our rarest single-origin coffees, led by our master roaster.
              </p>
              <Link href="/contact" className="btn-outline inline-flex items-center gap-2">
                Enquire <ArrowRight size={16} />
              </Link>
            </div>
            <div className="border border-champagne/20 p-8">
              <h2 className="font-serif text-2xl mb-4 text-champagne">Corporate Programs</h2>
              <p className="text-ivory/70 mb-6">
                Elevate your office with a curated coffee subscription and on-site barista training.
              </p>
              <Link href="/contact" className="btn-outline inline-flex items-center gap-2">
                Enquire <ArrowRight size={16} />
              </Link>
            </div>
            <div className="border border-champagne/20 p-8">
              <h2 className="font-serif text-2xl mb-4 text-champagne">Roasting Workshops</h2>
              <p className="text-ivory/70 mb-6">
                Learn the art of small-batch roasting and take home your own custom blend.
              </p>
              <Link href="/contact" className="btn-outline inline-flex items-center gap-2">
                Enquire <ArrowRight size={16} />
              </Link>
            </div>
            <div className="border border-champagne/20 p-8">
              <h2 className="font-serif text-2xl mb-4 text-champagne">Bespoke Blends</h2>
              <p className="text-ivory/70 mb-6">
                Work with our team to create a signature coffee exclusively for your brand or home.
              </p>
              <Link href="/contact" className="btn-outline inline-flex items-center gap-2">
                Enquire <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}