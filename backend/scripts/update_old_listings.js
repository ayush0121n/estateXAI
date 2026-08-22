require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Property = require('../models/Property');
const PG = require('../models/PG');

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/estateXAI';

async function geocode(address, city) {
    try {
        const query = encodeURIComponent(`${address}, ${city}, India`);
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`, {
            headers: { 'User-Agent': 'EstateXAi/1.0 (info@estatexai.com)' }
        });
        const data = await response.json();
        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon)
            };
        }
    } catch (err) {
        console.error(`Geocoding failed for ${address}:`, err.message);
    }
    // Fallback to central Pune if it fails
    return { lat: 18.5204, lng: 73.8567 };
}

async function updateListings() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        console.log('Scanning Properties for missing coordinates...');
        const properties = await Property.find({
            $or: [
                { 'location.coordinates.lat': { $exists: false } },
                { 'location.coordinates.lat': null },
                { 'location.coordinates.lng': { $exists: false } },
                { 'location.coordinates.lng': null }
            ]
        });

        let propCount = 0;
        for (const prop of properties) {
            console.log(`Geocoding property: ${prop.title}...`);
            const coords = await geocode(prop.location.address, prop.location.city || 'Pune');
            prop.location.coordinates = coords;
            await prop.save();
            propCount++;
            await new Promise(r => setTimeout(r, 1000)); // Rate limit Nominatim
        }

        console.log('Scanning PGs for missing coordinates...');
        const pgs = await PG.find({
            $or: [
                { 'location.coordinates.lat': { $exists: false } },
                { 'location.coordinates.lat': null },
                { 'location.coordinates.lng': { $exists: false } },
                { 'location.coordinates.lng': null }
            ]
        });

        let pgCount = 0;
        for (const pg of pgs) {
            console.log(`Geocoding PG: ${pg.name}...`);
            const coords = await geocode(pg.location.address, pg.location.city || 'Pune');
            pg.location.coordinates = coords;
            await pg.save();
            pgCount++;
            await new Promise(r => setTimeout(r, 1000));
        }

        console.log(`Successfully updated ${propCount} Properties and ${pgCount} PGs with coordinates!`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

updateListings();
