const path = require('path');
const rootDir = path.join(__dirname, '..');
require('dotenv').config({ path: path.join(rootDir, '.env') });
const mongoose = require('mongoose');

const realisticImages = [
    'https://images.unsplash.com/photo-1598928506311-c55dd100e47a?w=800',
    'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800',
    'https://images.unsplash.com/photo-1605276374104-5d519b5d4f13?w=800',
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800',
    'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800',
    'https://images.unsplash.com/photo-1613553474136-1e0e85498877?w=800',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
    'https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=800'
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

    console.log('Updated images to realistic ones.');
    process.exit(0);
}

updateImages().catch(err => {
    console.error(err);
    process.exit(1);
});
