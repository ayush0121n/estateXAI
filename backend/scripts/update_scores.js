require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Property = require('../models/Property');

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/estateXAI';

const VIBES = [
    "Upcoming Metro station nearby will boost connectivity.",
    "Rapidly developing IT corridor with new commercial hubs.",
    "Established residential area with tree-lined avenues.",
    "High-street retail and premium cafes emerging.",
    "Peaceful suburban vibe with excellent parks."
];

async function updateScores() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const properties = await Property.find({});
        for (const prop of properties) {
            prop.walkabilityScore = 60 + Math.floor(Math.random() * 35); // 60-95
            prop.connectivityScore = 65 + Math.floor(Math.random() * 30); // 65-95
            prop.futureDevelopment = VIBES[Math.floor(Math.random() * VIBES.length)];
            await prop.save();
        }
        
        console.log(`Successfully updated ${properties.length} Properties with Walkability and Connectivity scores.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

updateScores();
