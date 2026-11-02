import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Sparkles, Send, ShieldCheck } from 'lucide-react';
import { BRAND } from '../lib/constants';

export const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    occasion: 'wedding',
    message: '',
  });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="py-16 bg-pearl min-h-screen">
      <div className="container-bl max-w-5xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <span className="font-accent text-xs font-bold text-gold-700 tracking-[0.2em] uppercase">
            Personal Concierge & Boutique Appointments
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-crimson-900">
            Connect with BL Jewels
          </h1>
          <p className="font-body text-xs sm:text-sm text-stone-600">
            Schedule a private salon viewing at our flagship boutique or speak with our master jewelry stylists.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Info Card */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-8 border border-gold-300/60 shadow-sm space-y-8">
            <div>
              <h3 className="font-display text-xl font-bold text-charcoal">
                Flagship Boutique
              </h3>
              <p className="text-xs text-stone-500 font-body mt-1">
                Located in the historic heart of India's jewelry capital.
              </p>
            </div>

            <div className="space-y-4 font-body text-xs text-stone-700">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-crimson-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-900">Boutique Address</strong>
                  <span>BL Jewels House, Zaveri Bazaar, Kalbadevi, Mumbai, Maharashtra 400002</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-crimson-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-900">Direct Concierge</strong>
                  <span>+91 98765 43210 / +91 98200 12345</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-crimson-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-900">Email Inquiries</strong>
                  <span>concierge@bljewels.com</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-crimson-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-900">Visiting Hours</strong>
                  <span>Monday to Saturday: 10:30 AM – 8:30 PM (Closed on Sundays)</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gold-50/80 rounded-2xl border border-gold-300 text-xs font-body text-gold-900">
              <ShieldCheck className="w-4 h-4 text-gold-700 inline mr-1.5" />
              <span>Complimentary valet parking & private bridal salon available upon appointment.</span>
            </div>
          </div>

          {/* Right Appointment Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 border border-gold-300/60 shadow-sm">
            <h2 className="font-display text-2xl font-bold text-charcoal mb-2">
              Book a Private Styling Appointment
            </h2>
            <p className="text-xs text-stone-500 font-body mb-6">
              Our gemologists and stylists will curate customized selections aligned with your wedding dates and purity preferences.
            </p>

            {sent ? (
              <div className="py-12 text-center space-y-3 bg-ivory rounded-2xl border border-gold-200">
                <Sparkles className="w-10 h-10 text-gold-600 mx-auto" />
                <h3 className="font-display text-xl font-bold text-charcoal">Appointment Request Received</h3>
                <p className="text-xs text-stone-600 font-body max-w-sm mx-auto">
                  Namaste! Our concierge will call you within 2 business hours to confirm your private salon appointment.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-body">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Radhika Sharma"
                      className="w-full px-3.5 py-2.5 bg-pearl border border-border-light rounded-xl text-stone-900 focus:outline-none focus:border-gold-400"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Contact Phone *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98200 12345"
                      className="w-full px-3.5 py-2.5 bg-pearl border border-border-light rounded-xl text-stone-900 focus:outline-none focus:border-gold-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 bg-pearl border border-border-light rounded-xl text-stone-900 focus:outline-none focus:border-gold-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Celebrating Occasion</label>
                  <select
                    value={formData.occasion}
                    onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-pearl border border-border-light rounded-xl text-stone-900 focus:outline-none focus:border-gold-400"
                  >
                    <option value="wedding">Bridal & Wedding Trousseau</option>
                    <option value="engagement">Diamond Solitaire Engagement</option>
                    <option value="anniversary">Anniversary Celebration</option>
                    <option value="custom">Bespoke Jewelry Commission</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Special Preferences / Note</label>
                  <textarea
                    rows={3}
                    placeholder="Tell us about desired karat purity (22K/18K), budget, or specific styles..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-pearl border border-border-light rounded-xl text-stone-900 focus:outline-none focus:border-gold-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-crimson-700 to-crimson-600 hover:from-crimson-800 hover:to-crimson-700 text-white rounded-xl text-xs font-semibold font-body tracking-wider transition-all shadow-crimson flex items-center justify-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Request Private Appointment</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

