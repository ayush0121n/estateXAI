/* eslint-disable */
/**
 * EstateXAI – Complete Digital Rental Toolkit
 * All 10 lifecycle documents + existing Agreement & Receipt
 * Theme: gold #c9a35e, cream, brand seal, security markings
 *
 * Drop this file in place of (or merge into) frontend/src/pages/RentalToolkit.jsx
 * Requires: jspdf, framer-motion, lucide-react (already in package.json)
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Receipt, Shield, ClipboardCheck, Download, CheckCircle2,
  Building2, LogOut, Scale, FileWarning, Home, Users, Package,
  FileCheck, BookOpen, Wrench, ChevronDown, ChevronRight
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { fadeIn, staggerContainer, staggerItem } from '../utils/animations';

const STATES = [
  'Maharashtra', 'Karnataka', 'Telangana', 'Delhi', 'Tamil Nadu',
  'Gujarat', 'West Bengal', 'Rajasthan', 'Uttar Pradesh', 'Madhya Pradesh'
];

/* ─────────────────────── Shared helpers ─────────────────────── */
function numberToWords(num) {
  if (num === 0) return 'Zero';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  if (num >= 10000000) return `${numberToWords(Math.floor(num / 10000000))} Crore ${numberToWords(num % 10000000)}`.trim();
  if (num >= 100000) return `${numberToWords(Math.floor(num / 100000))} Lakh ${numberToWords(num % 100000)}`.trim();
  if (num >= 1000) return `${numberToWords(Math.floor(num / 1000))} Thousand ${numberToWords(num % 1000)}`.trim();
  if (num >= 100) return `${numberToWords(Math.floor(num / 100))} Hundred ${numberToWords(num % 100)}`.trim();
  if (num >= 20) return `${tens[Math.floor(num / 10)]} ${ones[num % 10]}`.trim();
  return ones[num];
}

const GOLD = [201, 163, 94];
const DARK = [18, 24, 32];
const MUTED = [90, 90, 90];
const CREAM = [245, 241, 235];
const BORDER = [224, 217, 208];

function drawSeal(doc, cx, cy, r = 12, label = 'AUTHENTIC') {
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
  doc.setFillColor(...GOLD);
  const s = 2.6;
  doc.triangle(cx, cy + s, cx + s * 0.4, cy + s * 0.3, cx + s, cy, 'F');
  doc.triangle(cx, cy + s, cx - s * 0.4, cy + s * 0.3, cx - s, cy, 'F');
  doc.triangle(cx, cy - s, cx + s * 0.4, cy - s * 0.3, cx + s, cy, 'F');
  doc.triangle(cx, cy - s, cx - s * 0.4, cy - s * 0.3, cx - s, cy, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(4.2);
  doc.setTextColor(163, 130, 70);
  doc.text('EstateXAI', cx, cy - r + 4.2, { align: 'center' });
  doc.setFontSize(3.6);
  doc.text(label, cx, cy + r - 3.2, { align: 'center' });
  doc.setFontSize(3.3);
  doc.setTextColor(...MUTED);
  doc.text('2026', cx, cy + 3.2, { align: 'center' });
}

function pdfHeader(doc, title, subtitle = 'OFFICIAL DOCUMENT') {
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 15;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(...MUTED);
  doc.text('SECURE DOCUMENT  •  EstateXAI Digital Rental Toolkit', margin, 8);
  doc.text('DO NOT TAMPER', pageW - margin, 8, { align: 'right' });
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.3);
  doc.line(margin, 9.5, pageW - margin, 9.5);

  let y = 16;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...GOLD);
  doc.text('EstateXAI', pageW / 2, y, { align: 'center' });
  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.text(`DIGITAL RENTAL TOOLKIT  •  ${subtitle}`, pageW / 2, y, { align: 'center' });
  y += 3.5;
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1.1);
  doc.line(margin, y, pageW - margin, y);
  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...DARK);
  doc.text(title, pageW / 2, y, { align: 'center' });
  y += 4;
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.35);
  doc.line(margin, y, pageW - margin, y);
  return y + 6;
}

function pdfFooter(doc, label = 'AUTHENTIC') {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 15;
  drawSeal(doc, pageW - margin - 14, 26, 12, label);
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.3);
  doc.line(margin, pageH - 12, pageW - margin, pageH - 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...MUTED);
  doc.text('Generated via EstateXAI Digital Rental Toolkit  •  estate-xai.vercel.app/rental-toolkit', pageW / 2, pageH - 8, { align: 'center' });
}

