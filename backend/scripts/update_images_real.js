const path = require('path');
const rootDir = path.join(__dirname, '..');
require('dotenv').config({ path: path.join(rootDir, '.env') });
const mongoose = require('mongoose');

const realisticImages = [
    'https://images.pexels.com/photos/439227/pexels-photo-439227.jpeg?auto=compress&cs=tinysrgb&w=800', // standard building exterior
    'https://images.pexels.com/photos/2089698/pexels-photo-2089698.jpeg?auto=compress&cs=tinysrgb&w=800', // standard living room
    'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg?auto=compress&cs=tinysrgb&w=800', // simple bedroom
    'https://images.pexels.com/photos/279719/pexels-photo-279719.jpeg?auto=compress&cs=tinysrgb&w=800', // typical street
    'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=800', // normal kitchen
    'https://images.pexels.com/photos/259962/pexels-photo-259962.jpeg?auto=compress&cs=tinysrgb&w=800'  // normal house exterior
];

async function updateImages() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const Property = require(path.join(rootDir, 'models/Property'));
    const PG = require(path.join(rootDir, 'models/PG'));

    const props = await Property.find();
    for (let p of props) {
        const randImage = realisticImages[Math.floor(Math.random() * realisticImages.length)];
        p.images = [randImage];
        await p.save();
    }

    const pgs = await PG.find();
    for (let p of pgs) {
        const randImage = realisticImages[Math.floor(Math.random() * realisticImages.length)];
        p.images = [randImage];
        await p.save();
    }

    console.log('Updated images to realistic, unpolished photos.');
    process.exit(0);
}

updateImages().catch(err => {
    console.error(err);
    process.exit(1);
});
