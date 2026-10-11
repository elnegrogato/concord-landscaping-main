'use client';

import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { Leaf, Droplets, MapPin, Phone, Mail, Spade, Trees, Clock, CheckCircle2, Menu, X, Hammer, Star, ArrowRight, Shield, Sprout, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { NavBar } from '@/components/public/blocks/NavBar';
import { Footer } from '@/components/public/blocks/Footer';
import { TrustBadge, ServiceCard, GalleryItem, TestimonialCard, FormField, ListItem } from '@/components/public/helpers';

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      projectDetails: formData.get('projectDetails') as string,
      service: formData.get('service') as string,
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Something went wrong');
      }

      toast.success('Message sent! We will be in touch within 24 hours.');
      form.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9F1] text-[#2D3A3A] p-4 md:p-6 lg:p-8 flex flex-col items-center font-sans scroll-smooth custom-scrollbar">
      <NavBar />

      {/* Page-specific structured data (Service + BreadcrumbList) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://concordlandscaping.com",
              },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "Service",
              name: "Landscape Design",
              provider: {
                "@type": "LandscapingBusiness",
                name: "Concord Landscaping",
                telephone: "+17048864240",
              },
            },
            {
              "@context": "https://schema.org",
              "@type": "Service",
              name: "Hardscaping",
              provider: {
                "@type": "LandscapingBusiness",
                name: "Concord Landscaping",
                telephone: "+17048864240",
              },
            },
            {
              "@context": "https://schema.org",
              "@type": "Service",
              name: "Irrigation Systems",
              provider: {
                "@type": "LandscapingBusiness",
                name: "Concord Landscaping",
                telephone: "+17048864240",
              },
            },
            {
              "@context": "https://schema.org",
              "@type": "Service",
              name: "Lawn Maintenance",
              provider: {
                "@type": "LandscapingBusiness",
                name: "Concord Landscaping",
                telephone: "+17048864240",
              },
            },
          ]),
        }}
      />

      {/* Main Container */}
      <main className="w-full max-w-6xl mx-auto flex flex-col gap-4">
        
        {/* ═══ Hero Bento Row ═══ */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, staggerChildren: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4"
        >
          
          {/* Hero Section */}
          <motion.section 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-2 relative rounded-[24px] overflow-hidden bg-[#1B4332] text-white p-8 md:p-12 flex flex-col justify-end min-h-[400px]"
          >
            <div className="absolute top-6 right-6 px-4 py-1.5 bg-white/20 rounded-full text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3 h-3" />
              Serving Cabarrus County
            </div>
            
            <div className="absolute inset-0 z-0 opacity-30 mix-blend-overlay">
              <Image
                src="/images/hero.png"
                alt="Beautifully landscaped residential home in Concord, NC"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 66vw"
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative z-10"
            >
              <h1 className="font-serif text-4xl md:text-5xl lg:text-[56px] leading-[1.1] mb-5 font-bold">
                Transforming Outdoor Spaces.
              </h1>
              <p className="text-base md:text-lg text-white/90 max-w-sm mb-6">
                Premium landscape design, hardscaping, and precision irrigation for homes across Cabarrus County.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="#contact"
                  className="bg-[#D4A373] text-white px-8 py-4 rounded-full font-bold uppercase tracking-wider text-xs md:text-sm hover:bg-[#c4935f] hover:shadow-lg hover:-translate-y-0.5 transition-all w-fit flex items-center gap-2"
                >
                  Request a Free Quote
                  <ArrowRight className="w-4 h-4" />
                </Link>
                  <a
                    href="tel:+17048864240"
                    className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-full font-bold uppercase tracking-wider text-xs md:text-sm hover:bg-white/20 transition-colors w-fit flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    (704) 886-4240
                  </a>
              </div>
            </motion.div>
          </motion.section>

          {/* Side Stats */}
          <div className="grid grid-cols-1 gap-4 lg:col-span-1">
            <div className="bg-[#D4A373] text-white rounded-[24px] p-8 flex flex-col items-center justify-center border border-[#1B4332]/10 h-full min-h-[160px]">
              <div className="text-5xl font-extrabold mb-1 font-serif">450+</div>
              <div className="text-xs uppercase tracking-widest opacity-90 font-bold text-center">Properties Managed</div>
            </div>
            <div className="bg-[#95D5B2] text-[#1B4332] rounded-[24px] p-8 flex flex-col justify-center border border-[#1B4332]/10 h-full">
               <blockquote className="font-serif italic text-lg leading-relaxed mb-4">
                 &ldquo;Expert horticultural science with an eye for timeless landscape architecture.&rdquo;
               </blockquote>
               <div className="font-bold text-sm tracking-wide flex items-center gap-2">
                 <div className="w-8 h-8 rounded-full bg-[#1B4332] text-[#95D5B2] flex items-center justify-center text-xs font-serif italic">est</div>
                 <span>Since 2008</span>
               </div>
            </div>
          </div>
        </motion.div>

        {/* ═══ Trust Strip ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <TrustBadge icon={<Shield className="w-5 h-5" />} label="Licensed & Insured" />
          <TrustBadge icon={<Star className="w-5 h-5" />} label="4.9★ Rating" />
          <TrustBadge icon={<CalendarDays className="w-5 h-5" />} label="16+ Years Experience" />
          <TrustBadge icon={<Sprout className="w-5 h-5" />} label="Eco-Friendly Practices" />
        </motion.div>

        {/* ═══ Services Section ═══ */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          id="services" 
          className="bg-white rounded-[24px] p-8 md:p-12 border border-[#1B4332]/10 scroll-mt-24"
        >
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1B4332]">Our Expertise</h2>
              <p className="text-[#2D3A3A]/60 text-sm mt-2">Comprehensive outdoor solutions for residential and commercial properties.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ServiceCard 
              icon={<Trees className="w-6 h-6 text-[#1B4332]" />}
              title="Landscape Design"
              desc="From conceptual 3D designs to meticulous planting, we craft environments that enhance property value and curb appeal."
            />
            <ServiceCard 
              icon={<Hammer className="w-6 h-6 text-[#1B4332]" />}
              title="Hardscaping"
              desc="Premium paver patios, retaining walls, fire pits, and stone features built for longevity and lasting beauty."
            />
            <ServiceCard 
              icon={<Droplets className="w-6 h-6 text-[#1B4332]" />}
              title="Irrigation Systems"
              desc="Smart watering solutions designed to conserve water while ensuring lush, healthy lawns year-round."
            />
            <ServiceCard 
              icon={<Spade className="w-6 h-6 text-[#1B4332]" />}
              title="Maintenance"
              desc="Comprehensive scheduled lawn care including mowing, pruning, fertilization, aeration, and seasonal cleanups."
            />
          </div>
        </motion.section>

        {/* ═══ Gallery Section ═══ */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          id="gallery" 
          className="bg-[#1B4332] rounded-[24px] p-8 md:p-12 border border-[#1B4332]/10 text-white scroll-mt-24"
        >
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-serif text-3xl md:text-4xl font-bold">Recent Projects</h2>
            <Link href="#contact" className="hidden md:inline-flex bg-[#D4A373] text-white px-6 py-3 rounded-full font-bold uppercase tracking-wider text-xs hover:bg-[#c4935f] hover:shadow-lg transition-all items-center gap-2">
              Start Yours
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
            <GalleryItem
              src="/images/gallery-patio.png"
              alt="Custom stone paver patio with fire pit surrounded by lush landscaping"
              label="Custom Paver Patio"
              tag="Hardscaping"
              className="col-span-2 row-span-2"
            />
            <GalleryItem
              src="/images/gallery-lawn.png"
              alt="Perfectly manicured residential lawn with diagonal mowing lines"
              label="Precision Lawn Care"
              tag="Maintenance"
            />
            <GalleryItem
              src="/images/gallery-garden.png"
              alt="Colorful garden bed with salvia, black-eyed Susans, and roses"
              label="Garden Installation"
              tag="Design"
            />
            <GalleryItem
              src="/images/gallery-irrigation.png"
              alt="Residential irrigation system sprinklers watering a green lawn at sunrise"
              label="Smart Irrigation"
              tag="Irrigation"
              className="col-span-2"
            />
          </div>
        </motion.section>

        {/* ═══ About Section ═══ */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          id="about" 
          className="rounded-[24px] p-8 md:p-12 border border-[#1B4332]/10 bg-[#1B4332] text-white scroll-mt-24 shadow-sm"
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h2 className="font-serif text-3xl font-bold mb-2">Why Choose Us</h2>
              <p className="text-white/70 text-sm leading-relaxed mb-6">
                For over 16 years, we&apos;ve been the trusted landscaping partner for homeowners and businesses throughout the Piedmont region. Our team combines horticultural expertise with an eye for design to deliver outdoor spaces that stand the test of time.
              </p>
              <ul className="space-y-4 pt-2">
                <ListItem text="Licensed & Fully Insured" />
                <ListItem text="Deep Knowledge of Piedmont Region Soil & Climate" />
                <ListItem text="Reliable, On-Time Service Professionals" />
                <ListItem text="Guaranteed Customer Satisfaction" />
                <ListItem text="Free Consultations & Transparent Pricing" />
              </ul>
            </motion.div>
            <div className="relative aspect-[3/2] rounded-[16px] overflow-hidden shadow-lg border border-white/10 group">
              <Image
                src="/images/about-team.png"
                alt="Concord Landscaping team planting shrubs on a residential property"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </motion.section>

        {/* ═══ Testimonials Strip ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-2 gap-4"
        >
          <TestimonialCard
            quote="The best irrigation and landscaping team in Cabarrus County. They transformed our entire backyard into an oasis."
            name="Sarah Jenkins"
            role="Homeowner, Concord"
            rating={5}
          />
          <TestimonialCard
            quote="Professional from start to finish. Our paver patio and fire pit turned out even better than we imagined. Highly recommend!"
            name="Michael Torres"
            role="Homeowner, Harrisburg"
            rating={5}
          />
        </motion.div>

        {/* ═══ Contact + Info ═══ */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, staggerChildren: 0.1 }}
          className="grid md:grid-cols-3 gap-4"
        >
          <motion.section 
            id="contact" 
            className="md:col-span-2 bg-white rounded-[24px] p-8 md:p-10 border border-[#1B4332]/10 flex flex-col justify-center scroll-mt-24 shadow-sm"
          >
            <div className="mb-8">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1B4332] mb-3">Start Your Project</h2>
              <p className="text-[#2D3A3A]/70 text-sm">Contact us today for a free consultation and customized quote.</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <div className="grid md:grid-cols-2 gap-4">
                <FormField label="First Name" name="firstName" type="text" required />
                <FormField label="Last Name" name="lastName" type="text" required />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <FormField label="Email Address" name="email" type="email" required />
                <FormField label="Phone Number" name="phone" type="tel" />
              </div>
              <div className="space-y-1.5 focus-within:text-[#1B4332] transition-colors text-[#2D3A3A]/60">
                <label htmlFor="service" className="text-[10px] font-bold uppercase tracking-widest">Service Interested In</label>
                <select 
                  id="service"
                  name="service" 
                  className="w-full bg-[#F8F9F1] border border-[#1B4332]/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#95D5B2] focus:border-transparent transition-all outline-none text-sm font-medium text-[#2D3A3A] appearance-none"
                >
                  <option value="">Select a service (optional)</option>
                  <option value="landscape-design">Landscape Design</option>
                  <option value="hardscaping">Hardscaping</option>
                  <option value="irrigation">Irrigation Systems</option>
                  <option value="maintenance">Lawn Maintenance</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-1.5 focus-within:text-[#1B4332] transition-colors text-[#2D3A3A]/60">
                <label htmlFor="projectDetails" className="text-[10px] font-bold uppercase tracking-widest">Project Details</label>
                <textarea 
                  id="projectDetails"
                  name="projectDetails" 
                  rows={3} 
                  className="w-full bg-[#F8F9F1] border border-[#1B4332]/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#95D5B2] focus:border-transparent transition-all outline-none resize-none text-sm font-medium text-[#2D3A3A]" 
                  required
                  placeholder="Tell us about your project..."
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-auto px-8 mt-4 bg-[#1B4332] hover:bg-[#2D3A3A] hover:shadow-lg hover:-translate-y-0.5 text-white font-bold uppercase tracking-wider text-xs py-4 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </motion.section>

          {/* Sidebar Info */}
          <div className="grid grid-cols-1 gap-4 lg:col-span-1">
             <motion.section 
               initial={{ opacity: 0, x: 20 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="bg-white rounded-[24px] p-6 flex flex-col items-center justify-center gap-3 border border-[#1B4332]/10 h-full min-h-[160px] text-center shadow-sm"
             >
               <div className="w-14 h-14 rounded-[14px] bg-[#95D5B2]/30 flex items-center justify-center mb-1">
                  <MapPin className="w-7 h-7 text-[#1B4332]" />
               </div>
               <div>
                 <h3 className="text-lg font-bold text-[#1B4332] mb-1">Service Area</h3>
                 <p className="text-sm font-medium text-[#2D3A3A]/70">Concord, Harrisburg, Kannapolis & Surrounding Areas</p>
               </div>
               <div className="flex flex-col gap-2 mt-2 w-full">
                   <a href="tel:+17048864240" className="flex items-center justify-center gap-2 text-[#1B4332] font-bold text-sm hover:text-[#D4A373] transition-colors">
                     <Phone className="w-4 h-4" /> (704) 886-4240
                   </a>
                 <a href="mailto:info@concordlandscaping.com" className="flex items-center justify-center gap-2 text-[#1B4332]/70 font-medium text-xs hover:text-[#D4A373] transition-colors">
                   <Mail className="w-3.5 h-3.5" /> info@concordlandscaping.com
                 </a>
               </div>
             </motion.section>
             
             <motion.section 
               initial={{ opacity: 0, x: 20 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="bg-[#D4A373] text-white rounded-[24px] p-8 border border-[#1B4332]/10 h-full flex flex-col justify-center shadow-sm"
             >
               <Clock className="w-8 h-8 mb-4 opacity-80" />
               <h3 className="font-serif text-xl font-bold mb-3">Business Hours</h3>
               <div className="space-y-1.5 text-sm font-medium text-white/90">
                 <div className="flex justify-between"><span>Mon – Fri</span><span>7:00 AM – 6:00 PM</span></div>
                 <div className="flex justify-between"><span>Saturday</span><span>8:00 AM – 2:00 PM</span></div>
                 <div className="flex justify-between text-white/60"><span>Sunday</span><span>Closed</span></div>
               </div>
             </motion.section>
          </div>
        </motion.div>

      </main>


      <Footer />
    </div>
  );
}


