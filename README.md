# Premium Real Estate Website

A cinematic, high-end real estate website built with Next.js 16, TypeScript, TailwindCSS, and GSAP.

## Features

- **Hero Section** - Full-screen hero with elegant typography and scroll indicator
- **Property Grid** - Responsive grid with cinematic parallax scroll effects
- **Property Cards** - Premium cards with hover animations and image parallax
- **Filtering System** - Smooth client-side filtering (All, Apartment, House, Commercial)
- **Cinematic Animations** - GSAP-powered smooth, premium animations

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- TailwindCSS
- GSAP with ScrollTrigger
- Next.js Image Optimization

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Homepage
│   └── globals.css         # Global styles
├── components/
│   ├── Hero.tsx            # Hero section component
│   ├── PropertyCard.tsx    # Individual property card
│   ├── PropertyGrid.tsx    # Property grid with filtering
│   └── FilterBar.tsx       # Filter navigation bar
├── lib/
│   └── animations.ts       # GSAP animation utilities
└── data/
    └── properties.json     # Property data
```

## Design System

### Colors
- Background: `#0E0E0E`
- Secondary dark: `#151515`
- Card background: `#1C1C1C`
- Text primary: `#F5F5F5`
- Text secondary: `#A3A3A3`
- Accent: `#C6A15B` (luxury gold)

### Typography
- Font: Inter (system fallback)
- Large, elegant headings
- Generous whitespace
- Strong visual hierarchy

## Animation Details

- **Parallax Effect**: Cards use GSAP ScrollTrigger for smooth vertical parallax (image moves slower than scroll)
- **Hover Effects**: Subtle scale and image zoom on card hover
- **Filter Animations**: Smooth fade and stagger animations when filtering
- **Scroll Indicator**: Animated scroll indicator in hero section

## Next Steps

This is Step 1 of the project. Future enhancements may include:
- Property detail pages
- Advanced filtering and search
- Image galleries
- Contact forms
- Additional animations and interactions
