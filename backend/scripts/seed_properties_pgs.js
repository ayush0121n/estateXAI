require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Property = require('../models/Property');
const PG = require('../models/PG');

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/estateXAI';

const PUNE_LOCATIONS = {
    'Hinjewadi': { lat: 18.5913, lng: 73.7389 },
    'Baner': { lat: 18.5590, lng: 73.7868 },
    'Kothrud': { lat: 18.5074, lng: 73.8077 },
    'Viman Nagar': { lat: 18.5679, lng: 73.9143 },
    'Kalyani Nagar': { lat: 18.5488, lng: 73.9014 },
    'Wakad': { lat: 18.5987, lng: 73.7687 },
    'Kharadi': { lat: 18.5515, lng: 73.9348 },
    'Magarpatta': { lat: 18.5135, lng: 73.9298 }
};

const PROPERTY_IMAGES = [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80'
];

const PG_IMAGES = [
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1505691938895-1758d7bef51a?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1622396481328-9b1b78cdd9fd?auto=format&fit=crop&q=80'
];

async function seedData() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        console.log('Wiping existing Properties and PGs...');
        await Property.deleteMany({});
        await PG.deleteMany({});
        console.log('Old data wiped successfully.');

        // Get an owner user
        let owner = await User.findOne({ role: 'owner' });
        if (!owner) {
            // Fallback to any user
            owner = await User.findOne({});
            if (!owner) throw new Error("No users found! Please run regular seeder first.");
        }

        const areas = Object.keys(PUNE_LOCATIONS);

        console.log('Seeding 20 Properties...');
        const properties = [];
        for (let i = 0; i < 20; i++) {
            const area = areas[i % areas.length];
            const isRent = i % 2 === 0;
            const bhk = 1 + (i % 4);
            properties.push({
                title: `Premium ${bhk}BHK Luxury Apartment in ${area}`,
                description: `Experience luxury living in the heart of ${area}, Pune. This beautifully designed ${bhk}BHK property offers world-class amenities, stunning views, and unmatched convenience. Perfect for families or professionals looking for a premium lifestyle.`,
                type: ['apartment', 'villa', 'studio', 'house'][i % 4],
                listingType: isRent ? 'rent' : 'sale',
                price: isRent ? (15000 + (i * 5000)) : (5000000 + (i * 2000000)),
                area: 600 + (i * 200),
                bhk: bhk,
                bathrooms: bhk > 1 ? bhk - 1 : 1,
                location: {
                    address: `Phase ${1 + (i%3)}, ${area}`,
                    city: 'Pune',
                    state: 'Maharashtra',
                    coordinates: {
                        lat: PUNE_LOCATIONS[area].lat + (Math.random() - 0.5) * 0.01,
                        lng: PUNE_LOCATIONS[area].lng + (Math.random() - 0.5) * 0.01
                    }
                },
                amenities: ['parking', 'security', 'wifi', 'gym', 'pool'].slice(0, 2 + (i % 4)),
                images: [PROPERTY_IMAGES[i % PROPERTY_IMAGES.length]],
                owner: owner._id,
                isAvailable: true,
                isFeatured: i % 5 === 0,
                furnishing: ['unfurnished', 'semi-furnished', 'fully-furnished'][i % 3],
                status: 'approved'
            });
        }
        await Property.insertMany(properties);
        console.log('20 Properties seeded.');

        console.log('Seeding 15 PGs...');
        const pgs = [];
        for (let i = 0; i < 15; i++) {
            const area = areas[i % areas.length];
            const gender = ['male', 'female', 'unisex'][i % 3];
            pgs.push({
                name: `EstateXAi Premium ${gender.charAt(0).toUpperCase() + gender.slice(1)} PG in ${area}`,
                description: `Modern and fully-equipped PG for ${gender}s in ${area}. Includes high-speed WiFi, regular housekeeping, and delicious home-cooked meals. Safe, secure, and vibrant community.`,
                type: 'pg',
                genderType: gender,
                rentPerMonth: 6000 + (i * 500),
                securityDeposit: 10000,
                sharingType: ['single', 'double', 'triple'][(i % 3)],
                location: {
                    address: `Near Main Road, ${area}`,
                    city: 'Pune',
                    state: 'Maharashtra',
                    coordinates: {
                        lat: PUNE_LOCATIONS[area].lat + (Math.random() - 0.5) * 0.01,
                        lng: PUNE_LOCATIONS[area].lng + (Math.random() - 0.5) * 0.01
                    }
                },
                amenities: {
                    wifi: true,
                    food: i % 2 === 0,
                    ac: i % 3 === 0,
                    laundry: true,
                    parking: true,
                    housekeeping: true,
                    hotWater: true
                },
                meals: {
                    breakfast: i % 2 === 0,
                    lunch: i % 2 === 0,
                    dinner: i % 2 === 0
                },
                totalRooms: 10 + i,
                availableRooms: 2 + (i % 5),
                images: [PG_IMAGES[i % PG_IMAGES.length]],
                owner: owner._id,
                isAvailable: true,
                isFeatured: i % 4 === 0,
                rating: (3.5 + (i % 15) * 0.1).toFixed(1)
            });
        }
        await PG.insertMany(pgs);
        console.log('15 PGs seeded.');

        console.log('Database refresh complete! All properties and PGs have robust real-world Pune coordinates.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seedData();
