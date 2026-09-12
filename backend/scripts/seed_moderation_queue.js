require('dotenv').config();
const mongoose = require('mongoose');

const User = require('../models/User');
const Property = require('../models/Property');
const PG = require('../models/PG');
const Inquiry = require('../models/Inquiry');

const PENDING_LISTINGS = [
    {
        title: '3BHK Penthouse with Skyline View in Kothrud',
        description: 'Newly listed modern penthouse in Kothrud, Pune. Top floor with private terrace garden, Italian marble flooring, and smart home automation. Requesting fast approval for urgent sale.',
        type: 'apartment',
        listingType: 'sale',
        price: 14500000,
        area: 2100,
        bhk: 3,
        bathrooms: 3,
        location: {
            address: 'Ideal Colony, Paud Road, Kothrud',
            city: 'Pune',
            state: 'Maharashtra',
            pincode: '411038',
            coordinates: { lat: 18.5074, lng: 73.8077 }
        },
        amenities: ['parking', 'gym', 'pool', 'elevator', 'security', 'clubhouse', 'power_backup'],
        furnishing: 'fully-furnished',
        bachelorFriendly: true,
        zeroBrokerage: true,
        petFriendly: true,
        verified: false,
        status: 'pending',
        walkabilityScore: 88,
        connectivityScore: 85,
        futureDevelopment: 'New metro line extension within 400 meters.',
        images: [
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80'
        ]
    },
    {
        title: '2BHK Spacious Sunlit Flat near Manyata Tech Park',
        description: 'Brand new 2BHK rental apartment in Nagavara, Bangalore. Just 5 minutes from Manyata Tech Park gate 2. Modular kitchen, covered car parking, and peaceful gated community.',
        type: 'apartment',
        listingType: 'rent',
        price: 28000,
        deposit: 84000,
        area: 1150,
        bhk: 2,
        bathrooms: 2,
        location: {
            address: 'Outer Ring Road, Near Manyata Tech Park',
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: '560045',
            coordinates: { lat: 13.0458, lng: 77.6200 }
        },
        amenities: ['parking', 'security', 'wifi', 'elevator', 'power_backup'],
        furnishing: 'semi-furnished',
        bachelorFriendly: true,
        zeroBrokerage: false,
        petFriendly: false,
        verified: false,
        status: 'pending',
        walkabilityScore: 92,
        connectivityScore: 89,
        futureDevelopment: 'ORR metro corridor opening in 2026.',
        images: [
            'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80'
        ]
    },
    {
        title: 'Luxury 4BHK Sea View Villa in Candolim',
        description: 'Exclusive private Portuguese villa in Candolim, Goa with private plunge pool, lawn, and direct beach access. High rental yield potential as a holiday home.',
        type: 'villa',
        listingType: 'sale',
        price: 32500000,
        area: 3400,
        bhk: 4,
        bathrooms: 4,
        location: {
            address: 'Camotim Vaddo, Candolim Beach Road',
            city: 'Goa',
            state: 'Goa',
            pincode: '403515',
            coordinates: { lat: 15.5175, lng: 73.7634 }
        },
        amenities: ['parking', 'pool', 'garden', 'security', 'power_backup'],
        furnishing: 'fully-furnished',
        bachelorFriendly: true,
        zeroBrokerage: true,
        petFriendly: true,
        verified: false,
        status: 'pending',
        walkabilityScore: 84,
        connectivityScore: 78,
        futureDevelopment: 'New high-speed coastal highway access.',
        images: [
            'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80'
        ]
    },
    {
        title: '1BHK Studio Apartment near Cyber City',
        description: 'Compact and modern studio in Sector 24, DLF Phase 3, Gurgaon. Fully furnished with high-speed WiFi, work desk, and power backup. Ideal for corporate professionals.',
        type: 'studio',
        listingType: 'rent',
        price: 22000,
        deposit: 44000,
        area: 500,
        bhk: 1,
        bathrooms: 1,
        location: {
            address: 'DLF Phase 3, Near Cyber City',
            city: 'Delhi NCR',
            state: 'Haryana',
            pincode: '122002',
            coordinates: { lat: 28.4900, lng: 77.0950 }
        },
        amenities: ['parking', 'security', 'wifi', 'elevator', 'power_backup'],
        furnishing: 'fully-furnished',
        bachelorFriendly: true,
        zeroBrokerage: true,
        petFriendly: false,
        verified: false,
        status: 'pending',
        walkabilityScore: 94,
        connectivityScore: 95,
        futureDevelopment: 'Rapid Metro connection right outside the society.',
        images: [
            'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80'
        ]
    },
    {
        title: '3BHK Gated Community Apartment in HITEC City',
        description: 'East facing 3BHK flat in prime Madhapur / HITEC City locality. Premium marble finish, clubhouse with gym, swimming pool, and squash court.',
        type: 'apartment',
        listingType: 'sale',
        price: 11000000,
        area: 1750,
        bhk: 3,
        bathrooms: 3,
        location: {
            address: 'Ayyappa Society, Madhapur',
            city: 'Hyderabad',
            state: 'Telangana',
            pincode: '500081',
            coordinates: { lat: 17.4483, lng: 78.3915 }
        },
        amenities: ['parking', 'gym', 'pool', 'elevator', 'security', 'clubhouse', 'power_backup'],
        furnishing: 'semi-furnished',
        bachelorFriendly: true,
        zeroBrokerage: false,
        petFriendly: true,
        verified: false,
        status: 'pending',
        walkabilityScore: 89,
        connectivityScore: 92,
        futureDevelopment: 'Elevated skywalk corridor connecting directly to Metro station.',
        images: [
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80'
        ]
    },
    {
        title: '2BHK Modern Flat in Gomti Nagar Extension',
        description: 'Brand new 2BHK flat available for rent in Gomti Nagar Extension. Close to international cricket stadium, IT city, and Phoenix Palassio Mall.',
        type: 'apartment',
        listingType: 'rent',
        price: 18000,
        deposit: 36000,
        area: 1100,
        bhk: 2,
        bathrooms: 2,
        location: {
            address: 'Sector 7, Gomti Nagar Extension',
            city: 'Lucknow',
            state: 'Uttar Pradesh',
            pincode: '226010',
            coordinates: { lat: 26.8500, lng: 81.0100 }
        },
        amenities: ['parking', 'elevator', 'security', 'power_backup'],
        furnishing: 'semi-furnished',
        bachelorFriendly: true,
        zeroBrokerage: true,
        petFriendly: false,
        verified: false,
        status: 'pending',
        walkabilityScore: 82,
        connectivityScore: 85,
        futureDevelopment: 'New commercial district and IT hub development in progress.',
        images: [
            'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80'
        ]
    },
    {
        title: '2BHK Flat near Infopark Kakkanad',
        description: 'Furnished 2BHK flat in Kakkanad, Kochi. Just 1.5 km from Infopark Phase 1. 24-hr treated water supply, gym, and covered car park.',
        type: 'apartment',
        listingType: 'rent',
        price: 19000,
        deposit: 50000,
        area: 1050,
        bhk: 2,
        bathrooms: 2,
        location: {
            address: 'Near Infopark Expressway, Kakkanad',
            city: 'Kochi',
            state: 'Kerala',
            pincode: '682030',
            coordinates: { lat: 10.0159, lng: 76.3419 }
        },
        amenities: ['parking', 'security', 'gym', 'elevator', 'power_backup'],
        furnishing: 'fully-furnished',
        bachelorFriendly: true,
        zeroBrokerage: true,
        petFriendly: true,
        verified: false,
        status: 'pending',
        walkabilityScore: 80,
        connectivityScore: 83,
        futureDevelopment: 'Kochi Water Metro stop connecting to mainland Kochi.',
        images: [
            'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80'
        ]
    },
    {
        title: '3BHK Independent Floor in Sector 35',
        description: 'Premium builder floor on 1st floor in Sector 35, Chandigarh. Wide front road, green park facing, modular kitchen with chimney, and wooden wardrobes.',
        type: 'house',
        listingType: 'sale',
        price: 16500000,
        area: 1950,
        bhk: 3,
        bathrooms: 3,
        location: {
            address: 'Sector 35-B, Near Aroma Chowk',
            city: 'Chandigarh',
            state: 'Punjab/Haryana',
            pincode: '160035',
            coordinates: { lat: 30.7250, lng: 76.7650 }
        },
        amenities: ['parking', 'security', 'power_backup'],
        furnishing: 'semi-furnished',
        bachelorFriendly: false,
        zeroBrokerage: true,
        petFriendly: true,
        verified: false,
        status: 'pending',
        walkabilityScore: 90,
        connectivityScore: 91,
        futureDevelopment: 'City center beautification and underground cabling project.',
        images: [
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80'
        ]
    }
];

