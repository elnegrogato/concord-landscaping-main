import type {Metadata} from 'next';
import { Inter, Cormorant_Garamond } from 'next/font/google';
import { Toaster } from 'sonner';
import Script from 'next/script';
import { Suspense } from 'react';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const cormorant = Cormorant_Garamond({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-serif',
});

export const metadata: Metadata = {
  title: 'Concord Landscaping | Landscape, Hardscaping & Irrigation Services in Concord, NC',
  description: 'Concord Landscaping offers premium landscape design, hardscaping, irrigation systems, and lawn maintenance in Concord, NC and Cabarrus County. Licensed & fully insured since 2008. Call (704) 886-4240 for a free estimate.',
  keywords: ['landscaping', 'lawn care', 'irrigation', 'hardscaping', 'Concord NC', 'Cabarrus County', 'landscape design', 'patio installation', 'lawn maintenance'],
  authors: [{ name: 'Concord Landscaping' }],
  creator: 'Concord Landscaping',
  metadataBase: new URL('https://concordlandscaping.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Concord Landscaping | Premium Landscape & Irrigation Services',
    description: 'Expert landscape design, hardscaping, irrigation systems, and maintenance serving Cabarrus County, NC since 2008.',
    url: 'https://concordlandscaping.com',
    siteName: 'Concord Landscaping',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/images/hero.png',
        width: 1200,
        height: 630,
        alt: 'Concord Landscaping — Transforming Outdoor Spaces',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@concordlandscaping',
    creator: '@concordlandscaping',
    title: 'Concord Landscaping | Premium Landscape & Irrigation Services',
    description: 'Expert landscape design, hardscaping, irrigation, and maintenance in Concord, NC.',
    images: ['/images/hero.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// LocalBusiness structured data
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LandscapingBusiness',
  name: 'Concord Landscaping',
  description: 'Premium landscape design, hardscaping, irrigation systems, and maintenance services in Concord, NC.',
  url: 'https://concordlandscaping.com',
  telephone: '+17048864240',
  email: 'info@concordlandscaping.com',
  foundingDate: '2001',
  image: 'https://concordlandscaping.com/images/hero.png',
  priceRange: '$$',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+17048864240',
    contactType: 'customer service',
    areaServed: 'US',
    availableLanguage: 'English',
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Concord',
    addressRegion: 'NC',
    postalCode: '28025',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 35.4088,
    longitude: -80.5795,
  },
  areaServed: {
    '@type': 'GeoCircle',
    geoMidpoint: {
      '@type': 'GeoCoordinates',
      latitude: 35.4088,
      longitude: -80.5795,
    },
    geoRadius: '30',
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '07:00',
      closes: '18:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Saturday',
      opens: '08:00',
      closes: '14:00',
    },
  ],
  sameAs: [],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Landscaping Services',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Landscape Design' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Hardscaping' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Irrigation Systems' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Lawn Maintenance' } },
    ],
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        {/* Google Tag Manager — set NEXT_PUBLIC_GTM_ID in .env.local (see .env.example) */}
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <Script
            id="google-tag-manager"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtm.js?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
          />
        )}
        {/* Google Analytics (GA4) — set NEXT_PUBLIC_GA_MEASUREMENT_ID in .env.local */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
            />
            <Script
              id="google-analytics-config"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {send_page_view: true});
                `,
              }}
            />
          </>
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans text-[#2D3A3A] bg-[#F8F9F1] selection:bg-[#1B4332] selection:text-white" suppressHydrationWarning>
        {/* Google Tag Manager (noscript fallback for crawlers that do not execute JS) */}
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <Suspense fallback={null}>
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
                height="0"
                width="0"
                style={{ display: "none", visibility: "hidden" }}
                title="Google Tag Manager (noscript)"
              />
            </noscript>
          </Suspense>
        )}
        {children}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
