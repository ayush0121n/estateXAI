/* eslint-disable */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Receipt, Shield, ClipboardCheck, Download, ChevronDown, ChevronRight, CheckCircle2, Building2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { fadeIn, staggerContainer, staggerItem } from '../utils/animations';

const STATES = ['Maharashtra', 'Karnataka', 'Telangana', 'Delhi', 'Tamil Nadu', 'Gujarat', 'West Bengal', 'Rajasthan', 'Uttar Pradesh', 'Madhya Pradesh'];

function AgreementGenerator() {
    const [form, setForm] = useState({ landlordName: '', tenantName: '', address: '', city: '', state: 'Maharashtra', rent: '', deposit: '', startDate: '', duration: '11', includeNotice: true });
    const [generated, setGenerated] = useState(false);
    const s = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const generateAgreement = () => {
        if (!form.landlordName || !form.tenantName || !form.address || !form.rent) return;
        setGenerated(true);
    };

    const downloadAgreement = () => {
        const doc = new jsPDF({ unit: 'mm', format: 'a4' });
        const pageW = doc.internal.pageSize.getWidth();
        const margin = 15;
        const contentW = pageW - margin * 2;
        let y = 12;

        const GOLD = [201, 163, 94];
        const DARK = [18, 24, 32];
        const MUTED = [90, 90, 90];
        const CREAM = [245, 241, 235];
        const BORDER = [224, 217, 208];

        const rentNum = Number(form.rent) || 0;
        const depNum = Number(form.deposit) || 0;
        const dateStr = form.startDate
            ? new Date(form.startDate).toLocaleDateString('en-IN')
            : new Date().toLocaleDateString('en-IN');

        // —— Brand Seal helper ——
        const drawSeal = (cx, cy, r = 12, label = 'AUTHENTIC') => {
            doc.setDrawColor(...GOLD);
            doc.setLineWidth(1.2);
            doc.circle(cx, cy, r);
            doc.setLineWidth(0.4);
            doc.circle(cx, cy, r - 2);
            doc.setDrawColor(223, 194, 136);
            doc.setLineWidth(0.25);
            doc.circle(cx, cy, r - 3.2);
            doc.setFillColor(253, 249, 242);
            doc.circle(cx, cy, r - 3.6, 'F');
            // diamond
            doc.setFillColor(...GOLD);
            doc.setDrawColor(163, 130, 70);
            const s = 2.8;
            doc.triangle(cx, cy + s, cx + s * 0.4, cy + s * 0.3, cx + s, cy, 'F');
            doc.triangle(cx, cy + s, cx - s * 0.4, cy + s * 0.3, cx - s, cy, 'F');
            doc.triangle(cx, cy - s, cx + s * 0.4, cy - s * 0.3, cx + s, cy, 'F');
            doc.triangle(cx, cy - s, cx - s * 0.4, cy - s * 0.3, cx - s, cy, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(4.5);
            doc.setTextColor(163, 130, 70);
            doc.text('EstateXAI', cx, cy - r + 4.5, { align: 'center' });
            doc.setFontSize(3.8);
            doc.text(label, cx, cy + r - 3.5, { align: 'center' });
            doc.setFontSize(3.5);
            doc.setTextColor(...MUTED);
            doc.text('2026', cx, cy + 3.5, { align: 'center' });
        };

        // Security top strip
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6);
        doc.setTextColor(...MUTED);
        doc.text('SECURE DOCUMENT  •  EstateXAI Digital Rental Toolkit', margin, 8);
        doc.text('DO NOT TAMPER', pageW - margin, 8, { align: 'right' });
        doc.setDrawColor(...GOLD);
        doc.setLineWidth(0.3);
        doc.line(margin, 9.5, pageW - margin, 9.5);

        // Header
        y = 16;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...GOLD);
        doc.text('EstateXAI', pageW / 2, y, { align: 'center' });
        y += 4.5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...MUTED);
        doc.text('DIGITAL RENTAL TOOLKIT  •  OFFICIAL DOCUMENT', pageW / 2, y, { align: 'center' });
        y += 3.5;
        doc.setDrawColor(...GOLD);
        doc.setLineWidth(1.1);
        doc.line(margin, y, pageW - margin, y);
        y += 7;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(15);
        doc.setTextColor(...DARK);
        doc.text('RENTAL / LEASE AGREEMENT', pageW / 2, y, { align: 'center' });
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...MUTED);
        doc.text(`Executed on ${dateStr}  |  Jurisdiction: ${form.state}, India`, pageW / 2, y, { align: 'center' });
        y += 3.5;
        doc.setDrawColor(...BORDER);
        doc.setLineWidth(0.35);
        doc.line(margin, y, pageW - margin, y);
        y += 7;

        // 1. Parties
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(...GOLD);
        doc.text('1. PARTIES TO THE AGREEMENT', margin, y);
        y += 5;

        const boxH = 20;
        doc.setFillColor(...CREAM);
        doc.setDrawColor(...GOLD);
        doc.setLineWidth(0.5);
        doc.roundedRect(margin, y, contentW / 2 - 2, boxH, 1.5, 1.5, 'FD');
        doc.roundedRect(margin + contentW / 2 + 2, y, contentW / 2 - 2, boxH, 1.5, 1.5, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(...DARK);
        doc.text('LANDLORD / OWNER', margin + 3, y + 4.5);
        doc.text('TENANT', margin + contentW / 2 + 5, y + 4.5);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.text(form.landlordName || '—', margin + 3, y + 10);
        doc.text(form.tenantName || '—', margin + contentW / 2 + 5, y + 10);
        doc.setFontSize(7);
        doc.setTextColor(...MUTED);
        doc.text('(Hereinafter "Landlord")', margin + 3, y + 15);
        doc.text('(Hereinafter "Tenant")', margin + contentW / 2 + 5, y + 15);
        y += boxH + 7;

        // 2. Property
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(...GOLD);
        doc.text('2. PROPERTY DETAILS', margin, y);
        y += 4.5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(...DARK);
        const addr = `${form.address}${form.city ? ', ' + form.city : ''}, ${form.state}, India`;
        const addrLines = doc.splitTextToSize(`Address: ${addr}`, contentW);
        doc.text(addrLines, margin, y);
        y += addrLines.length * 4 + 2;
        const propLines = doc.splitTextToSize(
            'The Landlord lets and the Tenant takes on rent the above residential premises ("Property") on the terms below.',
            contentW
        );
        doc.text(propLines, margin, y);
        y += propLines.length * 4 + 5;

        // 3. Key terms table
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(...GOLD);
        doc.text('3. KEY COMMERCIAL TERMS', margin, y);
        y += 4.5;

        const terms = [
            ['Monthly Rent', `Rs. ${rentNum.toLocaleString('en-IN')} (Rupees ${numberToWords(rentNum)} only)`],
            ['Security Deposit', `Rs. ${depNum.toLocaleString('en-IN')} (Rupees ${numberToWords(depNum)} only)`],
            ['Duration', `${form.duration} months from ${dateStr}`],
            ['Rent Due Date', 'On or before the 5th of every month'],
            ['Governing Law', `Laws of ${form.state}, India`],
        ];

        doc.setFillColor(...GOLD);
        doc.rect(margin, y, contentW, 6.5, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.text('Particulars', margin + 2.5, y + 4.3);
        doc.text('Details', margin + 48, y + 4.3);
        y += 6.5;

        terms.forEach((row, i) => {
            if (i % 2 === 0) {
                doc.setFillColor(...CREAM);
                doc.rect(margin, y, contentW, 6.5, 'F');
            }
            doc.setDrawColor(...BORDER);
            doc.setLineWidth(0.15);
            doc.rect(margin, y, contentW, 6.5);
            doc.setTextColor(...DARK);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7.5);
            doc.text(row[0], margin + 2.5, y + 4.3);
            doc.text(row[1], margin + 48, y + 4.3);
            y += 6.5;
        });
        y += 5;

        // 4. Clauses
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(...GOLD);
        doc.text('4. TERMS AND CONDITIONS', margin, y);
        y += 5;

        const clauses = [
            ['4.1 Rent Payment', `Tenant shall pay monthly rent of Rs. ${rentNum.toLocaleString('en-IN')} on or before the 5th of each month via UPI, bank transfer, cheque or mutually agreed mode.`],
            ['4.2 Security Deposit', `Refundable deposit of Rs. ${depNum.toLocaleString('en-IN')} returned within 30 days of vacating after deducting dues/damages beyond normal wear & tear.`],
            ['4.3 Duration & Renewal', `Valid for ${form.duration} months from ${dateStr}. Renewal only by mutual written consent.`],
            ['4.4 Maintenance', 'Tenant maintains premises in good condition and handles minor repairs. Structural/major repairs are Landlord\'s responsibility.'],
            ['4.5 Utilities', 'Electricity, water, gas, internet and other utilities are borne by the Tenant as per actual consumption.'],
            ['4.6 Subletting', 'No subletting or parting with possession without prior written consent of the Landlord.'],
            ['4.7 Use', 'Property for residential use only. No structural alterations without written consent.'],
        ];
        if (form.includeNotice) {
            clauses.push(['4.8 Notice Period', 'Either party may terminate by giving one (1) month\'s prior written notice.']);
        }
        clauses.push(
            ['4.9 Governing Law', `Governed by the laws of ${form.state}, India. Courts at ${form.city || form.state} have exclusive jurisdiction.`],
            ['4.10 Entire Agreement', 'This document constitutes the entire agreement and supersedes all prior discussions.']
        );

        doc.setFontSize(8);
        clauses.forEach(([title, body]) => {
            if (y > 255) { doc.addPage(); y = 16; }
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...DARK);
            doc.text(title, margin, y);
            y += 3.5;
            doc.setFont('helvetica', 'normal');
            const lines = doc.splitTextToSize(body, contentW);
            doc.text(lines, margin, y);
            y += lines.length * 3.5 + 2.8;
        });

        // 5. Signatures
        if (y > 220) { doc.addPage(); y = 16; }
        y += 3;
        doc.setDrawColor(...GOLD);
        doc.setLineWidth(0.7);
        doc.line(margin, y, pageW - margin, y);
        y += 6;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(...GOLD);
        doc.text('5. SIGNATURES', margin, y);
        y += 4.5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...DARK);
        doc.text('IN WITNESS WHEREOF, the parties have executed this Agreement on the date first written above.', margin, y);
        y += 12;

        const col1 = margin + 8;
        const col2 = pageW / 2 + 8;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.text('LANDLORD', col1, y);
        doc.text('TENANT', col2, y);
        y += 14;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.text('___________________________', col1, y);
        doc.text('___________________________', col2, y);
        y += 3.5;
        doc.text('Signature', col1, y);
        doc.text('Signature', col2, y);
        y += 5;
        doc.text(`Name: ${form.landlordName || ''}`, col1, y);
        doc.text(`Name: ${form.tenantName || ''}`, col2, y);
        y += 4.5;
        doc.text('Date: _______________', col1, y);
        doc.text('Date: _______________', col2, y);
        y += 10;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.text('WITNESSES', pageW / 2, y, { align: 'center' });
        y += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.text('1. ___________________________', col1, y);
        doc.text('2. ___________________________', col2, y);
        y += 3.5;
        doc.text('Name & Signature', col1, y);
        doc.text('Name & Signature', col2, y);
        y += 4.5;
        doc.text('Date: _______________', col1, y);
        doc.text('Date: _______________', col2, y);

        // Brand seal
        drawSeal(pageW - margin - 14, 28, 13, 'AUTHENTIC');

        // Footer
        doc.setDrawColor(...BORDER);
        doc.setLineWidth(0.3);
        doc.line(margin, 287, pageW - margin, 287);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(...MUTED);
        doc.text('Generated via EstateXAI Digital Rental Toolkit  •  estate-xai.vercel.app/rental-toolkit', pageW / 2, 291, { align: 'center' });
        doc.setFontSize(6);
        doc.text('Template for guidance only. Consult a legal professional & register as per state laws. Brand seal = authenticity.', pageW / 2, 295, { align: 'center' });

        doc.save(`Rental_Agreement_${(form.tenantName || 'Tenant').replace(/\s+/g, '_')}.pdf`);
    };

    return (
        <motion.div variants={fadeIn} initial="initial" animate="animate">
            {!generated ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                        <label className="block mb-2 text-sm text-primary font-bold">Landlord / Owner Name *</label>
                        <input className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary transition-colors" placeholder="Full legal name" value={form.landlordName} onChange={e => s('landlordName', e.target.value)} />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm text-primary font-bold">Tenant Name *</label>
                        <input className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary transition-colors" placeholder="Full legal name" value={form.tenantName} onChange={e => s('tenantName', e.target.value)} />
                    </div>
                    <div className="md:col-span-2 lg:col-span-2">
                        <label className="block mb-2 text-sm text-primary font-bold">Property Address *</label>
                        <input className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary transition-colors" placeholder="Flat no, building, street, locality" value={form.address} onChange={e => s('address', e.target.value)} />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm text-primary font-bold">City</label>
                        <input className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary transition-colors" placeholder="e.g. Pune" value={form.city} onChange={e => s('city', e.target.value)} />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm text-primary font-bold">State</label>
                        <select className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary transition-colors cursor-pointer" value={form.state} onChange={e => s('state', e.target.value)}>
                            {STATES.map(st => <option key={st} value={st}>{st}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block mb-2 text-sm text-primary font-bold">Monthly Rent (₹) *</label>
                        <input className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary transition-colors" type="number" placeholder="15000" value={form.rent} onChange={e => s('rent', e.target.value)} />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm text-primary font-bold">Security Deposit (₹)</label>
                        <input className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary transition-colors" type="number" placeholder="30000" value={form.deposit} onChange={e => s('deposit', e.target.value)} />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm text-primary font-bold">Start Date</label>
                        <input className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary transition-colors" type="date" value={form.startDate} onChange={e => s('startDate', e.target.value)} />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm text-primary font-bold">Duration (months)</label>
                        <select className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary transition-colors cursor-pointer" value={form.duration} onChange={e => s('duration', e.target.value)}>
                            {['6', '11', '12', '24', '36'].map(d => <option key={d} value={d}>{d} months</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-2 flex items-center gap-3">
                        <button onClick={() => s('includeNotice', !form.includeNotice)} className={`relative w-11 h-6 rounded-full transition-colors ${form.includeNotice ? 'bg-primary' : 'bg-borderSubtle/30'}`}>
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${form.includeNotice ? 'left-6' : 'left-1'}`} />
                        </button>
                        <span className="text-sm font-medium text-muted">Include 1-month notice period clause</span>
                    </div>
                    <div className="md:col-span-2 lg:col-span-3 mt-4">
                        <button onClick={generateAgreement} className="btn btn-primary py-4 px-8 text-base font-bold shadow-md hover:shadow-lg inline-flex items-center gap-2">
                            <FileText className="w-5 h-5" /> Generate Agreement
                        </button>
                    </div>
                </div>
            ) : (
                <motion.div variants={fadeIn} initial="initial" animate="animate">
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 mb-6">
                        <div className="flex items-center gap-3 mb-5">
                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                            <span className="text-emerald-600 font-bold text-lg">Agreement Generated Successfully</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-muted">
                            <div>Landlord: <strong className="text-primary">{form.landlordName}</strong></div>
                            <div>Tenant: <strong className="text-primary">{form.tenantName}</strong></div>
                            <div>Rent: <strong className="text-primary">₹{Number(form.rent).toLocaleString('en-IN')}/mo</strong></div>
                            <div>Deposit: <strong className="text-primary">₹{Number(form.deposit || 0).toLocaleString('en-IN')}</strong></div>
                            <div>Duration: <strong className="text-primary">{form.duration} months</strong></div>
                            <div>City: <strong className="text-primary">{form.city}, {form.state}</strong></div>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <button onClick={downloadAgreement} className="btn btn-primary py-3 px-6 text-sm font-bold shadow-md hover:shadow-lg inline-flex items-center gap-2">
                            <Download className="w-4 h-4" /> Download Agreement
                        </button>
                        <button onClick={() => setGenerated(false)} className="btn btn-ghost py-3 px-6 text-sm font-bold inline-flex items-center gap-2">
                            Edit Details
                        </button>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}

function ReceiptGenerator() {
    const [form, setForm] = useState({ landlordName: '', tenantName: '', address: '', rent: '', month: new Date().toISOString().slice(0, 7), paymentMode: 'UPI' });
    const s = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const downloadReceipt = () => {
        if (!form.landlordName || !form.tenantName || !form.rent) return;

        const doc = new jsPDF({ unit: 'mm', format: 'a4' });
        const pageW = doc.internal.pageSize.getWidth();
        const pageH = doc.internal.pageSize.getHeight();
        const margin = 18;

        const GOLD = [201, 163, 94];
        const DARK = [18, 24, 32];
        const MUTED = [90, 90, 90];
        const CREAM = [245, 241, 235];
        const CREAM_L = [247, 244, 237];
        const BORDER = [224, 217, 208];

        const rentNum = Number(form.rent) || 0;
        const [year, month] = form.month.split('-');
        const monthName = new Date(year, month - 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
        const receiptNo = `RR-${Date.now().toString(36).toUpperCase()}`;
        const today = new Date().toLocaleDateString('en-IN');

        // Seal helper (same as agreement)
        const drawSeal = (cx, cy, r = 14, label = 'PAID') => {
            doc.setDrawColor(...GOLD);
            doc.setLineWidth(1.3);
            doc.circle(cx, cy, r);
            doc.setLineWidth(0.45);
            doc.circle(cx, cy, r - 2.2);
            doc.setDrawColor(223, 194, 136);
            doc.setLineWidth(0.25);
            doc.circle(cx, cy, r - 3.5);
            doc.setFillColor(253, 249, 242);
            doc.circle(cx, cy, r - 4, 'F');
            doc.setFillColor(...GOLD);
            const s = 3;
            doc.triangle(cx, cy + s, cx + s * 0.4, cy + s * 0.3, cx + s, cy, 'F');
            doc.triangle(cx, cy + s, cx - s * 0.4, cy + s * 0.3, cx - s, cy, 'F');
            doc.triangle(cx, cy - s, cx + s * 0.4, cy - s * 0.3, cx + s, cy, 'F');
            doc.triangle(cx, cy - s, cx - s * 0.4, cy - s * 0.3, cx - s, cy, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(5);
            doc.setTextColor(163, 130, 70);
            doc.text('EstateXAI', cx, cy - r + 5, { align: 'center' });
            doc.setFontSize(4.2);
            doc.text(label, cx, cy + r - 4, { align: 'center' });
            doc.setFontSize(3.8);
            doc.setTextColor(...MUTED);
            doc.text('2026', cx, cy + 4, { align: 'center' });
        };

        // Soft cream background panel
        doc.setFillColor(...CREAM);
        doc.rect(0, 0, pageW, pageH, 'F');

        // Double gold border
        doc.setDrawColor(...GOLD);
        doc.setLineWidth(1.6);
        doc.roundedRect(10, 10, pageW - 20, pageH - 20, 3, 3, 'S');
        doc.setDrawColor(223, 194, 136);
        doc.setLineWidth(0.35);
        doc.roundedRect(12, 12, pageW - 24, pageH - 24, 2.5, 2.5, 'S');

        // Dark header bar
        doc.setFillColor(26, 26, 30);
        doc.roundedRect(margin, 18, pageW - margin * 2, 20, 2, 2, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(...GOLD);
        doc.text('EstateXAI', pageW / 2, 27, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(212, 212, 216);
        doc.text('DIGITAL RENTAL TOOLKIT  •  RENT RECEIPT', pageW / 2, 33.5, { align: 'center' });

        // Title
        let y = 48;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(17);
        doc.setTextColor(...DARK);
        doc.text('RENT RECEIPT', pageW / 2, y, { align: 'center' });
        y += 4;
        doc.setDrawColor(...GOLD);
        doc.setLineWidth(1);
        doc.line(65, y, pageW - 65, y);
        y += 10;

        // Meta box
        doc.setFillColor(...CREAM_L);
        doc.setDrawColor(...GOLD);
        doc.setLineWidth(0.5);
        doc.roundedRect(margin, y, pageW - margin * 2, 16, 1.5, 1.5, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(...DARK);
        doc.text('Receipt No:', margin + 4, y + 6);
        doc.setFont('helvetica', 'normal');
        doc.text(receiptNo, margin + 28, y + 6);
        doc.setFont('helvetica', 'bold');
        doc.text('Date:', 115, y + 6);
        doc.setFont('helvetica', 'normal');
        doc.text(today, 128, y + 6);
        doc.setFont('helvetica', 'bold');
        doc.text('For the month of:', margin + 4, y + 12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...GOLD);
        doc.text(monthName, margin + 42, y + 12);
        y += 24;

        // Amount box
        doc.setFillColor(...GOLD);
        doc.roundedRect(margin, y, pageW - margin * 2, 22, 2.5, 2.5, 'F');
        doc.setTextColor(...DARK);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text('AMOUNT RECEIVED', pageW / 2, y + 6, { align: 'center' });
        doc.setFontSize(15);
        doc.text(`Rs. ${rentNum.toLocaleString('en-IN')}`, pageW / 2, y + 13.5, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.text(`(Rupees ${numberToWords(rentNum)} only)`, pageW / 2, y + 18.5, { align: 'center' });
        y += 30;

        // Details
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(...GOLD);
        doc.text('PAYMENT DETAILS', margin + 2, y);
        y += 2;
        doc.setDrawColor(...BORDER);
        doc.setLineWidth(0.3);
        doc.line(margin + 2, y, pageW - margin - 2, y);
        y += 7;

        const details = [
            ['Received From (Tenant)', form.tenantName],
            ['Received By (Landlord)', form.landlordName],
            ['Property Address', form.address || '—'],
            ['Payment Mode', form.paymentMode],
            ['Period Covered', monthName],
        ];

        details.forEach(([label, value]) => {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7.5);
            doc.setTextColor(...MUTED);
            doc.text(label, margin + 4, y);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.setTextColor(...DARK);
            const vLines = doc.splitTextToSize(String(value), pageW - margin * 2 - 10);
            doc.text(vLines, margin + 4, y + 4);
            y += 4 + vLines.length * 4 + 4;
        });

        y += 2;
        // Declaration
        doc.setFillColor(...CREAM_L);
        doc.setDrawColor(...BORDER);
        doc.setLineWidth(0.35);
        doc.roundedRect(margin, y, pageW - margin * 2, 22, 1.5, 1.5, 'FD');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...DARK);
        const decl = `This acknowledges that the Landlord has received Rs. ${rentNum.toLocaleString('en-IN')} (Rupees ${numberToWords(rentNum)} only) from the Tenant towards rent for ${monthName} for the property above. Valid for tax purposes under Section 10(13A).`;
        const declLines = doc.splitTextToSize(decl, pageW - margin * 2 - 8);
        doc.text(declLines, margin + 4, y + 5);
        y += 30;

        // Signatures
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(...DARK);
        doc.text('Landlord / Owner Signature', margin + 4, y);
        doc.text('Tenant Acknowledgement', 115, y);
        y += 16;
        doc.setDrawColor(...DARK);
        doc.setLineWidth(0.4);
        doc.line(margin + 4, y, margin + 55, y);
        doc.line(115, y, 170, y);
        y += 4.5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...MUTED);
        doc.text(form.landlordName, margin + 4, y);
        doc.text(form.tenantName, 115, y);
        y += 4;
        doc.text('Date: _______________', margin + 4, y);
        doc.text('Date: _______________', 115, y);

        // Brand seal
        drawSeal(pageW - margin - 16, 42, 14, 'PAID');

        // Footer
        doc.setDrawColor(...GOLD);
        doc.setLineWidth(0.4);
        doc.line(margin, 22, pageW - margin, 22);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(...MUTED);
        doc.text('Generated via EstateXAI Digital Rental Toolkit  •  estate-xai.vercel.app/rental-toolkit', pageW / 2, 17, { align: 'center' });
        doc.setFontSize(6);
        doc.text('Official receipt with brand seal. Keep for tax records (Section 10(13A)).', pageW / 2, 13, { align: 'center' });

        // Top security
        doc.setFontSize(6);
        doc.text('SECURE DOCUMENT  •  DO NOT TAMPER', margin, pageH - 12);
        doc.text(`ID: ${receiptNo}`, pageW - margin, pageH - 12, { align: 'right' });

        doc.save(`Rent_Receipt_${monthName.replace(/\s+/g, '_')}.pdf`);
    };

    return (
        <motion.div variants={fadeIn} initial="initial" animate="animate" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
                <label className="block mb-2 text-sm text-primary font-bold">Landlord Name *</label>
                <input className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary transition-colors" placeholder="Owner name" value={form.landlordName} onChange={e => s('landlordName', e.target.value)} />
            </div>
            <div>
                <label className="block mb-2 text-sm text-primary font-bold">Tenant Name *</label>
                <input className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary transition-colors" placeholder="Tenant name" value={form.tenantName} onChange={e => s('tenantName', e.target.value)} />
            </div>
            <div className="md:col-span-2 lg:col-span-2">
                <label className="block mb-2 text-sm text-primary font-bold">Property Address</label>
                <input className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary transition-colors" placeholder="Flat no, building, locality" value={form.address} onChange={e => s('address', e.target.value)} />
            </div>
            <div>
                <label className="block mb-2 text-sm text-primary font-bold">Rent Amount (₹) *</label>
                <input className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary transition-colors" type="number" placeholder="15000" value={form.rent} onChange={e => s('rent', e.target.value)} />
            </div>
            <div>
                <label className="block mb-2 text-sm text-primary font-bold">For Month</label>
                <input className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary transition-colors" type="month" value={form.month} onChange={e => s('month', e.target.value)} />
            </div>
            <div>
                <label className="block mb-2 text-sm text-primary font-bold">Payment Mode</label>
                <select className="w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary transition-colors cursor-pointer" value={form.paymentMode} onChange={e => s('paymentMode', e.target.value)}>
                    {['UPI', 'Bank Transfer', 'Cash', 'Cheque', 'Google Pay', 'PhonePe', 'Paytm'].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
            </div>
            <div className="md:col-span-2 lg:col-span-3 mt-4">
                <button onClick={downloadReceipt} className="btn btn-primary py-4 px-8 text-base font-bold shadow-md hover:shadow-lg inline-flex items-center gap-2">
                    <Download className="w-5 h-5" /> Generate & Download Receipt
                </button>
            </div>
        </motion.div>
    );
}

const POLICE_CHECKLIST = [
    { id: 1, text: 'Tenant Aadhaar card copy (front + back)', important: true },
    { id: 2, text: 'Tenant passport-size photographs (2 copies)', important: true },
    { id: 3, text: 'Signed rental agreement copy', important: true },
    { id: 4, text: 'Landlord Aadhaar card copy', important: false },
    { id: 5, text: 'Property ownership proof or society NOC', important: false },
    { id: 6, text: 'Register on local police station portal (varies by city)', important: true },
    { id: 7, text: 'For Maharashtra: Register on tenantverification.mahapolice.gov.in', important: false },
    { id: 8, text: 'For Karnataka: Register on ksp.gov.in tenant verification', important: false },
    { id: 9, text: 'For Telangana: Register on TSCOP app', important: false },
    { id: 10, text: 'Keep a copy of the verification receipt', important: true },
];

const MOVEIN_CHECKLIST = [
    { id: 1, text: 'Document all existing damages with photos/video before moving in', important: true },
    { id: 2, text: 'Check all electrical switches, fans, lights, and power sockets', important: true },
    { id: 3, text: 'Test all taps, flush, geyser, and check for water leaks', important: true },
    { id: 4, text: 'Verify gas connection (if piped gas) or plan for cylinder', important: false },
    { id: 5, text: 'Check WiFi/broadband availability and speed', important: false },
    { id: 6, text: 'Get society gate pass / entry card for you and visitors', important: true },
    { id: 7, text: 'Note down emergency contacts: security, maintenance, plumber, electrician', important: false },
    { id: 8, text: 'Set up electricity meter reading baseline', important: true },
    { id: 9, text: 'Understand garbage collection schedule and parking rules', important: false },
    { id: 10, text: 'Exchange contact numbers with immediate neighbors', important: false },
    { id: 11, text: 'Verify rent payment method and due date with landlord', important: true },
    { id: 12, text: 'Complete police verification (see checklist above)', important: true },
];

function InteractiveChecklist({ items, title, icon: Icon, color, colorClass, bgClass, borderClass }) {
    const storageKey = `checklist_${title.replace(/\s/g, '_')}`;
    const [checked, setChecked] = useState(() => {
        try { return JSON.parse(localStorage.getItem(storageKey) || '[]'); } catch { return []; }
    });

    const toggle = (id) => {
        const next = checked.includes(id) ? checked.filter(c => c !== id) : [...checked, id];
        setChecked(next);
        localStorage.setItem(storageKey, JSON.stringify(next));
    };

    const progress = Math.round((checked.length / items.length) * 100);

    return (
        <motion.div variants={fadeIn} initial="initial" animate="animate">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${bgClass} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${colorClass}`} />
                    </div>
                    <span className="text-primary font-bold text-lg">{title}</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-24 h-2 rounded-full bg-borderSubtle/20 overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-300`} style={{ width: `${progress}%`, backgroundColor: color }} />
                    </div>
                    <span className={`text-sm font-bold`} style={{ color }}>{progress}%</span>
                </div>
            </div>
            <div className="flex flex-col gap-3">
                {items.map(item => (
                    <button key={item.id} onClick={() => toggle(item.id)} className={`flex items-start gap-4 p-4 rounded-xl border text-left w-full transition-all ${checked.includes(item.id) ? `${bgClass} ${borderClass}` : 'bg-surface border-borderSubtle/30 hover:border-borderSubtle/50'}`}>
                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${checked.includes(item.id) ? 'border-transparent bg-primary' : 'border-borderSubtle/40'}`} style={{ backgroundColor: checked.includes(item.id) ? color : 'transparent' }}>
                            {checked.includes(item.id) && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </div>
                        <div>
                            <span className={`text-sm transition-all ${checked.includes(item.id) ? 'text-muted line-through' : 'text-primary font-medium'}`}>
                                {item.text}
                            </span>
                            {item.important && !checked.includes(item.id) && (
                                <span className="ml-3 text-[11px] px-2 py-0.5 rounded-md bg-red-500/10 text-red-500 font-bold uppercase tracking-wider">Important</span>
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </motion.div>
    );
}

function numberToWords(num) {
    if (num === 0) return 'Zero';
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    if (num >= 10000000) return `${numberToWords(Math.floor(num / 10000000))} Crore ${numberToWords(num % 10000000)}`.trim();
    if (num >= 100000) return `${numberToWords(Math.floor(num / 100000))} Lakh ${numberToWords(num % 100000)}`.trim();
    if (num >= 1000) return `${numberToWords(Math.floor(num / 1000))} Thousand ${numberToWords(num % 1000)}`.trim();
    if (num >= 100) return `${numberToWords(Math.floor(num / 100))} Hundred ${numberToWords(num % 100)}`.trim();
    if (num >= 20) return `${tens[Math.floor(num / 10)]} ${ones[num % 10]}`.trim();
    return ones[num];
}

const TOOLS = [
    { id: 'agreement', title: 'Rental Agreement Generator', desc: 'Generate a legally-formatted rental agreement in seconds', icon: FileText, color: 'var(--primary)', colorClass: 'text-primary', bgClass: 'bg-primary/10', borderClass: 'border-primary/30', component: AgreementGenerator },
    { id: 'receipt', title: 'Rent Receipt Generator', desc: 'Create monthly rent receipts for tax benefits (Section 10(13A))', icon: Receipt, color: '#22c55e', colorClass: 'text-emerald-500', bgClass: 'bg-emerald-500/10', borderClass: 'border-emerald-500/30', component: ReceiptGenerator },
    { id: 'police', title: 'Police Verification Checklist', desc: 'Complete checklist with state-specific portal links', icon: Shield, color: '#f59e0b', colorClass: 'text-amber-500', bgClass: 'bg-amber-500/10', borderClass: 'border-amber-500/30', component: null },
    { id: 'movein', title: 'Move-In Checklist', desc: 'Never miss anything when moving into a new place', icon: ClipboardCheck, color: '#8b5cf6', colorClass: 'text-violet-500', bgClass: 'bg-violet-500/10', borderClass: 'border-violet-500/30', component: null }
];

export default function RentalToolkit() {
    const [activeTab, setActiveTab] = useState('agreement');

    return (
        <div className="light-page min-h-screen pt-24 pb-20 font-sans">
            <div className="max-w-6xl mx-auto px-6 lg:px-8">
                {/* Hero */}
                <motion.div variants={fadeIn} initial="initial" animate="animate" className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
                        <Building2 className="w-4 h-4 text-primary" />
                        <span className="text-xs text-primary font-bold tracking-wider uppercase">Free Tools for Renters</span>
                    </div>
                    <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary mb-4">
                        Digital Rental <span className="text-accent">Toolkit</span>
                    </h1>
                    <p className="text-muted text-lg max-w-2xl mx-auto">
                        Free tools every Indian renter needs — agreements, receipts, police verification guides, and move-in checklists.
                    </p>
                </motion.div>

                {/* Tab Selector */}
                <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                    {TOOLS.map((tool) => (
                        <motion.button
                            key={tool.id}
                            variants={staggerItem}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveTab(tool.id)}
                            className={`p-6 rounded-2xl text-left border transition-all ${activeTab === tool.id ? `${tool.bgClass} ${tool.borderClass}` : 'bg-surface border-borderSubtle/20 hover:border-borderSubtle/50'}`}
                        >
                            <tool.icon className={`w-8 h-8 mb-4 ${activeTab === tool.id ? tool.colorClass : 'text-muted'}`} />
                            <div className={`font-bold text-base mb-2 ${activeTab === tool.id ? tool.colorClass : 'text-primary'}`}>{tool.title}</div>
                            <div className="text-sm text-muted leading-relaxed">{tool.desc}</div>
                        </motion.button>
                    ))}
                </motion.div>

                {/* Active Tool Content */}
                <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                    className="bg-elevated border border-borderSubtle/20 rounded-[2rem] p-8 md:p-12 shadow-xl shadow-black/5">
                    {activeTab === 'agreement' && <AgreementGenerator />}
                    {activeTab === 'receipt' && <ReceiptGenerator />}
                    {activeTab === 'police' && <InteractiveChecklist items={POLICE_CHECKLIST} title="Police Verification Checklist" icon={Shield} color="#f59e0b" colorClass="text-amber-500" bgClass="bg-amber-500/10" borderClass="border-amber-500/30" />}
                    {activeTab === 'movein' && <InteractiveChecklist items={MOVEIN_CHECKLIST} title="Move-In Checklist" icon={ClipboardCheck} color="#8b5cf6" colorClass="text-violet-500" bgClass="bg-violet-500/10" borderClass="border-violet-500/30" />}
                </motion.div>
            </div>
        </div>
    );
}