async function seedModerationQueue() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected.');

    const users = await User.find({ role: 'owner' }).limit(5);
    const fallbackUser = await User.findOne({});
    const owners = users.length > 0 ? users : [fallbackUser];

    // 1. Insert Pending Listings
    console.log('Seeding pending properties for moderation queue...');
    let idx = 0;
    const toInsert = PENDING_LISTINGS.map(p => {
        const owner = owners[idx % owners.length];
        idx++;
        return {
            ...p,
            owner: owner._id,
            isAvailable: false // Not available until approved
        };
    });

    await Property.insertMany(toInsert);
    const pendingCount = await Property.countDocuments({ status: 'pending' });
    console.log(`✅ Successfully seeded ${toInsert.length} pending properties! Current Pending in DB: ${pendingCount}`);

    // 2. Ensure all owners (including admin and owner@estatexai.com) have leads/inquiries
    const allOwners = await User.find({ role: { $in: ['admin', 'owner'] } });
    const regularUsers = await User.find({ role: 'user' });

    console.log('Ensuring all owner accounts have received inquiries...');
    const allProps = await Property.find({ status: 'approved' }).limit(50);
    const allPGs = await PG.find().limit(50);

    let inquiriesCreated = 0;
    for (const o of allOwners) {
        const existingCount = await Inquiry.countDocuments({ owner: o._id });
        if (existingCount < 5) {
            const needed = 5 - existingCount;
            const newInqs = [];
            for (let i = 0; i < needed; i++) {
                const prop = allProps[i % allProps.length];
                const sender = regularUsers[i % regularUsers.length] || o;
                newInqs.push({
                    user: sender._id,
                    propertyType: i % 2 === 0 ? 'property' : 'pg',
                    property: i % 2 === 0 ? prop._id : undefined,
                    pg: i % 2 !== 0 ? allPGs[i % allPGs.length]._id : undefined,
                    owner: o._id,
                    message: i % 2 === 0 
                        ? "Hello, I saw this property on EstateXAi and would love to schedule a visit this weekend!" 
                        : "Hi, is double sharing room still available in this PG? Looking to move in within 10 days.",
                    phone: sender.phone || '9820123451',
                    status: i % 2 === 0 ? 'pending' : 'responded',
                    ownerResponse: i % 2 !== 0 ? "Yes! The room is available. You can visit anytime between 10 AM and 6 PM." : ''
                });
            }
            await Inquiry.insertMany(newInqs);
            inquiriesCreated += needed;
        }
    }
    console.log(`✅ Created ${inquiriesCreated} additional inquiries across owner accounts.`);

    console.log('\n================ MODERATION & LEADS SUMMARY ================');
    console.log(`Pending Moderation Queue Count: ${await Property.countDocuments({ status: 'pending' })}`);
    console.log(`Total Inquiries in DB: ${await Inquiry.countDocuments()}`);
    console.log('============================================================\n');

    process.exit(0);
}

seedModerationQueue().catch(err => {
    console.error(err);
    process.exit(1);
});
