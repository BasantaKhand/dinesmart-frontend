"use client";

import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { useState } from "react";
import axios from "@/lib/axios";

export function ContactSection() {
  const [formData, setFormData] = useState({
    fullName: '',
    restaurantName: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.restaurantName || !formData.email || !formData.phone || !formData.message) {
      setErrorMessage('All fields are required');
      setSubmitStatus('error');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitStatus('idle');
      
      await axios.post('/contact', formData);
      
      setSubmitStatus('success');
      setFormData({ fullName: '', restaurantName: '', email: '', phone: '', message: '' });
      setTimeout(() => setSubmitStatus('idle'), 3000);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Failed to send message. Please try again.');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <section id="contact" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <p className="inline-flex rounded-full bg-[#FF5C00]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#FF5C00]">
          Contact
        </p>

        <h2 className="mt-4 text-[34px] font-extrabold leading-tight tracking-tight text-zinc-900 sm:text-[40px]">
          Talk to our team.
        </h2>

        <p className="mt-4 text-[16px] leading-7 text-zinc-600">
          Have questions or want a demo? Send a message and we’ll get back to you quickly.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-12">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-100 lg:col-span-7">
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
            <div className="sm:col-span-1">
              <label className="text-sm font-medium text-zinc-700">Full name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Your name"
                className="mt-2 w-full rounded-xl bg-white px-4 py-3 text-[15px] text-zinc-900 ring-1 ring-zinc-200 outline-none focus:ring-2 focus:ring-[#FF5C00]/40"
              />
            </div>

            <div className="sm:col-span-1">
              <label className="text-sm font-medium text-zinc-700">Restaurant name</label>
              <input
                type="text"
                name="restaurantName"
                value={formData.restaurantName}
                onChange={handleChange}
                placeholder="Your restaurant"
                className="mt-2 w-full rounded-xl bg-white px-4 py-3 text-[15px] text-zinc-900 ring-1 ring-zinc-200 outline-none focus:ring-2 focus:ring-[#FF5C00]/40"
              />
            </div>

            <div className="sm:col-span-1">
              <label className="text-sm font-medium text-zinc-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@restaurant.com"
                className="mt-2 w-full rounded-xl bg-white px-4 py-3 text-[15px] text-zinc-900 ring-1 ring-zinc-200 outline-none focus:ring-2 focus:ring-[#FF5C00]/40"
              />
            </div>

            <div className="sm:col-span-1">
              <label className="text-sm font-medium text-zinc-700">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                className="mt-2 w-full rounded-xl bg-white px-4 py-3 text-[15px] text-zinc-900 ring-1 ring-zinc-200 outline-none focus:ring-2 focus:ring-[#FF5C00]/40"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-zinc-700">Message</label>
              <textarea
                rows={5}
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us what you need (demo, pricing, branches, POS, inventory, etc.)"
                className="mt-2 w-full resize-none rounded-xl bg-white px-4 py-3 text-[15px] text-zinc-900 ring-1 ring-zinc-200 outline-none focus:ring-2 focus:ring-[#FF5C00]/40"
              />
            </div>

            {submitStatus === 'success' && (
              <div className="sm:col-span-2 rounded-lg bg-emerald-50 p-3 ring-1 ring-emerald-200">
                <p className="text-sm font-medium text-emerald-700">✓ Message sent successfully! We'll contact you soon.</p>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="sm:col-span-2 rounded-lg bg-rose-50 p-3 ring-1 ring-rose-200">
                <p className="text-sm font-medium text-rose-700">{errorMessage}</p>
              </div>
            )}

            <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3 pt-1">
              <p className="text-sm text-zinc-500">
                By submitting, you agree to be contacted about DineSmart RMS.
              </p>

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-[#FF5C00] px-6 py-2 text-[15px] font-medium text-white transition-colors duration-200 hover:bg-[#e65300] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        </div>

        <div className="self-start rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-100 lg:col-span-5">
          <h3 className="text-[18px] font-semibold text-zinc-900">Contact details</h3>
          <p className="mt-2 text-[15px] leading-7 text-zinc-600">
            Reach us directly or send a message using the form. We typically respond within 24 hours.
          </p>

          <div className="mt-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF5C00]/10">
                <Mail size={20} className="text-[#FF5C00]" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900">Email</p>
                <p className="text-[15px] text-zinc-600">support@dinesmart.com</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF5C00]/10">
                <Phone size={20} className="text-[#FF5C00]" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900">Phone</p>
                <p className="text-[15px] text-zinc-600">+1 (555) 123-4567</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF5C00]/10">
                <Clock size={20} className="text-[#FF5C00]" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900">Hours</p>
                <p className="text-[15px] text-zinc-600">Mon–Fri, 9:00 AM – 6:00 PM</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF5C00]/10">
                <MapPin size={20} className="text-[#FF5C00]" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900">Location</p>
                <p className="text-[15px] text-zinc-600">Your City, Your Country</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}