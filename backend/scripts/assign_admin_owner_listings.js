require('dotenv').config();
const mongoose = require('mongoose');

const User = require('../models/User');
const Property = require('../models/Property');
const PG = require('../models/PG');
const Inquiry = require('../models/Inquiry');

async function assign() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected.');

    const admin = await User.findOne({ email: 'admin@estatexai.com' });
    const owner = await User.findOne({ email: 'owner@estatexai.com' });

    if (!admin || !owner) {
        console.error('Admin or owner user not found.');
        process.exit(1);
    }

    console.log('Admin ID:', admin._id, '| Owner ID:', owner._id);

    // Get 25 properties and assign to Admin
    const adminProps = await Property.find().limit(25);
    for (const p of adminProps) {
        p.owner = admin._id;
        await p.save();
    }
    console.log(`Assigned ${adminProps.length} properties to admin.`);

    // Get next 25 properties and assign to Owner
    const ownerProps = await Property.find().skip(25).limit(25);
    for (const p of ownerProps) {
        p.owner = owner._id;
        await p.save();
    }
    console.log(`Assigned ${ownerProps.length} properties to owner.`);

    // Get 15 PGs and assign to Admin
    const adminPGs = await PG.find().limit(15);
    for (const pg of adminPGs) {
        pg.owner = admin._id;
        await pg.save();
    }
    console.log(`Assigned ${adminPGs.length} PGs to admin.`);

    // Get next 15 PGs and assign to Owner
    const ownerPGs = await PG.find().skip(15).limit(15);
    for (const pg of ownerPGs) {
        pg.owner = owner._id;
        await pg.save();
    }
    console.log(`Assigned ${ownerPGs.length} PGs to owner.`);

    // Assign 12 inquiries to admin
    const adminInquiries = await Inquiry.find().limit(12);
    for (const inq of adminInquiries) {
        inq.owner = admin._id;
        await inq.save();
    }
    console.log(`Assigned ${adminInquiries.length} inquiries to admin.`);

    // Assign next 12 inquiries to owner
    const ownerInquiries = await Inquiry.find().skip(12).limit(12);
    for (const inq of ownerInquiries) {
        inq.owner = owner._id;
        await inq.save();
    }
    console.log(`Assigned ${ownerInquiries.length} inquiries to owner.`);

    const adminPCount = await Property.countDocuments({ owner: admin._id });
    const adminPGCount = await PG.countDocuments({ owner: admin._id });
    const adminInqCount = await Inquiry.countDocuments({ owner: admin._id });

    const ownerPCount = await Property.countDocuments({ owner: owner._id });
    const ownerPGCount = await PG.countDocuments({ owner: owner._id });
    const ownerInqCount = await Inquiry.countDocuments({ owner: owner._id });

    console.log('\n================ ASSIGNMENT RESULTS ================');
    console.log(`admin@estatexai.com -> Properties: ${adminPCount}, PGs: ${adminPGCount}, Inquiries: ${adminInqCount}`);
    console.log(`owner@estatexai.com -> Properties: ${ownerPCount}, PGs: ${ownerPGCount}, Inquiries: ${ownerInqCount}`);
    console.log('====================================================\n');

    process.exit(0);
}

assign().catch(err => {
    console.error(err);
    process.exit(1);
});
