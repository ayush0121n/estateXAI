/* eslint-disable */
import { useEffect, useRef, useState, useMemo } from 'react';
import { MapPin, School, Hospital, Bus, ShoppingBag, Leaf, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default Leaflet icon paths broken by Vite/Webpack bundling
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const POI_ICON_MAP = {
    school: <School size={14} />,
    hospital: <Hospital size={14} />,
    transport: <Bus size={14} />,
    shopping: <ShoppingBag size={14} />,
    park: <Leaf size={14} />,
    other: <MapPin size={14} />,
};

const POI_COLOR_MAP = {
    school: '#3b82f6',
    hospital: '#ef4444',
    transport: '#f59e0b',
    shopping: '#a855f7',
    park: '#22d3a5',
    other: 'var(--primary)',
};

function calculateWalkabilityScore(pois) {
    if (!pois || pois.length === 0) return 0;
    const close = pois.filter(p => p.distanceKm <= 0.5).length;
    const medium = pois.filter(p => p.distanceKm > 0.5 && p.distanceKm <= 1.5).length;
    const far = pois.filter(p => p.distanceKm > 1.5).length;
    const typeBonus = new Set(pois.map(p => p.type)).size * 5;
    return Math.min(100, Math.round(close * 15 + medium * 7 + far * 2 + typeBonus));
}

const CARTO_API_KEY = import.meta.env.VITE_CARTO_API_KEY || 'cb1_4rho_1_afaafdf324caa87ee4b09c2a';

export default function PropertyMap({ property }) {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [tileError, setTileError] = useState(false);

    const CITY_COORDS = {
        'Pune': { lat: 18.5204, lng: 73.8567 },
        'Bangalore': { lat: 12.9716, lng: 77.5946 },
        'Mumbai': { lat: 19.0760, lng: 72.8777 },
        'Delhi NCR': { lat: 28.7041, lng: 77.1025 },
        'Hyderabad': { lat: 17.3850, lng: 78.4867 },
        'Chennai': { lat: 13.0827, lng: 80.2707 },
        'Kolkata': { lat: 22.5726, lng: 88.3639 },
    };

    const fallback = CITY_COORDS[property?.location?.city] || { lat: 20.5937, lng: 78.9629 };
    const effectiveLat = property?.location?.coordinates?.lat || fallback.lat;
    const effectiveLng = property?.location?.coordinates?.lng || fallback.lng;
    const isExactLocation = !!(property?.location?.coordinates?.lat && property?.location?.coordinates?.lng);
    const pois = property?.nearbyPOIs || [];

    const walkabilityScore = useMemo(
        () => property?.walkabilityScore || calculateWalkabilityScore(pois),
        [property, pois]
    );
    const connectivityScore = property?.connectivityScore || Math.round(walkabilityScore * 0.85);

    // Google Maps / Street View links
    const googleMapsUrl = `https://www.google.com/maps?q=${effectiveLat},${effectiveLng}`;
    const streetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${effectiveLat},${effectiveLng}`;

    useEffect(() => {
        if (!mapRef.current) return;

        setIsLoading(true);
        setTileError(false);

        // Clean up previous instance cleanly
        if (mapInstance.current) {
            try {
                mapInstance.current.off();
                mapInstance.current.remove();
            } catch (err) {
                console.warn('Error removing previous map instance:', err);
            }
            mapInstance.current = null;
        }

        let map;
        try {
            map = L.map(mapRef.current, {
                zoomControl: true,
                scrollWheelZoom: false, // prevent accidental zoom while scrolling page
                attributionControl: true,
            }).setView([effectiveLat, effectiveLng], isExactLocation ? 15 : 11);

            mapInstance.current = map;
        } catch (err) {
            console.error('Failed to initialize Leaflet map:', err);
            setIsLoading(false);
            return;
        }

        // Reliable CartoDB Voyager tiles with user API key & proper attribution
        const tileLayer = L.tileLayer(
            `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${CARTO_API_KEY}`,
            {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 20,
            }
        );

        let tilesLoadedCount = 0;
        let fallbackTried = false;

        tileLayer.on('tileload', () => {
            tilesLoadedCount++;
            if (tilesLoadedCount >= 1) {
                setIsLoading(false);
            }
        });

        tileLayer.on('load', () => {
            setIsLoading(false);
        });

        tileLayer.on('tileerror', (e) => {
            console.warn('Map tile failed to load:', e);
            if (!fallbackTried) {
                fallbackTried = true;
                const fallbackTileLayer = L.tileLayer(
                    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
                    { attribution: 'Tiles &copy; Esri', maxZoom: 19 }
                );
                fallbackTileLayer.on('tileload', () => {
                    tilesLoadedCount++;
                    setIsLoading(false);
                    setTileError(false);
                });
                fallbackTileLayer.on('load', () => {
                    setIsLoading(false);
                    setTileError(false);
                });
                fallbackTileLayer.addTo(map);
            }

            // Fallback timeout will reveal error if no tiles succeed
            setTimeout(() => {
                if (tilesLoadedCount === 0) {
                    setTileError(true);
                    setIsLoading(false);
                }
            }, 3500);
        });

        tileLayer.addTo(map);

        // Approximate area circle
        if (!isExactLocation) {
            L.circle([effectiveLat, effectiveLng], {
                color: 'var(--primary, #c9a35e)',
                fillColor: 'var(--primary, #c9a35e)',
                fillOpacity: 0.12,
                radius: 2500,
                weight: 1.5,
                dashArray: '6 4',
            }).addTo(map);
        }

        // Main property marker
        const mainIcon = L.divIcon({
            className: 'custom-property-pin',
            html: `<div style="background:var(--primary,#c9a35e);width:38px;height:38px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 4px 14px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;">
                     <div style="transform:rotate(45deg);width:10px;height:10px;background:#fff;border-radius:50%;"></div>
                   </div>`,
            iconSize: [38, 38],
            iconAnchor: [19, 38],
            popupAnchor: [0, -38],
        });

        L.marker([effectiveLat, effectiveLng], { icon: mainIcon })
            .addTo(map)
            .bindPopup(
                `<div style="font-family:inherit;padding:2px 4px;">
                   <b style="color:#121820;font-size:14px;">${property?.title || 'Property Location'}</b><br/>
                   <span style="color:#555;font-size:12px;margin-top:2px;display:block;">${isExactLocation ? (property?.location?.address || '') : 'Approximate area shown'}</span>
                 </div>`,
                { maxWidth: 240 }
            )
            .openPopup();

        // POI markers
        pois.forEach(poi => {
            if (!poi.lat || !poi.lng) return;
            const color = POI_COLOR_MAP[poi.type] || '#c9a35e';
            const poiIcon = L.divIcon({
                className: 'custom-poi-pin',
                html: `<div style="background:${color};width:22px;height:22px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.35);"></div>`,
                iconSize: [22, 22],
                iconAnchor: [11, 11],
            });
            L.marker([poi.lat, poi.lng], { icon: poiIcon })
                .addTo(map)
                .bindPopup(`<div style="font-family:inherit;"><b>${poi.name}</b><br/><span style="font-size:12px;color:#6b6b6b;">${poi.type} · ${poi.distanceKm} km</span></div>`);
        });

        // Trigger multiple invalidateSize calls to eliminate gray tile artifacting on initial render / layout shift
        const invalidate = () => {
            if (mapInstance.current) {
                mapInstance.current.invalidateSize();
            }
        };

        const t1 = setTimeout(invalidate, 100);
        const t2 = setTimeout(invalidate, 300);
        const t3 = setTimeout(invalidate, 700);
        const t4 = setTimeout(invalidate, 1500);

        // Fallback to remove loader after 2.5s maximum even on slow connections
        const fallbackLoader = setTimeout(() => {
            setIsLoading(false);
        }, 2500);

        // Window resize listener
        window.addEventListener('resize', invalidate);

        // ResizeObserver for dynamic container visibility
        let ro = null;
        if (typeof ResizeObserver !== 'undefined' && mapRef.current) {
            ro = new ResizeObserver(() => {
                invalidate();
            });
            ro.observe(mapRef.current);
        }

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            clearTimeout(t4);
            clearTimeout(fallbackLoader);
            window.removeEventListener('resize', invalidate);
            if (ro) ro.disconnect();
            if (mapInstance.current) {
                try {
                    mapInstance.current.off();
                    mapInstance.current.remove();
                } catch (e) {
                    // ignore
                }
                mapInstance.current = null;
            }
        };
    }, [effectiveLat, effectiveLng, isExactLocation]);

    const scoreColor = (s) => s >= 70 ? '#22d3a5' : s >= 40 ? '#f59e0b' : '#ef4444';

    return (
        <div style={{ marginTop: 28 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={18} color="var(--primary)" /> Location Intelligence
            </h3>

            {/* Map container with overlays */}
            <div style={{ position: 'relative', marginBottom: 16 }}>
                <div
                    ref={mapRef}
                    style={{
                        height: 340,
                        width: '100%',
                        borderRadius: 16,
                        overflow: 'hidden',
                        border: '1px solid rgba(201,163,94,0.25)',
                        zIndex: 1,
                        background: '#1a1f26', // dark modern placeholder while tiles load
                    }}
                />

                {/* Loading Map Overlay */}
                {isLoading && (
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 500,
                            background: 'rgba(18, 24, 32, 0.75)',
                            backdropFilter: 'blur(4px)',
                            borderRadius: 16,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 10,
                            color: '#fff',
                            fontSize: 13,
                            fontWeight: 500,
                            pointerEvents: 'none',
                        }}
                    >
                        <Loader2 size={24} color="var(--primary, #c9a35e)" className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                        <span>Loading interactive map...</span>
                    </div>
                )}

                {/* Tile Error Alert Overlay */}
                {tileError && (
                    <div
                        style={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            zIndex: 510,
                            background: 'rgba(239, 68, 68, 0.9)',
                            color: '#fff',
                            padding: '6px 12px',
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        }}
                    >
                        <AlertCircle size={14} /> Map tiles slow or unavailable. Check network.
                    </div>
                )}

                {/* Approximate area badge */}
                {!isExactLocation && (
                    <div
                        style={{
                            position: 'absolute',
                            top: 12,
                            left: 12,
                            zIndex: 400,
                            background: 'rgba(0,0,0,0.72)',
                            color: '#fff',
                            padding: '4px 12px',
                            borderRadius: 20,
                            fontSize: 12,
                            backdropFilter: 'blur(6px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                        }}
                    >
                        📍 Approximate Location
                    </div>
                )}

                {/* Street View & Maps external deep links */}
                <div style={{ position: 'absolute', bottom: 12, right: 12, zIndex: 400, display: 'flex', gap: 8 }}>
                    <a
                        href={streetViewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View Google Street View"
                        style={{
                            background: 'rgba(0,0,0,0.75)',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: 8,
                            padding: '6px 12px',
                            fontSize: 12,
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            backdropFilter: 'blur(4px)',
                            cursor: 'pointer',
                            textDecoration: 'none',
                        }}
                    >
                        🚶 Street View
                    </a>
                    <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open in Google Maps"
                        style={{
                            background: 'rgba(0,0,0,0.75)',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: 8,
                            padding: '6px 10px',
                            fontSize: 12,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            backdropFilter: 'blur(4px)',
                            cursor: 'pointer',
                            textDecoration: 'none',
                        }}
                    >
                        <ExternalLink size={13} /> Maps
                    </a>
                </div>
            </div>

            {/* Walkability & Connectivity Scores */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                {[
                    { label: 'Walkability Score', score: walkabilityScore, icon: '🚶' },
                    { label: 'Connectivity Score', score: connectivityScore, icon: '🔗' },
                ].map(({ label, score, icon }) => (
                    <div key={label} style={{ background: 'rgba(201,163,94,0.07)', border: '1px solid rgba(201,163,94,0.2)', borderRadius: 12, padding: '14px 16px' }}>
                        <div style={{ fontSize: 11, color: '#aaa', marginBottom: 6 }}>{icon} {label}</div>
                        <div style={{ fontSize: 26, fontWeight: 800, color: scoreColor(score) }}>
                            {score}<span style={{ fontSize: 14, color: '#aaa', fontWeight: 400 }}>/100</span>
                        </div>
                        <div style={{ marginTop: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 6, height: 6, overflow: 'hidden' }}>
                            <div style={{ width: `${score}%`, height: '100%', background: scoreColor(score), borderRadius: 6, transition: 'width 0.8s ease' }} />
                        </div>
                        <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>
                            {score >= 70 ? 'Excellent' : score >= 50 ? 'Good' : score >= 30 ? 'Moderate' : 'Limited'}
                        </div>
                    </div>
                ))}
            </div>

            {/* Nearby POIs */}
            {pois.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                    <h4 style={{ fontSize: 14, color: '#aaa', marginBottom: 10 }}>Nearby Places</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {pois.map((poi, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                                <span style={{ color: POI_COLOR_MAP[poi.type] || 'var(--primary)' }}>{POI_ICON_MAP[poi.type]}</span>
                                <span style={{ flex: 1, fontSize: 13 }}>{poi.name}</span>
                                <span style={{ fontSize: 12, color: '#888' }}>{poi.distanceKm} km</span>
                                <span style={{ fontSize: 11, color: POI_COLOR_MAP[poi.type] || 'var(--primary)', background: 'rgba(201,163,94,0.1)', padding: '2px 8px', borderRadius: 12, textTransform: 'capitalize' }}>{poi.type}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Future Development */}
            <div style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span>🏗️</span>
                    <h4 style={{ margin: 0, fontSize: 14, color: '#f59e0b' }}>Future Development</h4>
                    <span style={{ marginLeft: 'auto', fontSize: 10, color: '#888', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 8 }}>Admin-editable</span>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: '#bbb', lineHeight: 1.6 }}>
                    {property?.futureDevelopment || 'No upcoming development info available. Owners and admins can add nearby infrastructure projects via the dashboard.'}
                </p>
            </div>
        </div>
    );
}
