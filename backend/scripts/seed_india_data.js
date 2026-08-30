require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Property = require('../models/Property');
const PG = require('../models/PG');

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/estateXAI';

const INDIA_LOCATIONS = {
    'Mumbai': { lat: 19.0760, lng: 72.8777, areas: ['Bandra', 'Andheri', 'Juhu', 'Colaba'] },
    'Delhi': { lat: 28.7041, lng: 77.1025, areas: ['Connaught Place', 'Vasant Kunj', 'Saket', 'Dwarka'] },
    'Bangalore': { lat: 12.9716, lng: 77.5946, areas: ['Koramangala', 'Indiranagar', 'Whitefield', 'HSR Layout'] },
    'Chennai': { lat: 13.0827, lng: 80.2707, areas: ['T Nagar', 'Adyar', 'Velachery', 'Anna Nagar'] },
    'Hyderabad': { lat: 17.3850, lng: 78.4867, areas: ['Banjara Hills', 'Jubilee Hills', 'HITEC City', 'Gachibowli'] },
    'Kolkata': { lat: 22.5726, lng: 88.3639, areas: ['Salt Lake', 'Park Street', 'New Town', 'Ballygunge'] }
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

const REVIEWS_POOL = [
    { text: "Amazing property, exactly as shown in pictures!", rating: 5, type: 'user' },
    { text: "Good location but maintenance could be better.", rating: 3, type: 'user' },
    { text: "Very spacious and well ventilated.", rating: 4, type: 'user' },
    { text: "We take great pride in maintaining this property. Welcome!", rating: 5, type: 'owner' },
    { text: "Neighborhood is quite safe and peaceful.", rating: 4, type: 'user' },
    { text: "Highly recommend for working professionals.", rating: 5, type: 'user' },
    { text: "Recently renovated all bathrooms, hope you enjoy your stay.", rating: 5, type: 'owner' }
];

async function seedData() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        let owner = await User.findOne({ role: 'owner' });
        if (!owner) {
            owner = await User.findOne({});
            if (!owner) throw new Error("No users found! Please run regular seeder first.");
        }

        const cities = Object.keys(INDIA_LOCATIONS);
        const properties = [];
        const pgs = [];

        console.log('Seeding India-wide Properties and PGs...');

        for (let i = 0; i < 200; i++) {
            const city = cities[i % cities.length];
            const cityData = INDIA_LOCATIONS[city];
            const area = cityData.areas[i % cityData.areas.length];
            
            // Generate Random Reviews
            const propertyReviews = [];
            for (let j = 0; j < 3; j++) {
                const randomReview = REVIEWS_POOL[Math.floor(Math.random() * REVIEWS_POOL.length)];
                propertyReviews.push({
                    user: randomReview.type === 'owner' ? owner.name : `User${Math.floor(Math.random()*9000)+1000}`,
                    userType: randomReview.type,
                    rating: randomReview.rating,
                    comment: randomReview.text
                });
            }

            const isRent = i % 2 === 0;
            const bhk = 1 + (i % 4);
            
            properties.push({
                title: `Premium ${bhk}BHK Luxury Apartment in ${area}`,
                description: `Experience luxury living in the heart of ${area}, ${city}. This beautifully designed ${bhk}BHK property offers world-class amenities.`,
                type: ['apartment', 'villa', 'studio', 'house'][i % 4],
                listingType: isRent ? 'rent' : 'sale',
                price: isRent ? (15000 + (i * 5000)) : (5000000 + (i * 2000000)),
                area: 600 + (i * 200),
                bhk: bhk,
                bathrooms: bhk > 1 ? bhk - 1 : 1,
                location: {
                    address: `Phase ${1 + (i%3)}, ${area}`,
                    city: city,
                    state: 'India',
                    coordinates: {
                        lat: cityData.lat + (Math.random() - 0.5) * 0.05,
                        lng: cityData.lng + (Math.random() - 0.5) * 0.05
                    }
                },
                amenities: ['parking', 'security', 'wifi', 'gym', 'pool'].slice(0, 2 + (i % 4)),
                images: [PROPERTY_IMAGES[i % PROPERTY_IMAGES.length]],
                owner: owner._id,
                isAvailable: true,
                isFeatured: i % 5 === 0,
                furnishing: ['unfurnished', 'semi-furnished', 'fully-furnished'][i % 3],
                status: 'approved',
                reviews: propertyReviews
            });

            if (i < 100) {
                const gender = ['male', 'female', 'unisex'][i % 3];
                pgs.push({
                    name: `EstateXAi Premium ${gender.charAt(0).toUpperCase() + gender.slice(1)} PG in ${area}`,
                    description: `Modern and fully-equipped PG for ${gender}s in ${area}, ${city}. Includes high-speed WiFi, regular housekeeping, and delicious home-cooked meals.`,
                    type: 'pg',
                    genderType: gender,
                    rentPerMonth: 6000 + (i * 500),
                    securityDeposit: 10000,
                    sharingType: ['single', 'double', 'triple'][(i % 3)],
                    location: {
                        address: `Near Main Road, ${area}`,
                        city: city,
                        state: 'India',
                        coordinates: {
                            lat: cityData.lat + (Math.random() - 0.5) * 0.05,
                            lng: cityData.lng + (Math.random() - 0.5) * 0.05
                        }
                    },
                    amenities: { wifi: true, food: i % 2 === 0, ac: true, laundry: true },
                    meals: { breakfast: true, lunch: true, dinner: true },
                    totalRooms: 10 + i,
                    availableRooms: 2 + (i % 5),
                    images: [PG_IMAGES[i % PG_IMAGES.length]],
                    owner: owner._id,
                    isAvailable: true,
                    isFeatured: i % 4 === 0,
                    rating: (3.5 + (i % 15) * 0.1).toFixed(1),
                    reviews: propertyReviews
                });
            }
        }
        
        await Property.insertMany(properties);
        console.log(`Seeded ${properties.length} India-wide Properties with Reviews.`);
        
        await PG.insertMany(pgs);
        console.log(`Seeded ${pgs.length} India-wide PGs with Reviews.`);

        console.log('Database India-wide seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seedData();
