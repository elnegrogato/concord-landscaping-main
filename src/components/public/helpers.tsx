'use client';

import { type ReactNode } from 'react';
import { Star, CheckCircle2, MapPin, Phone, Mail, Clock } from 'lucide-react';
import Image from 'next/image';

export function TrustBadge({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="bg-white rounded-[16px] px-4 py-3 border border-[#1B4332]/5 flex items-center gap-3 text-[#1B4332]">
      <div className="shrink-0 text-[#D4A373]">{icon}</div>
      <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
    </div>
  );
}

export function ServiceCard({
  icon,
  title,
  desc,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div
      className="bg-[#F8F9F1] rounded-[24px] p-8 border border-[#1B4332]/5 hover:shadow-md hover:-translate-y-1 transition-all group h-full flex flex-col"
    >
      <div className="w-12 h-12 bg-[#95D5B2] rounded-xl flex items-center justify-center mb-6 text-[#1B4332] group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="font-serif text-2xl font-bold text-[#1B4332] mb-3">{title}</h3>
      <p className="text-[#2D3A3A]/80 leading-relaxed text-sm font-medium">{desc}</p>
    </div>
  );
}

export function GalleryItem({
  src,
  alt,
  label,
  tag,
  className = '',
}: {
  src: string;
  alt: string;
  label: string;
  tag: string;
  className?: string;
}) {
  return (
    <div
      className={`${className} relative rounded-[16px] overflow-hidden group cursor-pointer shadow-lg outline outline-1 outline-white/10 hover:outline-[#95D5B2]/50 transition-all`}
    >
      <Image
        src={src}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        alt={alt}
        sizes="(max-width: 768px) 100vw, 50vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
        <div>
          <span className="font-bold tracking-wide block text-base mb-1">{label}</span>
          <span className="text-[#95D5B2] text-[10px] uppercase tracking-widest font-bold">{tag}</span>
        </div>
      </div>
    </div>
  );
}

export function TestimonialCard({
  quote,
  name,
  role,
  rating,
}: {
  quote: string;
  name: string;
  role: string;
  rating: number;
}) {
  return (
    <div className="bg-white rounded-[24px] p-8 border border-[#1B4332]/10 flex flex-col justify-between shadow-sm h-full">
      <div className="flex gap-0.5 mb-4">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-[#D4A373] text-[#D4A373]" />
        ))}
      </div>
      <blockquote className="font-serif italic text-lg leading-relaxed text-[#1B4332] mb-6 flex-grow">{quote}</blockquote>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#95D5B2] flex items-center justify-center text-[#1B4332] font-bold text-sm">
          {name.split(' ').map((n) => n[0]).join('')}
        </div>
        <div>
          <p className="font-bold text-sm tracking-wide text-[#1B4332]">{name}</p>
          <p className="text-xs font-bold uppercase tracking-widest opacity-60 text-[#2D3A3A]">{role}</p>
        </div>
      </div>
    </div>
  );
}

export function FormField({
  label,
  name,
  type,
  required,
}: {
  label: string;
  name: string;
  type: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5 focus-within:text-[#1B4332] transition-colors text-[#2D3A3A]/60">
      <label htmlFor={name} className="text-[10px] font-bold uppercase tracking-widest">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        className="w-full bg-[#F8F9F1] border border-[#1B4332]/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#95D5B2] focus:border-transparent transition-all outline-none text-sm font-medium text-[#2D3A3A]"
        required={required}
      />
    </div>
  );
}

export function ListItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <CheckCircle2 className="w-5 h-5 text-[#95D5B2] shrink-0" />
      <span className="mt-0.5 text-white/90 font-medium">{text}</span>
    </li>
  );
}
