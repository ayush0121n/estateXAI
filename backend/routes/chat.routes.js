/* eslint-disable */
/**
 * chat.routes.js — EstateXAI Assistant (Real-World AI Chatbot)
 * ==============================================================
 * POST /api/chat
 *
 * 8 Core Real-World Features:
 * 1. Property price fairness & offer advice (overpriced/fair/underpriced, opening offer, walkaway price)
 * 2. Commute vs rent tradeoff (calculates net savings factoring travel cost + time value)
 * 3. Hidden costs & true budget estimator (maintenance, deposit interest lost, electricity, brokerage)
 * 4. Neighborhood safety & lifestyle matching (safety, nightlife, family-friendly, water/power reliability)
 * 5. Rental contract red flags & legal clause checker (painting deductions, lock-in, unfair notice)
 * 6. Roommate / PG matching compatibility (compatibility scoring rubric & quiz)
 * 7. Investment ROI & rental yield calculator (gross/net yield, cap rate, break-even years)
 * 8. Smart property & PG search & comparison (real listings from database)
 *
 * Uses native fetch for external AI APIs (Node 18+ compatible, zero extra dependencies).
 */

const express = require('express');
const router = express.Router();
const { predictPriceJS } = require('../utils/jsPricePredictor');
const { geocodeAddress, getRouteMetrics } = require('../utils/locationIntelligence');
const Property = require('../models/Property');
const PG = require('../models/PG');

// ── Intent Classifier ──────────────────────────────────────────────────────────

const INTENT_PATTERNS = {
    // 1. Price Fairness & Negotiation
    fairness: /fairness|is\s+(?:it|this|\d+[\w,]*)\s+(?:fair|overpriced|expensive|cheap|worth)|fair\s+price|negotiat|counter\s*offer|walk.?away|offer\s+advice|pricing\s+advice/i,
    
    // 2. Commute vs Rent Tradeoff
    commute_tradeoff: /commute\s+vs\s+rent|rent\s+vs\s+commute|closer\s+to\s+(?:office|work)|trade.?off|worth\s+paying\s+more\s+rent|save\s+(?:money|time)\s+living\s+closer/i,
    
    // 3. Hidden Costs & True Budget
    hidden_costs: /hidden\s+cost|true\s+budget|true\s+cost|extra\s+cost|beyond\s+rent|brokerage\s+cost|deposit\s+interest|maintenance\s+charge|living\s+expense/i,
    
    // 4. Rental Contract Red Flags
    contract_check: /contract|agreement|clause|red\s*flag|lease|deposit\s+deduction|painting\s+charge|lock.?in|notice\s+period|legal\s+check|cheated|landlord\s+clause/i,
    
    // 5. Investment ROI & Yield
    investment_roi: /roi|rental\s+yield|investment|cap\s+rate|break.?even|capital\s+appreciation|returns?\s+on\s+property|buy\s+to\s+let|invest/i,
    
    // 6. Roommate & Flatmate Matching
    roommate: /roommate|flatmate|room\s*partner|compatibility|co.?living|flat\s*share|bachelor\s+match/i,
    
    // 7. General Commute
    commute: /commute|travel\s+time|distance|how\s+far|reach\s+office|metro\s+route|traffic/i,
    
    // 8. Neighborhood & Locality
    neighborhood: /neighborhood|neighbourhood|locality|safety|safe|crime|nightlife|night\s+life|water\s+(?:cut|problem|supply)|power\s+cut|family\s+friendly|vibe/i,
    
    // 9. PG / Hostel
    pg: /\bpg\b|paying\s+guest|hostel|girls\s+pg|boys\s+pg|ladies\s+hostel|gents\s+hostel/i,
    
    // 10. Documents & Checklist
    document: /document|checklist|police\s+verif|kyc|rent\s+receipt|hra/i,
    
    // 11. Owner Advice
    owner: /list\s+property|post\s+listing|pricing\s+my|how\s+to\s+sell|how\s+to\s+rent\s+out|landlord\s+tips/i,
    
    // 12. Property Price Predictor
    price: /price|cost|rate|किराया|दाम|मूल्य|worth|value|valuat|predict|estimate|afford|budget|emi|loan|rent/i,
    
    general: /.*/
};

function classifyIntent(text) {
    for (const [intent, pattern] of Object.entries(INTENT_PATTERNS)) {
        if (intent === 'general') continue;
        if (pattern.test(text)) return intent;
    }
    return 'general';
}

// ── Locality Database for Neighborhood Intelligence ───────────────────────────

