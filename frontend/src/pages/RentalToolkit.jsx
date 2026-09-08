/* eslint-disable */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Receipt, Shield, ClipboardCheck, Download, ChevronDown, ChevronRight, CheckCircle2, Building2 } from 'lucide-react';
import { jsPDF } from 'jspdf';

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
        <div>
            {!generated ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
                    <div>
                        <label style={labelStyle}>Landlord / Owner Name *</label>
                        <input className="input" placeholder="Full legal name" value={form.landlordName} onChange={e => s('landlordName', e.target.value)} />
                    </div>
                    <div>
                        <label style={labelStyle}>Tenant Name *</label>
                        <input className="input" placeholder="Full legal name" value={form.tenantName} onChange={e => s('tenantName', e.target.value)} />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={labelStyle}>Property Address *</label>
                        <input className="input" placeholder="Flat no, building, street, locality" value={form.address} onChange={e => s('address', e.target.value)} />
                    </div>
                    <div>
                        <label style={labelStyle}>City</label>
                        <input className="input" placeholder="e.g. Pune" value={form.city} onChange={e => s('city', e.target.value)} />
                    </div>
                    <div>
                        <label style={labelStyle}>State</label>
                        <select className="input" value={form.state} onChange={e => s('state', e.target.value)} style={{ cursor: 'pointer' }}>
                            {STATES.map(st => <option key={st} value={st}>{st}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Monthly Rent (₹) *</label>
                        <input className="input" type="number" placeholder="15000" value={form.rent} onChange={e => s('rent', e.target.value)} />
                    </div>
                    <div>
                        <label style={labelStyle}>Security Deposit (₹)</label>
                        <input className="input" type="number" placeholder="30000" value={form.deposit} onChange={e => s('deposit', e.target.value)} />
                    </div>
                    <div>
                        <label style={labelStyle}>Start Date</label>
                        <input className="input" type="date" value={form.startDate} onChange={e => s('startDate', e.target.value)} />
                    </div>
                    <div>
                        <label style={labelStyle}>Duration (months)</label>
                        <select className="input" value={form.duration} onChange={e => s('duration', e.target.value)} style={{ cursor: 'pointer' }}>
                            {['6', '11', '12', '24', '36'].map(d => <option key={d} value={d}>{d} months</option>)}
                        </select>
                    </div>
                    <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button onClick={() => s('includeNotice', !form.includeNotice)} style={{ width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer', background: form.includeNotice ? 'var(--primary)' : 'rgba(255,255,255,0.1)', position: 'relative', transition: 'background 0.3s' }}>
                            <div style={{ position: 'absolute', top: 2, left: form.includeNotice ? 20 : 2, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: 'left 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
                        </button>
                        <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Include 1-month notice period clause</span>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <button onClick={generateAgreement} className="btn btn-primary" style={{ padding: '14px 32px', fontSize: 15 }}>
                            <FileText size={18} /> Generate Agreement
                        </button>
                    </div>
                </div>
            ) : (
                <div>
                    <div style={{ background: 'rgba(34,211,165,0.08)', border: '1px solid rgba(34,211,165,0.3)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                            <CheckCircle2 size={22} color="#22d3a5" />
                            <span style={{ color: '#22d3a5', fontWeight: 700, fontSize: 16 }}>Agreement Generated Successfully</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 14, color: 'var(--text-secondary)' }}>
                            <div>Landlord: <strong style={{ color: 'var(--text-primary)' }}>{form.landlordName}</strong></div>
                            <div>Tenant: <strong style={{ color: 'var(--text-primary)' }}>{form.tenantName}</strong></div>
                            <div>Rent: <strong style={{ color: 'var(--primary)' }}>₹{Number(form.rent).toLocaleString('en-IN')}/mo</strong></div>
                            <div>Deposit: <strong style={{ color: 'var(--primary)' }}>₹{Number(form.deposit || 0).toLocaleString('en-IN')}</strong></div>
                            <div>Duration: <strong style={{ color: 'var(--text-primary)' }}>{form.duration} months</strong></div>
                            <div>City: <strong style={{ color: 'var(--text-primary)' }}>{form.city}, {form.state}</strong></div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={downloadAgreement} className="btn btn-primary" style={{ padding: '12px 28px' }}>
                            <Download size={16} /> Download Agreement
                        </button>
                        <button onClick={() => setGenerated(false)} className="btn btn-ghost" style={{ padding: '12px 28px' }}>
                            Edit Details
                        </button>
                    </div>
                </div>
            )}
        </div>
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
        
        // Add a nice border for the receipt
        doc.setLineWidth(0.5);
        doc.rect(15, 20, 180, 120);
        
        doc.save(`Rent_Receipt_${monthName.replace(/\s+/g, '_')}.pdf`);
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
            <div>
                <label style={labelStyle}>Landlord Name *</label>
                <input className="input" placeholder="Owner name" value={form.landlordName} onChange={e => s('landlordName', e.target.value)} />
            </div>
            <div>
                <label style={labelStyle}>Tenant Name *</label>
                <input className="input" placeholder="Tenant name" value={form.tenantName} onChange={e => s('tenantName', e.target.value)} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Property Address</label>
                <input className="input" placeholder="Flat no, building, locality" value={form.address} onChange={e => s('address', e.target.value)} />
            </div>
            <div>
                <label style={labelStyle}>Rent Amount (₹) *</label>
                <input className="input" type="number" placeholder="15000" value={form.rent} onChange={e => s('rent', e.target.value)} />
            </div>
            <div>
                <label style={labelStyle}>For Month</label>
                <input className="input" type="month" value={form.month} onChange={e => s('month', e.target.value)} />
            </div>
            <div>
                <label style={labelStyle}>Payment Mode</label>
                <select className="input" value={form.paymentMode} onChange={e => s('paymentMode', e.target.value)} style={{ cursor: 'pointer' }}>
                    {['UPI', 'Bank Transfer', 'Cash', 'Cheque', 'Google Pay', 'PhonePe', 'Paytm'].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
                <button onClick={downloadReceipt} className="btn btn-primary" style={{ padding: '14px 32px', fontSize: 15 }}>
                    <Download size={18} /> Generate & Download Receipt
                </button>
            </div>
        </div>
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

function InteractiveChecklist({ items, title, icon: Icon, color }) {
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
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={18} color={color} />
                    </div>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 16 }}>{title}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 100, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                        <div style={{ width: `${progress}%`, height: '100%', borderRadius: 3, background: color, transition: 'width 0.3s' }} />
                    </div>
                    <span style={{ color, fontSize: 13, fontWeight: 600 }}>{progress}%</span>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {items.map(item => (
                    <button key={item.id} onClick={() => toggle(item.id)} style={{
                        display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px', borderRadius: 8,
                        border: `1px solid ${checked.includes(item.id) ? `${color}40` : 'var(--dark-border)'}`,
                        background: checked.includes(item.id) ? `${color}08` : 'rgba(255,255,255,0.02)',
                        cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: 'inherit', transition: 'all 0.2s'
                    }}>
                        <div style={{
                            width: 22, height: 22, borderRadius: 6, border: `2px solid ${checked.includes(item.id) ? color : 'rgba(255,255,255,0.15)'}`,
                            background: checked.includes(item.id) ? color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, marginTop: 1, transition: 'all 0.2s'
                        }}>
                            {checked.includes(item.id) && <CheckCircle2 size={14} color="#000" />}
                        </div>
                        <div>
                            <span style={{ color: checked.includes(item.id) ? 'var(--text-muted)' : 'var(--text-primary)', fontSize: 14, textDecoration: checked.includes(item.id) ? 'line-through' : 'none', transition: 'all 0.2s' }}>
                                {item.text}
                            </span>
                            {item.important && !checked.includes(item.id) && (
                                <span style={{ marginLeft: 8, fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontWeight: 600 }}>Important</span>
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

const labelStyle = { display: 'block', marginBottom: 6, fontSize: 13, color: '#b0b7d3', fontWeight: 500 };

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
    { id: 'agreement', title: 'Rental Agreement Generator', desc: 'Generate a legally-formatted rental agreement in seconds', icon: FileText, color: 'var(--primary)', component: AgreementGenerator },
    { id: 'receipt', title: 'Rent Receipt Generator', desc: 'Create monthly rent receipts for tax benefits (Section 10(13A))', icon: Receipt, color: '#22d3a5', component: ReceiptGenerator },
    { id: 'police', title: 'Police Verification Checklist', desc: 'Complete checklist with state-specific portal links', icon: Shield, color: '#f59e0b', component: null },
    { id: 'movein', title: 'Move-In Checklist', desc: 'Never miss anything when moving into a new place', icon: ClipboardCheck, color: '#8b5cf6', component: null }
];

export default function RentalToolkit() {
    const [activeTab, setActiveTab] = useState('agreement');

    return (
        <div style={{ paddingTop: 90, minHeight: '100vh', background: 'var(--dark)' }}>
            <div className="container" style={{ paddingBottom: 80 }}>
                {/* Hero */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ textAlign: 'center', marginBottom: 48 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(201,163,94,0.1)', border: '1px solid rgba(201,163,94,0.3)', borderRadius: 20, padding: '6px 16px', marginBottom: 20 }}>
                        <Building2 size={14} color="var(--primary)" />
                        <span style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600, letterSpacing: '0.5px' }}>FREE TOOLS FOR RENTERS</span>
                    </div>
                    <h1 style={{ fontSize: 'clamp(28px, 5vw, 46px)', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 16px', fontFamily: 'Outfit, sans-serif' }}>
                        Digital Rental <span style={{ color: 'var(--primary)' }}>Toolkit</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 17, maxWidth: 540, margin: '0 auto', lineHeight: 1.6 }}>
                        Free tools every Indian renter needs — agreements, receipts, police verification guides, and move-in checklists.
                    </p>
                </motion.div>

                {/* Tab Selector */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 40 }}>
                    {TOOLS.map(tool => (
                        <motion.button
                            key={tool.id}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveTab(tool.id)}
                            style={{
                                padding: '20px', borderRadius: 12, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                                border: `1px solid ${activeTab === tool.id ? `${tool.color}60` : 'var(--dark-border)'}`,
                                background: activeTab === tool.id ? `${tool.color}10` : 'rgba(255,255,255,0.02)',
                                transition: 'all 0.2s'
                            }}
                        >
                            <tool.icon size={24} color={activeTab === tool.id ? tool.color : 'var(--text-muted)'} style={{ marginBottom: 10 }} />
                            <div style={{ color: activeTab === tool.id ? tool.color : 'var(--text-primary)', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{tool.title}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.5 }}>{tool.desc}</div>
                        </motion.button>
                    ))}
                </div>

                {/* Active Tool Content */}
                <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                    style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: 16, padding: 'clamp(20px, 4vw, 40px)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
                    {activeTab === 'agreement' && <AgreementGenerator />}
                    {activeTab === 'receipt' && <ReceiptGenerator />}
                    {activeTab === 'police' && <InteractiveChecklist items={POLICE_CHECKLIST} title="Police Verification Checklist" icon={Shield} color="#f59e0b" />}
                    {activeTab === 'movein' && <InteractiveChecklist items={MOVEIN_CHECKLIST} title="Move-In Checklist" icon={ClipboardCheck} color="#8b5cf6" />}
                </motion.div>
            </div>
        </div>
    );
}
