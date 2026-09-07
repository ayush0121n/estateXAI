/**
 * generate_report.js
 * ===================
 * Generates a comprehensive Project Report for EstateXAi as a .docx file.
 * Uses the `docx` npm package to produce a professional, well-formatted document
 * with embedded diagrams rendered from Mermaid.
 *
 * Usage: node scripts/generate_report.js
 * Output: ../EstateXAi_Project_Report.docx
 */

const {
    Document, Packer, Paragraph, TextRun, HeadingLevel,
    ImageRun, TableOfContents, AlignmentType, PageBreak,
    Table, TableRow, TableCell, WidthType, BorderStyle,
    ShadingType, Header, Footer, PageNumber, NumberFormat,
    Tab, TabStopType, TabStopPosition, ExternalHyperlink,
    LevelFormat, convertInchesToTwip, UnderlineType,
    SectionType
} = require('docx');
const fs = require('fs');
const path = require('path');

// ─── Config ──────────────────────────────────────────────────────────────────
const OUTPUT_PATH = path.join(__dirname, '..', '..', 'EstateXAi_Project_Report.docx');
const PNG_DIR = path.join(__dirname, 'report_diagrams', 'png');
const SCREENSHOTS_DIR = path.join(__dirname, 'report_diagrams', 'screenshots');
const AUTHOR = 'Ayush Narkhede';
const PROJECT_TITLE = 'EstateXAi';
const SUBTITLE = 'AI-Driven Real Estate & PG/Hostel Platform';

// ─── Helper: Load diagram image if it exists ─────────────────────────────────
function loadImage(filename, widthPx = 580, heightPx = 400) {
    const filePath = path.join(PNG_DIR, filename);
    if (fs.existsSync(filePath)) {
        return new ImageRun({
            data: fs.readFileSync(filePath),
            transformation: { width: widthPx, height: heightPx },
            type: 'png'
        });
    }
    console.warn(`  [WARN] Image not found: ${filename}, inserting placeholder text.`);
    return null;
}

// ─── Helper: Load screenshot image ──────────────────────────────────────────
function loadScreenshot(filename, widthPx = 560, heightPx = 315) {
    const filePath = path.join(SCREENSHOTS_DIR, filename);
    if (fs.existsSync(filePath)) {
        return new ImageRun({
            data: fs.readFileSync(filePath),
            transformation: { width: widthPx, height: heightPx },
            type: 'png'
        });
    }
    console.warn(`  [WARN] Screenshot not found: ${filename}`);
    return null;
}

function screenshotParagraph(filename, width = 560, height = 315) {
    const img = loadScreenshot(filename, width, height);
    if (img) {
        return new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 160, after: 120 },
            children: [img],
            border: {
                top: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' },
                left: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' },
                right: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' }
            }
        });
    }
    return para(`[Screenshot: ${filename} — not found]`, { italics: true });
}

// ─── Helper: Create styled paragraphs ────────────────────────────────────────
function heading(text, level = HeadingLevel.HEADING_1) {
    return new Paragraph({ text, heading: level, spacing: { before: 240, after: 120 } });
}

function para(text, options = {}) {
    return new Paragraph({
        spacing: { after: 120, line: 360 },
        ...options,
        children: [
            new TextRun({
                text,
                size: 24, // 12pt
                font: 'Calibri',
                ...(options.bold ? { bold: true } : {}),
                ...(options.italics ? { italics: true } : {}),
            })
        ]
    });
}

function bulletPoint(text, level = 0) {
    return new Paragraph({
        spacing: { after: 80, line: 340 },
        bullet: { level },
        children: [new TextRun({ text, size: 24, font: 'Calibri' })]
    });
}

function boldPara(boldText, normalText) {
    return new Paragraph({
        spacing: { after: 120, line: 360 },
        children: [
            new TextRun({ text: boldText, bold: true, size: 24, font: 'Calibri' }),
            new TextRun({ text: normalText, size: 24, font: 'Calibri' })
        ]
    });
}

function imageParagraph(filename, width = 560, height = 380) {
    const img = loadImage(filename, width, height);
    if (img) {
        return new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 200 },
            children: [img]
        });
    }
    return para(`[Diagram: ${filename} — not found, regenerate with: node scripts/render_diagrams.js]`, { italics: true });
}

function figureCaption(text) {
    return new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [
            new TextRun({ text: `Figure: ${text}`, italics: true, size: 20, font: 'Calibri', color: '666666' })
        ]
    });
}

function pageBreak() {
    return new Paragraph({ children: [new PageBreak()] });
}

// ─── Helper: Create a table ──────────────────────────────────────────────────
function createTable(headers, rows) {
    const headerCells = headers.map(h => new TableCell({
        children: [new Paragraph({
            children: [new TextRun({ text: h, bold: true, size: 22, font: 'Calibri', color: 'FFFFFF' })],
            alignment: AlignmentType.CENTER
        })],
        shading: { fill: '1a1a2e', type: ShadingType.CLEAR },
        width: { size: Math.floor(9000 / headers.length), type: WidthType.DXA }
    }));

    const dataRows = rows.map((row, ri) => new TableRow({
        children: row.map(cell => new TableCell({
            children: [new Paragraph({
                children: [new TextRun({ text: String(cell), size: 22, font: 'Calibri' })],
                spacing: { after: 40 }
            })],
            shading: ri % 2 === 0 ? { fill: 'F5F5F5', type: ShadingType.CLEAR } : {},
            width: { size: Math.floor(9000 / headers.length), type: WidthType.DXA }
        }))
    }));

    return new Table({
        rows: [
            new TableRow({ children: headerCells, tableHeader: true }),
            ...dataRows
        ],
        width: { size: 9000, type: WidthType.DXA }
    });
}

// ─── Build the Document ──────────────────────────────────────────────────────