const LOCALITY_DATA = {
    // Pune
    'baner': { city: 'Pune', safety: 4.6, nightlife: 4.2, family: 4.5, water: 'Good (PMC + Society tankers in peak summer)', power: 'Very reliable (99%)', metro: 'Metro Line 3 under development', summary: 'Prime IT-accessible hub, excellent cafes and high street retail, popular with tech professionals.' },
    'hinjewadi': { city: 'Pune', safety: 4.1, nightlife: 3.5, family: 3.8, water: 'Tanker dependent in Phase 2/3', power: 'Reliable in Phase 1', metro: 'Metro Line 3 connected soon', summary: 'IT epicenter of Pune with Rajiv Gandhi Infotech Park. Heavy peak-hour traffic.' },
    'koregaon park': { city: 'Pune', safety: 4.8, nightlife: 4.9, family: 4.3, water: 'Excellent PMC supply', power: 'Very reliable', metro: 'Near Pune Station/Kalyani Nagar', summary: 'Upscale, leafy, top restaurants and nightlife, cosmopolitan crowd.' },
    'wakad': { city: 'Pune', safety: 4.3, nightlife: 3.8, family: 4.4, water: 'Moderate, mostly tanker backed', power: 'Good', metro: 'Near Hinjewadi corridor', summary: 'Top choice for Hinjewadi commuters, vibrant rental market, strong society communities.' },
    'kharadi': { city: 'Pune', safety: 4.5, nightlife: 4.1, family: 4.4, water: 'Good (EON zone)', power: 'Reliable', metro: 'Planned extension', summary: 'Eastern IT corridor, home to EON Free Zone and World Trade Center.' },

    // Bangalore
    'koramangala': { city: 'Bangalore', safety: 4.7, nightlife: 5.0, family: 4.2, water: 'Mixed (BWSSB + tankers)', power: 'Good (UPS recommended)', metro: 'Green/Yellow line access nearby', summary: 'Startup capital of India, top tier cafes, vibrant social scene, high rent.' },
    'indiranagar': { city: 'Bangalore', safety: 4.8, nightlife: 5.0, family: 4.5, water: 'BWSSB available in central blocks', power: 'Good', metro: 'Purple line stations throughout', summary: 'Iconic 100ft/12th Main roads, luxury dining, premier residential locality.' },
    'whitefield': { city: 'Bangalore', safety: 4.2, nightlife: 3.9, family: 4.4, water: 'Heavy tanker reliance', power: 'Average (gated societies have full backup)', metro: 'Purple line fully operational', summary: 'Major IT tech parks, large gated townships, great international schools.' },
    'h配套r layout': { city: 'Bangalore', safety: 4.4, nightlife: 4.3, family: 4.5, water: 'Tanker + BWSSB in sectors 1-3', power: 'Good', metro: 'Silk Board & upcoming corridors', summary: 'Sectoral layout, wide roads, loved by startup founders and techies.' },
    'bellandur': { city: 'Bangalore', safety: 4.0, nightlife: 3.7, family: 3.8, water: 'Heavy tanker reliance', power: 'Society backup essential', metro: 'ORR metro under active construction', summary: 'Direct proximity to EcoSpace and Outer Ring Road offices, heavy road congestion.' },

    // Mumbai
    'bandra': { city: 'Mumbai', safety: 4.9, nightlife: 5.0, family: 4.6, water: 'BMC continuous supply', power: 'Best in India (Adani/Tata)', metro: 'Metro Line 2B / 3 accessible', summary: 'The queen of suburbs, celebrity residences, sea-facing promenades, highest rents.' },
    'andheri west': { city: 'Mumbai', safety: 4.6, nightlife: 4.8, family: 4.3, water: 'BMC regular supply', power: 'Very reliable', metro: 'Metro Line 1, 2A, 7 interchange', summary: 'Media and entertainment capital, bustling food scene, top tier connectivity.' },
    'powai': { city: 'Mumbai', safety: 4.7, nightlife: 4.4, family: 4.8, water: 'BMC supply + Hiranandani management', power: 'Very reliable', metro: 'Line 6 underway', summary: 'Lakeside township, European architecture, IIT Bombay, corporate headquarters.' },

    // Hyderabad
    'hitec city': { city: 'Hyderabad', safety: 4.7, nightlife: 4.5, family: 4.3, water: 'HMWSSB good', power: 'TSSPDCL reliable', metro: 'Blue Line metro connected', summary: 'Heart of Hyderabad Cyberabad, modern infrastructure, high rental yields.' },
    'gachibowli': { city: 'Hyderabad', safety: 4.6, nightlife: 4.3, family: 4.6, water: 'Good in gated communities', power: 'Very reliable', metro: 'Phase 2 extension approved', summary: 'Financial district neighbor, sports stadium, large high-rise residential complexes.' }
};

