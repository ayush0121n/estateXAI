require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const NeighborhoodRating = require('../models/NeighborhoodRating');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/estateXAI';

async function seedData() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        // Define diverse data pools
        const names = ['Rahul', 'Sneha', 'Amit', 'Priya', 'Karan', 'Neha', 'Vikram', 'Riya', 'Siddharth', 'Aditi', 'Rohan', 'Pooja', 'Ankit', 'Shruti', 'Kabir', 'Tanvi', 'Arjun', 'Meera', 'Yash', 'Kriti'];
        const surnames = ['Verma', 'Patil', 'Desai', 'Sharma', 'Joshi', 'Kulkarni', 'Singh', 'Gupta', 'Mehta', 'Bose'];
        const areas = ['Hinjewadi', 'Baner', 'Kothrud', 'Viman Nagar', 'Kalyani Nagar', 'Wakad', 'Kharadi', 'Magarpatta'];
        
        // Generate 20 fake users for Roommates
        const fakeUsers = Array.from({ length: 20 }).map((_, i) => ({
            name: `${names[i]} ${surnames[i % surnames.length]}`,
            email: `user${i}@test.com`,
            password: "password123",
            role: "user",
            avatar: `https://i.pravatar.cc/150?img=${(i * 3) % 70}`,
            roommateProfile: {
                isLookingForRoommate: true,
                gender: i % 2 === 0 ? "male" : "female",
                diet: ['veg', 'non-veg', 'vegan', 'any'][i % 4],
                smoking: ['no', 'outside-only', 'yes', 'no'][i % 4],
                sleepSchedule: ['early-bird', 'night-owl', 'flexible'][i % 3],
                profession: ['student', 'working-professional', 'working-professional'][i % 3],
                preferredArea: areas[i % areas.length],
                budgetMin: 5000 + (i * 1000 % 5000),
                budgetMax: 10000 + (i * 2000 % 10000),
                bio: `Hi, I am ${names[i]}. Looking for a friendly flatmate to share a place in ${areas[i % areas.length]}. I am easygoing and respectful of personal space.`,
                age: 21 + (i % 10)
            }
        }));

        let createdUsers = [];
        for (const u of fakeUsers) {
            const exists = await User.findOne({ email: u.email });
            if (!exists) {
                const user = new User(u);
                await user.save();
                createdUsers.push(user);
            } else {
                // Update existing user with roommate profile just in case
                exists.roommateProfile = u.roommateProfile;
                await exists.save();
                createdUsers.push(exists);
            }
        }
        console.log(`Ensured ${createdUsers.length} users exist for roommate matching.`);

        // Generate Neighborhood Ratings (multiple per area to show aggregations)
        const ratings = [];
        for (let i = 0; i < 25; i++) {
            ratings.push({
                area: areas[i % areas.length],
                city: 'Pune',
                user: createdUsers[i % createdUsers.length]._id,
                safetyScore: 3 + (i % 3), // 3, 4, or 5
                noiseLevel: 1 + (i % 4),  // 1 to 4
                cleanlinessScore: 3 + (i % 3), // 3, 4, or 5
                review: `Living in ${areas[i % areas.length]} has been a good experience overall. Great amenities nearby.`
            });
        }

        for (const r of ratings) {
            await NeighborhoodRating.findOneAndUpdate(
                { area: r.area, user: r.user },
                r,
                { upsert: true }
            );
        }
        console.log(`Seeded ${ratings.length} neighborhood ratings across ${areas.length} areas.`);

        console.log('Seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seedData();