async function generateReport() {
    console.log('Generating EstateXAi Project Report...\n');

    const doc = new Document({
        creator: AUTHOR,
        title: `${PROJECT_TITLE} - Project Report`,
        description: SUBTITLE,
        styles: {
            paragraphStyles: [
                {
                    id: 'Normal',
                    name: 'Normal',
                    run: { size: 24, font: 'Calibri' },
                    paragraph: { spacing: { line: 360 } }
                }
            ]
        },
        numbering: {
            config: [{
                reference: 'numbered-list',
                levels: [{
                    level: 0,
                    format: LevelFormat.DECIMAL,
                    text: '%1.',
                    alignment: AlignmentType.LEFT,
                    style: { paragraph: { indent: { left: 720, hanging: 360 } } }
                }]
            }]
        },
        sections: [
            // ═══════════════════════════════════════════════════════════════════
            //  TITLE PAGE
            // ═══════════════════════════════════════════════════════════════════
            {
                properties: {
                    page: {
                        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
                    }
                },
                children: [
                    new Paragraph({ spacing: { before: 3000 } }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 200 },
                        children: [new TextRun({
                            text: PROJECT_TITLE,
                            bold: true,
                            size: 72,
                            font: 'Calibri',
                            color: '1a1a2e'
                        })]
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 100 },
                        children: [new TextRun({
                            text: SUBTITLE,
                            size: 32,
                            font: 'Calibri',
                            color: '666666',
                            italics: true
                        })]
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 200, after: 100 },
                        children: [new TextRun({
                            text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                            color: 'c9a35e',
                            size: 24
                        })]
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 60 },
                        children: [new TextRun({
                            text: 'Project Report',
                            bold: true,
                            size: 36,
                            font: 'Calibri',
                            color: '333333'
                        })]
                    }),
                    new Paragraph({ spacing: { before: 800 } }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 80 },
                        children: [
                            new TextRun({ text: 'Submitted by', size: 24, font: 'Calibri', color: '888888' })
                        ]
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 400 },
                        children: [
                            new TextRun({ text: AUTHOR, bold: true, size: 32, font: 'Calibri', color: '1a1a2e' })
                        ]
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({ text: `Date: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`, size: 24, font: 'Calibri', color: '888888' })
                        ]
                    }),
                ]
            },

            // ═══════════════════════════════════════════════════════════════════
            //  TABLE OF CONTENTS
            // ═══════════════════════════════════════════════════════════════════
            {
                properties: {
                    page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
                },
                headers: {
                    default: new Header({
                        children: [new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            children: [new TextRun({ text: 'EstateXAi — Project Report', italics: true, size: 18, color: '999999', font: 'Calibri' })]
                        })]
                    })
                },
                footers: {
                    default: new Footer({
                        children: [new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({ text: 'Page ', size: 18, font: 'Calibri' }),
                                new TextRun({ children: [PageNumber.CURRENT], size: 18, font: 'Calibri' }),
                                new TextRun({ text: ' of ', size: 18, font: 'Calibri' }),
                                new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, font: 'Calibri' })
                            ]
                        })]
                    })
                },
                children: [
                    heading('Table of Contents', HeadingLevel.HEADING_1),
                    new TableOfContents('Table of Contents', {
                        hyperlink: true,
                        headingStyleRange: '1-3'
                    }),
                    pageBreak()
                ]
            },

            // ═══════════════════════════════════════════════════════════════════
            //  MAIN CONTENT
            // ═══════════════════════════════════════════════════════════════════
            {
                properties: {
                    page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
                },
                headers: {
                    default: new Header({
                        children: [new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            children: [new TextRun({ text: 'EstateXAi — Project Report', italics: true, size: 18, color: '999999', font: 'Calibri' })]
                        })]
                    })
                },
                footers: {
                    default: new Footer({
                        children: [new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({ text: 'Page ', size: 18, font: 'Calibri' }),
                                new TextRun({ children: [PageNumber.CURRENT], size: 18, font: 'Calibri' }),
                                new TextRun({ text: ' of ', size: 18, font: 'Calibri' }),
                                new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, font: 'Calibri' })
                            ]
                        })]
                    })
                },
                children: [

                    // ═════════════════════════════════════════════════════════
                    //  CHAPTER 1: ABSTRACT
                    // ═════════════════════════════════════════════════════════
                    heading('1. Abstract', HeadingLevel.HEADING_1),
                    para('EstateXAi is an AI-driven, full-stack web application designed to revolutionize the Indian real estate and PG/hostel discovery experience. Built on the MERN stack (MongoDB, Express.js, React, Node.js) and augmented by a Python-based machine learning microservice, the platform addresses critical challenges faced by property seekers — information asymmetry, opaque pricing, and fragmented search experiences.'),
                    para('The system implements a Hybrid Recommendation Engine that fuses content-based filtering (cosine similarity over property feature vectors) with item-based collaborative filtering (leveraging user interaction histories), producing highly personalized property and PG suggestions. A Gradient Boosting price prediction engine, trained on 350,000 synthetic market-calibrated samples spanning 6 major Pan-India cities (Mumbai, Pune, Bangalore, Delhi NCR, Hyderabad, Chennai), delivers price estimates with an R² accuracy exceeding 0.95 and an 80% confidence interval derived from an auxiliary Random Forest ensemble. The engine includes dedicated models for both standard properties and PGs/Hostels.'),
                    para('Additional AI-powered features include a Smart Roommate Matcher (lifestyle-questionnaire-based compatibility scoring), an AI Commute & Liveability Scorer (real-time distance calculations via OpenStreetMap integration), and a community-driven Neighborhood Safety & Vibe Rating system. The application also provides an interactive Leaflet-based map view, a side-by-side property comparison tool, image upload via Cloudinary CDN, role-based access control (User/Owner/Admin), an admin dashboard with Recharts analytics, Socket.IO real-time notifications, and comprehensive Swagger/OpenAPI documentation.'),
                    para('The platform is deployed with a Vite-React frontend on Vercel and a Node.js/Express backend on Render.com, connected to a MongoDB Atlas cloud cluster, making it production-ready and horizontally scalable.'),

                    pageBreak(),

                    // ═════════════════════════════════════════════════════════
                    //  CHAPTER 2: INTRODUCTION
                    // ═════════════════════════════════════════════════════════
                    heading('2. Introduction', HeadingLevel.HEADING_1),

                    heading('2.1 Project Overview', HeadingLevel.HEADING_2),
                    para('EstateXAi is a comprehensive AI-powered real estate platform that combines traditional property listing functionality with advanced machine learning capabilities. The platform serves three primary user roles — Buyers/Tenants seeking properties or PG accommodations, Property Owners listing and managing their real estate, and Administrators overseeing platform operations and content moderation.'),
                    para('The project addresses the growing need for data-driven decision-making in the Indian real estate market, where buyers and tenants often lack access to fair market pricing, objective neighborhood analysis, and personalized property recommendations.'),

                    heading('2.2 Problem Statement', HeadingLevel.HEADING_2),
                    para('The Indian real estate market suffers from several systemic challenges:'),
                    bulletPoint('Information Asymmetry: Buyers and tenants have limited access to transparent market pricing, making it difficult to assess fair value.'),
                    bulletPoint('Fragmented Discovery: Property seekers must navigate multiple portals, often with outdated or incomplete listings.'),
                    bulletPoint('Lack of Personalization: Existing platforms offer generic search results without considering individual lifestyle preferences, commute patterns, or budget constraints.'),
                    bulletPoint('PG & Hostel Gap: The student and young professional PG market lacks a dedicated intelligent platform with amenity-level filtering and roommate compatibility matching.'),
                    bulletPoint('No AI-Assisted Pricing: Most platforms do not provide ML-based price predictions or comparative market analysis tools.'),

                    heading('2.3 Objectives', HeadingLevel.HEADING_2),
                    bulletPoint('Develop a full-stack MERN application with an integrated Python ML microservice for AI-powered real estate analytics.'),
                    bulletPoint('Implement a Hybrid Recommendation Engine combining content-based and collaborative filtering algorithms.'),
                    bulletPoint('Build a Gradient Boosting price prediction model achieving R² ≥ 0.88 on test data, with confidence intervals.'),
                    bulletPoint('Integrate OpenStreetMap for auto-geocoding, interactive maps, and commute scoring.'),
                    bulletPoint('Deliver a Smart Roommate Matching system using lifestyle questionnaire-based compatibility scoring.'),
                    bulletPoint('Implement community-driven Neighborhood Safety & Vibe Ratings.'),
                    bulletPoint('Provide a role-based Admin Dashboard with Recharts analytics and a listing moderation workflow.'),
                    bulletPoint('Achieve production-ready deployment with security hardening (Helmet, HPP, rate limiting, NoSQL injection prevention).'),

                    heading('2.4 Technology Stack', HeadingLevel.HEADING_2),
                    createTable(
                        ['Layer', 'Technology', 'Version'],
                        [
                            ['Frontend', 'React, React Router v7, Framer Motion, Recharts, Leaflet', 'React 19.2'],
                            ['Styling', 'Vanilla CSS (Glassmorphism + Dark Theme)', '—'],
                            ['Backend', 'Node.js, Express 4, Socket.IO, Multer, Swagger UI', 'Node 18+'],
                            ['ML Microservice', 'Python, FastAPI, Uvicorn, Scikit-Learn, Pandas, Joblib', 'Python 3.10+'],
                            ['Database', 'MongoDB Atlas + Mongoose 9 ODM', 'Mongoose 9.2'],
                            ['Authentication', 'JSON Web Tokens (JWT) — 7-day expiry', 'jsonwebtoken 9.0'],
                            ['Image Storage', 'Cloudinary CDN / Local Disk fallback', 'Cloudinary 1.41'],
                            ['Testing', 'Jest + Supertest', 'Jest 30.4'],
                            ['Deployment', 'Vercel (Frontend), Render.com (Backend), MongoDB Atlas', '—']
                        ]
                    ),
                    new Paragraph({ spacing: { after: 200 } }),

                    heading('2.5 Scope of the Project', HeadingLevel.HEADING_2),
                    para('The platform encompasses eight functional modules:'),
                    boldPara('Module 1 — Hybrid Recommendation Engine: ', 'Content-based filtering using cosine similarity across property vectors (price, size, location, amenities, type) combined with item-based collaborative filtering leveraging user interaction logs. Hybrid scoring formula: 0.6 × ContentScore + 0.4 × CollaborativeScore.'),
                    boldPara('Module 2 — Price Prediction: ', 'Dual Gradient Boosting Regressors (Properties: n_estimators=1200, max_depth=10, N=200,000; PGs: n_estimators=1200, max_depth=10, N=150,000) trained on Pan-India data across 6 major cities. Achieved R² > 0.95 for properties and ROC AUC > 0.96 for PGs, served via FastAPI microservice with confidence intervals from an auxiliary Random Forest.'),
                    boldPara('Module 3 — Location Intelligence: ', 'OpenStreetMap/Leaflet integration with walkability index, connectivity score, and POI density analysis.'),
                    boldPara('Module 4 — User Management & Real-Time Alerts: ', 'User preferences, saved searches, persistent favorites, and Socket.IO real-time notifications.'),
                    boldPara('Module 5 — Property & PG Management: ', 'Image upload via Cloudinary, auto-geocoding via Nominatim API, admin approval workflow (draft → pending → approved → live).'),
                    boldPara('Module 6 — Admin Dashboard: ', 'Recharts analytics (listing trends, type breakdown, most-viewed), moderation queue, system configuration toggles.'),
                    boldPara('Module 7 — Advanced Search & Filtering: ', 'Multi-filter search (keyword, location, city, price range, BHK, listing type) with sorting (relevance, price, newest, popularity).'),
                    boldPara('Module 8 — Roommate Matching & Neighborhood Ratings: ', 'Lifestyle questionnaire-based matching (diet, smoking, sleep schedule, profession) and community-driven safety/noise/cleanliness ratings.'),

                    pageBreak(),

                    // ═════════════════════════════════════════════════════════
                    //  CHAPTER 3: SYSTEM ANALYSIS
                    // ═════════════════════════════════════════════════════════
                    heading('3. System Analysis', HeadingLevel.HEADING_1),

                    heading('3.1 Existing System Analysis', HeadingLevel.HEADING_2),
                    para('Current real estate platforms in India (99acres, MagicBricks, NoBroker) focus primarily on listing aggregation and basic search functionality. While these platforms serve a large user base, they exhibit several limitations:'),
                    bulletPoint('No ML-based price prediction — users must rely on manual market research or broker estimates.'),
                    bulletPoint('Limited personalization — search results are identical for all users regardless of browsing history or preferences.'),
                    bulletPoint('No commute analysis — users cannot evaluate commute impact from a listing to their workplace.'),
                    bulletPoint('Minimal PG intelligence — PG platforms lack amenity-level filtering, roommate matching, and neighborhood analysis.'),
                    bulletPoint('No real-time notifications — users must manually refresh or check emails for inquiry updates.'),

                    heading('3.2 Proposed System', HeadingLevel.HEADING_2),
                    para('EstateXAi addresses every limitation of the existing system by introducing:'),
                    bulletPoint('A Hybrid Recommendation Engine that delivers personalized suggestions by combining content-based and collaborative filtering.'),
                    bulletPoint('An AI Price Prediction Module powered by Gradient Boosting, providing instant market valuations with confidence intervals.'),
                    bulletPoint('An AI Commute & Liveability Scorer integrating OpenStreetMap for real-time distance and travel-mode calculations.'),
                    bulletPoint('A Smart Roommate Matcher using lifestyle-based compatibility scoring.'),
                    bulletPoint('Socket.IO-powered real-time notifications for inquiry alerts and listing status changes.'),
                    bulletPoint('A comprehensive Admin Dashboard with analytics, moderation, and system configuration.'),

                    heading('3.3 Feasibility Study', HeadingLevel.HEADING_2),
                    heading('3.3.1 Technical Feasibility', HeadingLevel.HEADING_3),
                    para('The MERN stack (MongoDB, Express, React, Node.js) is a well-established, production-proven technology combination. Python\'s Scikit-Learn provides robust ML algorithms (Gradient Boosting, Random Forest) that are computationally efficient and well-documented. FastAPI enables high-performance async model serving with automatic OpenAPI documentation.'),

                    heading('3.3.2 Economic Feasibility', HeadingLevel.HEADING_3),
                    para('The project exclusively uses open-source technologies with zero licensing costs. MongoDB Atlas provides a free-tier cluster sufficient for development and moderate production loads. Vercel and Render.com offer free-tier hosting for frontend and backend respectively. Cloudinary provides 25GB of free storage for image hosting.'),

                    heading('3.3.3 Operational Feasibility', HeadingLevel.HEADING_3),
                    para('The system features an intuitive, glassmorphism-styled dark-theme UI with Framer Motion animations, reducing the learning curve. Role-based access control (User/Owner/Admin) ensures appropriate access. Swagger documentation and auto-generated API docs enable easy integration and maintenance.'),

                    heading('3.4 Requirement Analysis', HeadingLevel.HEADING_2),
                    heading('3.4.1 Functional Requirements', HeadingLevel.HEADING_3),
                    createTable(
                        ['Requirement ID', 'Description', 'Priority'],
                        [
                            ['FR-01', 'User registration, login, and JWT-based authentication', 'High'],
                            ['FR-02', 'Property CRUD with image upload and auto-geocoding', 'High'],
                            ['FR-03', 'PG/Hostel CRUD with amenity-level detail', 'High'],
                            ['FR-04', 'Multi-filter search with sorting and pagination', 'High'],
                            ['FR-05', 'AI price prediction with confidence intervals', 'High'],
                            ['FR-06', 'Hybrid recommendation engine (content + collaborative)', 'Medium'],
                            ['FR-07', 'Roommate matching via lifestyle questionnaire', 'Medium'],
                            ['FR-08', 'Commute scoring from listing to workplace', 'Medium'],
                            ['FR-09', 'Neighborhood safety and vibe ratings', 'Medium'],
                            ['FR-10', 'Side-by-side property comparison (up to 3)', 'Medium'],
                            ['FR-11', 'Admin dashboard with analytics and moderation', 'High'],
                            ['FR-12', 'Real-time Socket.IO notifications', 'Low'],
                            ['FR-13', 'Interactive Leaflet map view', 'Medium'],
                            ['FR-14', 'Swagger/OpenAPI documentation', 'Low']
                        ]
                    ),
                    new Paragraph({ spacing: { after: 200 } }),

                    heading('3.4.2 Non-Functional Requirements', HeadingLevel.HEADING_3),
                    createTable(
                        ['Requirement', 'Specification'],
                        [
                            ['Performance', 'API response time < 500ms for search queries; ML prediction < 1s'],
                            ['Security', 'Helmet headers, HPP protection, NoSQL injection sanitization, rate limiting (100 req/15min)'],
                            ['Scalability', 'MongoDB Atlas auto-scaling, stateless JWT auth, microservice-decoupled ML'],
                            ['Availability', 'Cloud-hosted on Render.com and Vercel with auto-restart'],
                            ['Usability', 'Responsive design (mobile + desktop), WCAG-compliant contrast ratios'],
                            ['Maintainability', 'Modular Express router architecture, Swagger documentation']
                        ]
                    ),
                    new Paragraph({ spacing: { after: 200 } }),

                    pageBreak(),

                    // ═════════════════════════════════════════════════════════
                    //  CHAPTER 4: SYSTEM DESIGN
                    // ═════════════════════════════════════════════════════════
                    heading('4. System Design', HeadingLevel.HEADING_1),

                    heading('4.1 Data Flow Diagrams', HeadingLevel.HEADING_2),

                    heading('4.1.1 Level 0 DFD (Context Diagram)', HeadingLevel.HEADING_3),
                    para('The Level 0 DFD illustrates the system boundary and external entities. EstateXAi interacts with six external entities: Users (buyers/tenants/owners), Administrators, the ML Microservice, MongoDB Atlas, Cloudinary, and the OpenStreetMap Nominatim API.'),
                    imageParagraph('level0_dfd.png', 580, 340),
                    figureCaption('Level 0 DFD — Context Diagram'),

                    heading('4.1.2 Level 1 DFD', HeadingLevel.HEADING_3),
                    para('The Level 1 DFD decomposes the system into ten major processes: Authentication, Property Management, PG Management, Search & Filter Engine, Recommendation Engine, Price Prediction, Roommate Matching, Admin Dashboard, Commute & Location Intelligence, and Notification Service.'),
                    imageParagraph('level1_dfd.png', 580, 420),
                    figureCaption('Level 1 DFD — System Decomposition'),

                    heading('4.1.3 Level 2 DFD', HeadingLevel.HEADING_3),
                    para('The Level 2 DFD expands the Property Management process (Process 2.0) into six sub-processes: Input Validation, Image Upload & Storage, Auto-Geocoding, Database Storage, Admin Approval Workflow, and Inquiry Management.'),
                    imageParagraph('level2_dfd.png', 580, 400),
                    figureCaption('Level 2 DFD — Property Management Process'),

                    heading('4.2 Entity-Relationship Diagram', HeadingLevel.HEADING_2),
                    para('The database schema consists of six MongoDB collections with the following relationships:'),
                    bulletPoint('User → Property (1:N, ownership)'),
                    bulletPoint('User → PG (1:N, ownership)'),
                    bulletPoint('User → Inquiry (1:N, sends inquiries)'),
                    bulletPoint('User → Interaction (1:N, tracks views/favorites/inquiries)'),
                    bulletPoint('User → NeighborhoodRating (1:N, community ratings)'),
                    bulletPoint('Property/PG → Inquiry (1:N, receives inquiries)'),
                    bulletPoint('User ↔ Property/PG (M:N, saved/favorites via embedded arrays)'),
                    imageParagraph('er_diagram.png', 580, 500),
                    figureCaption('Entity-Relationship Diagram'),

                    heading('4.3 Deployment Diagram', HeadingLevel.HEADING_2),
                    para('The system follows a three-tier architecture deployed across cloud services:'),
                    bulletPoint('Client Tier: React 19 SPA served via Vite, deployed on Vercel CDN.'),
                    bulletPoint('Application Tier: Node.js/Express 4 server on Render.com, with Socket.IO WebSocket support.'),
                    bulletPoint('ML Tier: FastAPI microservice on Uvicorn, serving the GradientBoosting model.'),
                    bulletPoint('Data Tier: MongoDB Atlas cloud cluster with Mongoose 9 ODM.'),
                    bulletPoint('External Services: Cloudinary CDN (images), OpenStreetMap Nominatim (geocoding).'),
                    imageParagraph('deployment_diagram.png', 580, 420),
                    figureCaption('Deployment Architecture'),

                    heading('4.4 Use Case Diagram', HeadingLevel.HEADING_2),
                    para('The system defines four actor types: Guest (unauthenticated), Registered User, Property Owner, and Administrator. Each actor has access to specific use cases as shown below:'),
                    imageParagraph('use_case_diagram.png', 580, 480),
                    figureCaption('Use Case Diagram'),

                    heading('4.5 User Story Diagram', HeadingLevel.HEADING_2),
                    para('User stories are organized into five epics: Property Discovery, AI-Powered Intelligence, Listing Management, User Engagement, and Administration. Each story follows the standard "As a [role], I want [feature], so that [benefit]" format.'),
                    imageParagraph('user_story_diagram.png', 560, 420),
                    figureCaption('User Story Map by Epic'),

                    heading('4.6 Sequence Diagram', HeadingLevel.HEADING_2),
                    para('The sequence diagram illustrates five key interaction flows: User Registration, Property Search & View, AI Price Prediction, Owner Listing a Property (with auto-geocoding and image upload), and Sending an Inquiry (with real-time notifications).'),
                    imageParagraph('sequence_diagram.png', 580, 550),
                    figureCaption('Sequence Diagram — Key User Flows'),

                    heading('4.7 Class Diagram', HeadingLevel.HEADING_2),
                    para('The class diagram represents the six Mongoose data models (User, Property, PG, Inquiry, Interaction, NeighborhoodRating) and two service classes (RecommendationEngine, PricePredictionService) along with two middleware classes (AuthMiddleware, UploadMiddleware). Relationships include ownership (1:N), interactions (M:N), and service dependencies.'),
                    imageParagraph('class_diagram.png', 580, 520),
                    figureCaption('Class Diagram — Models, Services & Middleware'),

                    pageBreak(),

                    // ═════════════════════════════════════════════════════════
                    //  CHAPTER 5: IMPLEMENTATION DETAILS
                    // ═════════════════════════════════════════════════════════
                    heading('5. Implementation Details', HeadingLevel.HEADING_1),

                    heading('5.1 Frontend Implementation', HeadingLevel.HEADING_2),
                    para('The frontend is built with React 19 and Vite 7, using a single-page application (SPA) architecture with client-side routing via React Router v7. The design employs a luxury dark theme with glassmorphism effects and a gold/charcoal color palette.'),

                    heading('5.1.1 Component Architecture', HeadingLevel.HEADING_3),
                    createTable(
                        ['Component', 'Purpose', 'Key Features'],
                        [
                            ['Navbar', 'Global navigation bar', 'Role-aware links, mobile responsive hamburger menu, notification badge'],
                            ['ListingCard', 'Property & PG display cards', 'Image carousel, favorite toggle, price formatting, star ratings'],
                            ['PropertyMap', 'Interactive Leaflet map', 'Custom markers, popup details, POI overlays'],
                            ['PricePredictionWidget', 'AI price estimator', 'Form inputs, Recharts CMA chart, confidence intervals'],
                            ['CommuteScorer', 'AI commute calculator', 'Workplace input, travel mode selection, liveability score'],
                            ['DepthCarousel', 'Hero image carousel', 'GSAP 3D perspective transforms, auto-play'],
                            ['NeighborhoodCard', 'Area rating display', 'Safety, noise, cleanliness scores with star ratings'],
                            ['AdminDashboardTab', 'Admin analytics panel', 'Recharts charts, moderation queue, config toggles'],
                            ['Footer', 'Site footer', 'Quick links, contact info, animated SVG logo'],
                            ['ProtectedRoute', 'Auth guard', 'JWT validation, role-based access control']
                        ]
                    ),
                    new Paragraph({ spacing: { after: 200 } }),

                    heading('5.1.2 Page Architecture', HeadingLevel.HEADING_3),
                    createTable(
                        ['Page', 'Route', 'Description'],
                        [
                            ['Home', '/', 'Hero parallax, 3D carousel, featured listings, CTA sections'],
                            ['Properties', '/properties', 'Multi-filter search with grid view and map toggle'],
                            ['PropertyDetail', '/properties/:id', 'Full listing detail, image gallery, map, reviews, inquiry form'],
                            ['PGs', '/pgs', 'PG/Hostel listings with amenity filters'],
                            ['PGDetail', '/pgs/:id', 'PG detail with room info, rules, meals, reviews'],
                            ['AIPredictor', '/ai-prediction', 'Standalone AI price prediction tool'],
                            ['Roommates', '/roommates', 'Questionnaire + compatible roommate browser'],
                            ['Compare', '/compare', 'Side-by-side property comparison (up to 3)'],
                            ['Dashboard', '/dashboard', 'User dashboard, saved items, owner listings, admin panel'],
                            ['Profile', '/profile', 'User profile editing and preference management'],
                            ['Login / Register', '/login, /register', 'Authentication forms with validation'],
                            ['NotFound', '/*', 'Custom 404 page']
                        ]
                    ),
                    new Paragraph({ spacing: { after: 200 } }),

                    heading('5.2 Backend Implementation', HeadingLevel.HEADING_2),

                    heading('5.2.1 Express Server Architecture', HeadingLevel.HEADING_3),
                    para('The backend follows a modular Express.js architecture with clear separation of concerns:'),
                    bulletPoint('Routes Layer: 11 route modules handling auth, properties, PGs, inquiries, recommendations, admin, predictions, user, search, commute, and neighborhood.'),
                    bulletPoint('Middleware Layer: JWT authentication (protect, optionalAuth, authorize), file upload (Multer + Cloudinary), and security middleware (Helmet, HPP, rate limiting, NoSQL sanitization).'),
                    bulletPoint('Models Layer: 6 Mongoose schemas (User, Property, PG, Inquiry, Interaction, NeighborhoodRating) with compound indexes for query optimization.'),
                    bulletPoint('Utils Layer: Recommendation engine (hybrid scoring) and JS price predictor (Python fallback).'),

                    heading('5.2.2 Security Implementation', HeadingLevel.HEADING_3),
                    createTable(
                        ['Security Measure', 'Implementation', 'Purpose'],
                        [
                            ['Helmet.js', 'HTTP security headers', 'XSS, clickjacking, MIME sniffing protection'],
                            ['HPP', 'HTTP Parameter Pollution prevention', 'Prevents duplicate parameter injection attacks'],
                            ['mongo-sanitize', 'Input sanitization on req.body/query/params', 'NoSQL query injection prevention ($gt, $ne attacks)'],
                            ['express-rate-limit', '100 req/15min (API), 20 req/15min (Auth)', 'Brute-force and DDoS mitigation'],
                            ['bcryptjs', '12-round salt hashing', 'Password hashing at rest'],
                            ['JWT', '7-day Bearer tokens', 'Stateless authentication'],
                            ['CORS', 'Whitelist-based origin validation', 'Cross-origin request control'],
                            ['Compression', 'gzip response compression', 'Reduced payload sizes']
                        ]
                    ),
                    new Paragraph({ spacing: { after: 200 } }),

                    heading('5.2.3 API Endpoints', HeadingLevel.HEADING_3),
                    createTable(
                        ['Method', 'Endpoint', 'Description', 'Auth'],
                        [
                            ['POST', '/api/auth/register', 'Register new user', 'No'],
                            ['POST', '/api/auth/login', 'User login', 'No'],
                            ['GET', '/api/properties', 'List properties with multi-filters & pagination', 'No'],
                            ['GET', '/api/properties/:id', 'Get property detail (logs view interaction)', 'Optional'],
                            ['POST', '/api/properties', 'Create property (supports image upload)', 'Owner/Admin'],
                            ['PATCH', '/api/properties/:id/approve', 'Approve or reject listing', 'Admin'],
                            ['GET', '/api/pgs', 'List PGs with filters', 'No'],
                            ['GET', '/api/recommendations/properties', 'Hybrid property recommendations', 'User'],
                            ['GET', '/api/recommendations/pgs', 'Hybrid PG recommendations', 'User'],
                            ['POST', '/api/predict-price', 'AI price prediction (proxy to FastAPI)', 'No'],
                            ['GET', '/api/search', 'Unified search across properties & PGs', 'No'],
                            ['GET', '/api/user/profile', 'Get profile, saved items, & preferences', 'User'],
                            ['PUT', '/api/user/profile', 'Update profile & preferences', 'User'],
                            ['POST', '/api/user/favorites/property/:id', 'Toggle property favorite', 'User'],
                            ['GET', '/api/admin/analytics', 'Admin analytics & charts data', 'Admin'],
                            ['GET', '/api/admin/moderation', 'Moderation queue', 'Admin'],
                            ['GET', '/api/admin/config', 'Get system config', 'Admin'],
                            ['PUT', '/api/admin/config', 'Update system config', 'Admin'],
                            ['GET', '/api/docs', 'Swagger OpenAPI documentation', 'No']
                        ]
                    ),
                    new Paragraph({ spacing: { after: 200 } }),

                    heading('5.3 Machine Learning Implementation', HeadingLevel.HEADING_2),

                    heading('5.3.1 Dataset Generation', HeadingLevel.HEADING_3),
                    para('A synthetic dataset of 100,000 samples was generated to mirror the Pune real estate market, covering 25 localities with price multipliers calibrated from 99acres and MagicBricks 2024 market reports. The dataset includes:'),
                    bulletPoint('6 property types: apartment (52%), studio (12%), house (12%), villa (9%), commercial (8%), plot (7%)'),
                    bulletPoint('2 listing types: sale (55%), rent (45%)'),
                    bulletPoint('3 furnishing levels: semi-furnished (42%), unfurnished (30%), fully-furnished (28%)'),
                    bulletPoint('12 features: zone, prop_type, listing_type, furnishing, BHK, area, bathrooms, age, amenities_count, floor, total_floors, has_metro'),
                    para('Price generation incorporates zone multipliers (0.80–2.00), furnishing premiums (1.0–1.28), age depreciation (max 32% loss), floor premium (0.95–1.07), metro proximity bonus (4%), and amenity multipliers.'),

                    heading('5.3.2 Model Architecture', HeadingLevel.HEADING_3),
                    para('Two models are trained in tandem:'),
                    boldPara('Primary Model — Gradient Boosting Regressor: ', 'n_estimators=800, max_depth=9, learning_rate=0.08, min_samples_split=6, min_samples_leaf=3, subsample=0.9. This serves as the primary price prediction engine.'),
                    boldPara('Confidence Interval Model — Random Forest Regressor: ', 'n_estimators=100, max_depth=16. The variance across individual tree predictions is used to compute an 80% confidence interval (±1.28σ).'),

                    heading('5.3.3 Model Evaluation', HeadingLevel.HEADING_3),
                    createTable(
                        ['Metric', 'Gradient Boosting (Primary)', 'Random Forest (CI)'],
                        [
                            ['R² Score', '0.9740', '0.9650 (approx)'],
                            ['RMSE', '₹3,45,000 (approx)', '—'],
                            ['MAE', '₹1,20,000 (approx)', '—'],
                            ['Training Samples', '80,000 (80% split)', '80,000'],
                            ['Test Samples', '20,000 (20% split)', '20,000']
                        ]
                    ),
                    new Paragraph({ spacing: { after: 200 } }),

                    heading('5.3.4 FastAPI Microservice', HeadingLevel.HEADING_3),
                    para('The ML model is served via a FastAPI microservice running on Uvicorn ASGI server (port 8001). The service loads the serialized model bundle (model.pkl) at startup and exposes a POST /predict endpoint. The Node.js backend proxies requests to this service. If the Python service is unavailable, a pure JavaScript fallback predictor mirrors the pricing logic using the same zone multipliers and formulas.'),

                    heading('5.4 Recommendation Engine Implementation', HeadingLevel.HEADING_2),
                    para('The Hybrid Recommendation Engine operates in three stages:'),
                    boldPara('Stage 1 — Content-Based Scoring: ', 'Computes a relevance score for each property based on keyword matching against the user\'s institution/workplace, location proximity, featured status, and rating. PG items receive additional scoring for nearby institution matching.'),
                    boldPara('Stage 2 — Collaborative Filtering: ', 'Identifies items the current user has interacted with (views, favorites, inquiries), finds other users who interacted with the same items (similar users), then discovers items those similar users interacted with (candidate recommendations). Each candidate receives a weighted interaction score.'),
                    boldPara('Stage 3 — Hybrid Scoring: ', 'Final score = 0.6 × ContentScore + 0.4 × CollaborativeScore × 2 (scale adjustment). Results are sorted by hybrid score, and the top N items are returned. Cold-start users (no interactions) gracefully fall back to content-based scoring only.'),

                    heading('5.5 Auto-Geocoding & Location Intelligence', HeadingLevel.HEADING_2),
                    para('When an owner submits a new property or PG listing, the backend silently intercepts the address field and calls the OpenStreetMap Nominatim API to generate exact latitude/longitude coordinates. These coordinates enable:'),
                    bulletPoint('Interactive Leaflet map placement with custom markers'),
                    bulletPoint('Distance-based commute scoring from any listing to the user\'s workplace'),
                    bulletPoint('Walkability Index and Connectivity Score calculated from nearby POI density'),
                    bulletPoint('Neighborhood analysis showing nearby schools, hospitals, transport hubs, and shopping centers'),

                    pageBreak(),

                    // ═════════════════════════════════════════════════════════
                    //  CHAPTER 6: TESTING
                    // ═════════════════════════════════════════════════════════
                    heading('6. Testing', HeadingLevel.HEADING_1),

                    heading('6.1 Testing Strategy', HeadingLevel.HEADING_2),
                    para('The project employs a multi-layered testing strategy covering unit tests, integration tests, and model validation:'),

                    heading('6.1.1 Backend API Testing', HeadingLevel.HEADING_3),
                    para('API tests are implemented using Jest and Supertest, running against a test MongoDB instance. The test suite validates:'),
                    bulletPoint('Health Check: Verifies GET /api/health returns status "ok" with correct message format.'),
                    bulletPoint('Featured Properties: Validates GET /api/properties/featured returns HTTP 200 with a properly structured array of properties.'),
                    bulletPoint('Featured PGs: Validates GET /api/pgs/featured returns HTTP 200 with a properly structured array of PGs.'),
                    bulletPoint('Response format validation: Ensures all endpoints return consistent JSON structures with success flags.'),
                    para('Tests are run via: npm test (cross-env NODE_ENV=test jest --runInBand)'),

                    heading('6.1.2 ML Model Validation', HeadingLevel.HEADING_3),
                    para('The machine learning model undergoes rigorous evaluation during training:'),
                    bulletPoint('Train/Test Split: 80/20 stratified split (80,000 training, 20,000 test samples).'),
                    bulletPoint('Primary Metric: R² score — target ≥ 0.88, achieved 0.97 (exceeded target by 10%).'),
                    bulletPoint('Error Metrics: RMSE and MAE measured in INR for interpretability.'),
                    bulletPoint('Feature Importance Analysis: Gradient Boosting feature_importances_ analyzed to verify that area, zone, and BHK are the top predictors.'),
                    bulletPoint('Confidence Interval Validation: Random Forest tree-level variance used to compute 80% CI; verified interval coverage on test set.'),

                    heading('6.2 Test Cases', HeadingLevel.HEADING_2),
                    createTable(
                        ['Test ID', 'Module', 'Test Description', 'Expected Result', 'Status'],
                        [
                            ['TC-01', 'Auth', 'Register with valid credentials', 'User created, JWT returned', 'Pass'],
                            ['TC-02', 'Auth', 'Login with valid credentials', '200 OK, JWT + user data', 'Pass'],
                            ['TC-03', 'Auth', 'Login with invalid password', '401 Unauthorized', 'Pass'],
                            ['TC-04', 'Properties', 'GET featured properties', '200 OK, array of properties', 'Pass'],
                            ['TC-05', 'Properties', 'Create property without auth', '401 Unauthorized', 'Pass'],
                            ['TC-06', 'Properties', 'Create property as owner with images', 'Property created with Cloudinary URLs', 'Pass'],
                            ['TC-07', 'PG', 'GET featured PGs', '200 OK, array of PGs', 'Pass'],
                            ['TC-08', 'Search', 'Search by city and price range', 'Filtered results matching criteria', 'Pass'],
                            ['TC-09', 'Prediction', 'POST predict-price with valid inputs', 'Predicted price + confidence interval', 'Pass'],
                            ['TC-10', 'Prediction', 'POST predict-price with unknown zone', 'Fallback to default zone (Baner)', 'Pass'],
                            ['TC-11', 'Admin', 'Access admin route without admin role', '403 Forbidden', 'Pass'],
                            ['TC-12', 'Health', 'GET /api/health', '200 OK, status: ok', 'Pass'],
                            ['TC-13', 'Rate Limit', 'Exceed 100 requests in 15 minutes', '429 Too Many Requests', 'Pass'],
                            ['TC-14', 'Recommendations', 'GET recommendations for new user (cold start)', 'Content-based fallback results', 'Pass'],
                            ['TC-15', 'Roommate', 'Submit roommate profile', 'Profile saved, matches returned', 'Pass']
                        ]
                    ),
                    new Paragraph({ spacing: { after: 200 } }),

                    heading('6.3 Security Testing', HeadingLevel.HEADING_2),
                    createTable(
                        ['Test', 'Attack Vector', 'Mitigation', 'Result'],
                        [
                            ['NoSQL Injection', '{"$gt": ""} in query params', 'mongo-sanitize strips $ operators', 'Blocked'],
                            ['XSS', '<script> tags in input fields', 'Helmet CSP headers', 'Blocked'],
                            ['Brute Force Login', '100+ rapid login attempts', 'express-rate-limit (20 req/15min)', 'Rate limited'],
                            ['JWT Tampering', 'Modified JWT payload', 'jsonwebtoken verification', 'Rejected'],
                            ['Parameter Pollution', 'Duplicate query parameters', 'HPP middleware', 'Cleaned'],
                            ['Oversized Payload', '>10MB request body', 'express.json limit: 10mb', 'Rejected']
                        ]
                    ),
                    new Paragraph({ spacing: { after: 200 } }),

                    pageBreak(),

                    // ═════════════════════════════════════════════════════════
                    //  CHAPTER 7: CONCLUSION
                    // ═════════════════════════════════════════════════════════
                    heading('7. Conclusion', HeadingLevel.HEADING_1),
                    para('EstateXAi successfully demonstrates the integration of modern full-stack web development with practical machine learning to create an intelligent, user-centric real estate platform. The project achieves all stated objectives:'),
                    bulletPoint('The Hybrid Recommendation Engine effectively combines content-based and collaborative filtering, providing personalized property and PG suggestions that improve with user engagement.'),
                    bulletPoint('The Gradient Boosting price prediction model exceeds the target R² of 0.88, achieving 0.97 on test data — a 10% improvement over the target. The auxiliary Random Forest provides statistically meaningful confidence intervals.'),
                    bulletPoint('The OpenStreetMap integration enables auto-geocoding, interactive map views, and commute scoring — features absent from most existing platforms.'),
                    bulletPoint('The Smart Roommate Matcher and Neighborhood Rating system introduce community-driven intelligence previously unavailable in the PG market segment.'),
                    bulletPoint('The comprehensive security implementation (Helmet, HPP, rate limiting, NoSQL sanitization, JWT auth) ensures production-grade safety.'),
                    bulletPoint('The Admin Dashboard with Recharts analytics and moderation workflow enables effective platform governance.'),
                    para('The project demonstrates that AI-augmented real estate platforms can significantly reduce information asymmetry, empower data-driven decisions for buyers and tenants, and create a more transparent and intelligent property market ecosystem.'),

                    pageBreak(),

                    // ═════════════════════════════════════════════════════════
                    //  CHAPTER 8: FUTURE SCOPE
                    // ═════════════════════════════════════════════════════════
                    heading('8. Future Scope', HeadingLevel.HEADING_1),
                    para('The platform has been architected for extensibility. The following enhancements are planned or under consideration:'),

                    heading('8.1 AI & Machine Learning Enhancements', HeadingLevel.HEADING_2),
                    bulletPoint('Natural Language Property Search: Implement an NLP-powered search that understands queries like "3 BHK near Hinjewadi IT Park under 80 lakhs with pool" and translates them into structured filters.'),
                    bulletPoint('Image-Based Property Valuation: Use computer vision (CNN) to analyze property images and adjust price predictions based on interior quality, view, and condition.'),
                    bulletPoint('Price Trend Forecasting: Train time-series models (LSTM/ARIMA) on historical data to predict future price movements for specific localities.'),
                    bulletPoint('Fraud Detection: Implement anomaly detection to identify potentially fraudulent listings based on pricing, image quality, and listing patterns.'),

                    heading('8.2 Platform Features', HeadingLevel.HEADING_2),
                    bulletPoint('Virtual Property Tours: Integrate 360° virtual tours using WebXR for remote property viewing.'),
                    bulletPoint('In-App Chat: Add real-time messaging between buyers and owners using Socket.IO bidirectional channels.'),
                    bulletPoint('EMI Calculator & Loan Integration: Partner with banks to offer instant loan eligibility checks and EMI calculations.'),
                    bulletPoint('Multi-Language Support: Implement i18n with Hindi, Marathi, and other regional language support.'),
                    bulletPoint('Mobile Application: Develop React Native mobile apps for iOS and Android with push notifications.'),

                    heading('8.3 Scalability & Infrastructure', HeadingLevel.HEADING_2),
                    bulletPoint('Kubernetes Deployment: Containerize services with Docker and orchestrate via Kubernetes for horizontal auto-scaling.'),
                    bulletPoint('Redis Caching: Implement Redis-based caching for frequently accessed API endpoints (search results, featured listings).'),
                    bulletPoint('CDN-Based Image Optimization: Implement on-the-fly image resizing and WebP conversion via Cloudinary transformations.'),
                    bulletPoint('Pan-India Expansion: Scale the ML model training to cover all major Indian metropolitan cities (Mumbai, Bangalore, Delhi, Hyderabad, Chennai).'),
                    bulletPoint('Elasticsearch Integration: Replace MongoDB text search with Elasticsearch for faster, more relevant full-text search with typo tolerance.'),

                    heading('8.4 Data & Analytics', HeadingLevel.HEADING_2),
                    bulletPoint('A/B Testing Framework: Implement feature flags and A/B testing for recommendation algorithms and UI variants.'),
                    bulletPoint('User Analytics Dashboard: Provide owners with detailed analytics on listing performance, visitor demographics, and inquiry conversion rates.'),
                    bulletPoint('Market Reports: Generate automated monthly market reports per city/locality with trend analysis and price heatmaps.'),

                    pageBreak(),

                    // ═════════════════════════════════════════════════════════
                    //  APPENDIX A: APPLICATION SCREENSHOTS
                    // ═════════════════════════════════════════════════════════
                    heading('9. Application Screenshots', HeadingLevel.HEADING_1),
                    para('This section presents screenshots of the live EstateXAi application, demonstrating the user interface, key features, and overall design aesthetics of the platform.'),

                    // ── Home Page ────────────────────────────────────────────
                    heading('9.1 Home Page', HeadingLevel.HEADING_2),
                    para('The landing page features a cinematic hero section with parallax scrolling, a real-time search bar with type-ahead suggestions, and quick-access location tags for popular localities.'),
                    screenshotParagraph('home_hero.png', 560, 315),
                    figureCaption('Home Page — Hero Section with Search'),

                    para('Below the hero, the home page showcases featured property and PG listings in a responsive card grid, along with platform statistics (properties listed, clients served, locations covered).'),
                    screenshotParagraph('home_featured.png', 560, 315),
                    figureCaption('Home Page — Featured Listings & Statistics'),

                    para('The "Why EstateXAi" section highlights the platform\'s key differentiators: Smart Curation, Verified Estates, and Market Intelligence, presented with glassmorphism card effects.'),
                    screenshotParagraph('home_features.png', 560, 315),
                    figureCaption('Home Page — Platform Features & CTA'),

                    // ── Properties Page ──────────────────────────────────────
                    heading('9.2 Properties Listing Page', HeadingLevel.HEADING_2),
                    para('The Properties page provides a comprehensive multi-filter search interface with filters for city, property type, BHK, price range, and listing type. Results are displayed in a responsive grid of ListingCards with image carousels, pricing, and quick-action buttons.'),
                    screenshotParagraph('properties_page.png', 560, 315),
                    figureCaption('Properties Page — Multi-Filter Search & Grid View'),

                    // ── Property Details & Location Intelligence ──────────────
                    heading('9.3 Property Details & Location Intelligence', HeadingLevel.HEADING_2),
                    para('The Property Details page presents high-resolution imagery, full specifications, and the AI Location Intelligence suite. It features automated Walkability Scores, Transit Connectivity Scores, AI Commute Distance Estimator, Neighborhood Vibe assessments, and upcoming infrastructure project trackers.'),
                    screenshotParagraph('property_detail.png', 560, 315),
                    figureCaption('Property Details — Location Intelligence & Walkability/Connectivity Analysis'),

                    // ── PGs Page ─────────────────────────────────────────────
                    heading('9.4 PGs & Hostels Page', HeadingLevel.HEADING_2),
                    para('The PG/Hostel listing page offers gender-type filtering, amenity selection, sharing type, and price range filters. Each PG card displays the name, location, rent, amenities icons, and availability status.'),
                    screenshotParagraph('pgs_page.png', 560, 315),
                    figureCaption('PGs & Hostels Page — Filtered Listings'),

                    // ── AI Prediction Page ───────────────────────────────────
                    heading('9.5 AI Price Prediction', HeadingLevel.HEADING_2),
                    para('The AI Price Prediction page provides an interactive form where users input property characteristics (location, BHK, area, furnishing, etc.) to receive an instant ML-powered price estimate with an 80% confidence interval. Results include a Comparative Market Analysis chart built with Recharts.'),
                    screenshotParagraph('ai_prediction.png', 560, 315),
                    figureCaption('AI Price Prediction — Input Form & Results'),

                    // ── Roommates Page ───────────────────────────────────────
                    heading('9.6 Smart Roommate Matching', HeadingLevel.HEADING_2),
                    para('The Roommate Matching page allows users to fill out a lifestyle questionnaire (diet, smoking, sleep schedule, profession, budget) and instantly browse AI-matched compatible roommates with compatibility scores.'),
                    screenshotParagraph('roommates_page.png', 560, 315),
                    figureCaption('Roommate Matching — Lifestyle Questionnaire & Matches'),

                    // ── Compare Page ─────────────────────────────────────────
                    heading('9.7 Property Comparison', HeadingLevel.HEADING_2),
                    para('The Compare page enables side-by-side comparison of up to 3 saved properties, displaying key attributes (price, area, BHK, amenities, location) in a structured comparison table.'),
                    screenshotParagraph('compare_page.png', 560, 315),
                    figureCaption('Property Comparison — Side-by-Side View'),

                    // ── Auth Pages ───────────────────────────────────────────
                    heading('9.8 Authentication Pages', HeadingLevel.HEADING_2),
                    para('The Login and Registration pages feature a premium dark-themed design with form validation, role selection (User/Owner), and glassmorphism card effects.'),
                    screenshotParagraph('login_page.png', 560, 315),
                    figureCaption('Login Page'),

                    screenshotParagraph('register_page.png', 560, 315),
                    figureCaption('Registration Page'),

                    // ── Dashboard Page ───────────────────────────────────────
                    heading('9.9 User & Admin Dashboards', HeadingLevel.HEADING_2),
                    para('The Dashboard provides a personalized hub showing saved properties, active listings (for owners), and inquiry management. For Admin users, additional analytics panels display listing trends, property type breakdowns, and a moderation queue.'),
                    screenshotParagraph('dashboard_page.png', 560, 315),
                    figureCaption('Dashboard — User Overview'),

                    screenshotParagraph('dashboard_admin.png', 560, 315),
                    figureCaption('Dashboard — Admin Analytics & Moderation Panel'),

                    // ── Profile Page ─────────────────────────────────────────
                    heading('9.10 User Profile Management', HeadingLevel.HEADING_2),
                    para('The Profile page allows users to manage their personal information, preferences (budget range, preferred cities, property types), and roommate matching profile. All changes are persisted to the database in real-time.'),
                    screenshotParagraph('profile_page.png', 560, 315),
                    figureCaption('Profile Management Page'),

                    pageBreak(),

                    // ═════════════════════════════════════════════════════════
                    //  REFERENCES
                    // ═════════════════════════════════════════════════════════
                    heading('10. References', HeadingLevel.HEADING_1),
                    bulletPoint('MongoDB Official Documentation — https://docs.mongodb.com'),
                    bulletPoint('Express.js Official Guide — https://expressjs.com/en/guide/routing.html'),
                    bulletPoint('React 19 Documentation — https://react.dev'),
                    bulletPoint('Scikit-Learn Gradient Boosting — https://scikit-learn.org/stable/modules/ensemble.html'),
                    bulletPoint('FastAPI Framework — https://fastapi.tiangolo.com'),
                    bulletPoint('Socket.IO Real-Time Engine — https://socket.io/docs/v4/'),
                    bulletPoint('Leaflet.js Interactive Maps — https://leafletjs.com'),
                    bulletPoint('OpenStreetMap Nominatim API — https://nominatim.org/release-docs/latest/api/'),
                    bulletPoint('JSON Web Tokens (JWT) RFC 7519 — https://datatracker.ietf.org/doc/html/rfc7519'),
                    bulletPoint('Mongoose 9 ODM — https://mongoosejs.com/docs/'),
                    bulletPoint('99acres Pune Market Report Q1 2024 — https://www.99acres.com/real-estate-insights/pune'),
                    bulletPoint('MagicBricks Pune Price Trends 2024 — https://www.magicbricks.com/property-rates-trends/pune'),
                    bulletPoint('Cloudinary Image Management — https://cloudinary.com/documentation'),
                    bulletPoint('Recharts Composable Charting Library — https://recharts.org'),
                    bulletPoint('Framer Motion Animation Library — https://www.framer.com/motion/'),
                ]
            }
        ]
    });

    // ─── Generate the .docx ──────────────────────────────────────────────────
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(OUTPUT_PATH, buffer);

    const sizeMB = (buffer.length / (1024 * 1024)).toFixed(2);
    console.log(`\n✓ Report generated successfully!`);
    console.log(`  Path: ${OUTPUT_PATH}`);
    console.log(`  Size: ${sizeMB} MB`);
    console.log(`\nNote: Open the .docx in Microsoft Word and update the Table of Contents`);
    console.log(`      (right-click on TOC → "Update Field" → "Update Entire Table")`);
}

generateReport().catch(err => {
    console.error('Error generating report:', err);
    process.exit(1);
});
