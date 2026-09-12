const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const PG = require('../models/PG');

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Advanced unified search across properties and PGs
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search keyword
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [property, pg, all]
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [relevance, price_asc, price_desc, newest, popular]
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/', async (req, res) => {
    try {
        const {
            q = '',
            type = 'all',
            city,
            minPrice, maxPrice,
            bhk,
            listingType,
            sort = 'newest',
            page = 1,
            limit = 12
        } = req.query;

        const skip = (Number(page) - 1) * Number(limit);

        // Sort mapping
        const sortMap = {
            relevance: '-views -isFeatured',
            price_asc: 'price rentPerMonth',
            price_desc: '-price -rentPerMonth',
            newest: '-createdAt',
            popular: '-views'
        };
        const sortStr = sortMap[sort] || '-createdAt';

        let results = { properties: [], pgs: [], total: 0 };

        // Build search query for text
        const textQuery = q ? {
            $or: [
                { title: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { 'location.address': { $regex: q, $options: 'i' } },
                { 'location.city': { $regex: q, $options: 'i' } }
            ]
        } : {};

        if (type === 'all' || type === 'property') {
            if (city && city.toLowerCase() !== 'all' && city.toLowerCase() !== 'all cities') {
                const cleanCity = city.replace(/ncr/i, '').trim();
                propQuery['location.city'] = { $regex: cleanCity || city, $options: 'i' };
            }
            if (bhk) propQuery.bhk = Number(bhk);
            if (listingType) propQuery.listingType = listingType;
            if (minPrice || maxPrice) {
                propQuery.price = {};
                if (minPrice) propQuery.price.$gte = Number(minPrice);
                if (maxPrice) propQuery.price.$lte = Number(maxPrice);
            }

            const props = await Property.find(propQuery)
                .populate('owner', 'name phone email')
                .sort(sortStr.replace('rentPerMonth', 'price'))
                .skip(type === 'property' ? skip : 0)
                .limit(type === 'property' ? Number(limit) : 6);
            
            results.properties = props;
            if (type === 'property') {
                results.total = await Property.countDocuments(propQuery);
            }
        }

        if (type === 'all' || type === 'pg') {
            const pgQuery = { isAvailable: true, ...textQuery };
            if (q) {
                pgQuery.$or = [
                    { name: { $regex: q, $options: 'i' } },
                    { description: { $regex: q, $options: 'i' } },
                    { 'location.address': { $regex: q, $options: 'i' } },
                    { 'location.city': { $regex: q, $options: 'i' } }
                ];
            }
            if (city && city.toLowerCase() !== 'all' && city.toLowerCase() !== 'all cities') {
                const cleanCity = city.replace(/ncr/i, '').trim();
                pgQuery['location.city'] = { $regex: cleanCity || city, $options: 'i' };
            }
            if (minPrice || maxPrice) {
                pgQuery.rentPerMonth = {};
                if (minPrice) pgQuery.rentPerMonth.$gte = Number(minPrice);
                if (maxPrice) pgQuery.rentPerMonth.$lte = Number(maxPrice);
            }

            const pgs = await PG.find(pgQuery)
                .populate('owner', 'name phone email')
                .sort(sortStr.replace('price', 'rentPerMonth'))
                .skip(type === 'pg' ? skip : 0)
                .limit(type === 'pg' ? Number(limit) : 6);

            results.pgs = pgs;
            if (type === 'pg') {
                results.total = await PG.countDocuments(pgQuery);
            }
        }

        if (type === 'all') {
            results.total = results.properties.length + results.pgs.length;
        }

        res.json({ success: true, ...results, page: Number(page), sort });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
