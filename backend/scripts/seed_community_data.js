const path = require('path');
const rootDir = path.join(__dirname, '..');
require('dotenv').config({ path: path.join(rootDir, '.env') });
const mongoose = require('mongoose');

const User = require('../models/User');
const Property = require('../models/Property');
const PG = require('../models/PG');
const Inquiry = require('../models/Inquiry');

const INDIAN_USERS = [
    {
        name: 'Aarav Sharma',
        email: 'aarav.sharma@estatexai.com',
        phone: '9820123451',
        role: 'owner',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        institution: 'IIT Bombay',
        workplace: 'Google India',
        city: 'Mumbai',
        trustScore: 96,
        isPhoneVerified: true,
        roommateProfile: {
            isLookingForRoommate: true,
            gender: 'male',
            diet: 'veg',
            smoking: 'no',
            sleepSchedule: 'early-bird',
            profession: 'working-professional',
            preferredArea: 'Powai',
            city: 'Mumbai',
            budgetMin: 15000,
            budgetMax: 28000,
            age: 27,
            bio: 'Software Engineer at Google Powai. Looking for a clean, vegetarian flatmate. I play badminton on weekends and love quiet evenings.',
            timeline: 'immediate',
            cleanliness: 'super-clean',
            cooking: 'occasional',
            pets: 'no-pets',
            guestsPolicy: 'occasional',
            wfhPreference: 'hybrid',
            noiseTolerance: 'moderate',
            contactNumber: '9820123451'
        }
    },
    {
        name: 'Priya Iyer',
        email: 'priya.iyer@estatexai.com',
        phone: '9840123452',
        role: 'user',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
        institution: 'IIM Bangalore',
        workplace: 'McKinsey & Co',
        city: 'Bangalore',
        trustScore: 94,
        isPhoneVerified: true,
        roommateProfile: {
            isLookingForRoommate: true,
            gender: 'female',
            diet: 'veg',
            smoking: 'no',
            sleepSchedule: 'flexible',
            profession: 'working-professional',
            preferredArea: 'Indiranagar',
            city: 'Bangalore',
            budgetMin: 18000,
            budgetMax: 30000,
            age: 26,
            bio: 'Strategy consultant working in Indiranagar. Looking for a friendly female flatmate. Non-smoker, loves reading and weekend brunches.',
            timeline: '15-days',
            cleanliness: 'super-clean',
            cooking: 'daily',
            pets: 'open-to-pets',
            guestsPolicy: 'occasional',
            wfhPreference: 'hybrid',
            noiseTolerance: 'moderate',
            contactNumber: '9840123452'
        }
    },
    {
        name: 'Rohan Deshmukh',
        email: 'rohan.deshmukh@estatexai.com',
        phone: '9822123453',
        role: 'owner',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        institution: 'COEP Pune',
        workplace: 'Persistent Systems',
        city: 'Pune',
        trustScore: 91,
        isPhoneVerified: true,
        roommateProfile: {
            isLookingForRoommate: true,
            gender: 'male',
            diet: 'non-veg',
            smoking: 'outside-only',
            sleepSchedule: 'night-owl',
            profession: 'working-professional',
            preferredArea: 'Baner',
            city: 'Pune',
            budgetMin: 10000,
            budgetMax: 18000,
            age: 25,
            bio: 'Tech lead based in Baner/Hinjewadi. Chill personality, gamer, fond of cooking non-veg delicacies on weekends.',
            timeline: 'immediate',
            cleanliness: 'moderate',
            cooking: 'daily',
            pets: 'has-pets',
            guestsPolicy: 'flexible',
            wfhPreference: 'full-wfh',
            noiseTolerance: 'lively',
            contactNumber: '9822123453'
        }
    },
    {
        name: 'Sneha Kulkarni',
        email: 'sneha.kulkarni@estatexai.com',
        phone: '9823123454',
        role: 'user',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        institution: 'Symbiosis Pune',
        workplace: 'Barclays Global',
        city: 'Pune',
        trustScore: 92,
        isPhoneVerified: true,
        roommateProfile: {
            isLookingForRoommate: true,
            gender: 'female',
            diet: 'veg',
            smoking: 'no',
            sleepSchedule: 'early-bird',
            profession: 'working-professional',
            preferredArea: 'Viman Nagar',
            city: 'Pune',
            budgetMin: 12000,
            budgetMax: 20000,
            age: 24,
            bio: 'Risk analyst at Barclays. Looking for an organized flatmate in Viman Nagar or Kalyani Nagar. Yoga practitioner and foodie.',
            timeline: 'next-month',
            cleanliness: 'super-clean',
            cooking: 'daily',
            pets: 'open-to-pets',
            guestsPolicy: 'occasional',
            wfhPreference: 'hybrid',
            noiseTolerance: 'silent',
            contactNumber: '9823123454'
        }
    },
    {
        name: 'Vikramaditya Singhania',
        email: 'vikram.singhania@estatexai.com',
        phone: '9811123455',
        role: 'owner',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        institution: 'Delhi University (SRCC)',
        workplace: 'Deloitte India',
        city: 'Delhi NCR',
        trustScore: 97,
        isPhoneVerified: true,
        roommateProfile: {
            isLookingForRoommate: true,
            gender: 'male',
            diet: 'non-veg',
            smoking: 'no',
            sleepSchedule: 'flexible',
            profession: 'working-professional',
            preferredArea: 'Hauz Khas',
            city: 'Delhi NCR',
            budgetMin: 18000,
            budgetMax: 32000,
            age: 28,
            bio: 'Financial consultant in Cyber City. Looking for a reliable flatmate who appreciates good conversations and neat living spaces.',
            timeline: 'immediate',
            cleanliness: 'moderate',
            cooking: 'occasional',
            pets: 'no-pets',
            guestsPolicy: 'occasional',
            wfhPreference: 'hybrid',
            noiseTolerance: 'moderate',
            contactNumber: '9811123455'
        }
    },
    {
        name: 'Ananya Nair',
        email: 'ananya.nair@estatexai.com',
        phone: '9847123456',
        role: 'user',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
        institution: 'NIT Calicut',
        workplace: 'Kochi Infopark Tech',
        city: 'Kochi',
        trustScore: 89,
        isPhoneVerified: true,
        roommateProfile: {
            isLookingForRoommate: true,
            gender: 'female',
            diet: 'any',
            smoking: 'no',
            sleepSchedule: 'early-bird',
            profession: 'working-professional',
            preferredArea: 'Kakkanad',
            city: 'Kochi',
            budgetMin: 8000,
            budgetMax: 15000,
            age: 25,
            bio: 'Full-stack developer at Infopark. Looking for female flatmate. Quiet lifestyle, loves painting and classical music.',
            timeline: 'flexible',
            cleanliness: 'super-clean',
            cooking: 'daily',
            pets: 'open-to-pets',
            guestsPolicy: 'no-guests',
            wfhPreference: 'full-wfh',
            noiseTolerance: 'silent',
            contactNumber: '9847123456'
        }
    },
    {
        name: 'Aditya Reddy',
        email: 'aditya.reddy@estatexai.com',
        phone: '9849123457',
        role: 'owner',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
        institution: 'IIIT Hyderabad',
        workplace: 'Microsoft IDC',
        city: 'Hyderabad',
        trustScore: 95,
        isPhoneVerified: true,
        roommateProfile: {
            isLookingForRoommate: true,
            gender: 'male',
            diet: 'non-veg',
            smoking: 'no',
            sleepSchedule: 'night-owl',
            profession: 'working-professional',
            preferredArea: 'Gachibowli',
            city: 'Hyderabad',
            budgetMin: 14000,
            budgetMax: 26000,
            age: 26,
            bio: 'Cloud architect at Microsoft Gachibowli. Passionate about AI, hiking, and Hyderabadi biryani. Respectful and tidy.',
            timeline: 'immediate',
            cleanliness: 'super-clean',
            cooking: 'outside-food',
            pets: 'open-to-pets',
            guestsPolicy: 'occasional',
            wfhPreference: 'hybrid',
            noiseTolerance: 'moderate',
            contactNumber: '9849123457'
        }
    },
    {
        name: 'Ishita Sen',
        email: 'ishita.sen@estatexai.com',
        phone: '9830123458',
        role: 'user',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        institution: 'Jadavpur University',
        workplace: 'TCS Innovation Labs',
        city: 'Kolkata',
        trustScore: 90,
        isPhoneVerified: true,
        roommateProfile: {
            isLookingForRoommate: true,
            gender: 'female',
            diet: 'any',
            smoking: 'no',
            sleepSchedule: 'flexible',
            profession: 'working-professional',
            preferredArea: 'Salt Lake',
            city: 'Kolkata',
            budgetMin: 7000,
            budgetMax: 14000,
            age: 24,
            bio: 'Data scientist in Salt Lake Sector V. Seeking a friendly flatmate. Easy to live with, love literature and weekend coffee conversations.',
            timeline: '15-days',
            cleanliness: 'moderate',
            cooking: 'occasional',
            pets: 'open-to-pets',
            guestsPolicy: 'occasional',
            wfhPreference: 'hybrid',
            noiseTolerance: 'moderate',
            contactNumber: '9830123458'
        }
    },
    {
        name: 'Kabir Verma',
        email: 'kabir.verma@estatexai.com',
        phone: '9872123459',
        role: 'owner',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
        institution: 'PEC Chandigarh',
        workplace: 'Infosys Mohali',
        city: 'Chandigarh',
        trustScore: 93,
        isPhoneVerified: true,
        roommateProfile: {
            isLookingForRoommate: true,
            gender: 'male',
            diet: 'non-veg',
            smoking: 'outside-only',
            sleepSchedule: 'early-bird',
            profession: 'working-professional',
            preferredArea: 'Sector 35',
            city: 'Chandigarh',
            budgetMin: 9000,
            budgetMax: 16000,
            age: 27,
            bio: 'Senior analyst in Mohali Phase 8. Early morning runner, badminton player. Looking for a responsible flatmate in Sector 35/43.',
            timeline: 'immediate',
            cleanliness: 'super-clean',
            cooking: 'daily',
            pets: 'no-pets',
            guestsPolicy: 'occasional',
            wfhPreference: 'office',
            noiseTolerance: 'silent',
            contactNumber: '9872123459'
        }
    },
    {
        name: 'Tanvi Bansal',
        email: 'tanvi.bansal@estatexai.com',
        phone: '9829123460',
        role: 'user',
        avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
        institution: 'MNIT Jaipur',
        workplace: 'Genus Power Tech',
        city: 'Jaipur',
        trustScore: 88,
        isPhoneVerified: true,
        roommateProfile: {
            isLookingForRoommate: true,
            gender: 'female',
            diet: 'veg',
            smoking: 'no',
            sleepSchedule: 'early-bird',
            profession: 'student',
            preferredArea: 'Malviya Nagar',
            city: 'Jaipur',
            budgetMin: 6000,
            budgetMax: 12000,
            age: 22,
            bio: 'Final year M.Tech student at MNIT. Dedicated to academics and fitness. Looking for a neat female flatmate near Malviya Nagar.',
            timeline: 'next-month',
            cleanliness: 'super-clean',
            cooking: 'daily',
            pets: 'no-pets',
            guestsPolicy: 'no-guests',
            wfhPreference: 'any',
            noiseTolerance: 'silent',
            contactNumber: '9829123460'
        }
    },
    {
        name: 'Harshvardhan Patel',
        email: 'harsh.patel@estatexai.com',
        phone: '9898123461',
        role: 'owner',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
        institution: 'IIM Ahmedabad',
        workplace: 'Adani Digital Labs',
        city: 'Ahmedabad',
        trustScore: 98,
        isPhoneVerified: true,
        roommateProfile: {
            isLookingForRoommate: true,
            gender: 'male',
            diet: 'veg',
            smoking: 'no',
            sleepSchedule: 'flexible',
            profession: 'working-professional',
            preferredArea: 'Bodakdev',
            city: 'Ahmedabad',
            budgetMin: 12000,
            budgetMax: 22000,
            age: 29,
            bio: 'Product manager at Adani Digital. Seeking a respectful roommate who appreciates calm environments and clean kitchens.',
            timeline: 'immediate',
            cleanliness: 'super-clean',
            cooking: 'daily',
            pets: 'open-to-pets',
            guestsPolicy: 'occasional',
            wfhPreference: 'hybrid',
            noiseTolerance: 'moderate',
            contactNumber: '9898123461'
        }
    },
    {
        name: 'Meera Chawla',
        email: 'meera.chawla@estatexai.com',
        phone: '9839123462',
        role: 'user',
        avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=200&q=80',
        institution: 'IIM Lucknow',
        workplace: 'HCL Technologies',
        city: 'Lucknow',
        trustScore: 92,
        isPhoneVerified: true,
        roommateProfile: {
            isLookingForRoommate: true,
            gender: 'female',
            diet: 'veg',
            smoking: 'no',
            sleepSchedule: 'early-bird',
            profession: 'working-professional',
            preferredArea: 'Gomti Nagar',
            city: 'Lucknow',
            budgetMin: 7000,
            budgetMax: 14000,
            age: 25,
            bio: 'HR Specialist at HCL Lucknow. Looking for a friendly female flatmate near Gomti Nagar. Non-smoker, easy-going and respectful.',
            timeline: '15-days',
            cleanliness: 'moderate',
            cooking: 'occasional',
            pets: 'no-pets',
            guestsPolicy: 'occasional',
            wfhPreference: 'hybrid',
            noiseTolerance: 'moderate',
            contactNumber: '9839123462'
        }
    },
    {
        name: 'Devansh Singhal',
        email: 'devansh.singhal@estatexai.com',
        phone: '9827123463',
        role: 'user',
        avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
        institution: 'IIM Indore',
        workplace: 'TCS Indore SEZ',
        city: 'Indore',
        trustScore: 91,
        isPhoneVerified: true,
        roommateProfile: {
            isLookingForRoommate: true,
            gender: 'male',
            diet: 'any',
            smoking: 'no',
            sleepSchedule: 'night-owl',
            profession: 'working-professional',
            preferredArea: 'Vijay Nagar',
            city: 'Indore',
            budgetMin: 6500,
            budgetMax: 13000,
            age: 24,
            bio: 'Software dev in Super Corridor. Looking for a chilled flatmate who loves tech discussions, music, and weekend food trips.',
            timeline: 'immediate',
            cleanliness: 'moderate',
            cooking: 'outside-food',
            pets: 'open-to-pets',
            guestsPolicy: 'flexible',
            wfhPreference: 'full-wfh',
            noiseTolerance: 'moderate',
            contactNumber: '9827123463'
        }
    },
    {
        name: 'Natasha Fernandes',
        email: 'natasha.fernandes@estatexai.com',
        phone: '9822123464',
        role: 'owner',
        avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
        institution: 'Goa University',
        workplace: 'Creative Digital Studio',
        city: 'Goa',
        trustScore: 94,
        isPhoneVerified: true,
        roommateProfile: {
            isLookingForRoommate: true,
            gender: 'female',
            diet: 'any',
            smoking: 'outside-only',
            sleepSchedule: 'flexible',
            profession: 'working-professional',
            preferredArea: 'Panaji',
            city: 'Goa',
            budgetMin: 12000,
            budgetMax: 24000,
            age: 27,
            bio: 'Digital nomad and UI designer. Looking for an open-minded flatmate in North Goa or Panaji. Quiet during work hours, beach-lover.',
            timeline: 'immediate',
            cleanliness: 'super-clean',
            cooking: 'daily',
            pets: 'has-pets',
            guestsPolicy: 'flexible',
            wfhPreference: 'full-wfh',
            noiseTolerance: 'moderate',
            contactNumber: '9822123464'
        }
    },
    {
        name: 'Karthik Subramanian',
        email: 'karthik.subramanian@estatexai.com',
        phone: '9841123465',
        role: 'owner',
        avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=200&q=80',
        institution: 'IIT Madras',
        workplace: 'Zoho Corporation',
        city: 'Chennai',
        trustScore: 97,
        isPhoneVerified: true,
        roommateProfile: {
            isLookingForRoommate: true,
            gender: 'male',
            diet: 'veg',
            smoking: 'no',
            sleepSchedule: 'early-bird',
            profession: 'working-professional',
            preferredArea: 'Velachery',
            city: 'Chennai',
            budgetMin: 11000,
            budgetMax: 20000,
            age: 28,
            bio: 'Lead engineer at Zoho. Looking for a neat, vegetarian flatmate along OMR/Velachery. Carnatic music enthusiast.',
            timeline: 'immediate',
            cleanliness: 'super-clean',
            cooking: 'daily',
            pets: 'no-pets',
            guestsPolicy: 'occasional',
            wfhPreference: 'hybrid',
            noiseTolerance: 'silent',
            contactNumber: '9841123465'
        }
    }
];

