/* eslint-disable */
import { useEffect, useRef, useMemo } from 'react';
import { MapPin, School, Hospital, Bus, ShoppingBag, Leaf, ExternalLink } from 'lucide-react';
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

export default function PropertyMap({ property }) {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);

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

        // Destroy previous instance to avoid "Map container already initialized" error
        if (mapInstance.current) {
            mapInstance.current.remove();
            mapInstance.current = null;
        }

        const map = L.map(mapRef.current, {
            zoomControl: true,
            scrollWheelZoom: false, // prevent accidental scroll-zoom
        }).setView([effectiveLat, effectiveLng], isExactLocation ? 15 : 11);

        mapInstance.current = map;

        // Use ResizeObserver to invalidate map size whenever the container becomes visible
        // (fixes maps inside hidden tabs or collapsing sections)
        const ro = new ResizeObserver(() => {
            if (mapInstance.current) mapInstance.current.invalidateSize();
        });
        ro.observe(mapRef.current);

        // Also invalidate after short delay for first render
        setTimeout(() => mapInstance.current?.invalidateSize(), 300);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
        }).addTo(map);

        // Approximate area circle
        if (!isExactLocation) {
            L.circle([effectiveLat, effectiveLng], {
                color: 'var(--primary)',
                fillColor: 'var(--primary)',
                fillOpacity: 0.12,
                radius: 2500,
                weight: 1.5,
                dashArray: '6 4',
            }).addTo(map);
        }

        // Main property marker
        const mainIcon = L.divIcon({
            className: '',
            html: `<div style="background:var(--primary,#c9a35e);width:38px;height:38px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;">
                     <div style="transform:rotate(45deg);width:10px;height:10px;background:#fff;border-radius:50%;"></div>
                   </div>`,
            iconSize: [38, 38],
            iconAnchor: [19, 38],
            popupAnchor: [0, -38],
        });

        L.marker([effectiveLat, effectiveLng], { icon: mainIcon })
            .addTo(map)
            .bindPopup(
                `<b style="color:#121820;">${property?.title || 'Property Location'}</b><br/>
                 <span style="color:#6b6b6b;font-size:12px;">${isExactLocation ? (property?.location?.address || '') : 'Approximate area shown'}</span>`,
                { maxWidth: 220 }
            )
            .openPopup();

        // POI markers
        pois.forEach(poi => {
            if (!poi.lat || !poi.lng) return;
            const color = POI_COLOR_MAP[poi.type] || '#c9a35e';
            const poiIcon = L.divIcon({
                className: '',
                html: `<div style="background:${color};width:22px;height:22px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.35);"></div>`,
                iconSize: [22, 22],
                iconAnchor: [11, 11],
            });
            L.marker([poi.lat, poi.lng], { icon: poiIcon })
                .addTo(map)
                .bindPopup(`<b>${poi.name}</b><br/><span style="font-size:12px;color:#6b6b6b;">${poi.type} · ${poi.distanceKm} km</span>`);
        });

        return () => {
            ro.disconnect();
            if (mapInstance.current) {
                mapInstance.current.remove();
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

            {/* Map container */}
            <div style={{ position: 'relative', marginBottom: 16 }}>
                <div
                    ref={mapRef}
                    style={{
                        height: 340, width: '100%', borderRadius: 16,
                        overflow: 'hidden', border: '1px solid rgba(201,163,94,0.2)',
                        zIndex: 1,
                    }}
                />
                {!isExactLocation && (
                    <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 400, background: 'rgba(0,0,0,0.72)', color: '#fff', padding: '4px 12px', borderRadius: 20, fontSize: 12, backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        📍 Approximate Location
                    </div>
                )}
                {/* Street View & Maps buttons */}
                <div style={{ position: 'absolute', bottom: 12, right: 12, zIndex: 400, display: 'flex', gap: 8 }}>
                    <a
                        href={streetViewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View Street View"
                        style={{ background: 'rgba(0,0,0,0.75)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, backdropFilter: 'blur(4px)', cursor: 'pointer', textDecoration: 'none' }}
                    >
                        🚶 Street View
                    </a>
                    <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open in Google Maps"
                        style={{ background: 'rgba(0,0,0,0.75)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '6px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5, backdropFilter: 'blur(4px)', cursor: 'pointer', textDecoration: 'none' }}
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
