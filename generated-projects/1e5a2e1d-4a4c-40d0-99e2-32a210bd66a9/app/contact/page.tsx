"use client";

import { useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="pt-24">
      <section className="section-padding">
        <div className="container max-w-2xl">
          <p className="text-champagne uppercase tracking-[0.3em] text-sm mb-4">Contact</p>
          <h1 className="font-serif text-5xl font-light mb-12">Private Enquiry</h1>
          {submitted ? (
            <div className="border border-champagne/20 p-8 text-center">
              <p className="text-2xl font-serif mb-4">Thank you</p>
              <p className="text-ivory/70">Your enquiry has been received. Our concierge will contact you shortly.</p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
              className="space-y-8"
            >
              <div>
                <label htmlFor="name" className="label">Name</label>
                <input id="name" type="text" required className="input-field" />
              </div>
              <div>
                <label htmlFor="email" className="label">Email</label>
                <input id="email" type="email" required className="input-field" />
              </div>
              <div>
                <label htmlFor="message" className="label">Message</label>
                <textarea id="message" rows={5} required className="input-field resize-none" />
              </div>
              <button type="submit" className="btn-outline w-full">
                Send Enquiry
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}