import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Sparkles, Send, ShieldCheck } from 'lucide-react';
import { ticketService } from '../services/api';
import { useAuthStore } from '../store/authStore';

export const ContactPage = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [formData, setFormData] = useState({
    name: null,
    phone: null,
    email: null,
    occasion: 'wedding',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submittedTicket, setSubmittedTicket] = useState(null);

  const effectiveName = formData.name ?? user?.name ?? '';
  const effectivePhone = formData.phone ?? user?.phone ?? '';
  const effectiveEmail = formData.email ?? user?.email ?? '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await ticketService.submitContact({
        name: effectiveName,
        phone: effectivePhone,
        email: effectiveEmail,
        occasion: formData.occasion,
        message: formData.message,
        subject: `Showroom Consultation — ${formData.occasion}`,
      });
      setSubmittedTicket(res.data || { ticketNumber: '' });
      setFormData((prev) => ({ ...prev, message: '' }));
    } catch (err) {
      setError(
        err.response?.data?.message || 'Unable to submit your inquiry right now. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-16 bg-pearl min-h-screen">
      <div className="container-bl max-w-5xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <span className="font-accent text-xs font-bold text-gold-700 tracking-[0.2em] uppercase">
            Showroom Visit & Contact Us
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#930303]">
            Connect with BL Jewels
          </h1>
          <p className="font-body text-xs sm:text-sm text-stone-600">
            Schedule a private viewing at our flagship showroom or speak directly with our master jewelry specialists.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Info Card */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-8 border border-gold-300/60 shadow-sm space-y-8">
            <div>
              <h3 className="font-display text-xl font-bold text-charcoal">
                Flagship Showroom
              </h3>
              <p className="text-xs text-stone-500 font-body mt-1">
                Located in the historic heart of India's jewelry capital.
              </p>
            </div>

            <div className="space-y-4 font-body text-xs text-stone-700">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#930303] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-900">Showroom Address</strong>
                  <span>Upper Ground Floor, Shop No.01, Suresh Mall, Mahatma Gandhi Rd, Ramnagar Colony, Civil Lines, Agra, Uttar Pradesh 282002</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#930303] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-900">Showroom Contact</strong>
                  <a href="tel:07454986610" className="hover:text-[#930303] transition-colors">074549 86610</a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#930303] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-900">Email Inquiries</strong>
                  <span>concierge@bljewels.com</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#930303] shrink-0 mt-0.5" />
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
            <h2 id="contact-form-title" className="font-display text-2xl font-bold text-charcoal mb-2">
              Book a Private Styling Appointment
            </h2>
            <p className="text-xs text-stone-500 font-body mb-6">
              Our gemologists and stylists will curate customized selections aligned with your wedding dates and purity preferences.
            </p>

            {error && (
              <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
                {error}
              </p>
            )}

            {submittedTicket ? (
              <div role="status" className="py-12 px-6 text-center space-y-3 bg-ivory rounded-2xl border border-gold-200">
                <Sparkles className="w-10 h-10 text-gold-600 mx-auto" />
                <h3 className="font-display text-xl font-bold text-charcoal">Appointment Request Received</h3>
                {submittedTicket.ticketNumber && (
                  <p className="inline-block rounded-full bg-white border border-gold-300 px-3 py-1 text-[11px] font-semibold text-[#930303]">
                    Reference ID: {submittedTicket.ticketNumber}
                  </p>
                )}
                <p className="text-xs text-stone-600 font-body max-w-sm mx-auto">
                  Namaste! Our showroom team has logged your inquiry and will respond shortly.
                </p>
                <div className="pt-2 flex flex-wrap justify-center gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setSubmittedTicket(null)}
                    className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:border-[#930303] hover:text-[#930303] cursor-pointer"
                  >
                    Send Another Inquiry
                  </button>
                  {isAuthenticated && (
                    <Link
                      to="/account"
                      className="px-4 py-2 rounded-xl bg-[#930303] text-white hover:bg-[#7A0303]"
                    >
                      Track in My Account
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <form aria-labelledby="contact-form-title" onSubmit={handleSubmit} method="POST" className="space-y-4 font-body">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="block text-xs font-semibold text-stone-700 mb-1">
                      Your Full Name <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      enterKeyHint="next"
                      value={effectiveName}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Radhika Sharma"
                      className="w-full px-3.5 py-2.5 bg-pearl border border-border-light rounded-xl text-base sm:text-xs text-stone-900 focus:outline-none focus:border-gold-400"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-phone" className="block text-xs font-semibold text-stone-700 mb-1">
                      Contact Phone <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      required
                      autoComplete="tel"
                      inputMode="tel"
                      enterKeyHint="next"
                      value={effectivePhone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98200 12345"
                      className="w-full px-3.5 py-2.5 bg-pearl border border-border-light rounded-xl text-base sm:text-xs text-stone-900 focus:outline-none focus:border-gold-400"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-email" className="block text-xs font-semibold text-stone-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    enterKeyHint="next"
                    value={effectiveEmail}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 bg-pearl border border-border-light rounded-xl text-base sm:text-xs text-stone-900 focus:outline-none focus:border-gold-400"
                  />
                </div>

                <div>
                  <label htmlFor="contact-occasion" className="block text-xs font-semibold text-stone-700 mb-1">
                    Celebrating Occasion
                  </label>
                  <select
                    id="contact-occasion"
                    name="occasion"
                    value={formData.occasion}
                    onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-pearl border border-border-light rounded-xl text-base sm:text-xs text-stone-900 focus:outline-none focus:border-gold-400"
                  >
                    <option value="wedding">Bridal & Wedding Trousseau</option>
                    <option value="engagement">Diamond Solitaire Engagement</option>
                    <option value="anniversary">Anniversary Celebration</option>
                    <option value="custom">Bespoke Jewelry Commission</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-xs font-semibold text-stone-700 mb-1">
                    Special Preferences / Inquiry <span aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={3}
                    required
                    placeholder="Tell us about desired karat purity (22K/18K), budget, or specific styles..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-pearl border border-border-light rounded-xl text-base sm:text-xs text-stone-900 focus:outline-none focus:border-gold-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-gradient-to-r from-[#930303] to-[#7A0303] hover:from-[#7A0303] hover:to-[#5C0202] disabled:opacity-60 text-white rounded-xl text-xs font-semibold font-body tracking-wider transition-all shadow-md shadow-[#930303]/25 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Sending Request…' : 'Request Private Appointment'}</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

