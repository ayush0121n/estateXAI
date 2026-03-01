const path = require('path');
const rootDir = path.join(__dirname, '..');

// Load env from backend root
require('dotenv').config({ path: path.join(rootDir, '.env') });

const mongoose = require('mongoose');

async function main() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB!');

    const User = require(path.join(rootDir, 'models/User'));
    const Property = require(path.join(rootDir, 'models/Property'));
    const PG = require(path.join(rootDir, 'models/PG'));

    // Clean up old test/admin accounts
    await User.deleteOne({ email: 'admin@estatexai.com' });
    await User.deleteOne({ email: 'owner@estatexai.com' });
    await User.deleteOne({ email: 'testfix@test.com' });
    await User.deleteOne({ email: 'test123@test.com' });

    const admin = await User.create({ name: 'EstateXAi Admin', email: 'admin@estatexai.com', password: 'Admin@123', phone: '9876543210', role: 'admin', institution: 'SBUP Pune' });
    console.log('Admin created:', admin._id.toString());

    const owner = await User.create({ name: 'Rajesh Kumar', email: 'owner@estatexai.com', password: 'Owner@123', phone: '9765432109', role: 'owner' });
    console.log('Owner created:', owner._id.toString());

    const propCount = await Property.countDocuments();
    if (propCount === 0) {
        await Property.insertMany([
            { title: '3BHK Luxury Apartment in Kothrud', description: 'Spacious 3BHK flat in Kothrud with modern amenities.', type: 'apartment', listingType: 'sale', price: 8500000, area: 1350, bhk: 3, bathrooms: 2, location: { address: 'Kothrud, Pune', city: 'Pune', pincode: '411038' }, amenities: ['parking', 'gym', 'security', 'elevator'], owner: admin._id, isFeatured: true, furnishing: 'semi-furnished', images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'] },
            { title: '2BHK Modern Flat near Hinjewadi', description: 'Fully furnished 2BHK for rent near Hinjewadi IT Park.', type: 'apartment', listingType: 'rent', price: 22000, area: 950, bhk: 2, bathrooms: 2, location: { address: 'Hinjewadi Phase 1, Pune', city: 'Pune', pincode: '411057' }, amenities: ['parking', 'security', 'wifi'], owner: admin._id, isFeatured: true, furnishing: 'fully-furnished', images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'] },
            { title: '1BHK Studio in Viman Nagar', description: 'Cozy studio apartment, perfect for working professionals.', type: 'studio', listingType: 'rent', price: 14000, area: 450, bhk: 1, bathrooms: 1, location: { address: 'Viman Nagar, Pune', city: 'Pune', pincode: '411014' }, amenities: ['security', 'wifi'], owner: admin._id, furnishing: 'fully-furnished', images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'] },
            { title: '4BHK Premium Villa in Baner', description: 'Luxury 4BHK villa with private garden, pool and clubhouse.', type: 'villa', listingType: 'sale', price: 18500000, area: 2800, bhk: 4, bathrooms: 4, location: { address: 'Baner Road, Pune', city: 'Pune', pincode: '411045' }, amenities: ['parking', 'gym', 'pool', 'garden', 'security', 'clubhouse'], owner: admin._id, isFeatured: true, furnishing: 'fully-furnished', images: ['https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800'] },
            { title: '2BHK in Wakad Gated Society', description: 'Ready-to-move 2BHK near Mumbai Expressway.', type: 'apartment', listingType: 'sale', price: 6200000, area: 1050, bhk: 2, bathrooms: 2, location: { address: 'Wakad, Pune', city: 'Pune', pincode: '411057' }, amenities: ['parking', 'gym', 'security', 'elevator', 'power_backup'], owner: owner._id, furnishing: 'semi-furnished', images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'] },
            { title: 'Commercial Office in Shivajinagar', description: '1200 sqft premium office space in prime location.', type: 'commercial', listingType: 'rent', price: 55000, area: 1200, location: { address: 'Shivajinagar, Pune', city: 'Pune', pincode: '411005' }, amenities: ['parking', 'elevator', 'security', 'power_backup'], owner: owner._id, images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'] }
        ]);
        console.log('6 Properties seeded!');
    } else {
        console.log('Properties already exist, skipping...');
    }

    const pgCount = await PG.countDocuments();
    if (pgCount === 0) {
        await PG.insertMany([
            { name: 'Green Valley Boys PG', description: 'Comfortable PG for boys near SPPU University.', type: 'pg', genderType: 'male', rentPerMonth: 8500, securityDeposit: 17000, sharingType: ['single', 'double'], location: { address: 'Aundh, Pune', city: 'Pune', pincode: '411007', nearbyInstitutions: ['SPPU University', 'MIT College'] }, amenities: { wifi: true, food: true, ac: false, laundry: true, cctv: true, hotWater: true, housekeeping: true }, meals: { breakfast: true, lunch: false, dinner: true }, totalRooms: 30, availableRooms: 8, owner: admin._id, isFeatured: true, rating: 4.2, reviewCount: 47, images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'] },
            { name: 'Sunrise Girls Hostel', description: 'Safe and secure hostel for girls near MIT and Symbiosis.', type: 'hostel', genderType: 'female', rentPerMonth: 9000, securityDeposit: 18000, sharingType: ['double', 'triple'], location: { address: 'Viman Nagar, Pune', city: 'Pune', pincode: '411014', nearbyInstitutions: ['Symbiosis Institute', 'NIBM'] }, amenities: { wifi: true, food: true, ac: true, laundry: true, cctv: true, housekeeping: true, hotWater: true, studyRoom: true }, meals: { breakfast: true, lunch: true, dinner: true }, totalRooms: 25, availableRooms: 5, owner: admin._id, isFeatured: true, rating: 4.5, reviewCount: 89, images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800'] },
            { name: 'Urban Co-Living Hinjewadi', description: 'Modern co-living for IT professionals near Hinjewadi Park.', type: 'coliving', genderType: 'unisex', rentPerMonth: 12000, securityDeposit: 24000, sharingType: ['single', 'double'], location: { address: 'Hinjewadi Phase 2, Pune', city: 'Pune', pincode: '411057', nearbyInstitutions: ['Infosys', 'TCS', 'Wipro Campus'] }, amenities: { wifi: true, food: false, ac: true, laundry: true, gym: true, parking: true, cctv: true, tv: true, refrigerator: true, hotWater: true }, meals: { breakfast: false, lunch: false, dinner: false }, totalRooms: 40, availableRooms: 12, owner: owner._id, isFeatured: true, rating: 4.3, reviewCount: 63, images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800'] },
            { name: "Scholar's Den PG", description: 'Affordable PG for students near Fergusson College.', type: 'pg', genderType: 'male', rentPerMonth: 6500, securityDeposit: 13000, sharingType: ['double', 'triple', 'quad'], location: { address: 'Deccan Gymkhana, Pune', city: 'Pune', pincode: '411004', nearbyInstitutions: ['Fergusson College', 'BVDU'] }, amenities: { wifi: true, food: true, ac: false, cctv: true, hotWater: true, studyRoom: true }, meals: { breakfast: true, lunch: false, dinner: true }, totalRooms: 20, availableRooms: 6, owner: owner._id, rating: 3.9, reviewCount: 34, images: ['https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800'] },
            { name: 'Lotus Premium Girls PG', description: 'Premium girls PG with all facilities in Koregaon Park.', type: 'pg', genderType: 'female', rentPerMonth: 11000, securityDeposit: 22000, sharingType: ['single', 'double'], location: { address: 'Koregaon Park, Pune', city: 'Pune', pincode: '411001', nearbyInstitutions: ['IIIT Pune', 'Army Institute'] }, amenities: { wifi: true, food: true, ac: true, laundry: true, cctv: true, hotWater: true, housekeeping: true }, meals: { breakfast: true, lunch: false, dinner: true }, totalRooms: 18, availableRooms: 3, owner: owner._id, isFeatured: true, rating: 4.6, reviewCount: 71, images: ['https://images.unsplash.com/photo-1501183638710-841dd1904471?w=800'] }
        ]);
        console.log('5 PGs seeded!');
    } else {
        console.log('PGs already exist, skipping...');
    }

    console.log('\n=== SEED COMPLETE ===');
    console.log('Admin: admin@estatexai.com / Admin@123');
    console.log('Owner: owner@estatexai.com / Owner@123');
    process.exit(0);
}

main().catch(err => {
    console.error('FAILED:', err.message);
    process.exit(1);
});
