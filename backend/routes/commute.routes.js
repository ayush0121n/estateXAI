const express = require('express');
const router = express.Router();
const { geocodeAddress, getRouteMetrics, calculateLocationScores, detectFutureDevelopment } = require('../utils/locationIntelligence');
const Property = require('../models/Property');

// @POST /api/commute/score
// Body: { workplace: "Infosys Hinjewadi" (optional), userLat, userLng (optional), propertyLat: 18.5, propertyLng: 73.7 }
router.post('/score', async (req, res) => {
    try {
        const { workplace, userLat, userLng, propertyLat, propertyLng } = req.body;
        
        if (propertyLat === undefined || propertyLng === undefined) {
            return res.status(400).json({ success: false, message: 'propertyLat and propertyLng are required.' });
        }

        let originLat, originLng, originName;

        // If user provided exact location (e.g. navigator.geolocation)
        if (userLat && userLng) {
            originLat = userLat;
            originLng = userLng;
            originName = 'Your Current Location';
        } else if (workplace) {
            // Geocode the workplace text using Nominatim
            const geo = await geocodeAddress(workplace + ', India'); // scope to India
            if (!geo) {
                return res.status(404).json({ success: false, message: 'Workplace location not found via Nominatim. Try a more specific name.' });
            }
            originLat = geo.lat;
            originLng = geo.lng;
            originName = geo.displayName.split(',')[0];
        } else {
            return res.status(400).json({ success: false, message: 'Provide either workplace string or userLat/userLng coordinates.' });
        }

        // Get exact OSRM driving and walking routes
        const drivingRoute = await getRouteMetrics(propertyLat, propertyLng, originLat, originLng, 'driving');
        const walkingRoute = await getRouteMetrics(propertyLat, propertyLng, originLat, originLng, 'walking');

        // Fallback to Haversine if OSRM fails
        let distanceKm, bikeMinutes, autoMinutes, busMinutes;
        
        if (drivingRoute) {
            distanceKm = parseFloat(drivingRoute.distanceKm);
            autoMinutes = drivingRoute.durationMin;
            // Rough approximations if we only have driving profile
            bikeMinutes = Math.max(1, Math.round(autoMinutes * 1.2)); 
            busMinutes = Math.round(autoMinutes * 1.5);
        } else {
            const R = 6371;
            const dLat = ((originLat - propertyLat) * Math.PI) / 180;
            const dLon = ((originLng - propertyLng) * Math.PI) / 180;
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos((propertyLat * Math.PI) / 180) *
                Math.cos((originLat * Math.PI) / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            distanceKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            
            bikeMinutes = Math.round((distanceKm / 30) * 60);
            autoMinutes = Math.round((distanceKm / 20) * 60);
            busMinutes = Math.round((distanceKm / 15) * 60);
        }

        // Liveability Score based on exact distance
        let liveabilityScore;
        if (distanceKm <= 2) liveabilityScore = 98;
        else if (distanceKm <= 5) liveabilityScore = Math.round(98 - (distanceKm - 2) * 5);
        else if (distanceKm <= 10) liveabilityScore = Math.round(83 - (distanceKm - 5) * 4);
        else if (distanceKm <= 20) liveabilityScore = Math.round(63 - (distanceKm - 10) * 2);
        else liveabilityScore = Math.max(10, Math.round(43 - (distanceKm - 20)));

        const weeklyHours = ((bikeMinutes * 2 * 5) / 60).toFixed(1);
        const monthlyHours = ((bikeMinutes * 2 * 22) / 60).toFixed(1);

        res.json({
            success: true,
            workplace: originName,
            distanceKm: distanceKm.toFixed(1),
            commuteTimes: {
                bike: bikeMinutes,
                auto: autoMinutes,
                bus: busMinutes
            },
            liveabilityScore,
            timeInsight: {
                weeklyHours,
                monthlyHours,
                verdict: liveabilityScore >= 80 ? 'Excellent location!' :
                         liveabilityScore >= 60 ? 'Good commute distance.' :
                         liveabilityScore >= 40 ? 'Moderate commute, plan ahead.' :
                         'Long commute — consider closer options.'
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @GET /api/commute/location-intelligence/:propertyId
// Fetches walkability and future dev dynamically if not set
router.get('/location-intelligence/:propertyId', async (req, res) => {
    try {
        const property = await Property.findById(req.params.propertyId);
        if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
        
        const lat = property.location?.coordinates?.lat;
        const lng = property.location?.coordinates?.lng;
        
        if (!lat || !lng) {
            return res.json({ success: true, walkabilityScore: 0, connectivityScore: 0, futureDevelopment: '' });
        }

        let needsSave = false;

        // If score is 0, query Overpass API
        if (property.walkabilityScore === 0 || property.connectivityScore === 0) {
            const scores = await calculateLocationScores(lat, lng);
            property.walkabilityScore = scores.walkabilityScore;
            property.connectivityScore = scores.connectivityScore;
            needsSave = true;
        }

        // Only auto-generate if admin hasn't provided a custom one
        if (!property.futureDevelopment || property.futureDevelopment.trim() === '') {
            const futureDev = await detectFutureDevelopment(lat, lng);
            if (futureDev) {
                property.futureDevelopment = futureDev;
                needsSave = true;
            }
        }

        // Cache the scores so we don't hammer Overpass API
        if (needsSave) {
            await property.save();
        }

        res.json({
            success: true,
            walkabilityScore: property.walkabilityScore,
            connectivityScore: property.connectivityScore,
            futureDevelopment: property.futureDevelopment
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