const REALISTIC_REVIEWS = [
    { rating: 5, comment: "Exceptional property! Society security is 24/7, high speed elevators, and zero water issues." },
    { rating: 5, comment: "Spacious layout with fantastic natural light and ventilation. Exactly as shown in the photos." },
    { rating: 4, comment: "Very peaceful neighborhood, close to grocery stores, pharmacy, and metro station. Highly recommended." },
    { rating: 5, comment: "The owner is very transparent and polite. Agreement process was seamless and zero brokerage paid!" },
    { rating: 4, comment: "Clean society with gym, clubhouse, and regular garbage pickup. Great for families and bachelors alike." },
    { rating: 5, comment: "Great PG! Healthy meals served hot three times a day, high speed WiFi, and daily room cleaning." },
    { rating: 4, comment: "Safe place for girls with CCTV coverage and biometric entry. Warden is very helpful." },
    { rating: 5, comment: "Walkable distance to IT Park and bus stop. Saved 40 mins of daily commute." }
];

const SAMPLE_INQUIRIES = [
    "Hi, is this listing still available for immediate move-in? I work nearby and would love to schedule a visit.",
    "Hello! Does the rent include society maintenance and water charges? Also, is covered four-wheeler parking available?",
    "Can I schedule a property inspection this Saturday between 11:00 AM and 2:00 PM?",
    "Hi, are bachelors allowed without any restrictive society timing guidelines?",
    "Is single sharing occupancy available in this PG, and what are the food timings on weekends?",
    "Hello, I am interested in purchasing this property. Could you please share the floor plan and verify if home loans are pre-approved by SBI/HDFC?",
    "Is high-speed optical fiber internet already installed, or can I get an Airtel/Jio connection easily?",
    "Could you please confirm the security deposit amount and minimum lock-in period?"
];

