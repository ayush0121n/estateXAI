const mongoose = require('mongoose');
const Property = require('./models/Property');
const PG = require('./models/PG');
require('dotenv').config();

const dummyFutureDevelopments = [
    'Upcoming Metro line 3 station within 500m (expected 2026).',
    'New tech park "CyberCity 2.0" under construction nearby.',
    'Proposed 6-lane highway connecting directly to the airport.',
    'New multi-specialty hospital slated to open in the next 12 months.',
    'Massive smart-city development project approved for the adjacent sector.',
    'Shopping mall and multiplex scheduled for completion by year end.',
    'No upcoming major developments planned currently.'
];

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDevelopment() {
    return dummyFutureDevelopments[Math.floor(Math.random() * dummyFutureDevelopments.length)];
}

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Migrate Properties
        const properties = await Property.find();
        let propCount = 0;
        for (const prop of properties) {
            let changed = false;
            if (prop.walkabilityScore === 0) {
                prop.walkabilityScore = getRandomInt(60, 95);
                changed = true;
            }
            if (prop.connectivityScore === 0) {
                prop.connectivityScore = getRandomInt(65, 95);
                changed = true;
            }
            if (!prop.futureDevelopment || prop.futureDevelopment === '') {
                prop.futureDevelopment = getRandomDevelopment();
                changed = true;
            }
            if (changed) {
                await prop.save();
                propCount++;
            }
        }
        console.log(`Updated ${propCount} Properties with Location Intelligence data.`);

        // Migrate PGs
        const pgs = await PG.find();
        let pgCount = 0;
        for (const pg of pgs) {
            let changed = false;
            if (!pg.walkabilityScore || pg.walkabilityScore === 0) {
                pg.walkabilityScore = getRandomInt(70, 98); // PGs tend to be highly walkable
                changed = true;
            }
            if (!pg.connectivityScore || pg.connectivityScore === 0) {
                pg.connectivityScore = getRandomInt(75, 95);
                changed = true;
            }
            if (!pg.futureDevelopment || pg.futureDevelopment === '') {
                pg.futureDevelopment = getRandomDevelopment();
                changed = true;
            }
            if (changed) {
                await pg.save();
                pgCount++;
            }
        }
        console.log(`Updated ${pgCount} PGs with Location Intelligence data.`);

        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
