'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { Menu, X, Phone } from 'lucide-react';

const navLinks = [
  { href: '#services', label: 'Services' },
  { href: '#about', label: 'About' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#contact', label: 'Contact' },
];

export function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <div className="w-full max-w-6xl mx-auto sticky top-4 z-50 mb-6">
        <header className="flex items-center justify-between px-6 py-4 bg-[#F8F9F1]/80 backdrop-blur-md rounded-full shadow-sm border border-[#1B4332]/10 transition-all">
          <Link href="/" className="flex items-center gap-2 group">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-[#95D5B2] drop-shadow-sm group-hover:scale-110 transition-transform"
            >
              <path
                d="M12 2C12 2 4 6 4 14C4 18.5 7.5 22 12 22C16.5 22 20 18.5 20 14C20 6 12 2 12 2ZM12 20V12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 16C8 16 9 12 12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="font-serif text-2xl font-bold tracking-tight text-[#1B4332]">
              Concord<span className="text-[#D4A373]">Landscaping</span>
            </div>
          </Link>
          <nav className="hidden md:block" aria-label="Main navigation">
            <ul className="flex items-center gap-8 text-sm uppercase tracking-widest font-bold text-[#1B4332]">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-[#D4A373] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <button
            className="md:hidden text-[#1B4332] p-2 hover:bg-[#1B4332]/5 rounded-full transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Navigation"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-0 z-40 bg-[#F8F9F1] pt-24 px-6 flex flex-col gap-6"
            role="dialog"
            aria-label="Mobile navigation"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="text-2xl font-serif font-bold text-[#1B4332] border-b border-[#1B4332]/10 pb-4 tracking-tight"
              >
                {link.label}
              </Link>
            ))}
            <a
              href="tel:+17045550192"
              className="mt-auto mb-12 bg-[#1B4332] text-white px-8 py-4 rounded-full font-bold uppercase tracking-wider text-sm text-center hover:bg-[#2D3A3A] transition-colors"
            >
              <Phone className="w-4 h-4 inline mr-2" />
              Call Now
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
