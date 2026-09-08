import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import './PillNav.css';

export default function PillNav({
  items = [],
  activeHref,
  baseColor = "#0a0a0a",
  pillColor = "#f5c518",
  pillTextColor = "#0a0a0a",
  hoveredPillTextColor = "#ffffff",
  ease = "power2.easeOut",
  initialLoadAnimation = true
}) {
  const containerRef = useRef(null);
  const pillRef = useRef(null);
  const itemRefs = useRef([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const activeIndex = items.findIndex(item => activeHref === item.href || (item.href !== '/' && activeHref.startsWith(item.href + '/')));
  const currentIndex = hoveredIndex !== null ? hoveredIndex : (activeIndex >= 0 ? activeIndex : 0);

  useEffect(() => {
    if (!pillRef.current || !itemRefs.current[currentIndex]) return;
    
    const target = itemRefs.current[currentIndex];
    
    gsap.to(pillRef.current, {
      x: target.offsetLeft - 4,
      width: target.offsetWidth,
      duration: initialLoadAnimation ? 0.4 : 0,
      ease: ease,
    });
  }, [currentIndex, ease, initialLoadAnimation]);

  return (
    <div 
      className="pill-nav-container" 
      ref={containerRef}
      style={{
        '--base-color': baseColor,
        '--pill-color': pillColor,
      }}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      <div className="pill-nav-background" ref={pillRef} style={{ width: 0 }} />
      {items.map((item, index) => {
        const isActive = activeIndex === index;
        const isHovered = hoveredIndex === index;
        return (
          <Link
            key={item.href}
            to={item.href}
            ref={el => itemRefs.current[index] = el}
            className={`pill-nav-item ${isActive ? 'active' : ''}`}
            onMouseEnter={() => setHoveredIndex(index)}
            style={{
               color: (isHovered || (!hoveredIndex && isActive)) ? pillTextColor : 'var(--text-secondary)'
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
