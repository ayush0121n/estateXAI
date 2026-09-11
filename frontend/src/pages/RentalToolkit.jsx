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
        const content = `RENTAL / LEASE AGREEMENT

This Rental Agreement is made on ${form.startDate || new Date().toLocaleDateString('en-IN')}

BETWEEN

Landlord: ${form.landlordName}
(Hereinafter referred to as "OWNER/LANDLORD")

AND

Tenant: ${form.tenantName}
(Hereinafter referred to as "TENANT")

PROPERTY ADDRESS:
${form.address}, ${form.city}, ${form.state}

TERMS AND CONDITIONS:

1. RENT: The monthly rent shall be Rs. ${Number(form.rent).toLocaleString('en-IN')} (Rupees ${numberToWords(Number(form.rent))} only), payable on or before the 5th of every month.

2. SECURITY DEPOSIT: The Tenant has paid a security deposit of Rs. ${Number(form.deposit || 0).toLocaleString('en-IN')} (Rupees ${numberToWords(Number(form.deposit || 0))} only) which shall be refunded at the time of vacating the premises, after deducting any dues or damages.

3. DURATION: This agreement is valid for a period of ${form.duration} months from ${form.startDate || 'the date of signing'}.

4. MAINTENANCE: The Tenant shall maintain the premises in good condition and shall be responsible for minor repairs.

5. SUBLETTING: The Tenant shall not sublet the premises or any part thereof without the written consent of the Landlord.

6. UTILITIES: Electricity, water, and other utility charges shall be borne by the Tenant as per actual consumption.

${form.includeNotice ? `7. NOTICE PERIOD: Either party may terminate this agreement by giving one month's written notice.` : ''}

8. GOVERNING LAW: This agreement shall be governed by the laws of ${form.state}, India.


LANDLORD: ________________________          TENANT: ________________________
Name: ${form.landlordName}                  Name: ${form.tenantName}
Date:                                       Date:


WITNESS 1: ________________________         WITNESS 2: ________________________

Generated via EstateXAi Digital Rental Toolkit
`;
        const doc = new jsPDF();
        doc.setFontSize(12);
        const lines = doc.splitTextToSize(content, 170);
        doc.text(lines, 20, 20);
        doc.save(`Rental_Agreement_${form.tenantName.replace(/\s+/g, '_')}.pdf`);
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
        const [year, month] = form.month.split('-');
        const monthName = new Date(year, month - 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
        const content = `RENT RECEIPT

Receipt No: RR-${Date.now().toString(36).toUpperCase()}
Date: ${new Date().toLocaleDateString('en-IN')}

Received from: ${form.tenantName}
Amount: Rs. ${Number(form.rent).toLocaleString('en-IN')} (Rupees ${numberToWords(Number(form.rent))} only)
For the month of: ${monthName}
Payment Mode: ${form.paymentMode}

Property Address: ${form.address}

Received by: ${form.landlordName} (Landlord/Owner)

Signature: ________________________

Generated via EstateXAi Digital Rental Toolkit`;

        const doc = new jsPDF();
        doc.setFontSize(14);
        const lines = doc.splitTextToSize(content, 170);
        doc.text(lines, 20, 30);
        
        doc.setLineWidth(0.5);
        doc.rect(15, 20, 180, 120);
        
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