async function seedCommunity() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Community Seeding.');

    // 1. Upsert or create Indian Users with complete profiles
    const userDocs = [];
    for (const u of INDIAN_USERS) {
        let existing = await User.findOne({ email: u.email });
        if (existing) {
            Object.assign(existing, u);
            await existing.save();
            userDocs.push(existing);
        } else {
            const created = await User.create({
                ...u,
                password: 'password123'
            });
            userDocs.push(created);
        }
    }
    console.log(`✅ Upserted ${userDocs.length} Indian Users with Roommate Profiles.`);

    // 2. Distribute Properties and PGs to these diverse Owners (Sales & Renting)
    const properties = await Property.find();
    const pgs = await PG.find();

    console.log(`Assigning diverse owners to ${properties.length} properties and ${pgs.length} PGs...`);
    const ownerUsers = userDocs.filter(u => u.role === 'owner' || Math.random() > 0.4);

    let pIdx = 0;
    for (const p of properties) {
        const assignedOwner = ownerUsers[pIdx % ownerUsers.length];
        p.owner = assignedOwner._id;
        
        // Add 2-3 realistic reviews from diverse users
        const reviews = [];
        for (let r = 0; r < 2; r++) {
            const reviewer = userDocs[(pIdx + r + 1) % userDocs.length];
            const revTemplate = REALISTIC_REVIEWS[(pIdx + r) % REALISTIC_REVIEWS.length];
            reviews.push({
                user: reviewer.name,
                userType: 'user',
                rating: revTemplate.rating,
                comment: revTemplate.comment,
                createdAt: new Date(Date.now() - (r * 86400000 * 5))
            });
        }
        p.reviews = reviews;
        await p.save();
        pIdx++;
    }

    let pgIdx = 0;
    for (const pg of pgs) {
        const assignedOwner = ownerUsers[pgIdx % ownerUsers.length];
        pg.owner = assignedOwner._id;

        const reviews = [];
        for (let r = 0; r < 2; r++) {
            const reviewer = userDocs[(pgIdx + r + 2) % userDocs.length];
            const revTemplate = REALISTIC_REVIEWS[(pgIdx + r + 3) % REALISTIC_REVIEWS.length];
            reviews.push({
                user: reviewer.name,
                userType: 'user',
                rating: revTemplate.rating,
                comment: revTemplate.comment,
                createdAt: new Date(Date.now() - (r * 86400000 * 4))
            });
        }
        pg.reviews = reviews;
        await pg.save();
        pgIdx++;
    }
    console.log(`✅ Properties and PGs successfully linked to diverse owners with authentic reviews.`);

    // 3. Seed Realistic Inquiries on Properties and PGs
    console.log('Seeding user inquiries for Properties and PGs...');
    await Inquiry.deleteMany({}); // Refresh inquiry table

    const inquiries = [];
    // 25 Property inquiries
    for (let i = 0; i < 25; i++) {
        const prop = properties[i % properties.length];
        const inquirer = userDocs[i % userDocs.length];
        const status = ['pending', 'responded', 'closed'][i % 3];
        const message = SAMPLE_INQUIRIES[i % SAMPLE_INQUIRIES.length];

        inquiries.push({
            user: inquirer._id,
            propertyType: 'property',
            property: prop._id,
            owner: prop.owner,
            message: message,
            phone: inquirer.phone || '9820123451',
            status: status,
            ownerResponse: status !== 'pending' ? 'Thanks for reaching out! Yes, it is available. I will call you shortly to coordinate.' : ''
        });
    }

    // 20 PG inquiries
    for (let i = 0; i < 20; i++) {
        const pg = pgs[i % pgs.length];
        const inquirer = userDocs[(i + 3) % userDocs.length];
        const status = ['pending', 'responded', 'closed'][i % 3];
        const message = SAMPLE_INQUIRIES[(i + 4) % SAMPLE_INQUIRIES.length];

        inquiries.push({
            user: inquirer._id,
            propertyType: 'pg',
            pg: pg._id,
            owner: pg.owner,
            message: message,
            phone: inquirer.phone || '9840123452',
            status: status,
            ownerResponse: status !== 'pending' ? 'Hello! Rooms are open. Food is included and you can visit anytime before 8 PM.' : ''
        });
    }

    await Inquiry.insertMany(inquiries);
    console.log(`✅ Seeded ${inquiries.length} live inquiries on Properties & PGs.`);

    const totalUsers = await User.countDocuments();
    const flatmateUsers = await User.countDocuments({ 'roommateProfile.isLookingForRoommate': true });
    const totalInquiries = await Inquiry.countDocuments();

    console.log('\n================ COMMUNITY SEEDING SUMMARY ================');
    console.log(`Total Users in System: ${totalUsers}`);
    console.log(`Users Looking for Flatmates: ${flatmateUsers}`);
    console.log(`Active Live Inquiries: ${totalInquiries}`);
    console.log(`Total Properties Owned & Reviewed: ${properties.length}`);
    console.log(`Total PGs Owned & Reviewed: ${pgs.length}`);
    console.log('===========================================================\n');

    process.exit(0);
}

seedCommunity().catch(err => {
    console.error('Community seeding failed:', err);
    process.exit(1);
});
