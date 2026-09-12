const path = require('path');
const rootDir = path.join(__dirname, '..');
require('dotenv').config({ path: path.join(rootDir, '.env') });
const mongoose = require('mongoose');

const User = require('../models/User');
const Property = require('../models/Property');
const PG = require('../models/PG');

const NEW_CITIES = {
    'Ahmedabad': {
        state: 'Gujarat',
        lat: 23.0225,
        lng: 72.5714,
        areas: [
            { name: 'Navrangpura', institutions: ['Gujarat University', 'IIM Ahmedabad', 'CEPT'], landmark: 'Near Commerce Six Roads' },
            { name: 'SG Highway', institutions: ['Nirma University', 'Infocity'], landmark: 'Near ISKCON Temple' },
            { name: 'Bodakdev', institutions: ['MICA', 'Ahmedabad University'], landmark: 'Near Sindhu Bhavan' },
            { name: 'Satellite', institutions: ['ISRO', 'L.D. College'], landmark: 'Near Shivranjani Cross Roads' },
            { name: 'Vastrapur', institutions: ['IIM Ahmedabad', 'ATIRA'], landmark: 'Near Vastrapur Lake' }
        ]
    },
    'Jaipur': {
        state: 'Rajasthan',
        lat: 26.9124,
        lng: 75.7873,
        areas: [
            { name: 'Malviya Nagar', institutions: ['MNIT Jaipur', 'Apex University'], landmark: 'Near World Trade Park' },
            { name: 'Mansarovar', institutions: ['IIS University', 'Rajasthan University'], landmark: 'Near Metro Station' },
            { name: 'C-Scheme', institutions: ['Maharani College', 'St. Xaviers'], landmark: 'Near Central Park' },
            { name: 'Vaishali Nagar', institutions: ['Amity University Campus'], landmark: 'Near Nursery Circle' },
            { name: 'Jagatpura', institutions: ['JECRC University', 'SKIT'], landmark: 'Near Bombay Hospital' }
        ]
    },
    'Indore': {
        state: 'Madhya Pradesh',
        lat: 22.7196,
        lng: 75.8577,
        areas: [
            { name: 'Vijay Nagar', institutions: ['Prestige Institute', 'Medhavi Skills'], landmark: 'Near Scheme 54' },
            { name: 'Bhawarkua', institutions: ['DAVV University', 'Holkar Science College'], landmark: 'Near Bhanwarkuan Square' },
            { name: 'Palasia', institutions: ['GSITS', 'Indore Christian College'], landmark: 'Near Old Palasia' },
            { name: 'Super Corridor', institutions: ['TCS SEZ', 'Infosys Campus', 'Symbiosis'], landmark: 'Near Airport Road' },
            { name: 'Rau', institutions: ['IIM Indore', 'IPS Academy'], landmark: 'Near IIM Campus Road' }
        ]
    },
    'Lucknow': {
        state: 'Uttar Pradesh',
        lat: 26.8467,
        lng: 80.9462,
        areas: [
            { name: 'Gomti Nagar', institutions: ['Amity University', 'BBD University', 'IIM Lucknow'], landmark: 'Near Riverside Mall' },
            { name: 'Hazratganj', institutions: ['Lucknow University', 'National PG College'], landmark: 'Near Metro Station' },
            { name: 'Aliganj', institutions: ['Engineering College AKTU', 'BBAU'], landmark: 'Near Kapoorthala' },
            { name: 'Indira Nagar', institutions: ['Central School', 'Jaipuria Institute'], landmark: 'Near Bhootnath Market' },
            { name: 'Vibhuti Khand', institutions: ['TCS Lucknow', 'High Court'], landmark: 'Near Wave Cinema' }
        ]
    },
    'Chandigarh': {
        state: 'Punjab/Haryana',
        lat: 30.7333,
        lng: 76.7794,
        areas: [
            { name: 'Sector 17', institutions: ['Panjab University', 'PEC'], landmark: 'Near City Centre' },
            { name: 'Sector 35', institutions: ['MCM DAV College', 'SD College'], landmark: 'Near Aroma Chowk' },
            { name: 'Sector 22', institutions: ['PGIMER', 'Govt College for Girls'], landmark: 'Near Aroma Hotel' },
            { name: 'Mohali Phase 7', institutions: ['ISB Mohali', 'IISER Mohali'], landmark: 'Near Industrial Area' },
            { name: 'Sector 43', institutions: ['Chitkara University', 'CU Mohali'], landmark: 'Near ISBT 43' }
        ]
    },
    'Kochi': {
        state: 'Kerala',
        lat: 9.9312,
        lng: 76.2673,
        areas: [
            { name: 'Kakkanad', institutions: ['Infopark Kochi', 'SmartCity', 'Rajagiri College'], landmark: 'Near InfoPark Expressway' },
            { name: 'Marine Drive', institutions: ['St. Teresas College', 'CUSAT'], landmark: 'Near Rainbow Bridge' },
            { name: 'Edapally', institutions: ['Amrita Institute', 'Model Engineering College'], landmark: 'Near Lulu Mall' },
            { name: 'Panampilly Nagar', institutions: ['Sacred Heart College'], landmark: 'Near Central Park' },
            { name: 'Kaloor', institutions: ['Kaloor Stadium', 'JNI Stadium'], landmark: 'Near Metro Station' }
        ]
    },
    'Goa': {
        state: 'Goa',
        lat: 15.2993,
        lng: 74.1240,
        areas: [
            { name: 'Panaji', institutions: ['Goa University', 'Dhempe College'], landmark: 'Near Miramar Beach Road' },
            { name: 'Candolim', institutions: ['Institute of Hotel Management'], landmark: 'Near Candolim Beach Road' },
            { name: 'Porvorim', institutions: ['Goa Medical College', 'IIT Goa'], landmark: 'Near Assembly Complex' },
            { name: 'Anjuna', institutions: ['St. Xaviers Mapusa'], landmark: 'Near Flea Market Road' },
            { name: 'Margao', institutions: ['Chowgule College', 'Don Bosco College'], landmark: 'Near Borda' }
        ]
    }
};