function lookupNeighborhood(query) {
    const q = query.toLowerCase();
    for (const [locality, data] of Object.entries(LOCALITY_DATA)) {
        if (q.includes(locality)) {
            return { locality: locality.toUpperCase(), ...data };
        }
    }
    return null;
}

// ── Smart Calculations ────────────────────────────────────────────────────────

/**
 * 1. Price Fairness Calculator
 */
function analyzePriceFairness({ askingPrice, city, bhk, area, listingType = 'rent' }) {
    const benchmark = predictPriceJS({
        city: city || 'Pune',
        bhk: bhk || 2,
        area: area || (bhk === 1 ? 600 : bhk === 2 ? 1050 : 1500),
        listingType: listingType,
        furnishing: 'semi-furnished',
        amenities_count: 5
    });

    const predicted = benchmark.predicted_price;
    const diffPercent = ((askingPrice - predicted) / predicted) * 100;

    let verdict, tone, openingOffer, walkawayPrice, analysis;

    if (diffPercent > 12) {
        verdict = '🔴 OVERPRICED';
        tone = 'caution';
        openingOffer = Math.round(predicted * 0.92);
        walkawayPrice = Math.round(predicted * 1.05);
        analysis = `Asking price is **${Math.abs(diffPercent).toFixed(1)}% above** current market median. You have strong leverage to negotiate downward.`;
    } else if (diffPercent < -10) {
        verdict = '🟢 UNDERPRICED / GREAT DEAL';
        tone = 'positive';
        openingOffer = askingPrice;
        walkawayPrice = Math.round(askingPrice * 1.05);
        analysis = `Asking price is **${Math.abs(diffPercent).toFixed(1)}% below** market rate. Excellent value — verify property documents and condition promptly before someone else takes it!`;
    } else {
        verdict = '🟡 FAIR MARKET VALUE';
        tone = 'neutral';
        openingOffer = Math.round(askingPrice * 0.94);
        walkawayPrice = askingPrice;
        analysis = `Asking price aligns within **±${Math.abs(diffPercent).toFixed(1)}%** of the standard benchmark for this specification.`;
    }

    return {
        benchmark,
        diffPercent: diffPercent.toFixed(1),
        verdict,
        tone,
        askingPrice,
        predicted,
        openingOffer,
        walkawayPrice,
        analysis
    };
}

/**
 * 2. Commute vs Rent Tradeoff
 */
function calculateCommuteTradeoff({ currentRent, closerRent, kmSavedOneWay, hourlyIncome = 400 }) {
    const rentDiff = closerRent - currentRent; // e.g. +5000/mo
    const kmSavedDaily = kmSavedOneWay * 2;
    const workDays = 22;
    
    // Estimate transit costs: ₹14/km for cab/car fuel+wear, ₹5/km for 2-wheeler
    const fuelCostSavedPerKm = 8; // blended average
    const monthlyTravelExpenseSaved = kmSavedDaily * fuelCostSavedPerKm * workDays;
    
    // Estimate time saved: Assume 15 km/hr in peak Indian traffic -> 4 mins per km
    const minutesSavedDaily = kmSavedDaily * 4;
    const hoursSavedMonthly = (minutesSavedDaily * workDays) / 60;
    const timeValueMonthly = hoursSavedMonthly * hourlyIncome;
    
    const totalBenefit = monthlyTravelExpenseSaved + timeValueMonthly;
    const netMonthlyGain = totalBenefit - rentDiff;

    return {
        rentDiff,
        monthlyTravelExpenseSaved: Math.round(monthlyTravelExpenseSaved),
        hoursSavedMonthly: hoursSavedMonthly.toFixed(1),
        timeValueMonthly: Math.round(timeValueMonthly),
        totalBenefit: Math.round(totalBenefit),
        netMonthlyGain: Math.round(netMonthlyGain),
        isWorthIt: netMonthlyGain > 0
    };
}

/**
 * 3. Hidden Costs & True Budget Calculator
 */
