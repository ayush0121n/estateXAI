const express = require('express');
const router = express.Router();

// @POST /api/commute/score
// Body: { workplace: "Infosys Hinjewadi", propertyLat: 18.5, propertyLng: 73.7 }
router.post('/score', async (req, res) => {
    try {
        const { workplace, propertyLat, propertyLng } = req.body;
        if (!workplace || propertyLat === undefined || propertyLng === undefined) {
            return res.status(400).json({ success: false, message: 'workplace, propertyLat and propertyLng are required.' });
        }

        // Geocode the workplace using free Nominatim API (OpenStreetMap)
        const encodedWorkplace = encodeURIComponent(workplace + ', Pune, Maharashtra, India');
        const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodedWorkplace}&format=json&limit=1`;

        const geoRes = await fetch(geoUrl, {
            headers: { 'User-Agent': 'EstateXAi/1.0 (contact@estatexai.com)' }
        });
        const geoData = await geoRes.json();

        if (!geoData || geoData.length === 0) {
            return res.status(404).json({ success: false, message: 'Workplace location not found. Try a more specific name.' });
        }

        const workplaceLat = parseFloat(geoData[0].lat);
        const workplaceLng = parseFloat(geoData[0].lon);
        const workplaceName = geoData[0].display_name.split(',')[0];

        // Haversine formula for straight-line distance (km)
        const R = 6371;
        const dLat = ((workplaceLat - propertyLat) * Math.PI) / 180;
        const dLon = ((workplaceLng - propertyLng) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((propertyLat * Math.PI) / 180) *
            Math.cos((workplaceLat * Math.PI) / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const distanceKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        // Estimate commute times (using Pune average speeds)
        const bikeMinutes = Math.round((distanceKm / 30) * 60);  // avg 30km/h bike
        const autoMinutes = Math.round((distanceKm / 20) * 60);  // avg 20km/h auto in traffic
        const busMinutes = Math.round((distanceKm / 15) * 60);   // avg 15km/h bus

        // Liveability Score: 100 for <2km, drops off progressively
        let liveabilityScore;
        if (distanceKm <= 2) liveabilityScore = 98;
        else if (distanceKm <= 5) liveabilityScore = Math.round(98 - (distanceKm - 2) * 5);
        else if (distanceKm <= 10) liveabilityScore = Math.round(83 - (distanceKm - 5) * 4);
        else if (distanceKm <= 20) liveabilityScore = Math.round(63 - (distanceKm - 10) * 2);
        else liveabilityScore = Math.max(10, Math.round(43 - (distanceKm - 20)));

        // Weekly/monthly time cost
        const weeklyHours = ((bikeMinutes * 2 * 5) / 60).toFixed(1);
        const monthlyHours = ((bikeMinutes * 2 * 22) / 60).toFixed(1);

        res.json({
            success: true,
            workplace: workplaceName,
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

module.exports = router;