const PROP_IMAGES = [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80'
];

const PG_IMAGES = [
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1505691938895-1758d7bef51a?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1622396481328-9b1b78cdd9fd?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&q=80'
];

async function seedAll() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected.');

    const admin = await User.findOne({ role: 'admin' }) || await User.findOne({});
    if (!admin) {
        console.error('No admin/user found.');
        process.exit(1);
    }
    const ownerId = admin._id;

    // 1. Also normalize any existing "Delhi" properties/PGs to "Delhi NCR" or ensure clean match
    await Property.updateMany({ 'location.city': 'Delhi' }, { $set: { 'location.city': 'Delhi NCR' } });
    await PG.updateMany({ 'location.city': 'Delhi' }, { $set: { 'location.city': 'Delhi NCR' } });
    console.log('Normalized Delhi listings to Delhi NCR.');

    const newProperties = [];
    const newPGs = [];

    let count = 0;
    for (const [cityName, cityData] of Object.entries(NEW_CITIES)) {
        console.log(`Generating listings for ${cityName}...`);

        cityData.areas.forEach((area, aIdx) => {
            // Add 2 properties per area
            // 1 Rent, 1 Sale
            const rentPrice = 12000 + Math.floor(Math.random() * 25000);
            const salePrice = 3500000 + Math.floor(Math.random() * 8000000);
            const bhkRent = 1 + (aIdx % 3);
            const bhkSale = 2 + (aIdx % 3);

            newProperties.push({
                title: `${bhkRent}BHK Modern Flat in ${area.name}`,
                description: `Spacious and well-ventilated ${bhkRent}BHK apartment located in ${area.name}, ${cityName}. ${area.landmark}. Prime location with round-the-clock water and power backup.`,
                type: ['apartment', 'studio', 'house'][aIdx % 3],
                listingType: 'rent',
                price: rentPrice,
                area: 550 + bhkRent * 300,
                bhk: bhkRent,
                bathrooms: bhkRent > 1 ? bhkRent - 1 : 1,
                deposit: rentPrice * 2,
                location: {
                    address: `${area.landmark}, ${area.name}`,
                    city: cityName,
                    state: cityData.state,
                    pincode: '380009',
                    coordinates: {
                        lat: cityData.lat + (Math.random() - 0.5) * 0.04,
                        lng: cityData.lng + (Math.random() - 0.5) * 0.04
                    }
                },
                amenities: ['parking', 'security', 'wifi', 'elevator', 'power_backup'],
                furnishing: ['semi-furnished', 'fully-furnished'][aIdx % 2],
                bachelorFriendly: true,
                zeroBrokerage: Math.random() > 0.4,
                petFriendly: Math.random() > 0.5,
                verified: true,
                isFeatured: aIdx === 0,
                isAvailable: true,
                walkabilityScore: 78 + Math.floor(Math.random() * 18),
                connectivityScore: 80 + Math.floor(Math.random() * 16),
                futureDevelopment: `Upcoming metro and commercial hub in ${area.name}.`,
                images: [
                    PROP_IMAGES[(count + aIdx) % PROP_IMAGES.length],
                    PROP_IMAGES[(count + aIdx + 1) % PROP_IMAGES.length]
                ],
                owner: ownerId,
                status: 'approved'
            });

            newProperties.push({
                title: `Luxury ${bhkSale}BHK Home in ${area.name}`,
                description: `Luxurious ${bhkSale}BHK gated society residence in ${area.name}, ${cityName}. Premium finishes, clubhouse, gym, and lush green surrounding.`,
                type: bhkSale >= 3 ? 'villa' : 'apartment',
                listingType: 'sale',
                price: salePrice,
                area: 900 + bhkSale * 350,
                bhk: bhkSale,
                bathrooms: bhkSale,
                location: {
                    address: `${area.landmark}, ${area.name}`,
                    city: cityName,
                    state: cityData.state,
                    pincode: '380015',
                    coordinates: {
                        lat: cityData.lat + (Math.random() - 0.5) * 0.04,
                        lng: cityData.lng + (Math.random() - 0.5) * 0.04
                    }
                },
                amenities: ['parking', 'gym', 'pool', 'security', 'clubhouse', 'power_backup'],
                furnishing: 'fully-furnished',
                bachelorFriendly: false,
                zeroBrokerage: Math.random() > 0.5,
                petFriendly: true,
                verified: true,
                isFeatured: aIdx === 1,
                isAvailable: true,
                walkabilityScore: 75 + Math.floor(Math.random() * 20),
                connectivityScore: 82 + Math.floor(Math.random() * 15),
                futureDevelopment: `New tech corridor and hospital under development.`,
                images: [
                    PROP_IMAGES[(count + aIdx + 2) % PROP_IMAGES.length],
                    PROP_IMAGES[(count + aIdx + 3) % PROP_IMAGES.length]
                ],
                owner: ownerId,
                status: 'approved'
            });

            // Add 2 PGs per area: 1 Boys / 1 Girls / Unisex
            const gender1 = aIdx % 2 === 0 ? 'male' : 'female';
            const gender2 = 'unisex';
            const pgRent1 = 6500 + Math.floor(Math.random() * 5000);
            const pgRent2 = 8500 + Math.floor(Math.random() * 6000);

            newPGs.push({
                name: `Elite ${gender1 === 'male' ? 'Boys' : 'Girls'} PG - ${area.name}`,
                description: `Premium ${gender1} accommodation located right near ${area.institutions.join(' and ')}. Includes fast WiFi, three daily meals, daily housekeeping, and 24/7 CCTV surveillance.`,
                type: 'pg',
                genderType: gender1,
                rentPerMonth: pgRent1,
                securityDeposit: pgRent1 * 2,
                sharingType: ['single', 'double', 'triple'],
                location: {
                    address: `${area.landmark}, ${area.name}`,
                    city: cityName,
                    state: cityData.state,
                    pincode: '380009',
                    nearbyInstitutions: area.institutions,
                    coordinates: {
                        lat: cityData.lat + (Math.random() - 0.5) * 0.03,
                        lng: cityData.lng + (Math.random() - 0.5) * 0.03
                    }
                },
                amenities: { wifi: true, food: true, ac: Math.random() > 0.5, laundry: true, housekeeping: true, cctv: true, hotWater: true },
                meals: { breakfast: true, lunch: true, dinner: true },
                totalRooms: 20,
                availableRooms: 5,
                images: [
                    PG_IMAGES[(count + aIdx) % PG_IMAGES.length],
                    PG_IMAGES[(count + aIdx + 1) % PG_IMAGES.length]
                ],
                owner: ownerId,
                isAvailable: true,
                isFeatured: aIdx === 0,
                rating: Number((4.1 + Math.random() * 0.8).toFixed(1)),
                reviewCount: 20 + Math.floor(Math.random() * 50),
                walkabilityScore: 85 + Math.floor(Math.random() * 12),
                connectivityScore: 82 + Math.floor(Math.random() * 14)
            });

            newPGs.push({
                name: `Hive Co-Living & Hostel - ${area.name}`,
                description: `Modern unisex co-living space designed for working professionals and students near ${area.institutions[0]}. High-speed fiber internet, dedicated study room, and food included.`,
                type: 'coliving',
                genderType: gender2,
                rentPerMonth: pgRent2,
                securityDeposit: pgRent2 * 2,
                sharingType: ['single', 'double'],
                location: {
                    address: `Main Road, ${area.name}`,
                    city: cityName,
                    state: cityData.state,
                    pincode: '380015',
                    nearbyInstitutions: area.institutions,
                    coordinates: {
                        lat: cityData.lat + (Math.random() - 0.5) * 0.03,
                        lng: cityData.lng + (Math.random() - 0.5) * 0.03
                    }
                },
                amenities: { wifi: true, food: true, ac: true, laundry: true, housekeeping: true, cctv: true, hotWater: true, gym: true },
                meals: { breakfast: true, lunch: false, dinner: true },
                totalRooms: 30,
                availableRooms: 8,
                images: [
                    PG_IMAGES[(count + aIdx + 2) % PG_IMAGES.length],
                    PG_IMAGES[(count + aIdx + 3) % PG_IMAGES.length]
                ],
                owner: ownerId,
                isAvailable: true,
                isFeatured: aIdx === 1,
                rating: Number((4.3 + Math.random() * 0.6).toFixed(1)),
                reviewCount: 35 + Math.floor(Math.random() * 60),
                walkabilityScore: 88 + Math.floor(Math.random() * 10),
                connectivityScore: 85 + Math.floor(Math.random() * 12)
            });

            count++;
        });
    }

    console.log(`Inserting ${newProperties.length} new Properties...`);
    await Property.insertMany(newProperties);

    console.log(`Inserting ${newPGs.length} new PGs...`);
    await PG.insertMany(newPGs);

    const totalProps = await Property.countDocuments();
    const totalPGs = await PG.countDocuments();
    console.log(`✅ Success! Total Properties in DB: ${totalProps}, Total PGs: ${totalPGs}`);

    process.exit(0);
}

seedAll().catch(err => {
    console.error('Seeding error:', err);
    process.exit(1);
});