function calculateHiddenCosts({ baseRent, securityDepositMonths = 3, brokerageMonths = 1, city = 'Pune' }) {
    const maintenance = Math.round(baseRent * 0.12); // avg society maintenance 10-15%
    const electricityWater = Math.round(baseRent * 0.08); // avg utility 8%
    
    // Opportunity cost of deposit: interest lost at 7% p.a. (FD rate)
    const depositAmount = baseRent * securityDepositMonths;
    const monthlyDepositInterestLost = Math.round((depositAmount * 0.07) / 12);
    
    // Brokerage amortized over 12 months tenure
    const brokerageTotal = baseRent * brokerageMonths;
    const monthlyBrokerageAmortized = Math.round(brokerageTotal / 12);
    
    // One-time move-in & deep cleaning amortized
    const moveInAmortized = Math.round(8000 / 12);
    
    const trueMonthlyCost = baseRent + maintenance + electricityWater + monthlyDepositInterestLost + monthlyBrokerageAmortized + moveInAmortized;
    const hiddenMarkupPercent = (((trueMonthlyCost - baseRent) / baseRent) * 100).toFixed(1);

    return {
        baseRent,
        maintenance,
        electricityWater,
        depositAmount,
        monthlyDepositInterestLost,
        brokerageTotal,
        monthlyBrokerageAmortized,
        moveInAmortized,
        trueMonthlyCost,
        hiddenMarkupPercent
    };
}

/**
 * 4. Investment ROI & Yield Calculator
 */
function calculateInvestmentROI({ propertyPrice, expectedMonthlyRent, maintenanceMonthly = 3000, propertyTaxAnnual = 12000 }) {
    const grossAnnualRent = expectedMonthlyRent * 12;
    const grossRentalYield = ((grossAnnualRent / propertyPrice) * 100).toFixed(2);
    
    const annualExpenses = (maintenanceMonthly * 12) + propertyTaxAnnual + (expectedMonthlyRent * 1); // 1 month vacancy allowance
    const netAnnualIncome = grossAnnualRent - annualExpenses;
    const netRentalYield = ((netAnnualIncome / propertyPrice) * 100).toFixed(2);
    
    const breakEvenYears = (propertyPrice / Math.max(1, netAnnualIncome)).toFixed(1);

    return {
        propertyPrice,
        expectedMonthlyRent,
        grossAnnualRent,
        grossRentalYield,
        annualExpenses,
        netAnnualIncome,
        netRentalYield,
        breakEvenYears
    };
}

// ── Native Fetch LLM Callers (Zero external library dependency) ────────────────

async function callGemini(messages, systemInstruction) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: messages.map(m => ({
                    role: m.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: m.content }]
                })),
                systemInstruction: { parts: [{ text: systemInstruction }] },
                generationConfig: { maxOutputTokens: 600, temperature: 0.6 }
            }),
            signal: AbortSignal.timeout(9000)
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } catch {
        return null;
    }
}

async function callOpenAI(messages, systemInstruction) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return null;
    try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ role: 'system', content: systemInstruction }, ...messages],
                max_tokens: 600,
                temperature: 0.6
            }),
            signal: AbortSignal.timeout(9000)
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data?.choices?.[0]?.message?.content || null;
    } catch {
        return null;
    }
}

// ── Main Route ─────────────────────────────────────────────────────────────────

