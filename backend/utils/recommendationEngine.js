const Interaction = require('../models/Interaction');
const Property = require('../models/Property');
const PG = require('../models/PG');
const User = require('../models/User');

/**
 * Get Content-Based Score
 * Checks how well an item matches user preferences or typical user keywords.
 */
function getContentBasedScore(item, itemType, user) {
    let score = 0;
    
    // User keyword matching (institution/workplace/city)
    const keyword = (user.institution || user.workplace || 'Pune').toLowerCase();
    
    if (itemType === 'PG') {
        if (item.location.nearbyInstitutions && item.location.nearbyInstitutions.some(i => i.toLowerCase().includes(keyword))) score += 5;
        if (item.location.address.toLowerCase().includes(keyword)) score += 3;
        if (item.location.city.toLowerCase() === keyword) score += 1;
        score += (item.rating || 0) * 0.5; // Boost by rating
    } else {
        if (item.location.address.toLowerCase().includes(keyword)) score += 3;
        if (item.location.city.toLowerCase() === keyword) score += 1;
        if (item.isFeatured) score += 2;
    }
    
    return score;
}

/**
 * Get Item-Based Collaborative Recommendations
 * 1. Find items the user interacted with.
 * 2. Find other users who interacted with those items.
 * 3. Find other items those users interacted with.
 */
async function getCollaborativeScores(userId, itemType) {
    const userInteractions = await Interaction.find({ user: userId, itemType });
    if (!userInteractions.length) return {}; // Cold start

    const itemIds = userInteractions.map(i => i.itemId);
    
    // Find other users who interacted with these items
    const otherInteractions = await Interaction.find({ itemId: { $in: itemIds }, user: { $ne: userId }, itemType });
    const similarUsers = [...new Set(otherInteractions.map(i => i.user.toString()))];

    // Find other items these similar users interacted with
    const recommendedInteractions = await Interaction.find({ 
        user: { $in: similarUsers }, 
        itemId: { $nin: itemIds }, // exclude items the user already interacted with
        itemType 
    });

    const collabScores = {};
    for (const inter of recommendedInteractions) {
        const idStr = inter.itemId.toString();
        collabScores[idStr] = (collabScores[idStr] || 0) + (inter.weight || 1);
    }
    
    return collabScores;
}

/**
 * Main Hybrid Engine
 */
async function getHybridRecommendations(user, itemType, limit = 6) {
    try {
        const Model = itemType === 'PG' ? PG : Property;
        
        // 1. Get Collaborative Scores
        const collabScores = await getCollaborativeScores(user._id, itemType);
        
        // 2. Fetch Candidates
        // If we have strong collab recommendations, fetch those, plus some base candidates for content scoring.
        const collabItemIds = Object.keys(collabScores);
        
        const candidates = await Model.find({ 
            isAvailable: true,
            $or: [
                { _id: { $in: collabItemIds } },
                { 'location.city': 'Pune' }, // Base pool
                { isFeatured: true }
            ]
        }).populate('owner', 'name phone').limit(50); // limit pool to avoid huge memory usage

        // 3. Compute Hybrid Score
        const ALPHA = 0.6; // Weight for Content
        const BETA = 0.4; // Weight for Collaborative
        
        const scoredItems = candidates.map(item => {
            const contentScore = getContentBasedScore(item, itemType, user);
            const collabScore = collabScores[item._id.toString()] || 0;
            
            // Normalize slightly - assuming collab score might be 0-10, content 0-10
            const hybridScore = (ALPHA * contentScore) + (BETA * collabScore * 2); // boost collab weight slightly in scale
            
            return {
                item,
                score: hybridScore,
                contentScore,
                collabScore
            };
        });

        // 4. Sort and return top N
        scoredItems.sort((a, b) => b.score - a.score);
        
        return scoredItems.slice(0, limit).map(si => si.item);

    } catch (error) {
        console.error("Hybrid Engine Error:", error);
        return [];
    }
}

module.exports = {
    getHybridRecommendations
};
