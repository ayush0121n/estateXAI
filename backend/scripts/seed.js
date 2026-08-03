const path = require('path');
const rootDir = path.join(__dirname, '..');

require('dotenv').config({ path: path.join(rootDir, '.env') });
const mongoose = require('mongoose');

async function main() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas!');

    const User = require(path.join(rootDir, 'models/User'));
    const Property = require(path.join(rootDir, 'models/Property'));
    const PG = require(path.join(rootDir, 'models/PG'));

    // Reset properties & PGs for fresh realistic seed
    await Property.deleteMany({});
    await PG.deleteMany({});
    await User.deleteOne({ email: 'admin@estatexai.com' });
    await User.deleteOne({ email: 'owner@estatexai.com' });

    const admin = await User.create({
        name: 'EstateXAi Admin',
        email: 'admin@estatexai.com',
        password: 'Admin@123',
        phone: '9876543210',
        role: 'admin',
        institution: 'SBUP Pune',
        workplace: 'EstateXAi Labs'
    });

    const owner = await User.create({
        name: 'Rajesh Kumar',
        email: 'owner@estatexai.com',
        password: 'Owner@123',
        phone: '9765432109',
        role: 'owner',
        workplace: 'Infosys Pune'
    });

    const properties = [
        // Kothrud
        {
            title: '3BHK Luxury Apartment in Kothrud',
            description: 'Spacious 3BHK flat in prime Kothrud locality. Features modular kitchen, wooden flooring in master bedroom, 2 covered parking spots, 24x7 security, and power backup.',
            type: 'apartment', listingType: 'sale', price: 8500000, area: 1350, bhk: 3, bathrooms: 2, floor: 4, totalFloors: 10, yearBuilt: 2020, furnishing: 'semi-furnished', facing: 'east',
            location: { address: 'Paud Road, Kothrud, Pune', city: 'Pune', state: 'Maharashtra', pincode: '411038', coordinates: { lat: 18.5074, lng: 73.8077 } },
            amenities: ['parking', 'gym', 'security', 'elevator', 'power_backup', 'wifi'],
            owner: admin._id, isFeatured: true, status: 'approved', views: 340,
            walkabilityScore: 88, connectivityScore: 92,
            futureDevelopment: 'Upcoming Metro Line extension connecting Paud Road to Swargate expected by Q4 2026.',
            nearbyPOIs: [
                { name: 'MIT World Peace University', type: 'school', distanceKm: 0.6, lat: 18.5085, lng: 73.8090 },
                { name: 'Sahyadri Super Specialty Hospital', type: 'hospital', distanceKm: 1.2, lat: 18.5040, lng: 73.8120 },
                { name: 'Kothrud Bus Stand', type: 'transport', distanceKm: 0.4, lat: 18.5060, lng: 73.8050 },
                { name: 'Pavillion Mall', type: 'shopping', distanceKm: 2.5, lat: 18.5200, lng: 73.8200 }
            ],
            images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800']
        },
        // Hinjewadi
        {
            title: '2BHK Modern Flat near Hinjewadi IT Hub',
            description: 'Fully furnished 2BHK flat located 5 mins from Infosys and Wipro Circle. Includes high-speed WiFi, ACs in both rooms, sofa set, TV, and automatic washing machine.',
            type: 'apartment', listingType: 'rent', price: 24000, area: 980, bhk: 2, bathrooms: 2, floor: 6, totalFloors: 14, yearBuilt: 2022, furnishing: 'fully-furnished', facing: 'north-east',
            location: { address: 'Hinjewadi Phase 1, Pune', city: 'Pune', state: 'Maharashtra', pincode: '411057', coordinates: { lat: 18.5912, lng: 73.7389 } },
            amenities: ['parking', 'gym', 'security', 'elevator', 'wifi', 'ac', 'power_backup'],
            owner: admin._id, isFeatured: true, status: 'approved', views: 512,
            walkabilityScore: 78, connectivityScore: 95,
            futureDevelopment: 'Hinjewadi-Shivajinagar Metro Line 3 station within 300 meters walking distance.',
            nearbyPOIs: [
                { name: 'Infosys Phase 1 Campus', type: 'school', distanceKm: 0.5, lat: 18.5920, lng: 73.7370 },
                { name: 'Ruby Hall Clinic Hinjewadi', type: 'hospital', distanceKm: 1.0, lat: 18.5890, lng: 73.7420 },
                { name: 'Xion Mall Hinjewadi', type: 'shopping', distanceKm: 1.5, lat: 18.5950, lng: 73.7500 }
            ],
            images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800']
        },
        // Baner
        {
            title: '4BHK Ultra-Luxury Villa in Baner',
            description: 'Independent gated villa with private swimming pool, landscaped garden, servant room, home automation system, and 3 covered car parking spaces.',
            type: 'villa', listingType: 'sale', price: 19500000, area: 3200, bhk: 4, bathrooms: 4, floor: 1, totalFloors: 2, yearBuilt: 2023, furnishing: 'fully-furnished', facing: 'east',
            location: { address: 'Baner-Pashan Link Road, Baner, Pune', city: 'Pune', state: 'Maharashtra', pincode: '411045', coordinates: { lat: 18.5590, lng: 73.7868 } },
            amenities: ['parking', 'gym', 'pool', 'garden', 'clubhouse', 'security', 'wifi', 'ac'],
            owner: admin._id, isFeatured: true, status: 'approved', views: 680,
            walkabilityScore: 82, connectivityScore: 90,
            futureDevelopment: 'High Street Baner Commercial corridor expansion scheduled for 2026.',
            nearbyPOIs: [
                { name: 'VIBGYOR High School Baner', type: 'school', distanceKm: 0.8, lat: 18.5600, lng: 73.7850 },
                { name: 'Jupiter Hospital Baner', type: 'hospital', distanceKm: 1.5, lat: 18.5550, lng: 73.7920 }
            ],
            images: ['https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800']
        },
        // Viman Nagar
        {
            title: '1BHK Studio Apartment in Viman Nagar',
            description: 'Compact studio flat next to Phoenix Marketcity and Symbiosis Campus. Fully furnished with bed, fridge, air conditioner, and work desk.',
            type: 'studio', listingType: 'rent', price: 16000, area: 480, bhk: 1, bathrooms: 1, floor: 3, totalFloors: 7, yearBuilt: 2021, furnishing: 'fully-furnished', facing: 'north',
            location: { address: 'Viman Nagar, Pune', city: 'Pune', state: 'Maharashtra', pincode: '411014', coordinates: { lat: 18.5679, lng: 73.9143 } },
            amenities: ['wifi', 'ac', 'security', 'elevator', 'power_backup'],
            owner: owner._id, isFeatured: false, status: 'approved', views: 245,
            walkabilityScore: 94, connectivityScore: 96,
            futureDevelopment: 'Pune International Airport expansion & Ramwadi Metro connectivity.',
            nearbyPOIs: [
                { name: 'Symbiosis International University', type: 'school', distanceKm: 0.4, lat: 18.5685, lng: 73.9150 },
                { name: 'Phoenix Marketcity Mall', type: 'shopping', distanceKm: 0.6, lat: 18.5620, lng: 73.9170 }
            ],
            images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800']
        },
        // Wakad
        {
            title: '2BHK Gated Flat in Wakad',
            description: 'Family-friendly 2BHK flat near Bhumkar Chowk. Swimming pool, children play area, clubhouse, 24hr security guard and CCTV monitoring.',
            type: 'apartment', listingType: 'sale', price: 6800000, area: 1100, bhk: 2, bathrooms: 2, floor: 8, totalFloors: 12, yearBuilt: 2019, furnishing: 'semi-furnished', facing: 'east',
            location: { address: 'Bhumkar Chowk, Wakad, Pune', city: 'Pune', state: 'Maharashtra', pincode: '411057', coordinates: { lat: 18.5983, lng: 73.7611 } },
            amenities: ['parking', 'gym', 'pool', 'garden', 'security', 'elevator'],
            owner: owner._id, isFeatured: false, status: 'approved', views: 189,
            walkabilityScore: 75, connectivityScore: 88,
            nearbyPOIs: [
                { name: 'EuroSchool Wakad', type: 'school', distanceKm: 1.1, lat: 18.5970, lng: 73.7630 }
            ],
            images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800']
        },
        // Shivajinagar
        {
            title: 'Commercial Office Space in Shivajinagar',
            description: '1400 sq.ft prime commercial office layout with 20 workstations, glass cabin, conference room, reception area, and dedicated underground parking.',
            type: 'commercial', listingType: 'rent', price: 65000, area: 1400, bhk: 0, bathrooms: 2, floor: 2, totalFloors: 6, yearBuilt: 2018, furnishing: 'fully-furnished', facing: 'south-east',
            location: { address: 'JM Road, Shivajinagar, Pune', city: 'Pune', state: 'Maharashtra', pincode: '411005', coordinates: { lat: 18.5308, lng: 73.8474 } },
            amenities: ['parking', 'elevator', 'security', 'power_backup', 'wifi', 'ac'],
            owner: owner._id, isFeatured: true, status: 'approved', views: 420,
            walkabilityScore: 96, connectivityScore: 98,
            nearbyPOIs: [
                { name: 'Shivajinagar Metro Station', type: 'transport', distanceKm: 0.2, lat: 18.5315, lng: 73.8480 }
            ],
            images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800']
        },
        // Kharadi
        {
            title: 'Premium 3BHK Apartment in Kharadi',
            description: 'Luxurious 3BHK located near EON IT Park. High-floor unit with panoramic city views, Italian marble flooring, and modular kitchen.',
            type: 'apartment', listingType: 'sale', price: 12500000, area: 1650, bhk: 3, bathrooms: 3, floor: 12, totalFloors: 22, yearBuilt: 2021, furnishing: 'semi-furnished', facing: 'east',
            location: { address: 'Near EON IT Park, Kharadi, Pune', city: 'Pune', state: 'Maharashtra', pincode: '411014', coordinates: { lat: 18.5515, lng: 73.9348 } },
            amenities: ['parking', 'gym', 'pool', 'garden', 'security', 'elevator', 'clubhouse', 'power_backup'],
            owner: admin._id, isFeatured: true, status: 'approved', views: 510,
            walkabilityScore: 85, connectivityScore: 89,
            futureDevelopment: 'New commercial park development adjacent to EON.',
            nearbyPOIs: [
                { name: 'EON IT Park', type: 'other', distanceKm: 0.5, lat: 18.5520, lng: 73.9350 },
                { name: 'Columbia Asia Hospital', type: 'hospital', distanceKm: 1.2, lat: 18.5500, lng: 73.9300 }
            ],
            images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800']
        },
        // Hadapsar (Magarpatta)
        {
            title: '2BHK Apartment in Magarpatta City',
            description: 'Well-maintained 2BHK flat inside Magarpatta City. Peaceful environment with huge green spaces, jogging tracks, and excellent security.',
            type: 'apartment', listingType: 'rent', price: 28000, area: 1050, bhk: 2, bathrooms: 2, floor: 5, totalFloors: 11, yearBuilt: 2015, furnishing: 'fully-furnished', facing: 'north',
            location: { address: 'Magarpatta City, Hadapsar, Pune', city: 'Pune', state: 'Maharashtra', pincode: '411028', coordinates: { lat: 18.5158, lng: 73.9272 } },
            amenities: ['parking', 'gym', 'pool', 'garden', 'security', 'elevator', 'wifi', 'ac'],
            owner: owner._id, isFeatured: false, status: 'approved', views: 330,
            walkabilityScore: 95, connectivityScore: 90,
            nearbyPOIs: [
                { name: 'Seasons Mall', type: 'shopping', distanceKm: 0.8, lat: 18.5180, lng: 73.9300 },
                { name: 'Cybercity IT Park', type: 'other', distanceKm: 0.3, lat: 18.5160, lng: 73.9280 }
            ],
            images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800']
        },
        // Aundh
        {
            title: '4BHK Penthouse in Aundh',
            description: 'Exclusive 4BHK penthouse with a private terrace garden in Aundh. Features smart home technology, high-end fittings, and two servant quarters.',
            type: 'apartment', listingType: 'sale', price: 35000000, area: 3800, bhk: 4, bathrooms: 5, floor: 15, totalFloors: 15, yearBuilt: 2022, furnishing: 'semi-furnished', facing: 'west',
            location: { address: 'ITI Road, Aundh, Pune', city: 'Pune', state: 'Maharashtra', pincode: '411007', coordinates: { lat: 18.5580, lng: 73.8075 } },
            amenities: ['parking', 'gym', 'pool', 'garden', 'security', 'elevator', 'clubhouse', 'power_backup'],
            owner: admin._id, isFeatured: true, status: 'approved', views: 820,
            walkabilityScore: 92, connectivityScore: 94,
            nearbyPOIs: [
                { name: 'Westend Mall', type: 'shopping', distanceKm: 1.5, lat: 18.5610, lng: 73.8050 },
                { name: 'Medipoint Hospital', type: 'hospital', distanceKm: 0.7, lat: 18.5570, lng: 73.8100 }
            ],
            images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800']
        },
        // Undri
        {
            title: 'Affordable 2BHK in Undri',
            description: 'Brand new 2BHK apartment in a developing locality. Great for investment. Complex includes basic amenities and open parking.',
            type: 'apartment', listingType: 'sale', price: 4500000, area: 850, bhk: 2, bathrooms: 2, floor: 3, totalFloors: 8, yearBuilt: 2024, furnishing: 'unfurnished', facing: 'east',
            location: { address: 'NIBM Annexe, Undri, Pune', city: 'Pune', state: 'Maharashtra', pincode: '411060', coordinates: { lat: 18.4555, lng: 73.9055 } },
            amenities: ['parking', 'security', 'elevator', 'garden'],
            owner: owner._id, isFeatured: false, status: 'approved', views: 150,
            walkabilityScore: 60, connectivityScore: 75,
            futureDevelopment: 'Proposed ring road alignment to improve connectivity to IT hubs.',
            nearbyPOIs: [
                { name: 'Bishop\'s Co-Ed School', type: 'school', distanceKm: 1.0, lat: 18.4600, lng: 73.9100 }
            ],
            images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800']
        },
        // Koregaon Park
        {
            title: 'Exquisite 3BHK Apartment in Koregaon Park',
            description: 'Ultra-luxurious 3BHK apartment in the heart of KP. Walking distance to Osho Ashram, cafes, and boutiques.',
            type: 'apartment', listingType: 'rent', price: 75000, area: 1800, bhk: 3, bathrooms: 3, floor: 2, totalFloors: 5, yearBuilt: 2018, furnishing: 'fully-furnished', facing: 'north',
            location: { address: 'Lane 5, Koregaon Park, Pune', city: 'Pune', state: 'Maharashtra', pincode: '411001', coordinates: { lat: 18.5360, lng: 73.8940 } },
            amenities: ['parking', 'security', 'elevator', 'power_backup', 'ac', 'wifi'],
            owner: admin._id, isFeatured: true, status: 'approved', views: 600,
            walkabilityScore: 98, connectivityScore: 95,
            nearbyPOIs: [
                { name: 'Osho International Meditation Resort', type: 'park', distanceKm: 0.5, lat: 18.5380, lng: 73.8900 },
                { name: 'German Bakery', type: 'shopping', distanceKm: 0.3, lat: 18.5370, lng: 73.8920 }
            ],
            images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800']
        }
    ];

    const pgs = [
        // Aundh
        {
            name: 'Green Valley Boys PG & Hostel',
            description: 'Clean and peaceful PG accommodation for male students and young professionals. Offers 3 times nutritious meals, high-speed WiFi, hot water, and daily housekeeping.',
            type: 'pg', genderType: 'male', rentPerMonth: 8500, securityDeposit: 17000, sharingType: ['single', 'double'],
            location: { address: 'Near SPPU Gate 2, Aundh, Pune', city: 'Pune', state: 'Maharashtra', pincode: '411007', nearbyInstitutions: ['SPPU University', 'MIT Pune', 'Aundh College'], coordinates: { lat: 18.5589, lng: 73.8088 } },
            amenities: { wifi: true, food: true, ac: false, laundry: true, parking: false, housekeeping: true, cctv: true, powerBackup: true, hotWater: true, studyRoom: true },
            meals: { breakfast: true, lunch: false, dinner: true },
            rules: { curfewTime: '10:30 PM', guestsAllowed: false, smokingAllowed: false, petsAllowed: false },
            totalRooms: 30, availableRooms: 8, owner: admin._id, isFeatured: true, rating: 4.4, reviewCount: 52,
            images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800']
        },
        // Viman Nagar
        {
            name: 'Sunrise Girls Luxury Hostel',
            description: 'Female-only residence with 24/7 biometric security access, CCTV surveillance, air-conditioned rooms, study library, and daily laundry service.',
            type: 'hostel', genderType: 'female', rentPerMonth: 9500, securityDeposit: 19000, sharingType: ['double', 'triple'],
            location: { address: 'Symbiosis Road, Viman Nagar, Pune', city: 'Pune', state: 'Maharashtra', pincode: '411014', nearbyInstitutions: ['Symbiosis Institute', 'NIBM', 'Christ College'], coordinates: { lat: 18.5679, lng: 73.9143 } },
            amenities: { wifi: true, food: true, ac: true, laundry: true, housekeeping: true, cctv: true, hotWater: true, studyRoom: true, refrigerator: true },
            meals: { breakfast: true, lunch: true, dinner: true },
            rules: { curfewTime: '9:30 PM', guestsAllowed: false, smokingAllowed: false, petsAllowed: false },
            totalRooms: 25, availableRooms: 4, owner: admin._id, isFeatured: true, rating: 4.7, reviewCount: 94,
            images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800']
        },
        // Hinjewadi
        {
            name: 'Urban Co-Living Space Hinjewadi',
            description: 'Premium co-living ecosystem designed for tech professionals in IT Park Phase 2. Gaming lounge, high-speed fiber internet, rooftop cafe, and gym.',
            type: 'coliving', genderType: 'unisex', rentPerMonth: 13000, securityDeposit: 26000, sharingType: ['single', 'double'],
            location: { address: 'Phase 2 Road, Hinjewadi, Pune', city: 'Pune', state: 'Maharashtra', pincode: '411057', nearbyInstitutions: ['Infosys', 'TCS', 'Wipro', 'Tech Mahindra'], coordinates: { lat: 18.5912, lng: 73.7389 } },
            amenities: { wifi: true, food: false, ac: true, laundry: true, gym: true, parking: true, cctv: true, tv: true, refrigerator: true, powerBackup: true, hotWater: true },
            meals: { breakfast: false, lunch: false, dinner: false },
            rules: { curfewTime: 'None', guestsAllowed: true, smokingAllowed: false, petsAllowed: false },
            totalRooms: 45, availableRooms: 10, owner: owner._id, isFeatured: true, rating: 4.5, reviewCount: 78,
            images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800']
        },
        // Deccan
        {
            name: "Scholar's Den Student PG",
            description: 'Budget-friendly PG close to Fergusson College and BMCC. Silent study room, high-speed WiFi, home-cooked Maharashtrian meals included.',
            type: 'pg', genderType: 'male', rentPerMonth: 6800, securityDeposit: 13600, sharingType: ['double', 'triple', 'quad'],
            location: { address: 'FC Road, Deccan Gymkhana, Pune', city: 'Pune', state: 'Maharashtra', pincode: '411004', nearbyInstitutions: ['Fergusson College', 'BMCC', 'COEP Pune'], coordinates: { lat: 18.5136, lng: 73.8389 } },
            amenities: { wifi: true, food: true, ac: false, cctv: true, hotWater: true, studyRoom: true, housekeeping: true },
            meals: { breakfast: true, lunch: false, dinner: true },
            rules: { curfewTime: '10:00 PM', guestsAllowed: false, smokingAllowed: false, petsAllowed: false },
            totalRooms: 22, availableRooms: 5, owner: owner._id, isFeatured: false, rating: 4.1, reviewCount: 39,
            images: ['https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800']
        },
        // Koregaon Park
        {
            name: 'Lotus Girls Premium PG Koregaon Park',
            description: 'Boutique accommodation for female working professionals and students in posh Koregaon Park. Single & double occupancy available.',
            type: 'pg', genderType: 'female', rentPerMonth: 11500, securityDeposit: 23000, sharingType: ['single', 'double'],
            location: { address: 'Lane 7, Koregaon Park, Pune', city: 'Pune', state: 'Maharashtra', pincode: '411001', nearbyInstitutions: ['IIIT Pune', 'Army Institute of Technology'], coordinates: { lat: 18.5362, lng: 73.8938 } },
            amenities: { wifi: true, food: true, ac: true, laundry: true, cctv: true, hotWater: true, housekeeping: true, refrigerator: true },
            meals: { breakfast: true, lunch: false, dinner: true },
            rules: { curfewTime: '10:30 PM', guestsAllowed: true, smokingAllowed: false, petsAllowed: false },
            totalRooms: 16, availableRooms: 3, owner: owner._id, isFeatured: true, rating: 4.8, reviewCount: 82,
            images: ['https://images.unsplash.com/photo-1501183638710-841dd1904471?w=800']
        },
        // Kharadi
        {
            name: 'Tech-Hub Co-Living Kharadi',
            description: 'Modern PG near EON IT Park. Perfect for IT professionals. Includes gym, recreation area, and weekly events.',
            type: 'coliving', genderType: 'unisex', rentPerMonth: 12500, securityDeposit: 25000, sharingType: ['double', 'triple'],
            location: { address: 'Kharadi South Main Road, Pune', city: 'Pune', state: 'Maharashtra', pincode: '411014', nearbyInstitutions: ['EON IT Park', 'Zensar', 'Barclays'], coordinates: { lat: 18.5525, lng: 73.9355 } },
            amenities: { wifi: true, food: false, ac: true, laundry: true, gym: true, cctv: true, hotWater: true, housekeeping: true },
            meals: { breakfast: false, lunch: false, dinner: false },
            rules: { curfewTime: 'None', guestsAllowed: true, smokingAllowed: false, petsAllowed: false },
            totalRooms: 35, availableRooms: 12, owner: admin._id, isFeatured: true, rating: 4.3, reviewCount: 45,
            images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800']
        },
        // Hadapsar
        {
            name: 'Magarpatta City Boys Hostel',
            description: 'Conveniently located boys hostel near Cybercity. Good food, regular cleaning, and secure environment.',
            type: 'hostel', genderType: 'male', rentPerMonth: 7500, securityDeposit: 15000, sharingType: ['double', 'quad'],
            location: { address: 'Magarpatta North Gate, Hadapsar, Pune', city: 'Pune', state: 'Maharashtra', pincode: '411028', nearbyInstitutions: ['Cybercity', 'Amanora Park Town'], coordinates: { lat: 18.5170, lng: 73.9290 } },
            amenities: { wifi: true, food: true, ac: false, laundry: false, cctv: true, hotWater: true, housekeeping: true },
            meals: { breakfast: true, lunch: true, dinner: true },
            rules: { curfewTime: '11:00 PM', guestsAllowed: false, smokingAllowed: false, petsAllowed: false },
            totalRooms: 20, availableRooms: 6, owner: owner._id, isFeatured: false, rating: 4.0, reviewCount: 28,
            images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800']
        }
    ];

    await Property.insertMany(properties);
    await PG.insertMany(pgs);

    console.log(`\n✅ SEED SUCCESSFUL!`);
    console.log(`- Seeded ${properties.length} realistic Properties with Map Coordinates & Price Trends`);
    console.log(`- Seeded ${pgs.length} realistic PGs with Nearby Institutions & Ratings`);
    console.log('Admin Account: admin@estatexai.com / Admin@123');
    console.log('Owner Account: owner@estatexai.com / Owner@123');

    process.exit(0);
}

main().catch(err => {
    console.error('Seed Error:', err);
    process.exit(1);
});
