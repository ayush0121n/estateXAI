const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org/search';
const OSRM_BASE = 'https://router.project-osrm.org/route/v1';
const OVERPASS_API = 'https://overpass-api.de/api/interpreter';

// Custom User-Agent is required by Nominatim and Overpass
const headers = {
    'User-Agent': 'EstateXAi-Location-Intelligence/1.0 (contact: admin@estatexai.com)'
};

/**
 * Geocode a text address into coordinates using Nominatim API
 */
exports.geocodeAddress = async (address) => {
    try {
        const url = new URL(NOMINATIM_BASE);
        url.searchParams.append('q', address);
        url.searchParams.append('format', 'json');
        url.searchParams.append('limit', '1');

        const response = await fetch(url.toString(), { headers });
        const data = await response.json();
        
        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon),
                displayName: data[0].display_name
            };
        }
        return null;
    } catch (error) {
        console.error('Nominatim Geocoding Error:', error.message);
        return null;
    }
};

/**
 * Get accurate route data using OSRM
 * Profiles: 'driving', 'walking', 'cycling' (often aliased to bike)
 */
exports.getRouteMetrics = async (startLat, startLng, endLat, endLng, profile = 'driving') => {
    try {
        // OSRM format: lon,lat;lon,lat
        const url = `${OSRM_BASE}/${profile}/${startLng},${startLat};${endLng},${endLat}?overview=false`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data && data.code === 'Ok' && data.routes.length > 0) {
            const route = data.routes[0];
            return {
                distanceKm: (route.distance / 1000).toFixed(1),
                durationMin: Math.ceil(route.duration / 60)
            };
        }
        return null;
    } catch (error) {
        console.error(`OSRM Route Error (${profile}):`, error.message);
        return null;
    }
};

/**
 * Query Overpass API for Walkability and Connectivity
 * Walkability: Count of nearby shops, supermarkets, pharmacies
 * Connectivity: Count of nearby bus_stops, stations
 */
exports.calculateLocationScores = async (lat, lng, radius = 1000) => {
    try {
        const query = `
            [out:json][timeout:10];
            (
              node["amenity"~"school|hospital|pharmacy|marketplace|clinic"](around:${radius},${lat},${lng});
              node["shop"~"supermarket|convenience|mall"](around:${radius},${lat},${lng});
              node["highway"~"bus_stop"](around:${radius},${lat},${lng});
              node["railway"~"station|subway_entrance"](around:${radius},${lat},${lng});
            );
            out count;
        `;
        
        const response = await fetch(OVERPASS_API, {
            method: 'POST',
            headers: {
                ...headers,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `data=${encodeURIComponent(query)}`
        });
        const data = await response.json();
        
        const counts = data.elements[0]?.tags || {};
        const totalAmenities = parseInt(counts.nodes || 0);
        
        // Rough heuristic: > 40 essential amenities in 1km = highly walkable (95+)
        let walkabilityScore = 40 + Math.min((totalAmenities * 1.5), 55); 
        
        // Let's assume 1/3 of the detected nodes are transit related in dense areas
        let connectivityScore = 50 + Math.min((totalAmenities * 1.2), 48);

        return {
            walkabilityScore: Math.floor(walkabilityScore),
            connectivityScore: Math.floor(connectivityScore)
        };
    } catch (error) {
        console.error('Overpass Amenities Error:', error.message);
        return { walkabilityScore: 0, connectivityScore: 0 };
    }
};

/**
 * Query Overpass for future development (construction)
 */
exports.detectFutureDevelopment = async (lat, lng, radius = 2000) => {
    try {
        const query = `
            [out:json][timeout:10];
            (
              way["landuse"="construction"](around:${radius},${lat},${lng});
              way["highway"="construction"](around:${radius},${lat},${lng});
              way["railway"="construction"](around:${radius},${lat},${lng});
            );
            out body 1;
        `;
        
        const response = await fetch(OVERPASS_API, {
            method: 'POST',
            headers: {
                ...headers,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `data=${encodeURIComponent(query)}`
        });
        const data = await response.json();
        
        const elements = data.elements;
        if (elements && elements.length > 0) {
            const dev = elements[0];
            let type = 'Infrastructure development';
            if (dev.tags) {
                if (dev.tags.highway === 'construction') type = 'Major road construction';
                if (dev.tags.railway === 'construction') type = 'Railway/Metro expansion';
                if (dev.tags.landuse === 'construction') type = 'Large-scale commercial/residential development';
            }
            return `Detected: ${type} currently in progress within 2km radius. This is expected to boost area connectivity and property valuation in the near future.`;
        }
        return null; // No automated development found
    } catch (error) {
        console.error('Overpass Construction Error:', error.message);
        return null;
    }
};
