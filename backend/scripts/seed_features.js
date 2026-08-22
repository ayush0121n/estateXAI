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

        // Create 3 dummy users for Roommates
        const fakeUsers = [
            {
                name: "Rahul Verma",
                email: "rahul.v@test.com",
                password: "password123",
                role: "user",
                avatar: "https://i.pravatar.cc/150?img=11",
                roommateProfile: {
                    isLookingForRoommate: true,
                    gender: "male",
                    diet: "veg",
                    smoking: "no",
                    sleepSchedule: "early-bird",
                    profession: "working-professional",
                    preferredArea: "Hinjewadi",
                    budgetMin: 8000,
                    budgetMax: 15000,
                    bio: "Software engineer at Infosys. I keep things clean and respect privacy.",
                    age: 26
                }
            },
            {
                name: "Sneha Patil",
                email: "sneha.p@test.com",
                password: "password123",
                role: "user",
                avatar: "https://i.pravatar.cc/150?img=5",
                roommateProfile: {
                    isLookingForRoommate: true,
                    gender: "female",
                    diet: "any",
                    smoking: "outside-only",
                    sleepSchedule: "night-owl",
                    profession: "student",
                    preferredArea: "Kothrud",
                    budgetMin: 5000,
                    budgetMax: 10000,
                    bio: "Design student. Looking for a chill flatmate to share a 2BHK.",
                    age: 22
                }
            },
            {
                name: "Amit Desai",
                email: "amit.d@test.com",
                password: "password123",
                role: "user",
                avatar: "https://i.pravatar.cc/150?img=33",
                roommateProfile: {
                    isLookingForRoommate: true,
                    gender: "male",
                    diet: "non-veg",
                    smoking: "yes",
                    sleepSchedule: "flexible",
                    profession: "working-professional",
                    preferredArea: "Baner",
                    budgetMin: 10000,
                    budgetMax: 20000,
                    bio: "Marketing manager. Very easygoing. Looking for a premium society in Baner.",
                    age: 28
                }
            }
        ];

        let createdUsers = [];
        for (const u of fakeUsers) {
            const exists = await User.findOne({ email: u.email });
            if (!exists) {
                const user = new User(u);
                await user.save();
                createdUsers.push(user);
                console.log(`Created user: ${u.name}`);
            } else {
                createdUsers.push(exists);
            }
        }

        // Add some Neighborhood Ratings
        if (createdUsers.length >= 2) {
            const ratings = [
                {
                    area: 'Hinjewadi',
                    city: 'Pune',
                    user: createdUsers[0]._id,
                    safetyScore: 4,
                    noiseLevel: 3, // 3 means somewhat noisy
                    cleanlinessScore: 4,
                    review: "Great for IT professionals, but traffic can be bad during peak hours."
                },
                {
                    area: 'Baner',
                    city: 'Pune',
                    user: createdUsers[2]._id,
                    safetyScore: 5,
                    noiseLevel: 2,
                    cleanlinessScore: 5,
                    review: "Very safe and clean area. Lots of cafes and good crowd."
                },
                {
                    area: 'Kothrud',
                    city: 'Pune',
                    user: createdUsers[1]._id,
                    safetyScore: 4,
                    noiseLevel: 2,
                    cleanlinessScore: 4,
                    review: "Peaceful neighborhood with good connectivity."
                }
            ];

            for (const r of ratings) {
                await NeighborhoodRating.findOneAndUpdate(
                    { area: r.area, user: r.user },
                    r,
                    { upsert: true }
                );
                console.log(`Seeded rating for ${r.area}`);
            }
        }

        console.log('Seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seedData();
