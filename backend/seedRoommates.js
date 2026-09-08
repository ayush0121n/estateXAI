const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const dummyUsers = [
    {
        name: 'Aarav Sharma',
        email: 'aarav.sharma@example.com',
        password: 'password123',
        phone: '9876543210',
        role: 'user',
        avatar: 'https://i.pravatar.cc/150?u=aarav',
        roommateProfile: {
            isLookingForRoommate: true,
            gender: 'male',
            diet: 'veg',
            smoking: 'no',
            sleepSchedule: 'early-bird',
            profession: 'working-professional',
            preferredArea: 'Hinjewadi',
            budgetMin: 8000,
            budgetMax: 15000,
            bio: 'IT professional working in Hinjewadi Phase 1. Looking for a clean, vegetarian flatmate. I enjoy a quiet and peaceful environment.',
            age: 26,
            timeline: 'immediate',
            cleanliness: 'super-clean',
            cooking: 'occasional',
            pets: 'no-pets',
            contactNumber: '9876543210'
        }
    },
    {
        name: 'Priya Patel',
        email: 'priya.patel@example.com',
        password: 'password123',
        phone: '9876543211',
        role: 'user',
        avatar: 'https://i.pravatar.cc/150?u=priya',
        roommateProfile: {
            isLookingForRoommate: true,
            gender: 'female',
            diet: 'any',
            smoking: 'outside-only',
            sleepSchedule: 'night-owl',
            profession: 'student',
            preferredArea: 'Kothrud',
            budgetMin: 5000,
            budgetMax: 12000,
            bio: 'Masters student at Pune University. Easy-going, love listening to music. Looking for a chill flatmate who respects privacy.',
            age: 23,
            timeline: '15-days',
            cleanliness: 'moderate',
            cooking: 'daily',
            pets: 'open-to-pets',
            contactNumber: '9876543211'
        }
    },
    {
        name: 'Rohan Gupta',
        email: 'rohan.gupta@example.com',
        password: 'password123',
        phone: '9876543212',
        role: 'user',
        avatar: 'https://i.pravatar.cc/150?u=rohan',
        roommateProfile: {
            isLookingForRoommate: true,
            gender: 'male',
            diet: 'non-veg',
            smoking: 'yes',
            sleepSchedule: 'flexible',
            profession: 'working-professional',
            preferredArea: 'Baner',
            budgetMin: 10000,
            budgetMax: 20000,
            bio: 'Marketing exec. I travel a lot for work so I am mostly only home on weekends. Looking for a laid-back flatmate.',
            age: 28,
            timeline: 'next-month',
            cleanliness: 'relaxed',
            cooking: 'outside-food',
            pets: 'open-to-pets',
            contactNumber: '9876543212'
        }
    },
    {
        name: 'Neha Singh',
        email: 'neha.singh@example.com',
        password: 'password123',
        phone: '9876543213',
        role: 'user',
        avatar: 'https://i.pravatar.cc/150?u=neha',
        roommateProfile: {
            isLookingForRoommate: true,
            gender: 'female',
            diet: 'vegan',
            smoking: 'no',
            sleepSchedule: 'early-bird',
            profession: 'working-professional',
            preferredArea: 'Viman Nagar',
            budgetMin: 12000,
            budgetMax: 25000,
            bio: 'Software Engineer. Strictly vegan and no smoking/drinking inside. Love yoga and keeping the house neat.',
            age: 25,
            timeline: 'immediate',
            cleanliness: 'super-clean',
            cooking: 'daily',
            pets: 'no-pets',
            contactNumber: '9876543213'
        }
    },
    {
        name: 'Vikram Joshi',
        email: 'vikram.joshi@example.com',
        password: 'password123',
        phone: '9876543214',
        role: 'user',
        avatar: 'https://i.pravatar.cc/150?u=vikram',
        roommateProfile: {
            isLookingForRoommate: true,
            gender: 'any',
            diet: 'any',
            smoking: 'no',
            sleepSchedule: 'flexible',
            profession: 'student',
            preferredArea: 'Shivajinagar',
            budgetMin: 4000,
            budgetMax: 9000,
            bio: 'Engineering student. Budget constraints, so looking for someone to split rent and basic amenities.',
            age: 21,
            timeline: 'flexible',
            cleanliness: 'moderate',
            cooking: 'occasional',
            pets: 'open-to-pets',
            contactNumber: '9876543214'
        }
    }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Check if dummy users exist, if not, create them
        let addedCount = 0;
        for (const userData of dummyUsers) {
            const existing = await User.findOne({ email: userData.email });
            if (!existing) {
                const user = new User(userData);
                await user.save();
                addedCount++;
            }
        }
        
        console.log(`Successfully added ${addedCount} dummy flatmate profiles.`);
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
}

seed();