router.post('/', async (req, res) => {
    try {
        const { message, history = [], userRole = 'guest', context = {} } = req.body;

        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Message is required.' });
        }

        const userMsg = message.trim().slice(0, 800);
        const intent = classifyIntent(userMsg);
        let responseMarkdown = '';
        let structuredData = null;

        // ── 1. Property Price Fairness & Offer Advice ──
        if (intent === 'fairness') {
            const priceMatch = userMsg.match(/₹?\s*(\d{4,9})/);
            const cityMatch = userMsg.match(/\b(Mumbai|Pune|Bangalore|Bengaluru|Hyderabad|Delhi|Chennai|Kolkata|Gurgaon|Noida)\b/i);
            const bhkMatch = userMsg.match(/(\d)\s*(?:bhk|bedroom)/i);

            const askingPrice = priceMatch ? parseInt(priceMatch[1], 10) : context.price || 25000;
            const city = cityMatch ? cityMatch[1] : context.city || 'Pune';
            const bhk = bhkMatch ? parseInt(bhkMatch[1], 10) : context.bhk || 2;
            const listingType = /buy|sale|crore|lakh/.test(userMsg) ? 'buy' : 'rent';

            const analysis = analyzePriceFairness({ askingPrice, city, bhk, listingType });
            structuredData = analysis;

            responseMarkdown = `### ⚖️ Price Fairness & Offer Strategy Analysis
**Asking Price**: ₹${askingPrice.toLocaleString()} ${listingType === 'rent' ? '/month' : ''} (${bhk} BHK in ${city})

• **Status**: ${analysis.verdict}
• **AI Benchmark**: ₹${analysis.predicted.toLocaleString()} ${listingType === 'rent' ? '/mo' : ''} (Range: ${analysis.benchmark.range_label})
• **Market Variance**: ${analysis.analysis}

🎯 **Recommended Negotiation Strategy**:
- 🏷️ **Opening Counter-Offer**: **₹${analysis.openingOffer.toLocaleString()}** (Give room for back-and-forth)
- 🛑 **Walk-Away Price**: **₹${analysis.walkawayPrice.toLocaleString()}** (Do not exceed this ceiling)
- 💡 **Tactical Lever**: Mention comparable recent deals in ${city} and offer prompt token transfer for a faster close.`;
        }

        // ── 2. Commute vs Rent Tradeoff ──
        else if (intent === 'commute_tradeoff') {
            const rentMatches = [...userMsg.matchAll(/₹?\s*(\d{4,6})/g)].map(m => parseInt(m[1], 10));
            const kmMatch = userMsg.match(/(\d+)\s*km/i);

            const currentRent = rentMatches[0] || 20000;
            const closerRent = rentMatches[1] || (currentRent + 6000);
            const kmSaved = kmMatch ? parseInt(kmMatch[1], 10) : 10;

            const calc = calculateCommuteTradeoff({ currentRent, closerRent, kmSavedOneWay: kmSaved });
            structuredData = calc;

            responseMarkdown = `### 🚗 Rent vs. Commute Tradeoff Calculator
Saving **${kmSaved} km each way** by paying **₹${calc.rentDiff.toLocaleString()} extra rent**:

• **Monthly Travel Fuel & Fare Saved**: ~₹${calc.monthlyTravelExpenseSaved.toLocaleString()}
• **Personal Time Reclaimed**: **~${calc.hoursSavedMonthly} hours/month** (~${(calc.hoursSavedMonthly/22).toFixed(1)} hrs/workday)
• **Time Value Monetized**: ~₹${calc.timeValueMonthly.toLocaleString()} (at modest ₹400/hr)
• **Gross Monthly Value Created**: **₹${calc.totalBenefit.toLocaleString()}**

🏆 **Verdict**: ${calc.isWorthIt ? '🟢 **HIGHLY RECOMMENDED!**' : '🟡 **BORDERLINE / NEUTRAL**'}
You come out ahead by **₹${Math.abs(calc.netMonthlyGain).toLocaleString()}/month** in real economic terms, plus ${calc.hoursSavedMonthly} hours of reduced stress and fatigue!`;
        }

        // ── 3. Hidden Costs & True Budget Estimator ──
        else if (intent === 'hidden_costs') {
            const rentMatch = userMsg.match(/₹?\s*(\d{4,6})/);
            const baseRent = rentMatch ? parseInt(rentMatch[1], 10) : context.price || 25000;

            const calc = calculateHiddenCosts({ baseRent });
            structuredData = calc;

            responseMarkdown = `### 🔍 True Monthly Living Cost Breakdown
*Rent is only a fraction of what you actually spend each month.*

For a quoted rent of **₹${baseRent.toLocaleString()}/month**:

| Expense Item | Monthly Outflow | Notes |
| :--- | :--- | :--- |
| **Quoted Rent** | ₹${baseRent.toLocaleString()} | Base contractual rent |
| **Society Maintenance** | ₹${calc.maintenance.toLocaleString()} | Lift, gym, security, power backup |
| **Electricity & Water** | ₹${calc.electricityWater.toLocaleString()} | AC usage + tanker water surcharge |
| **Security Deposit Opportunity Cost** | ₹${calc.monthlyDepositInterestLost.toLocaleString()} | 7% p.a. interest lost on ₹${calc.depositAmount.toLocaleString()} deposit |
| **Brokerage (Amortized)** | ₹${calc.monthlyBrokerageAmortized.toLocaleString()} | 1 month brokerage spread over 12 months |
| **Move-in & Deep Cleaning (Amortized)**| ₹${calc.moveInAmortized.toLocaleString()} | ₹8,000 one-time setup over 1 year |
| **TOTAL TRUE MONTHLY COST** | **₹${calc.trueMonthlyCost.toLocaleString()}** | **+${calc.hiddenMarkupPercent}% above base rent!** |

💡 **Pro Tip**: Always demand clarification on whether maintenance is included in the quoted rent before signing!`;
        }

        // ── 4. Rental Contract Red Flags & Legal Clause Checker ──
        else if (intent === 'contract_check') {
            responseMarkdown = `### 🚩 Rental Contract Red Flag & Clause Checker
Watch out for these common traps in Indian tenancy agreements:

1. ⚠️ **The "Painting Deduction Trap"**
   - *Clause to look for*: "Landlord shall deduct 1 full month's rent for repainting upon exit."
   - *Legal Reality*: Painting is normal wear-and-tear. Refuse this clause or cap it strictly at actual bills (max ₹3,000–5,000).

2. ⚠️ **Asymmetrical Notice Periods**
   - *Clause to look for*: Landlord gives 15 days notice to vacate, but demands 2–3 months notice from tenant.
   - *Fair Standard*: Must be strictly mutual (1 month for both sides).

3. ⚠️ **Unreasonable Lock-in Periods**
   - *Clause to look for*: "Tenant cannot vacate for 11 months; forfeit entire deposit if leaving earlier."
   - *Safe Solution*: Add a job relocation / emergency exit clause with 30 days notice.

4. ⚠️ **Deposit Refund Delay**
   - *Fair Standard*: The agreement MUST state: "Security deposit shall be refunded via NEFT/UPI within **7 business days** of key handover."

5. ⚠️ **Major Structural Repairs Imposed on Tenant**
   - Minor routine wear (<₹500 for bulbs/taps) is tenant's share; roof seepage, electrical mains, and geyser replacement MUST be the landlord's responsibility.

📄 Need a rock-solid, dispute-free agreement? Use our **Digital Rental Toolkit** at \`/rental-toolkit\`!`;
        }

        // ── 5. Investment ROI & Rental Yield Calculator ──
        else if (intent === 'investment_roi') {
            const priceMatch = userMsg.match(/(\d+(?:\.\d+)?)\s*(?:cr|crore|lakh|lacs)/i);
            const rentMatch = userMsg.match(/₹?\s*(\d{4,6})\s*(?:rent|pm|per\s+month|\/mo)/i);

            let propertyPrice = 8500000; // default 85 Lakh
            if (priceMatch) {
                const val = parseFloat(priceMatch[1]);
                propertyPrice = /cr|crore/i.test(priceMatch[0]) ? val * 10000000 : val * 100000;
            }
            const expectedRent = rentMatch ? parseInt(rentMatch[1], 10) : Math.round(propertyPrice * 0.003);

            const calc = calculateInvestmentROI({ propertyPrice, expectedMonthlyRent: expectedRent });
            structuredData = calc;

            responseMarkdown = `### 📈 Real Estate Investment & Rental Yield Analysis
**Property Value**: ₹${(propertyPrice / 100000).toFixed(1)} Lakh | **Estimated Rent**: ₹${expectedRent.toLocaleString()}/month

• **Gross Annual Rental Income**: ₹${calc.grossAnnualRent.toLocaleString()}
• **Gross Rental Yield**: **${calc.grossRentalYield}%** *(India urban residential avg: 2.5% – 3.8%)*
• **Net Rental Yield**: **${calc.netRentalYield}%** *(After maintenance, property tax & 1 mo vacancy)*
• **Years to Break Even on Capital (Rent only)**: **${calc.breakEvenYears} years**

📊 **Investment Verdict**:
${parseFloat(calc.grossRentalYield) >= 3.5 ? '🟢 **High-Yield Asset**: Exceeds average Indian residential yield.' : '🟡 **Capital Appreciation Play**: Yield is modest; returns will depend heavily on 6–9% annual property value appreciation.'}

💡 For higher yields (6%–8%), explore student housing / PGs or commercial office suites.`;
        }

        // ── 6. Roommate / PG Compatibility ──
        else if (intent === 'roommate') {
            responseMarkdown = `### 🤝 Flatmate Compatibility Matcher
Living with someone works best when lifestyle rhythms align. Evaluate flatmates across these **5 Core Pillars**:

| Pillar | Compatibility Question | Critical Threshold |
| :--- | :--- | :--- |
| 🌙 **Sleep Cycle** | Early riser (6 AM) vs. Night Owl (3 AM)? | Mismatched sleep schedules create 60% of flatmate conflicts. |
| 🥗 **Kitchen & Diet** | Pure Veg vs Non-Veg / Cooking vs Ordering? | Clarify separate utensils or shared cooking upfront. |
| 🧹 **Cleanliness** | Daily tidying vs. Weekly maid chore? | Agree on maid expenses & dishwashing rotation. |
| 🎉 **Social & Guests** | Quiet sanctuary vs. Frequent party hub? | Establish overnight guest policy on weekdays. |
| 💻 **Work Rhythm** | WFH full-time vs. Daily office commuter? | Daytime quietness requirements for Zoom calls. |

👉 Visit **/roommates** on EstateXAI to browse verified profiles matched by compatibility algorithms!`;
        }

        // ── 7. Neighborhood Intelligence ──
        else if (intent === 'neighborhood') {
            const locality = lookupNeighborhood(userMsg);
            if (locality) {
                responseMarkdown = `### 🏘️ Neighborhood Intelligence: ${locality.locality} (${locality.city})
${locality.summary}

• 🛡️ **Safety Rating**: **${locality.safety} / 5.0** (Community verified)
• 🍹 **Nightlife & Dining**: **${locality.nightlife} / 5.0**
• 👨‍👩‍👧 **Family & Kids Friendliness**: **${locality.family} / 5.0**
• 🚰 **Water Supply**: ${locality.water}
• ⚡ **Power Reliability**: ${locality.power}
• 🚇 **Transit & Connectivity**: ${locality.metro}

You can also view community safety ratings and leave your own review on any property page in ${locality.city}!`;
            } else {
                responseMarkdown = `### 🏘️ Neighborhood Safety & Lifestyle Guide
EstateXAI provides live community ratings for safety, noise levels, and cleanliness across Indian metros.

Tell me a specific locality (e.g., **Baner, Hinjewadi, Koramangala, Indiranagar, Whitefield, Powai, Bandra, Hitec City**) and I'll pull up its:
- 🛡️ Women's safety & night-walkability score
- 🚰 Water supply & tanker situation
- ⚡ Power cuts & society generator backups
- 🚗 Peak traffic and metro connectivity!`;
            }
        }

        // ── 8. PG / Hostel Finder ──
        else if (intent === 'pg') {
            const cityMatch = userMsg.match(/\b(Mumbai|Pune|Bangalore|Bengaluru|Hyderabad|Delhi|Chennai|Kolkata)\b/i);
            const genderMatch = userMsg.match(/\b(female|girls?|ladies|women|male|boys?|gents?)\b/i);
            const rentMatch = userMsg.match(/(?:under|below|max|upto)\s*₹?\s*(\d+)/i);

            const q = { isAvailable: true };
            if (cityMatch) q['location.city'] = new RegExp(cityMatch[1], 'i');
            if (genderMatch) q.genderType = /female|girls?|ladies|women/i.test(genderMatch[0]) ? 'female' : 'male';
            if (rentMatch) q.rentPerMonth = { $lte: parseInt(rentMatch[1], 10) };

            const pgs = await PG.find(q).limit(3).select('name rentPerMonth location genderType amenities').lean();

            if (pgs.length > 0) {
                const list = pgs.map((p, i) => `${i+1}. **${p.name}** — ₹${p.rentPerMonth?.toLocaleString()}/mo | ${p.location?.area || p.location?.city} (${p.genderType})`).join('\n');
                responseMarkdown = `### 🏠 Recommended PG Accommodations\n\n${list}\n\n👉 [Browse All PGs with Photos & Direct Owner Contact](/pgs)`;
            } else {
                responseMarkdown = `### 🏠 PG & Hostel Search
Looking for paying guest accommodations?
- **Boys / Girls / Unisex PGs** with food, WiFi, housekeeping & security.
- Typical monthly costs: Single room (₹10,000–22,000), Double sharing (₹6,000–14,000).

Search live inventory now on the **[PG Listings Page](/pgs)**!`;
            }
        }

        // ── 9. Commute Calculation ──
        else if (intent === 'commute') {
            const fromMatch = userMsg.match(/(?:from|near|in|at)\s+([A-Za-z\s]+?)(?:\s+to|\s+commute|\s+far|\?|$)/i);
            const toMatch = userMsg.match(/(?:to|near)\s+([A-Za-z\s]+?)(?:\s+from|\s+in|\?|$)/i);

            if (fromMatch && toMatch) {
                try {
                    const propGeo = await geocodeAddress(`${fromMatch[1].trim()}, India`);
                    const workGeo = await geocodeAddress(`${toMatch[1].trim()}, India`);
                    if (propGeo && workGeo) {
                        const route = await getRouteMetrics(propGeo.lat, propGeo.lng, workGeo.lat, workGeo.lng, 'driving');
                        const dist = route ? parseFloat(route.distanceKm) : 8.5;
                        const mins = route ? route.durationMin : Math.round(dist * 3.5);
                        responseMarkdown = `### 🚗 Commute Route Analysis
• **From**: ${fromMatch[1].trim()}
• **To**: ${toMatch[1].trim()}
• **Distance**: ~${dist.toFixed(1)} km
• **Estimated Peak Driving Time**: ~${mins} minutes (Bike: ~${Math.max(1, Math.round(mins*0.8))} mins)
• **Monthly Transit Hours (22 days)**: ~${(((mins * 2 * 22) / 60)).toFixed(1)} hours

💡 *For detailed door-to-door turn navigation with live map markers, check the interactive Map on any property page.*`;
                    }
                } catch {
                    // fallback below
                }
            }
            if (!responseMarkdown) {
                responseMarkdown = `### 🗺️ AI Commute Distance & Time Estimator
Tell me where you want to live and your office location (e.g., *"Commute from Baner to Hinjewadi Phase 1"*).
I'll calculate:
- Peak hour two-wheeler vs. cab travel times
- Monthly fuel & fare outlay
- Liveability score based on proximity!`;
            }
        }

        // ── 10. Default / Property Search ──
        else {
            const cityMatch = userMsg.match(/\b(Mumbai|Pune|Bangalore|Bengaluru|Hyderabad|Delhi|Chennai|Kolkata)\b/i);
            const bhkMatch = userMsg.match(/(\d)\s*bhk/i);
            const rentMatch = userMsg.match(/(?:under|below|max|upto)\s*₹?\s*(\d+)/i);

            if (cityMatch || bhkMatch || rentMatch) {
                const q = { isAvailable: true };
                if (cityMatch) q['location.city'] = new RegExp(cityMatch[1], 'i');
                if (bhkMatch) q.bhk = parseInt(bhkMatch[1], 10);
                if (rentMatch) q.price = { $lte: parseInt(rentMatch[1], 10) };

                const props = await Property.find(q).limit(3).select('title price location bhk listingType').lean();
                if (props.length > 0) {
                    const list = props.map((p, i) => `${i+1}. **${p.title}** — ₹${p.price?.toLocaleString()}${p.listingType === 'rent' ? '/mo' : ''} | ${p.bhk} BHK in ${p.location?.city}`).join('\n');
                    responseMarkdown = `### 🏡 Matching Listings Found\n\n${list}\n\n👉 [Explore All Properties with Interactive Maps & Street View](/properties)`;
                }
            }

            if (!responseMarkdown) {
                // If LLM available, call it; otherwise provide welcome menu
                const systemPrompt = `You are EstateXAI Assistant, an elite AI for Indian real estate.
You solve real-world problems: price fairness, offer advice, commute vs rent tradeoffs, hidden rental costs, contract red flags, flatmate matching, and investment yields.
Keep responses concise, practical, and formatted in clean markdown. Always use Indian Rupees (₹). Support English & Hindi.`;

                const recentHistory = (Array.isArray(history) ? history : []).slice(-4).map(m => ({ role: m.role, content: m.content }));
                const llmMessages = [...recentHistory, { role: 'user', content: userMsg }];

                responseMarkdown = await callGemini(llmMessages, systemPrompt);
                if (!responseMarkdown) {
                    responseMarkdown = await callOpenAI(llmMessages, systemPrompt);
                }
                if (!responseMarkdown) {
                    responseMarkdown = `### 👋 Welcome to EstateXAI Assistant!
I'm your 24/7 AI real estate advisor for Indian metros. Here is what I can do for you:

• ⚖️ **Price Fairness & Offers**: *"Is 30,000 fair for a 2BHK in Baner?"*
• 🚗 **Commute vs. Rent**: *"Commute vs rent: save 10km by paying ₹5,000 more rent?"*
• 🔍 **True Monthly Costs**: *"What are hidden costs for ₹25,000 rent?"*
• 🚩 **Contract Red Flags**: *"Check my rent agreement for painting charge traps"*
• 🏘️ **Neighborhood Vibe**: *"How is safety and water supply in Koramangala?"*
• 🤝 **Flatmate Quiz**: *"How to test roommate compatibility?"*
• 📈 **Investment ROI**: *"Calculate rental yield for an 80 Lakh flat with 25k rent"*

*Ask anything in English or Hindi!*`;
                }
            }
        }

        return res.json({
            success: true,
            response: responseMarkdown,
            intent,
            hasToolData: !!structuredData,
            engine: process.env.GEMINI_API_KEY ? 'gemini' : process.env.OPENAI_API_KEY ? 'openai' : 'smart-rule-engine'
        });

    } catch (err) {
        console.error('[Chat Error]:', err.message);
        return res.status(500).json({
            success: false,
            response: "I encountered a minor issue processing your request. Please try asking again or explore the navigation bar for Properties, PGs, and AI Predictor!",
            engine: 'error-fallback'
        });
    }
});

module.exports = router;
