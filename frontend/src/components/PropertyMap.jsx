import { useEffect, useRef, useMemo } from 'react';
import { MapPin, School, Hospital, Bus, ShoppingBag, Leaf } from 'lucide-react';

// Using Leaflet (react-leaflet) for the interactive map — fully free, no API key needed
// Install: npm install react-leaflet leaflet

let leafletLoaded = false;

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
    const score = Math.min(100, close * 15 + medium * 7 + far * 2 + typeBonus);
    return Math.round(score);
}

export default function PropertyMap({ property }) {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);

    const lat = property?.location?.coordinates?.lat;
    const lng = property?.location?.coordinates?.lng;
    const pois = property?.nearbyPOIs || [];
    
    const walkabilityScore = useMemo(() => property?.walkabilityScore || calculateWalkabilityScore(pois), [property, pois]);
    const connectivityScore = property?.connectivityScore || Math.round(walkabilityScore * 0.85);

    const hasCoordinates = lat && lng;

    useEffect(() => {
        if (!hasCoordinates || !mapRef.current || mapInstance.current) return;

        // Dynamically import Leaflet to avoid SSR issues
        import('leaflet').then(L => {
            // Fix default icon issue with Webpack
            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            });

            const map = L.map(mapRef.current).setView([lat, lng], 15);
            mapInstance.current = map;

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            // Main property marker
            const mainIcon = L.divIcon({
                className: '',
                html: `<div style="background:var(--primary);width:36px;height:36px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>`,
                iconSize: [36, 36],
                iconAnchor: [18, 36],
            });
            L.marker([lat, lng], { icon: mainIcon })
                .addTo(map)
                .bindPopup(`<b>${property.title}</b><br/>${property.location.address}`, { maxWidth: 200 })
                .openPopup();

            // POI markers
            pois.forEach(poi => {
                const color = POI_COLOR_MAP[poi.type] || 'var(--primary)';
                const poiIcon = L.divIcon({
                    className: '',
                    html: `<div style="background:${color};width:22px;height:22px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;"></div>`,
                    iconSize: [22, 22],
                    iconAnchor: [11, 11],
                });
                if (poi.lat && poi.lng) {
                    L.marker([poi.lat, poi.lng], { icon: poiIcon })
                        .addTo(map)
                        .bindPopup(`<b>${poi.name}</b><br/>${poi.type} · ${poi.distanceKm} km away`);
                }
            });
        });

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, [lat, lng, hasCoordinates]);

    const scoreColor = (s) => s >= 70 ? '#22d3a5' : s >= 40 ? '#f59e0b' : '#ef4444';

    return (
        <div style={{ marginTop: 28 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={18} color="var(--primary)" /> Location Intelligence
            </h3>

            {/* Map */}
            {hasCoordinates ? (
                <>
                    {/* Add Leaflet CSS dynamically */}
                    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                    <div ref={mapRef} style={{ height: 320, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(201, 163, 94,0.2)', marginBottom: 16 }} />
                </>
            ) : (
                <div style={{ height: 200, borderRadius: 16, background: 'rgba(201, 163, 94,0.05)', border: '1px dashed rgba(201, 163, 94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', marginBottom: 16 }}>
                    <div style={{ textAlign: 'center' }}>
                        <MapPin size={32} color="var(--primary)" style={{ opacity: 0.5, marginBottom: 8 }} />
                        <p style={{ margin: 0, fontSize: 14 }}>Map coordinates not available for this property.</p>
                        <p style={{ margin: '4px 0 0', fontSize: 12 }}>{property?.location?.address}</p>
                    </div>
                </div>
            )}

            {/* Scores */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                {[
                    { label: 'Walkability Score', score: walkabilityScore, icon: '🚶' },
                    { label: 'Connectivity Score', score: connectivityScore, icon: '🔗' },
                ].map(({ label, score, icon }) => (
                    <div key={label} style={{ background: 'rgba(201, 163, 94,0.07)', border: '1px solid rgba(201, 163, 94,0.2)', borderRadius: 12, padding: '14px 16px' }}>
                        <div style={{ fontSize: 11, color: '#aaa', marginBottom: 6 }}>{icon} {label}</div>
                        <div style={{ fontSize: 26, fontWeight: 800, color: scoreColor(score) }}>{score}<span style={{ fontSize: 14, color: '#aaa', fontWeight: 400 }}>/100</span></div>
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
                                <span style={{ fontSize: 11, color: POI_COLOR_MAP[poi.type] || 'var(--primary)', background: 'rgba(201, 163, 94,0.1)', padding: '2px 8px', borderRadius: 12, textTransform: 'capitalize' }}>{poi.type}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Future Development — Static/Admin-editable field */}
            <div style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span>🏗️</span>
                    <h4 style={{ margin: 0, fontSize: 14, color: '#f59e0b' }}>Future Development</h4>
                    <span style={{ marginLeft: 'auto', fontSize: 10, color: '#888', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 8 }}>Admin-editable</span>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: '#bbb', lineHeight: 1.6 }}>
                    {property?.futureDevelopment || 'No upcoming development information available for this area. Owners and admins can add nearby infrastructure projects via the dashboard.'}
                </p>
            </div>
        </div>
    );
}
