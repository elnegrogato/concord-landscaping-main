'use client';

import { Phone, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full max-w-6xl mx-auto mt-4 bg-[#2D3A3A] text-[#F8F9F1]/80 rounded-[24px] p-8">
      <div className="flex flex-col md:flex-row justify-between items-center text-xs font-medium gap-4">
        <p>© {new Date().getFullYear()} Concord Landscaping. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="tel:+17048864240" className="hover:text-white transition-colors flex items-center gap-1.5">
            <Phone className="w-3 h-3" />
            (704) 886-4240
          </a>
          <a
            href="mailto:info@concordlandscaping.com"
            className="hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Mail className="w-3 h-3" />
            Email Us
          </a>
        </div>
      </div>
    </footer>
  );
}
