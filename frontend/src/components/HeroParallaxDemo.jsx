import React from "react";
import { HeroParallax } from "./HeroParallax";

export const products = [
  {
    title: "Modern Penthouse",
    link: "/properties",
    thumbnail: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Luxury Villa",
    link: "/properties",
    thumbnail: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Oceanfront Estate",
    link: "/properties",
    thumbnail: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Urban Loft",
    link: "/properties",
    thumbnail: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Suburban Mansion",
    link: "/properties",
    thumbnail: "https://images.unsplash.com/photo-1600566753086-00f18efc2294?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Minimalist Home",
    link: "/properties",
    thumbnail: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Country Retreat",
    link: "/properties",
    thumbnail: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Contemporary House",
    link: "/properties",
    thumbnail: "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Glass Pavilion",
    link: "/properties",
    thumbnail: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Forest Cabin",
    link: "/properties",
    thumbnail: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Lakeside Lodge",
    link: "/properties",
    thumbnail: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Desert Oasis",
    link: "/properties",
    thumbnail: "https://images.unsplash.com/photo-1600566753086-00f18efc2294?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Mountain Chalet",
    link: "/properties",
    thumbnail: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Historic Manor",
    link: "/properties",
    thumbnail: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Skyline Apartment",
    link: "/properties",
    thumbnail: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800",
  },
];

export default function HeroParallaxDemo() {
  return <HeroParallax products={products} />;
}
