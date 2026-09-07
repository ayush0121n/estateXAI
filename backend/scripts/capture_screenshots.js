const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const { signToken } = require('../middleware/auth');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';
const OUTPUT_DIR = path.join(__dirname, 'report_diagrams', 'screenshots');

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function captureAll() {
    console.log('🚀 Starting Automated Screenshot Capture with Puppeteer-Core...');
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const adminToken = signToken('6a71f2ed7300aa019401ed2d');
    const adminUser = {
        _id: '6a71f2ed7300aa019401ed2d',
        name: 'EstateXAi Admin',
        email: 'admin@estatexai.com',
        role: 'admin',
        phone: '+91 98765 43210'
    };

    const userToken = signToken('6a9ee3e8f178a6caccd1c97e');
    const normalUser = {
        _id: '6a9ee3e8f178a6caccd1c97e',
        name: 'Aarav Sharma',
        email: 'aarav.sharma@example.com',
        role: 'user',
        phone: '+91 98111 22334',
        institution: 'IIT Bombay'
    };

    const browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-web-security',
            '--font-render-hinting=none'
        ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });

    const capture = async (filename, waitTime = 1500) => {
        await delay(waitTime);
        const targetPath = path.join(OUTPUT_DIR, filename);
        await page.screenshot({ path: targetPath, type: 'png' });
        const stats = fs.statSync(targetPath);
        console.log(`  📸 Saved ${filename} (${(stats.size / 1024).toFixed(1)} KB)`);
    };

    try {
        // 1. Home Page Hero
        console.log('\n--- Capturing Home Page Hero ---');
        await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.evaluate(() => {
            localStorage.clear();
            window.scrollTo(0, 0);
        });
        await capture('home_hero.png', 2000);

        // 2. Home Page Featured
        console.log('\n--- Capturing Home Page Featured ---');
        await page.evaluate(() => {
            const h = Array.from(document.querySelectorAll('h2')).find(el => el.innerText.includes('Featured Residences') || el.innerText.includes('Explore Properties'));
            if (h) {
                h.scrollIntoView({ behavior: 'instant', block: 'start' });
                window.scrollBy(0, -80);
            } else {
                window.scrollTo(0, 1100);
            }
        });
        await capture('home_featured.png', 1800);

        // 3. Home Page Features ("Why EstateXAi")
        console.log('\n--- Capturing Home Page Features ---');
        await page.evaluate(() => {
            const h = Array.from(document.querySelectorAll('h2')).find(el => el.innerText.includes('Uncompromising Quality') || el.innerText.includes('EstateXAi Difference'));
            if (h) {
                h.scrollIntoView({ behavior: 'instant', block: 'start' });
                window.scrollBy(0, -80);
            } else {
                window.scrollTo(0, 2400);
            }
        });
        await capture('home_features.png', 1800);

        // 4. Properties Page
        console.log('\n--- Capturing Properties Page ---');
        await page.goto(`${BASE_URL}/properties`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.evaluate(() => window.scrollTo(0, 0));
        await capture('properties_page.png', 2500);

        // 5. Property Detail Page with Location Intelligence
        console.log('\n--- Capturing Property Detail & Location Intelligence ---');
        const propId = '6a9401c5147c4476d0deb1db';
        await page.goto(`${BASE_URL}/properties/${propId}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.evaluate(() => {
            const headings = Array.from(document.querySelectorAll('h2, h3'));
            const intelHeading = headings.find(h => h.innerText.includes('Location Intelligence'));
            if (intelHeading) {
                intelHeading.scrollIntoView({ behavior: 'instant', block: 'start' });
                window.scrollBy(0, -60);
            } else {
                window.scrollTo(0, 800);
            }
        });
        await capture('property_detail.png', 2500);

        // 6. PGs & Hostels Page
        console.log('\n--- Capturing PGs Page ---');
        await page.goto(`${BASE_URL}/pgs`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.evaluate(() => window.scrollTo(0, 0));
        await capture('pgs_page.png', 2500);

        // 7. AI Prediction Page
        console.log('\n--- Capturing AI Prediction Page ---');
        await page.goto(`${BASE_URL}/ai-prediction`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.evaluate(() => window.scrollTo(0, 0));
        await capture('ai_prediction.png', 2000);

        // 8. Roommate Matching Page
        console.log('\n--- Capturing Roommates Page ---');
        await page.goto(`${BASE_URL}/roommates`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.evaluate(() => window.scrollTo(0, 0));
        await capture('roommates_page.png', 2000);

        // 9. Compare Page
        console.log('\n--- Capturing Compare Page ---');
        await page.evaluate((id) => {
            sessionStorage.setItem('compareList', JSON.stringify([id, '6a9401c5147c4476d0deb1df', '6a9401c5147c4476d0deb1b7']));
        }, propId);
        await page.goto(`${BASE_URL}/compare`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.evaluate(() => window.scrollTo(0, 0));
        await capture('compare_page.png', 2500);

        // 10. Login Page
        console.log('\n--- Capturing Login Page ---');
        await page.evaluate(() => {
            localStorage.clear();
        });
        await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.evaluate(() => window.scrollTo(0, 0));
        await capture('login_page.png', 1800);

        // 11. Register Page
        console.log('\n--- Capturing Register Page ---');
        await page.goto(`${BASE_URL}/register`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.evaluate(() => window.scrollTo(0, 0));
        await capture('register_page.png', 1800);

        // 12. User Dashboard (with real user JWT)
        console.log('\n--- Capturing User Dashboard ---');
        await page.evaluate((token, user) => {
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
        }, userToken, normalUser);
        await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.evaluate(() => window.scrollTo(0, 0));
        await capture('dashboard_page.png', 2500);

        // 13. Admin Dashboard (with real admin JWT)
        console.log('\n--- Capturing Admin Dashboard ---');
        await page.evaluate((token, user) => {
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
        }, adminToken, adminUser);
        await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.evaluate(() => window.scrollTo(0, 0));
        await capture('dashboard_admin.png', 2500);

        // 14. Profile Page (with user JWT)
        console.log('\n--- Capturing Profile Page ---');
        await page.goto(`${BASE_URL}/profile`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.evaluate(() => window.scrollTo(0, 0));
        await capture('profile_page.png', 2500);

        console.log('\n✅ All 14 high-resolution screenshots successfully captured and refreshed!');
    } catch (err) {
        console.error('❌ Error during capture:', err);
    } finally {
        await browser.close();
    }
}

captureAll();
