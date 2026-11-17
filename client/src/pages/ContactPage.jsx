import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Sparkles, Send, ExternalLink } from 'lucide-react';
import { ticketService } from '../services/api';
import { useAuthStore } from '../store/authStore';

export const ContactPage = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [formData, setFormData] = useState({
    name: null,
    phone: null,
    email: null,
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
        occasion: '',
        message: formData.message,
        subject: 'Showroom Visit / Customer Inquiry',
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
            Contact & Visit Us
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#930303]">
            Get in Touch with BL Jewels
          </h1>
          <p className="font-body text-xs sm:text-sm text-stone-600">
            Visit our showroom in Agra or send us your inquiry online. We are here to assist you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Info Card */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-8 border border-gold-300/60 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div>
                <h3 className="font-display text-xl font-bold text-charcoal">
                  Our Showroom
                </h3>
                <p className="text-xs text-stone-500 font-body mt-1">
                  Located at Civil Lines, Agra. We look forward to welcoming you.
                </p>
              </div>

              <div className="space-y-4 font-body text-xs text-stone-700">
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#930303] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-stone-900 font-semibold">Phone Number</strong>
                    <a href="tel:07454986610" className="hover:text-[#930303] transition-colors font-medium">074549 86610</a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#930303] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-stone-900 font-semibold">Email Address</strong>
                    <a href="mailto:concierge@bljewels.com" className="hover:text-[#930303] transition-colors">concierge@bljewels.com</a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#930303] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-stone-900 font-semibold">Showroom Address</strong>
                    <span className="leading-relaxed text-stone-600 block mt-0.5">
                      Upper Ground Floor, Shop No.01, Suresh Mall, Mahatma Gandhi Rd, Ramnagar Colony, Civil Lines, Agra, Uttar Pradesh 282002
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Embedded Live Google Map */}
            <div className="pt-5 border-t border-stone-200/70 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <MapPin size={12} className="text-[#930303]" />
                  <span>Showroom Location Map</span>
                </span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('B.L. Jewels, Suresh Mall, MG Road, Civil Lines, Agra, Uttar Pradesh 282002')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-semibold text-[#930303] hover:underline inline-flex items-center gap-1"
                >
                  <span>Open in Maps</span>
                  <ExternalLink size={12} />
                </a>
              </div>
              <div className="w-full flex-1 min-h-[220px] rounded-2xl overflow-hidden border border-stone-200 bg-[#FAF7F2] shadow-2xs relative">
                <iframe
                  title="BL Jewels Showroom Google Map Location"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent('B.L. Jewels, Suresh Mall, MG Road, Civil Lines, Agra')}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full min-h-[220px] block border-0"
                />
              </div>
            </div>
          </div>

          {/* Right Appointment Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 border border-gold-300/60 shadow-sm">
            <h2 id="contact-form-title" className="font-display text-2xl font-bold text-charcoal mb-2">
              Send Us a Message
            </h2>
            <p className="text-xs text-stone-500 font-body mb-6">
              Please enter your details below. Our team will get back to you shortly.
            </p>

            {error && (
              <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
                {error}
              </p>
            )}

            {submittedTicket ? (
              <div role="status" className="py-12 px-6 text-center space-y-3 bg-ivory rounded-2xl border border-gold-200">
                <Sparkles className="w-10 h-10 text-gold-600 mx-auto" />
                <h3 className="font-display text-xl font-bold text-charcoal">Message Sent Successfully</h3>
                {submittedTicket.ticketNumber && (
                  <p className="inline-block rounded-full bg-white border border-gold-300 px-3 py-1 text-[11px] font-semibold text-[#930303]">
                    Reference ID: {submittedTicket.ticketNumber}
                  </p>
                )}
                <p className="text-xs text-stone-600 font-body max-w-sm mx-auto">
                  Thank you for reaching out. Our team will review your inquiry and contact you soon.
                </p>
                <div className="pt-2 flex flex-wrap justify-center gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setSubmittedTicket(null)}
                    className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:border-[#930303] hover:text-[#930303] cursor-pointer"
                  >
                    Send Another Message
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
                      placeholder="Enter your full name"
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
                      placeholder="Enter your contact phone number"
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
                    placeholder="Enter your email address"
                    className="w-full px-3.5 py-2.5 bg-pearl border border-border-light rounded-xl text-base sm:text-xs text-stone-900 focus:outline-none focus:border-gold-400"
                  />
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-xs font-semibold text-stone-700 mb-1">
                    Your Message / Inquiry <span aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={4}
                    required
                    placeholder="How can we help you? Write your message here..."
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
                  <span>{submitting ? 'Sending Message…' : 'Send Message'}</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