/* ─────────────────────── Form field helper ─────────────────────── */
function Field({ label, children, className = '' }) {
  return (
    <div className={className}>
      <label className="block mb-2 text-sm text-primary font-bold">{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'w-full bg-surface border border-borderSubtle/30 rounded-btn px-4 py-3 outline-none focus:border-primary text-primary transition-colors';

/* ═══════════════════════════════════════════════════════════════
   1. MOVE-OUT / EXIT CHECKLIST + HANDOVER
   ═══════════════════════════════════════════════════════════════ */
function MoveOutGenerator() {
  const [f, setF] = useState({
    landlordName: '', tenantName: '', address: '', city: '', state: 'Maharashtra',
    deposit: '', moveOutDate: '', keysQty: '', meterElec: '', meterWater: '', notes: ''
  });
  const s = (k, v) => setF(p => ({ ...p, [k]: v }));

  const download = () => {
    if (!f.landlordName || !f.tenantName) return;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = pdfHeader(doc, 'MOVE-OUT / EXIT CHECKLIST + HANDOVER NOTE', 'EXIT DOCUMENT');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(`Move-Out Date: ${f.moveOutDate || '_______________'}  |  Property: ${f.address || '—'}, ${f.city || ''}, ${f.state}`, pageW / 2, y, { align: 'center' });
    y += 7;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...GOLD);
    doc.text('1. PROPERTY & PARTIES', margin, y);
    y += 5;
    doc.setFillColor(...CREAM);
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y, pageW - margin * 2, 22, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...DARK);
    doc.text(`Landlord: ${f.landlordName}`, margin + 4, y + 6);
    doc.text(`Tenant: ${f.tenantName}`, margin + 4, y + 11);
    doc.text(`Security Deposit Held: Rs. ${Number(f.deposit || 0).toLocaleString('en-IN')}`, margin + 4, y + 16);
    y += 28;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...GOLD);
    doc.text('2. EXIT CHECKLIST (Tick when done)', margin, y);
    y += 5;
    const checks = [
      'All personal belongings removed', 'Kitchen, bathrooms, floors cleaned',
      'Walls free of nails / posters / sticky marks', `Keys / cards / remotes returned (Qty: ${f.keysQty || '___'})`,
      `Electricity meter reading: ${f.meterElec || '________'}`, `Water / gas meter reading: ${f.meterWater || '________'}`,
      'All utility bills paid up to move-out date', 'Society maintenance / parking dues cleared',
      'Inventory checked against Condition Report', 'Visible damages documented with photos',
      'Forwarding address shared with Landlord', 'Police / tenant exit intimation completed (if required)'
    ];
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...DARK);
    checks.forEach(c => {
      doc.text(`☐  ${c}`, margin + 2, y);
      y += 5;
    });
    y += 3;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...GOLD);
    doc.text('3. HANDOVER NOTE', margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...DARK);
    const note = `The Tenant hands over vacant peaceful possession on the date above. Notes: ${f.notes || 'None'}`;
    const noteLines = doc.splitTextToSize(note, pageW - margin * 2);
    doc.text(noteLines, margin, y);
    y += noteLines.length * 4 + 6;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...GOLD);
    doc.text('4. DEPOSIT SETTLEMENT', margin, y);
    y += 5;
    doc.setFillColor(...GOLD);
    doc.rect(margin, y, pageW - margin * 2, 6.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7.5);
    doc.text('Item', margin + 3, y + 4.3);
    doc.text('Amount (Rs.)', pageW - margin - 35, y + 4.3);
    y += 6.5;
    const rows = [
      ['Original Security Deposit', Number(f.deposit || 0).toLocaleString('en-IN')],
      ['Less: Unpaid rent / dues', '________'],
      ['Less: Documented damages', '________'],
      ['Less: Unpaid utilities / society', '________'],
      ['Net Refundable Amount', '________']
    ];
    rows.forEach((r, i) => {
      if (i % 2 === 0) { doc.setFillColor(...CREAM); doc.rect(margin, y, pageW - margin * 2, 6.5, 'F'); }
      doc.setDrawColor(...BORDER); doc.setLineWidth(0.15); doc.rect(margin, y, pageW - margin * 2, 6.5);
      doc.setTextColor(...DARK); doc.setFont('helvetica', i === 4 ? 'bold' : 'normal'); doc.setFontSize(7.5);
      doc.text(r[0], margin + 3, y + 4.3); doc.text(r[1], pageW - margin - 35, y + 4.3);
      y += 6.5;
    });
    y += 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    doc.text('TENANT', margin + 15, y);
    doc.text('LANDLORD', pageW / 2 + 15, y);
    y += 14;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('_________________________', margin + 5, y);
    doc.text('_________________________', pageW / 2 + 5, y);
    y += 4;
    doc.text(`Name: ${f.tenantName}`, margin + 5, y);
    doc.text(`Name: ${f.landlordName}`, pageW / 2 + 5, y);
    y += 4;
    doc.text('Date: _______________', margin + 5, y);
    doc.text('Date: _______________', pageW / 2 + 5, y);

    pdfFooter(doc, 'EXIT');
    doc.save(`MoveOut_Handover_${(f.tenantName || 'Tenant').replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <motion.div variants={fadeIn} initial="initial" animate="animate" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Field label="Landlord Name *"><input className={inputCls} value={f.landlordName} onChange={e => s('landlordName', e.target.value)} placeholder="Full name" /></Field>
      <Field label="Tenant Name *"><input className={inputCls} value={f.tenantName} onChange={e => s('tenantName', e.target.value)} placeholder="Full name" /></Field>
      <Field label="Property Address" className="md:col-span-2"><input className={inputCls} value={f.address} onChange={e => s('address', e.target.value)} placeholder="Flat, building, locality" /></Field>
      <Field label="City"><input className={inputCls} value={f.city} onChange={e => s('city', e.target.value)} placeholder="Pune" /></Field>
      <Field label="State">
        <select className={inputCls + ' cursor-pointer'} value={f.state} onChange={e => s('state', e.target.value)}>
          {STATES.map(st => <option key={st}>{st}</option>)}
        </select>
      </Field>
      <Field label="Security Deposit (₹)"><input className={inputCls} type="number" value={f.deposit} onChange={e => s('deposit', e.target.value)} placeholder="30000" /></Field>
      <Field label="Move-Out Date"><input className={inputCls} type="date" value={f.moveOutDate} onChange={e => s('moveOutDate', e.target.value)} /></Field>
      <Field label="Keys / Cards Qty"><input className={inputCls} value={f.keysQty} onChange={e => s('keysQty', e.target.value)} placeholder="3" /></Field>
      <Field label="Electricity Meter"><input className={inputCls} value={f.meterElec} onChange={e => s('meterElec', e.target.value)} placeholder="Reading" /></Field>
      <Field label="Water / Gas Meter"><input className={inputCls} value={f.meterWater} onChange={e => s('meterWater', e.target.value)} placeholder="Reading" /></Field>
      <Field label="Notes / Damages" className="md:col-span-2 lg:col-span-3"><textarea className={inputCls} rows={2} value={f.notes} onChange={e => s('notes', e.target.value)} placeholder="Any special notes" /></Field>
      <div className="md:col-span-2 lg:col-span-3 mt-2">
        <button onClick={download} className="btn btn-primary py-4 px-8 text-base font-bold shadow-md hover:shadow-lg inline-flex items-center gap-2">
          <Download className="w-5 h-5" /> Download Move-Out Pack
        </button>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   2. SECURITY DEPOSIT REFUND CLAIM
   ═══════════════════════════════════════════════════════════════ */
function DepositClaimGenerator() {
  const [f, setF] = useState({
    landlordName: '', tenantName: '', address: '', deposit: '', moveOutDate: '',
    unpaidRent: '0', damages: '0', utilities: '0', bankName: '', accountNo: '', ifsc: '', mobile: '', email: ''
  });
  const s = (k, v) => setF(p => ({ ...p, [k]: v }));

  const download = () => {
    if (!f.landlordName || !f.tenantName || !f.deposit) return;
    const dep = Number(f.deposit) || 0;
    const unpaid = Number(f.unpaidRent) || 0;
    const dmg = Number(f.damages) || 0;
    const util = Number(f.utilities) || 0;
    const net = dep - unpaid - dmg - util;

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 16;
    let y = pdfHeader(doc, 'SECURITY DEPOSIT REFUND CLAIM / DEMAND LETTER', 'CLAIM DOCUMENT');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, pageW / 2, y, { align: 'center' });
    y += 7;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    doc.text('From (Tenant):', margin, y); y += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(f.tenantName, margin, y); y += 4;
    doc.text(f.address || '—', margin, y); y += 4;
    if (f.mobile || f.email) { doc.text(`${f.mobile || ''}  ${f.email || ''}`.trim(), margin, y); y += 4; }
    y += 3;
    doc.setFont('helvetica', 'bold');
    doc.text('To (Landlord):', margin, y); y += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.text(f.landlordName, margin, y); y += 6;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`Subject: Formal Request for Refund of Security Deposit – ${f.address || 'Property'}`, margin, y);
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const body1 = `I, ${f.tenantName}, was the tenant of the above property. I vacated and handed over peaceful possession on ${f.moveOutDate || '_______________'}.`;
    let lines = doc.splitTextToSize(body1, pageW - margin * 2);
    doc.text(lines, margin, y); y += lines.length * 4.5 + 3;

    const body2 = `As per the agreement, a security deposit of Rs. ${dep.toLocaleString('en-IN')} (Rupees ${numberToWords(dep)} only) was paid by me. I request you to refund the said deposit (after lawful deductions, if any) within the time prescribed under the agreement / applicable state law (generally 30 days from handover).`;
    lines = doc.splitTextToSize(body2, pageW - margin * 2);
    doc.text(lines, margin, y); y += lines.length * 4.5 + 5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...GOLD);
    doc.text('Details of Claim', margin, y); y += 5;

    doc.setFillColor(...GOLD);
    doc.rect(margin, y, pageW - margin * 2, 6.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7.5);
    doc.text('Particulars', margin + 3, y + 4.3);
    doc.text('Amount (Rs.)', pageW - margin - 40, y + 4.3);
    y += 6.5;

    const claimRows = [
      ['Security Deposit paid', dep.toLocaleString('en-IN')],
      ['Less: Unpaid rent', unpaid.toLocaleString('en-IN')],
      ['Less: Documented damages beyond normal wear', dmg.toLocaleString('en-IN')],
      ['Less: Unpaid utility / society charges', util.toLocaleString('en-IN')],
      ['Net Amount Claimed', net.toLocaleString('en-IN')]
    ];
    claimRows.forEach((r, i) => {
      if (i % 2 === 0) { doc.setFillColor(...CREAM); doc.rect(margin, y, pageW - margin * 2, 6.5, 'F'); }
      doc.setDrawColor(...BORDER); doc.setLineWidth(0.15); doc.rect(margin, y, pageW - margin * 2, 6.5);
      doc.setTextColor(...DARK); doc.setFont('helvetica', i === 4 ? 'bold' : 'normal'); doc.setFontSize(7.5);
      doc.text(r[0], margin + 3, y + 4.3); doc.text(r[1], pageW - margin - 40, y + 4.3);
      y += 6.5;
    });
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...DARK);
    const bank = `Kindly process the refund to: Account Name: ${f.tenantName}  |  Bank: ${f.bankName || '________'}  |  A/c No: ${f.accountNo || '________'}  |  IFSC: ${f.ifsc || '________'}`;
    lines = doc.splitTextToSize(bank, pageW - margin * 2);
    doc.text(lines, margin, y); y += lines.length * 4.5 + 4;

    const close = 'If the refund is not received within the stipulated period, I reserve the right to pursue remedies under applicable law, including filing a complaint before the competent authority / consumer forum / civil court.';
    lines = doc.splitTextToSize(close, pageW - margin * 2);
    doc.text(lines, margin, y); y += lines.length * 4.5 + 8;

    doc.text('Yours sincerely,', margin, y); y += 12;
    doc.text('_________________________', margin, y); y += 4;
    doc.setFont('helvetica', 'bold');
    doc.text(f.tenantName + ' (Tenant)', margin, y); y += 4;
    doc.setFont('helvetica', 'normal');
    doc.text('Date: _______________', margin, y);

    pdfFooter(doc, 'CLAIM');
    doc.save(`Deposit_Claim_${(f.tenantName || 'Tenant').replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <motion.div variants={fadeIn} initial="initial" animate="animate" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Field label="Tenant Name *"><input className={inputCls} value={f.tenantName} onChange={e => s('tenantName', e.target.value)} /></Field>
      <Field label="Landlord Name *"><input className={inputCls} value={f.landlordName} onChange={e => s('landlordName', e.target.value)} /></Field>
      <Field label="Property Address" className="md:col-span-2"><input className={inputCls} value={f.address} onChange={e => s('address', e.target.value)} /></Field>
      <Field label="Security Deposit (₹) *"><input className={inputCls} type="number" value={f.deposit} onChange={e => s('deposit', e.target.value)} /></Field>
      <Field label="Move-Out Date"><input className={inputCls} type="date" value={f.moveOutDate} onChange={e => s('moveOutDate', e.target.value)} /></Field>
      <Field label="Unpaid Rent (₹)"><input className={inputCls} type="number" value={f.unpaidRent} onChange={e => s('unpaidRent', e.target.value)} /></Field>
      <Field label="Damages (₹)"><input className={inputCls} type="number" value={f.damages} onChange={e => s('damages', e.target.value)} /></Field>
      <Field label="Unpaid Utilities (₹)"><input className={inputCls} type="number" value={f.utilities} onChange={e => s('utilities', e.target.value)} /></Field>
      <Field label="Bank Name"><input className={inputCls} value={f.bankName} onChange={e => s('bankName', e.target.value)} /></Field>
      <Field label="Account No"><input className={inputCls} value={f.accountNo} onChange={e => s('accountNo', e.target.value)} /></Field>
      <Field label="IFSC"><input className={inputCls} value={f.ifsc} onChange={e => s('ifsc', e.target.value)} /></Field>
      <Field label="Mobile"><input className={inputCls} value={f.mobile} onChange={e => s('mobile', e.target.value)} /></Field>
      <Field label="Email"><input className={inputCls} value={f.email} onChange={e => s('email', e.target.value)} /></Field>
      <div className="md:col-span-2 lg:col-span-3 mt-2">
        <button onClick={download} className="btn btn-primary py-4 px-8 text-base font-bold shadow-md hover:shadow-lg inline-flex items-center gap-2">
          <Download className="w-5 h-5" /> Download Deposit Claim Letter
        </button>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3. RENT INCREASE NOTICE
   ═══════════════════════════════════════════════════════════════ */
function RentIncreaseGenerator() {
  const [f, setF] = useState({
    landlordName: '', tenantName: '', address: '', city: '', state: 'Maharashtra',
    currentRent: '', newRent: '', effectiveDate: '', noticeDays: '30', agreementDate: ''
  });
  const s = (k, v) => setF(p => ({ ...p, [k]: v }));

  const download = () => {
    if (!f.landlordName || !f.tenantName || !f.currentRent || !f.newRent) return;
    const cur = Number(f.currentRent) || 0;
    const neu = Number(f.newRent) || 0;
    const inc = neu - cur;
    const pct = cur ? ((inc / cur) * 100).toFixed(1) : 0;

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 16;
    let y = pdfHeader(doc, 'NOTICE OF RENT INCREASE', 'LEGAL NOTICE');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}  |  Ref: Agreement dated ${f.agreementDate || '_______________'}`, pageW / 2, y, { align: 'center' });
    y += 7;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    doc.text(`From (Landlord): ${f.landlordName}`, margin, y); y += 4.5;
    doc.text(`To (Tenant): ${f.tenantName}`, margin, y); y += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(`Property: ${f.address || '—'}, ${f.city || ''}, ${f.state}`, margin, y); y += 7;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`Subject: Notice of Revision of Monthly Rent with effect from ${f.effectiveDate || '_______________'}`, margin, y);
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const intro = 'This is to formally notify you that, in accordance with the terms of our Leave & License / Rental Agreement and applicable state laws, the monthly rent for the above property will be revised as follows:';
    let lines = doc.splitTextToSize(intro, pageW - margin * 2);
    doc.text(lines, margin, y); y += lines.length * 4.5 + 5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...GOLD);
    doc.text('Rent Revision Details', margin, y); y += 5;

    const terms = [
      ['Current Monthly Rent', `Rs. ${cur.toLocaleString('en-IN')}`],
      ['Proposed New Monthly Rent', `Rs. ${neu.toLocaleString('en-IN')}`],
      ['Increase Amount / %', `Rs. ${inc.toLocaleString('en-IN')} (${pct}%)`],
      ['Effective From', f.effectiveDate || '_______________'],
      ['Notice Period Given', `${f.noticeDays} days`]
    ];
    doc.setFillColor(...GOLD);
    doc.rect(margin, y, pageW - margin * 2, 6.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7.5);
    doc.text('Particulars', margin + 3, y + 4.3);
    doc.text('Details', margin + 70, y + 4.3);
    y += 6.5;
    terms.forEach((r, i) => {
      if (i % 2 === 0) { doc.setFillColor(...CREAM); doc.rect(margin, y, pageW - margin * 2, 6.5, 'F'); }
      doc.setDrawColor(...BORDER); doc.setLineWidth(0.15); doc.rect(margin, y, pageW - margin * 2, 6.5);
      doc.setTextColor(...DARK); doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5);
      doc.text(r[0], margin + 3, y + 4.3); doc.text(r[1], margin + 70, y + 4.3);
      y += 6.5;
    });
    y += 6;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...GOLD);
    doc.text('State-wise Guidance (Indicative)', margin, y); y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...DARK);
    const guide = 'Maharashtra: Under Rent Control Act increases are regulated for certain properties; for leave & license, contractual terms usually govern. Karnataka / Telangana / Delhi / Tamil Nadu / Gujarat: Generally guided by the agreement. Many agreements allow 5–10% annual increase. Always check your specific agreement clause and local rules.';
    lines = doc.splitTextToSize(guide, pageW - margin * 2);
    doc.text(lines, margin, y); y += lines.length * 4 + 5;

    const close = 'You are requested to take note of the revised rent and ensure payment of the new amount from the effective date. If you have any objection, please write within 15 days of receipt of this notice.';
    lines = doc.splitTextToSize(close, pageW - margin * 2);
    doc.text(lines, margin, y); y += lines.length * 4.5 + 10;

    doc.text('Yours faithfully,', margin, y); y += 12;
    doc.text('_________________________', margin, y); y += 4;
    doc.setFont('helvetica', 'bold');
    doc.text(f.landlordName + ' (Landlord)', margin, y); y += 4;
    doc.setFont('helvetica', 'normal');
    doc.text('Date: _______________', margin, y);

    pdfFooter(doc, 'NOTICE');
    doc.save(`Rent_Increase_Notice_${(f.tenantName || 'Tenant').replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <motion.div variants={fadeIn} initial="initial" animate="animate" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Field label="Landlord Name *"><input className={inputCls} value={f.landlordName} onChange={e => s('landlordName', e.target.value)} /></Field>
      <Field label="Tenant Name *"><input className={inputCls} value={f.tenantName} onChange={e => s('tenantName', e.target.value)} /></Field>
      <Field label="Property Address" className="md:col-span-2"><input className={inputCls} value={f.address} onChange={e => s('address', e.target.value)} /></Field>
      <Field label="City"><input className={inputCls} value={f.city} onChange={e => s('city', e.target.value)} /></Field>
      <Field label="State">
        <select className={inputCls + ' cursor-pointer'} value={f.state} onChange={e => s('state', e.target.value)}>
          {STATES.map(st => <option key={st}>{st}</option>)}
        </select>
      </Field>
      <Field label="Current Rent (₹) *"><input className={inputCls} type="number" value={f.currentRent} onChange={e => s('currentRent', e.target.value)} /></Field>
      <Field label="New Rent (₹) *"><input className={inputCls} type="number" value={f.newRent} onChange={e => s('newRent', e.target.value)} /></Field>
      <Field label="Effective Date"><input className={inputCls} type="date" value={f.effectiveDate} onChange={e => s('effectiveDate', e.target.value)} /></Field>
      <Field label="Notice Period (days)">
        <select className={inputCls + ' cursor-pointer'} value={f.noticeDays} onChange={e => s('noticeDays', e.target.value)}>
          {['15', '30', '60', '90'].map(d => <option key={d}>{d}</option>)}
        </select>
      </Field>
      <Field label="Original Agreement Date"><input className={inputCls} type="date" value={f.agreementDate} onChange={e => s('agreementDate', e.target.value)} /></Field>
      <div className="md:col-span-2 lg:col-span-3 mt-2">
        <button onClick={download} className="btn btn-primary py-4 px-8 text-base font-bold shadow-md hover:shadow-lg inline-flex items-center gap-2">
          <Download className="w-5 h-5" /> Download Rent Increase Notice
        </button>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   4. HRA CERTIFICATE / TAX BUNDLE
   ═══════════════════════════════════════════════════════════════ */
function HRABundleGenerator() {
  const [f, setF] = useState({
    landlordName: '', tenantName: '', address: '', rent: '', months: '6',
    landlordPan: '', tenantPan: '', fy: '2025-26'
  });
  const s = (k, v) => setF(p => ({ ...p, [k]: v }));

  const download = () => {
    if (!f.landlordName || !f.tenantName || !f.rent) return;
    const rent = Number(f.rent) || 0;
    const months = Number(f.months) || 6;
    const total = rent * months;

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = pdfHeader(doc, 'HRA CERTIFICATE + RENT RECEIPT BUNDLE', 'TAX DOCUMENT (Sec 10(13A))');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(`Financial Year: ${f.fy}  |  For Employer / IT Returns`, pageW / 2, y, { align: 'center' });
    y += 7;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...GOLD);
    doc.text('A. LANDLORD DECLARATION / HRA CERTIFICATE', margin, y); y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...DARK);
    const decl = `I, ${f.landlordName}, do hereby declare that I am the owner/landlord of ${f.address || 'the premises'}. Ms. ${f.tenantName} (PAN: ${f.tenantPan || '_____________'}) has been occupying the said premises as tenant and has paid rent as follows:`;
    let lines = doc.splitTextToSize(decl, pageW - margin * 2);
    doc.text(lines, margin, y); y += lines.length * 4.2 + 4;

    doc.setFillColor(...GOLD);
    doc.rect(margin, y, pageW - margin * 2, 6.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7.5);
    doc.text('Month', margin + 3, y + 4.3);
    doc.text('Rent (Rs.)', margin + 50, y + 4.3);
    doc.text('Mode', margin + 100, y + 4.3);
    y += 6.5;

    const monthNames = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
    for (let i = 0; i < Math.min(months, 12); i++) {
      if (i % 2 === 0) { doc.setFillColor(...CREAM); doc.rect(margin, y, pageW - margin * 2, 6, 'F'); }
      doc.setDrawColor(...BORDER); doc.setLineWidth(0.15); doc.rect(margin, y, pageW - margin * 2, 6);
      doc.setTextColor(...DARK); doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5);
      doc.text(monthNames[i] + ' ' + (i < 9 ? '2025' : '2026'), margin + 3, y + 4);
      doc.text(rent.toLocaleString('en-IN'), margin + 50, y + 4);
      doc.text('UPI / Bank', margin + 100, y + 4);
      y += 6;
    }
    doc.setFillColor(232, 245, 233);
    doc.rect(margin, y, pageW - margin * 2, 6.5, 'F');
    doc.setDrawColor(...BORDER); doc.rect(margin, y, pageW - margin * 2, 6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DARK);
    doc.text('Total', margin + 3, y + 4.3);
    doc.text(total.toLocaleString('en-IN'), margin + 50, y + 4.3);
    y += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('I have not claimed any deduction under Section 24 in respect of the same rent. The above is true to the best of my knowledge.', margin, y);
    y += 8;
    doc.text('_________________________', margin, y); y += 4;
    doc.setFont('helvetica', 'bold');
    doc.text(f.landlordName + ' (Landlord)', margin, y); y += 3.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(`PAN: ${f.landlordPan || '_____________'}  |  Date: _______________`, margin, y);
    y += 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...GOLD);
    doc.text('B. TENANT DECLARATION', margin, y); y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...DARK);
    const tdecl = `I, ${f.tenantName}, confirm that the rent amounts stated above were actually paid by me for residential accommodation and that I am claiming HRA exemption under Section 10(13A) read with Rule 2A.`;
    lines = doc.splitTextToSize(tdecl, pageW - margin * 2);
    doc.text(lines, margin, y); y += lines.length * 4.2 + 6;
    doc.text('_________________________', margin, y); y += 4;
    doc.setFont('helvetica', 'bold');
    doc.text(f.tenantName + ' (Tenant)', margin, y); y += 3.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(`PAN: ${f.tenantPan || '_____________'}  |  Date: _______________`, margin, y);

    pdfFooter(doc, 'TAX');
    doc.save(`HRA_Tax_Bundle_${(f.tenantName || 'Tenant').replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <motion.div variants={fadeIn} initial="initial" animate="animate" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Field label="Landlord Name *"><input className={inputCls} value={f.landlordName} onChange={e => s('landlordName', e.target.value)} /></Field>
      <Field label="Tenant Name *"><input className={inputCls} value={f.tenantName} onChange={e => s('tenantName', e.target.value)} /></Field>
      <Field label="Property Address" className="md:col-span-2"><input className={inputCls} value={f.address} onChange={e => s('address', e.target.value)} /></Field>
      <Field label="Monthly Rent (₹) *"><input className={inputCls} type="number" value={f.rent} onChange={e => s('rent', e.target.value)} /></Field>
      <Field label="No. of Months">
        <select className={inputCls + ' cursor-pointer'} value={f.months} onChange={e => s('months', e.target.value)}>
          {[3, 6, 9, 12].map(m => <option key={m} value={m}>{m} months</option>)}
        </select>
      </Field>
      <Field label="Financial Year"><input className={inputCls} value={f.fy} onChange={e => s('fy', e.target.value)} placeholder="2025-26" /></Field>
      <Field label="Landlord PAN"><input className={inputCls} value={f.landlordPan} onChange={e => s('landlordPan', e.target.value)} /></Field>
      <Field label="Tenant PAN"><input className={inputCls} value={f.tenantPan} onChange={e => s('tenantPan', e.target.value)} /></Field>
      <div className="md:col-span-2 lg:col-span-3 mt-2">
        <button onClick={download} className="btn btn-primary py-4 px-8 text-base font-bold shadow-md hover:shadow-lg inline-flex items-center gap-2">
          <Download className="w-5 h-5" /> Download HRA Tax Bundle
        </button>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   5. POLICE VERIFICATION PRE-FILL
   ═══════════════════════════════════════════════════════════════ */
function PolicePrefillGenerator() {
  const [f, setF] = useState({
    tenantName: '', fatherName: '', dob: '', gender: 'Female', aadhaar: '', pan: '',
    mobile: '', email: '', permanentAddress: '', rentedAddress: '', policeStation: '',
    landlordName: '', landlordMobile: '', landlordAddress: '', state: 'Maharashtra'
  });
  const s = (k, v) => setF(p => ({ ...p, [k]: v }));

  const download = () => {
    if (!f.tenantName) return;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = pdfHeader(doc, 'POLICE VERIFICATION – TENANT APPLICATION PRE-FILL', 'VERIFICATION AID');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text('Use this to fill state portals. Actual submission must be on the official portal / at the police station.', pageW / 2, y, { align: 'center' });
    y += 7;

    const section = (title) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...GOLD);
      doc.text(title, margin, y);
      y += 5;
    };
    const row = (label, value) => {
      doc.setFillColor(...CREAM);
      doc.setDrawColor(...BORDER);
      doc.setLineWidth(0.2);
      doc.rect(margin, y, 50, 6.5, 'FD');
      doc.rect(margin + 50, y, pageW - margin * 2 - 50, 6.5, 'S');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...DARK);
      doc.text(label, margin + 2, y + 4.3);
      doc.setFont('helvetica', 'normal');
      doc.text(value || '—', margin + 52, y + 4.3);
      y += 6.5;
    };

    section('1. TENANT DETAILS');
    row('Full Name', f.tenantName);
    row("Father's / Husband's Name", f.fatherName);
    row('Date of Birth', f.dob);
    row('Gender', f.gender);
    row('Aadhaar No.', f.aadhaar);
    row('PAN', f.pan);
    row('Mobile', f.mobile);
    row('Email', f.email);
    row('Permanent Address', f.permanentAddress);
    row('Rented Address', f.rentedAddress);
    row('Police Station', f.policeStation);
    y += 4;

    section('2. LANDLORD DETAILS');
    row('Landlord Name', f.landlordName);
    row('Landlord Mobile', f.landlordMobile);
    row('Landlord Address', f.landlordAddress);
    y += 4;

    section('3. DOCUMENTS TO ATTACH');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...DARK);
    ['Tenant Aadhaar (front + back)', 'Tenant passport-size photos (2)', 'Signed rental agreement',
      'Landlord Aadhaar / ownership proof', 'Society NOC (if required)', 'Previous address proof (if any)'
    ].forEach(c => { doc.text(`☐  ${c}`, margin + 2, y); y += 4.5; });
    y += 3;

    section('4. STATE PORTAL LINKS');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const portals = 'Maharashtra: tenantverification.mahapolice.gov.in  |  Karnataka: ksp.gov.in  |  Telangana: TSCOP App  |  Delhi: delhipolice.gov.in  |  Others: local PS / state police website';
    const pl = doc.splitTextToSize(portals, pageW - margin * 2);
    doc.text(pl, margin, y);

    pdfFooter(doc, 'POLICE');
    doc.save(`Police_Verification_${(f.tenantName || 'Tenant').replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <motion.div variants={fadeIn} initial="initial" animate="animate" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Field label="Tenant Full Name *"><input className={inputCls} value={f.tenantName} onChange={e => s('tenantName', e.target.value)} /></Field>
      <Field label="Father's / Husband's Name"><input className={inputCls} value={f.fatherName} onChange={e => s('fatherName', e.target.value)} /></Field>
      <Field label="Date of Birth"><input className={inputCls} type="date" value={f.dob} onChange={e => s('dob', e.target.value)} /></Field>
      <Field label="Gender">
        <select className={inputCls + ' cursor-pointer'} value={f.gender} onChange={e => s('gender', e.target.value)}>
          {['Female', 'Male', 'Other'].map(g => <option key={g}>{g}</option>)}
        </select>
      </Field>
      <Field label="Aadhaar"><input className={inputCls} value={f.aadhaar} onChange={e => s('aadhaar', e.target.value)} placeholder="XXXX-XXXX-XXXX" /></Field>
      <Field label="PAN"><input className={inputCls} value={f.pan} onChange={e => s('pan', e.target.value)} /></Field>
      <Field label="Mobile"><input className={inputCls} value={f.mobile} onChange={e => s('mobile', e.target.value)} /></Field>
      <Field label="Email"><input className={inputCls} value={f.email} onChange={e => s('email', e.target.value)} /></Field>
      <Field label="Permanent Address" className="md:col-span-2"><input className={inputCls} value={f.permanentAddress} onChange={e => s('permanentAddress', e.target.value)} /></Field>
      <Field label="Rented Address" className="md:col-span-2"><input className={inputCls} value={f.rentedAddress} onChange={e => s('rentedAddress', e.target.value)} /></Field>
      <Field label="Police Station"><input className={inputCls} value={f.policeStation} onChange={e => s('policeStation', e.target.value)} /></Field>
      <Field label="State">
        <select className={inputCls + ' cursor-pointer'} value={f.state} onChange={e => s('state', e.target.value)}>
          {STATES.map(st => <option key={st}>{st}</option>)}
        </select>
      </Field>
      <Field label="Landlord Name"><input className={inputCls} value={f.landlordName} onChange={e => s('landlordName', e.target.value)} /></Field>
      <Field label="Landlord Mobile"><input className={inputCls} value={f.landlordMobile} onChange={e => s('landlordMobile', e.target.value)} /></Field>
      <Field label="Landlord Address" className="md:col-span-2"><input className={inputCls} value={f.landlordAddress} onChange={e => s('landlordAddress', e.target.value)} /></Field>
      <div className="md:col-span-2 lg:col-span-3 mt-2">
        <button onClick={download} className="btn btn-primary py-4 px-8 text-base font-bold shadow-md hover:shadow-lg inline-flex items-center gap-2">
          <Download className="w-5 h-5" /> Download Police Verification Prefill
        </button>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   6. SOCIETY / RWA NOC REQUEST
   ═══════════════════════════════════════════════════════════════ */
function NOCGenerator() {
  const [f, setF] = useState({
    ownerName: '', tenantName: '', flatNo: '', societyName: '', societyAddress: '',
    startDate: '', duration: '11', tenantMobile: '', tenantAadhaar: ''
  });
  const s = (k, v) => setF(p => ({ ...p, [k]: v }));

  const download = () => {
    if (!f.ownerName || !f.tenantName || !f.societyName) return;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 16;
    let y = pdfHeader(doc, 'SOCIETY / RWA – NOC REQUEST LETTER', 'NOC REQUEST');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, pageW / 2, y, { align: 'center' });
    y += 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    doc.text('To,', margin, y); y += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.text('The Chairman / Secretary', margin, y); y += 4;
    doc.text(f.societyName, margin, y); y += 4;
    doc.text(f.societyAddress || '—', margin, y); y += 7;

    doc.setFont('helvetica', 'bold');
    doc.text(`Subject: Request for No Objection Certificate (NOC) for Tenant – ${f.flatNo || 'Flat'}`, margin, y);
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const body = `I, ${f.ownerName}, am the owner of ${f.flatNo || 'the flat'} in your society. I have given the said flat on leave & license / rent to ${f.tenantName} for a period of ${f.duration} months commencing from ${f.startDate || '_______________'}.\n\nI request you to kindly issue a No Objection Certificate (NOC) in favour of the above tenant for the purpose of police verification / society records / utility connections, as required.\n\nTenant details: Name: ${f.tenantName}  |  Mobile: ${f.tenantMobile || '________'}  |  Aadhaar: ${f.tenantAadhaar || 'XXXX-XXXX-XXXX'}\n\nI undertake that the tenant will abide by all society bye-laws. Any violation will be my responsibility as owner.\n\nKindly issue the NOC at the earliest. I am ready to pay any applicable society charges.`;
    const lines = doc.splitTextToSize(body, pageW - margin * 2);
    doc.text(lines, margin, y); y += lines.length * 4.3 + 10;

    doc.text('Yours sincerely,', margin, y); y += 12;
    doc.text('_________________________', margin, y); y += 4;
    doc.setFont('helvetica', 'bold');
    doc.text(f.ownerName + ' (Owner)', margin, y); y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`${f.flatNo || ''}  |  Date: _______________`, margin, y);

    pdfFooter(doc, 'NOC');
    doc.save(`Society_NOC_Request_${(f.tenantName || 'Tenant').replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <motion.div variants={fadeIn} initial="initial" animate="animate" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Field label="Owner Name *"><input className={inputCls} value={f.ownerName} onChange={e => s('ownerName', e.target.value)} /></Field>
      <Field label="Tenant Name *"><input className={inputCls} value={f.tenantName} onChange={e => s('tenantName', e.target.value)} /></Field>
      <Field label="Flat / Unit No"><input className={inputCls} value={f.flatNo} onChange={e => s('flatNo', e.target.value)} placeholder="Flat 302" /></Field>
      <Field label="Society / RWA Name *"><input className={inputCls} value={f.societyName} onChange={e => s('societyName', e.target.value)} /></Field>
      <Field label="Society Address" className="md:col-span-2"><input className={inputCls} value={f.societyAddress} onChange={e => s('societyAddress', e.target.value)} /></Field>
      <Field label="Agreement Start Date"><input className={inputCls} type="date" value={f.startDate} onChange={e => s('startDate', e.target.value)} /></Field>
      <Field label="Duration (months)"><input className={inputCls} value={f.duration} onChange={e => s('duration', e.target.value)} /></Field>
      <Field label="Tenant Mobile"><input className={inputCls} value={f.tenantMobile} onChange={e => s('tenantMobile', e.target.value)} /></Field>
      <Field label="Tenant Aadhaar"><input className={inputCls} value={f.tenantAadhaar} onChange={e => s('tenantAadhaar', e.target.value)} /></Field>
      <div className="md:col-span-2 lg:col-span-3 mt-2">
        <button onClick={download} className="btn btn-primary py-4 px-8 text-base font-bold shadow-md hover:shadow-lg inline-flex items-center gap-2">
          <Download className="w-5 h-5" /> Download NOC Request Letter
        </button>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   7. UTILITY TRANSFER LETTERS
   ═══════════════════════════════════════════════════════════════ */
function UtilityGenerator() {
  const [f, setF] = useState({
    applicantName: '', address: '', consumerNo: '', meterNo: '',
    previousName: '', mobile: '', utility: 'Electricity'
  });
  const s = (k, v) => setF(p => ({ ...p, [k]: v }));

  const download = () => {
    if (!f.applicantName || !f.address) return;
    const boards = {
      Electricity: 'MSEDCL / Local Electricity Board',
      Gas: 'IGL / Mahanagar Gas / Local Distributor',
      Water: 'PMC / Local Municipal Water Department'
    };
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 16;
    let y = pdfHeader(doc, `${f.utility.toUpperCase()} – NAME CHANGE / TRANSFER REQUEST`, 'UTILITY DOCUMENT');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, pageW / 2, y, { align: 'center' });
    y += 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    doc.text('To,', margin, y); y += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.text('The Officer In-charge', margin, y); y += 4;
    doc.text(boards[f.utility] || 'Utility Provider', margin, y); y += 4;
    doc.text('[Local Office Address]', margin, y); y += 7;

    doc.setFont('helvetica', 'bold');
    doc.text(`Subject: Request for transfer / name change of ${f.utility} connection – ${f.address}`, margin, y);
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const body = `I, ${f.applicantName}, request you to kindly transfer / change the name on the above ${f.utility} connection from ${f.previousName || 'the previous consumer'} to my name.\n\nConsumer / Account No.: ${f.consumerNo || '_____________'}\nMeter No.: ${f.meterNo || '_____________'}\nProperty Address: ${f.address}\n\nDocuments attached: (1) ID proof, (2) Address proof / agreement, (3) Previous bill, (4) NOC from owner / society (if required).\n\nI undertake to pay all outstanding dues and future bills.`;
    const lines = doc.splitTextToSize(body, pageW - margin * 2);
    doc.text(lines, margin, y); y += lines.length * 4.3 + 10;

    doc.text('_________________________', margin, y); y += 4;
    doc.setFont('helvetica', 'bold');
    doc.text(f.applicantName + ' (Applicant)', margin, y); y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Mobile: ${f.mobile || '_____________'}  |  Date: _______________`, margin, y);

    pdfFooter(doc, 'UTILITY');
    doc.save(`Utility_${f.utility}_${(f.applicantName || 'Applicant').replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <motion.div variants={fadeIn} initial="initial" animate="animate" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Field label="Applicant Name *"><input className={inputCls} value={f.applicantName} onChange={e => s('applicantName', e.target.value)} /></Field>
      <Field label="Utility Type">
        <select className={inputCls + ' cursor-pointer'} value={f.utility} onChange={e => s('utility', e.target.value)}>
          {['Electricity', 'Gas', 'Water'].map(u => <option key={u}>{u}</option>)}
        </select>
      </Field>
      <Field label="Property Address *" className="md:col-span-2"><input className={inputCls} value={f.address} onChange={e => s('address', e.target.value)} /></Field>
      <Field label="Consumer / Account No"><input className={inputCls} value={f.consumerNo} onChange={e => s('consumerNo', e.target.value)} /></Field>
      <Field label="Meter No"><input className={inputCls} value={f.meterNo} onChange={e => s('meterNo', e.target.value)} /></Field>
      <Field label="Previous Consumer Name"><input className={inputCls} value={f.previousName} onChange={e => s('previousName', e.target.value)} /></Field>
      <Field label="Mobile"><input className={inputCls} value={f.mobile} onChange={e => s('mobile', e.target.value)} /></Field>
      <div className="md:col-span-2 lg:col-span-3 mt-2">
        <button onClick={download} className="btn btn-primary py-4 px-8 text-base font-bold shadow-md hover:shadow-lg inline-flex items-center gap-2">
          <Download className="w-5 h-5" /> Download Utility Transfer Letter
        </button>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   8. ROOMMATE AGREEMENT ADDENDUM
   ═══════════════════════════════════════════════════════════════ */
function RoommateGenerator() {
  const [f, setF] = useState({
    tenant1: '', tenant2: '', address: '', totalRent: '', share1: '', share2: '',
    depositShare: '', guestNights: '4', quietStart: '23:00', quietEnd: '07:00'
  });
  const s = (k, v) => setF(p => ({ ...p, [k]: v }));

  const download = () => {
    if (!f.tenant1 || !f.tenant2) return;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = pdfHeader(doc, 'ROOMMATE / FLATMATE AGREEMENT ADDENDUM', 'SHARED LIVING');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text('To be attached to the main Rental / Leave & License Agreement', pageW / 2, y, { align: 'center' });
    y += 7;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...GOLD);
    doc.text('1. PARTIES & PROPERTY', margin, y); y += 5;

    doc.setFillColor(...CREAM);
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y, (pageW - margin * 2) / 2 - 2, 16, 1.5, 1.5, 'FD');
    doc.roundedRect(margin + (pageW - margin * 2) / 2 + 2, y, (pageW - margin * 2) / 2 - 2, 16, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...DARK);
    doc.text('Co-Tenant 1', margin + 3, y + 5);
    doc.text('Co-Tenant 2', margin + (pageW - margin * 2) / 2 + 5, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.text(f.tenant1, margin + 3, y + 11);
    doc.text(f.tenant2, margin + (pageW - margin * 2) / 2 + 5, y + 11);
    y += 22;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(`Property: ${f.address || '—'}`, margin, y); y += 7;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...GOLD);
    doc.text('2. SHARED RESPONSIBILITIES', margin, y); y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...DARK);
    const items = [
      `Rent split: ${f.tenant1} pays Rs. ${f.share1 || '____'}  |  ${f.tenant2} pays Rs. ${f.share2 || '____'}  (Total: Rs. ${f.totalRent || '____'}) by 5th of every month.`,
      `Security deposit share: Rs. ${f.depositShare || '____'} each (refund as per main agreement).`,
      'Utilities (electricity, water, gas, internet, society): Split equally / as mutually agreed. Bills paid on time.',
      'Cleaning: Shared rotation for common areas (kitchen, living, bathrooms).',
      `Guests: Overnight guests limited to ${f.guestNights || '4'} nights per month with prior notice.`,
      `Quiet hours: ${f.quietStart || '11 PM'} – ${f.quietEnd || '7 AM'}. Respect work-from-home needs.`,
      'Food & groceries: Shared or separate as mutually agreed. Kitchen rules to be respected.',
      'Pets: As per main agreement / society rules only.'
    ];
    items.forEach(it => {
      const lines = doc.splitTextToSize('•  ' + it, pageW - margin * 2);
      doc.text(lines, margin, y);
      y += lines.length * 3.8 + 2.5;
    });
    y += 3;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...GOLD);
    doc.text('3. EXIT & REPLACEMENT', margin, y); y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...DARK);
    const exit = 'If one co-tenant leaves before the end of the main agreement, they must give at least 30 days’ written notice to the other co-tenant(s) and the Landlord. They remain liable for their share of rent until a mutually accepted replacement is found or the notice period ends. Security deposit share settled after final handover.';
    const el = doc.splitTextToSize(exit, pageW - margin * 2);
    doc.text(el, margin, y); y += el.length * 3.8 + 6;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...GOLD);
    doc.text('4. SIGNATURES', margin, y); y += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...DARK);
    doc.text('_________________________', margin + 5, y);
    doc.text('_________________________', pageW / 2 + 5, y);
    y += 4;
    doc.text(f.tenant1, margin + 5, y);
    doc.text(f.tenant2, pageW / 2 + 5, y);
    y += 4;
    doc.text('Date: _______________', margin + 5, y);
    doc.text('Date: _______________', pageW / 2 + 5, y);

    pdfFooter(doc, 'ROOMMATE');
    doc.save(`Roommate_Addendum_${(f.tenant1 || 'Tenant').replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <motion.div variants={fadeIn} initial="initial" animate="animate" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Field label="Co-Tenant 1 *"><input className={inputCls} value={f.tenant1} onChange={e => s('tenant1', e.target.value)} /></Field>
      <Field label="Co-Tenant 2 *"><input className={inputCls} value={f.tenant2} onChange={e => s('tenant2', e.target.value)} /></Field>
      <Field label="Property Address" className="md:col-span-2"><input className={inputCls} value={f.address} onChange={e => s('address', e.target.value)} /></Field>
      <Field label="Total Rent (₹)"><input className={inputCls} type="number" value={f.totalRent} onChange={e => s('totalRent', e.target.value)} /></Field>
      <Field label="Share – Tenant 1 (₹)"><input className={inputCls} type="number" value={f.share1} onChange={e => s('share1', e.target.value)} /></Field>
      <Field label="Share – Tenant 2 (₹)"><input className={inputCls} type="number" value={f.share2} onChange={e => s('share2', e.target.value)} /></Field>
      <Field label="Deposit Share each (₹)"><input className={inputCls} type="number" value={f.depositShare} onChange={e => s('depositShare', e.target.value)} /></Field>
      <Field label="Guest Nights / month"><input className={inputCls} value={f.guestNights} onChange={e => s('guestNights', e.target.value)} /></Field>
      <Field label="Quiet Hours Start"><input className={inputCls} value={f.quietStart} onChange={e => s('quietStart', e.target.value)} placeholder="23:00" /></Field>
      <Field label="Quiet Hours End"><input className={inputCls} value={f.quietEnd} onChange={e => s('quietEnd', e.target.value)} placeholder="07:00" /></Field>
      <div className="md:col-span-2 lg:col-span-3 mt-2">
        <button onClick={download} className="btn btn-primary py-4 px-8 text-base font-bold shadow-md hover:shadow-lg inline-flex items-center gap-2">
          <Download className="w-5 h-5" /> Download Roommate Addendum
        </button>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   9. INVENTORY / CONDITION REPORT
   ═══════════════════════════════════════════════════════════════ */
function InventoryGenerator() {
  const [f, setF] = useState({
    landlordName: '', tenantName: '', address: '', reportDate: '', type: 'Move-In'
  });
  const s = (k, v) => setF(p => ({ ...p, [k]: v }));

  const download = () => {
    if (!f.landlordName || !f.tenantName) return;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 14;
    let y = pdfHeader(doc, 'INVENTORY & CONDITION REPORT', 'MOVE-IN / MOVE-OUT EVIDENCE');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(`Property: ${f.address || '—'}  |  Date: ${f.reportDate || '_______________'}  |  Type: ${f.type}`, pageW / 2, y, { align: 'center' });
    y += 6;
    doc.setTextColor(...DARK);
    doc.text(`Landlord: ${f.landlordName}    |    Tenant: ${f.tenantName}`, pageW / 2, y, { align: 'center' });
    y += 7;

    const rooms = [
      { name: 'Living Room', items: ['Sofa / Seating', 'Coffee table', 'TV / Stand', 'Curtains / Blinds', 'Lights / Fans', 'Walls & Floor'] },
      { name: 'Bedroom', items: ['Bed / Mattress', 'Wardrobe', 'Side tables', 'Curtains', 'Lights / Fans / AC', 'Walls & Floor'] },
      { name: 'Kitchen', items: ['Stove / Chimney', 'Sink & Taps', 'Cabinets', 'Refrigerator', 'Exhaust / Lights', 'Walls & Floor'] },
      { name: 'Bathroom', items: ['WC / Flush', 'Washbasin & Taps', 'Shower / Geyser', 'Mirror / Shelf', 'Tiles & Floor', 'Exhaust'] },
      { name: 'General', items: ['Main door lock / keys', 'Windows & grills', 'Balcony / Utility', 'Intercom / Bell', 'Parking slot', 'Other fixtures'] }
    ];

    rooms.forEach(room => {
      if (y > 250) { doc.addPage(); y = 16; }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...GOLD);
      doc.text(room.name, margin, y); y += 4;

      doc.setFillColor(...GOLD);
      doc.rect(margin, y, pageW - margin * 2, 5.5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.text('Item', margin + 2, y + 3.8);
      doc.text('Qty', margin + 55, y + 3.8);
      doc.text('Condition (E/G/F/D)', margin + 70, y + 3.8);
      doc.text('Notes / Photo #', margin + 115, y + 3.8);
      y += 5.5;

      room.items.forEach((it, i) => {
        if (i % 2 === 0) { doc.setFillColor(...CREAM); doc.rect(margin, y, pageW - margin * 2, 5.5, 'F'); }
        doc.setDrawColor(...BORDER); doc.setLineWidth(0.12); doc.rect(margin, y, pageW - margin * 2, 5.5);
        doc.setTextColor(...DARK); doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
        doc.text(it, margin + 2, y + 3.8);
        doc.text('___', margin + 55, y + 3.8);
        doc.text('E / G / F / D', margin + 70, y + 3.8);
        doc.text('_______________', margin + 115, y + 3.8);
        y += 5.5;
      });
      y += 3;
    });

    if (y > 240) { doc.addPage(); y = 16; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...GOLD);
    doc.text('PHOTO / VIDEO EVIDENCE', margin, y); y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...DARK);
    doc.text('Attach date-stamped photos. Folder link: ________________________________________________', margin, y);
    y += 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...GOLD);
    doc.text('DECLARATION & SIGNATURES', margin, y); y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...DARK);
    const decl = 'Both parties confirm the inventory and condition recorded above are accurate. This document is the baseline for assessing damages at exit.';
    const dl = doc.splitTextToSize(decl, pageW - margin * 2);
    doc.text(dl, margin, y); y += dl.length * 3.8 + 10;

    doc.text('_________________________', margin + 5, y);
    doc.text('_________________________', pageW / 2 + 5, y);
    y += 4;
    doc.text(`Tenant: ${f.tenantName}`, margin + 5, y);
    doc.text(`Landlord: ${f.landlordName}`, pageW / 2 + 5, y);
    y += 4;
    doc.text('Date: _______________', margin + 5, y);
    doc.text('Date: _______________', pageW / 2 + 5, y);

    pdfFooter(doc, 'INVENTORY');
    doc.save(`Inventory_Report_${(f.tenantName || 'Tenant').replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <motion.div variants={fadeIn} initial="initial" animate="animate" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Field label="Landlord Name *"><input className={inputCls} value={f.landlordName} onChange={e => s('landlordName', e.target.value)} /></Field>
      <Field label="Tenant Name *"><input className={inputCls} value={f.tenantName} onChange={e => s('tenantName', e.target.value)} /></Field>
      <Field label="Property Address" className="md:col-span-2"><input className={inputCls} value={f.address} onChange={e => s('address', e.target.value)} /></Field>
      <Field label="Report Date"><input className={inputCls} type="date" value={f.reportDate} onChange={e => s('reportDate', e.target.value)} /></Field>
      <Field label="Report Type">
        <select className={inputCls + ' cursor-pointer'} value={f.type} onChange={e => s('type', e.target.value)}>
          {['Move-In', 'Move-Out'].map(t => <option key={t}>{t}</option>)}
        </select>
      </Field>
      <div className="md:col-span-2 lg:col-span-3 mt-2">
        <button onClick={download} className="btn btn-primary py-4 px-8 text-base font-bold shadow-md hover:shadow-lg inline-flex items-center gap-2">
          <Download className="w-5 h-5" /> Download Inventory Report
        </button>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   10. LEAVE & LICENSE vs RENTAL EXPLAINER
   ═══════════════════════════════════════════════════════════════ */
function LeaveLicenseExplainer() {
  const download = () => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = pdfHeader(doc, 'LEAVE & LICENSE vs RENTAL AGREEMENT', 'EXPLAINER + GUIDANCE');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text('Understand the difference before you sign or generate your document', pageW / 2, y, { align: 'center' });
    y += 7;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...GOLD);
    doc.text('1. QUICK COMPARISON', margin, y); y += 5;

    const headers = ['Point', 'Leave & License', 'Rental / Lease'];
    const rows = [
      ['Nature', 'Permission to use (license)', 'Transfer of interest'],
      ['Common in', 'Maharashtra, Gujarat', 'Most other states'],
      ['Tenant rights', 'Generally weaker; easier exit', 'Stronger statutory protection'],
      ['Duration', 'Often 11 months', '11 months or longer'],
      ['Registration', 'If > 11 months in many states', 'Usually if term > 11–12 months'],
      ['Best for', 'Short-medium term, clear exit', 'Longer stay, stronger protection']
    ];

    const colW = [(pageW - margin * 2) * 0.22, (pageW - margin * 2) * 0.39, (pageW - margin * 2) * 0.39];
    doc.setFillColor(...GOLD);
    doc.rect(margin, y, pageW - margin * 2, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    let x = margin;
    headers.forEach((h, i) => { doc.text(h, x + 2, y + 4); x += colW[i]; });
    y += 6;

    rows.forEach((r, ri) => {
      if (ri % 2 === 0) { doc.setFillColor(...CREAM); doc.rect(margin, y, pageW - margin * 2, 7, 'F'); }
      doc.setDrawColor(...BORDER); doc.setLineWidth(0.15); doc.rect(margin, y, pageW - margin * 2, 7);
      doc.setTextColor(...DARK); doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5);
      x = margin;
      r.forEach((cell, i) => { doc.text(cell, x + 2, y + 4.5); x += colW[i]; });
      y += 7;
    });
    y += 6;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...GOLD);
    doc.text('2. WHICH ONE SHOULD YOU USE?', margin, y); y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...DARK);
    const guide = '• Maharashtra & Gujarat: Leave & License is standard for residential. Use that format.\n• Other states: Rental / Lease Agreement is more common.\n• Duration tip: 11-month agreements are popular to stay under registration thresholds, but longer registered agreements give more certainty.\n• Always execute on stamp paper of appropriate value and consider registration for stronger enforceability.';
    const gl = doc.splitTextToSize(guide, pageW - margin * 2);
    doc.text(gl, margin, y); y += gl.length * 3.8 + 5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...GOLD);
    doc.text('3. ESTATEXAI GENERATOR GUIDANCE', margin, y); y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...DARK);
    const gen = 'Our Rental Agreement Generator produces a balanced residential agreement suitable for most Indian states. For Maharashtra/Gujarat-style Leave & License, use the same generator and title it “Leave and License Agreement” if desired. Key commercial terms remain the same.\n\nRecommended steps:\n1. Generate from EstateXAI Toolkit\n2. Print on stamp paper of correct value\n3. Both parties sign + 2 witnesses\n4. Register if required by state law\n5. Pair with Inventory Report + Police Verification';
    const genl = doc.splitTextToSize(gen, pageW - margin * 2);
    doc.text(genl, margin, y); y += genl.length * 3.8 + 5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...GOLD);
    doc.text('4. DISCLAIMER', margin, y); y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...DARK);
    const disc = 'This explainer is for general awareness only and does not constitute legal advice. Stamp duty, registration requirements and tenant protections vary by state. Consult a local lawyer or stamp authority for your specific case.';
    const discl = doc.splitTextToSize(disc, pageW - margin * 2);
    doc.text(discl, margin, y);

    pdfFooter(doc, 'GUIDE');
    doc.save('Leave_License_vs_Rental_Explainer.pdf');
  };

  return (
    <motion.div variants={fadeIn} initial="initial" animate="animate" className="text-center py-8">
      <p className="text-muted mb-6 max-w-xl mx-auto">
        Clear comparison of Leave & License vs Rental Agreement, state guidance, and how to use the EstateXAI generator correctly.
      </p>
      <button onClick={download} className="btn btn-primary py-4 px-8 text-base font-bold shadow-md hover:shadow-lg inline-flex items-center gap-2">
        <Download className="w-5 h-5" /> Download Explainer PDF
      </button>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EXISTING: Agreement + Receipt (kept for completeness)
   You already have improved versions – wire them the same way.
   ═══════════════════════════════════════════════════════════════ */
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

/* ─────────────────────── Main Toolkit Page ─────────────────────── */
const TOOLS = [
  { id: 'agreement', title: 'Rental Agreement', desc: 'Legally-formatted rental / leave & license agreement', icon: FileText, color: 'var(--primary)', colorClass: 'text-primary', bgClass: 'bg-primary/10', borderClass: 'border-primary/30' },
  { id: 'receipt', title: 'Rent Receipt', desc: 'Monthly rent receipts for tax (Sec 10(13A))', icon: Receipt, color: '#22c55e', colorClass: 'text-emerald-500', bgClass: 'bg-emerald-500/10', borderClass: 'border-emerald-500/30' },
  { id: 'moveout', title: 'Move-Out / Handover', desc: 'Exit checklist + deposit settlement + handover note', icon: LogOut, color: '#f59e0b', colorClass: 'text-amber-500', bgClass: 'bg-amber-500/10', borderClass: 'border-amber-500/30' },
  { id: 'deposit', title: 'Deposit Claim Letter', desc: 'Formal security deposit refund demand letter', icon: Scale, color: '#ef4444', colorClass: 'text-red-500', bgClass: 'bg-red-500/10', borderClass: 'border-red-500/30' },
  { id: 'rentincrease', title: 'Rent Increase Notice', desc: 'Notice with state-wise legal guidance', icon: FileWarning, color: '#8b5cf6', colorClass: 'text-violet-500', bgClass: 'bg-violet-500/10', borderClass: 'border-violet-500/30' },
  { id: 'hra', title: 'HRA Tax Bundle', desc: 'Landlord certificate + multi-month receipts for tax', icon: FileCheck, color: '#10b981', colorClass: 'text-emerald-500', bgClass: 'bg-emerald-500/10', borderClass: 'border-emerald-500/30' },
  { id: 'police', title: 'Police Verification', desc: 'Pre-fill form + state portal links + checklist', icon: Shield, color: '#3b82f6', colorClass: 'text-blue-500', bgClass: 'bg-blue-500/10', borderClass: 'border-blue-500/30' },
  { id: 'noc', title: 'Society NOC Request', desc: 'NOC letter from owner to RWA / society', icon: Home, color: '#06b6d4', colorClass: 'text-cyan-500', bgClass: 'bg-cyan-500/10', borderClass: 'border-cyan-500/30' },
  { id: 'utility', title: 'Utility Transfer', desc: 'Electricity / Gas / Water name-change letters', icon: Wrench, color: '#f97316', colorClass: 'text-orange-500', bgClass: 'bg-orange-500/10', borderClass: 'border-orange-500/30' },
  { id: 'roommate', title: 'Roommate Addendum', desc: 'Shared living rules, rent split, exit terms', icon: Users, color: '#ec4899', colorClass: 'text-pink-500', bgClass: 'bg-pink-500/10', borderClass: 'border-pink-500/30' },
  { id: 'inventory', title: 'Inventory Report', desc: 'Room-wise condition report with photo placeholders', icon: Package, color: '#6366f1', colorClass: 'text-indigo-500', bgClass: 'bg-indigo-500/10', borderClass: 'border-indigo-500/30' },
  { id: 'explainer', title: 'Leave & License Guide', desc: 'Leave & License vs Rental – which one to use', icon: BookOpen, color: '#84cc16', colorClass: 'text-lime-500', bgClass: 'bg-lime-500/10', borderClass: 'border-lime-500/30' },
];

export default function RentalToolkit() {
  const [activeTab, setActiveTab] = useState('moveout');

  const renderTool = () => {
    switch (activeTab) {
      case 'moveout': return <MoveOutGenerator />;
      case 'deposit': return <DepositClaimGenerator />;
      case 'rentincrease': return <RentIncreaseGenerator />;
      case 'hra': return <HRABundleGenerator />;
      case 'police': return <PolicePrefillGenerator />;
      case 'noc': return <NOCGenerator />;
      case 'utility': return <UtilityGenerator />;
      case 'roommate': return <RoommateGenerator />;
      case 'inventory': return <InventoryGenerator />;
      case 'explainer': return <LeaveLicenseExplainer />;
      case 'agreement': return <AgreementGenerator />; 
      case 'receipt': return <ReceiptGenerator />;     
      default:
        return (
          <div className="text-center py-12 text-muted">
            <p className="mb-4">Select a tool above. For <strong>Rental Agreement</strong> and <strong>Rent Receipt</strong>, keep your existing improved generators.</p>
            <p className="text-sm">All 10 new document tools are fully wired and ready.</p>
          </div>
        );
    }
  };

  return (
    <div className="light-page min-h-screen pt-24 pb-20 font-sans">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <motion.div variants={fadeIn} initial="initial" animate="animate" className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="text-xs text-primary font-bold tracking-wider uppercase">Free Tools for Renters</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary mb-4">
            Digital Rental <span className="text-accent">Toolkit</span>
          </h1>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            Complete rental lifecycle documents — agreements, receipts, exit, deposit claims, tax, police, society, utilities, roommates & more.
          </p>
        </motion.div>

        <motion.div variants={staggerContainer} initial="initial" animate="animate"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-10">
          {TOOLS.map(tool => (
            <motion.button
              key={tool.id}
              variants={staggerItem}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tool.id)}
              className={`p-4 rounded-2xl text-left border transition-all ${
                activeTab === tool.id ? `${tool.bgClass} ${tool.borderClass}` : 'bg-surface border-borderSubtle/20 hover:border-borderSubtle/50'
              }`}
            >
              <tool.icon className={`w-6 h-6 mb-2 ${activeTab === tool.id ? tool.colorClass : 'text-muted'}`} />
              <div className={`font-bold text-sm mb-1 ${activeTab === tool.id ? tool.colorClass : 'text-primary'}`}>{tool.title}</div>
              <div className="text-xs text-muted leading-snug line-clamp-2">{tool.desc}</div>
            </motion.button>
          ))}
        </motion.div>

        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          className="bg-elevated border border-borderSubtle/20 rounded-[2rem] p-8 md:p-12 shadow-xl shadow-black/5">
          {renderTool()}
        </motion.div>
      </div>
    </div>
  );
}
