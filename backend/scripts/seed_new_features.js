const path = require('path');
const rootDir = path.join(__dirname, '..');
require('dotenv').config({ path: path.join(rootDir, '.env') });
const mongoose = require('mongoose');

const CITY_COORDS = {
    'Pune': { lat: 18.5204, lng: 73.8567 },
    'Bangalore': { lat: 12.9716, lng: 77.5946 },
    'Mumbai': { lat: 19.0760, lng: 72.8777 },
    'Delhi NCR': { lat: 28.7041, lng: 77.1025 },
    'Hyderabad': { lat: 17.3850, lng: 78.4867 },
    'Chennai': { lat: 13.0827, lng: 80.2707 },
};

async function seedFeatures() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const Property = require(path.join(rootDir, 'models/Property'));
    const User = require(path.join(rootDir, 'models/User'));

    // Update Properties
    const props = await Property.find();
    let propUpdates = 0;
    for (let p of props) {
        let changed = false;
        
        // 1. Coordinates
        if (!p.location.coordinates || !p.location.coordinates.lat || !p.location.coordinates.lng) {
            const base = CITY_COORDS[p.location.city] || { lat: 20.5937, lng: 78.9629 };
            // Add some jitter
            p.location.coordinates = {
                lat: base.lat + (Math.random() - 0.5) * 0.1,
                lng: base.lng + (Math.random() - 0.5) * 0.1
            };
            changed = true;
        }

        // 2. Deposit (2x to 6x rent for rent listings)
        if (p.listingType === 'rent' && (!p.deposit || p.deposit === 0)) {
            const multiplier = Math.floor(Math.random() * 5) + 2; // 2 to 6
            p.deposit = p.price * multiplier;
            changed = true;
        }

        // 3. Trust badges & rules
        if (p.zeroBrokerage === undefined) {
            p.zeroBrokerage = Math.random() > 0.5;
            changed = true;
        }
        if (p.bachelorFriendly === undefined) {
            p.bachelorFriendly = Math.random() > 0.3;
            changed = true;
        }
        if (p.petFriendly === undefined) {
            p.petFriendly = Math.random() > 0.6;
            changed = true;
        }
        if (p.verified === undefined) {
            p.verified = Math.random() > 0.2;
            changed = true;
        }
        if (!p.societyRules) {
            p.societyRules = {
                bachelorsAllowed: p.bachelorFriendly,
                petsAllowed: p.petFriendly,
                nonVegAllowed: Math.random() > 0.4
            };
            changed = true;
        }

        if (changed) {
            await p.save();
            propUpdates++;
        }
    }
    console.log(`Updated ${propUpdates} properties.`);

    // Update Users
    const users = await User.find();
    let userUpdates = 0;
    for (let u of users) {
        let changed = false;

        // 1. Trust Score
        if (!u.trustScore || u.trustScore === 0) {
            u.trustScore = Math.floor(Math.random() * 40) + 60; // 60 to 99
            changed = true;
        }

        // 2. Verified
        if (u.isPhoneVerified === undefined) {
            u.isPhoneVerified = Math.random() > 0.3;
            changed = true;
        }

        // 3. Roommate Profile Mock
        if (!u.roommateProfile || !u.roommateProfile.city) {
            u.roommateProfile = {
                isLookingForRoommate: Math.random() > 0.5,
                gender: ['male', 'female', 'any'][Math.floor(Math.random() * 3)],
                diet: ['veg', 'non-veg', 'vegan', 'any'][Math.floor(Math.random() * 4)],
                smoking: ['yes', 'no', 'outside-only'][Math.floor(Math.random() * 3)],
                sleepSchedule: ['early-bird', 'night-owl', 'flexible'][Math.floor(Math.random() * 3)],
                profession: ['student', 'working-professional', 'any'][Math.floor(Math.random() * 3)],
                city: ['Pune', 'Bangalore', 'Mumbai'][Math.floor(Math.random() * 3)],
                budgetMin: 5000,
                budgetMax: 15000,
                age: Math.floor(Math.random() * 15) + 20, // 20 to 34
                bio: 'Looking for a chill flatmate!',
                cleanliness: ['super-clean', 'moderate', 'relaxed'][Math.floor(Math.random() * 3)],
                contactNumber: '9876543210'
            };
            changed = true;
        }

        if (changed) {
            await u.save();
            userUpdates++;
        }
    }
    console.log(`Updated ${userUpdates} users.`);

    console.log('Seed new features script completed.');
    process.exit(0);
}

seedFeatures().catch(err => {
    console.error(err);
    process.exit(1);
});
