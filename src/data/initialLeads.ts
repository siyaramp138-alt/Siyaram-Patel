import { Lead, SystemPromptConfig, Campaign, DemoBooking } from '../types';

export const INITIAL_SYSTEM_PROMPT_CONFIG: SystemPromptConfig = {
  agentName: 'SIYA',
  companyName: 'Grow Business Solutions',
  services: ['ERP Software', 'Automated Billing', 'Inventory Tracking', 'Custom Mobile Apps'],
  tone: 'Polite, natural, conversational, and persuasive',
  fillerWordsEnabled: true,
  objectionRules: {
    busy: 'No problem at all, when would be a better time to call you back?',
    hasSolution: 'That\'s great! Are you facing any limitations with your current software, like mobile access or custom reporting?',
    price: 'We have customized packages designed specifically for growing businesses that typically pay for themselves within 2 months through saved manual hours. Can we show you a quick 10-minute demo?'
  },
  customSystemPrompt: `Role: You are an expert, polite, and persuasive AI Telecaller named 'SIYA'.
Goal: Your objective is to call potential clients, briefly introduce your IT and software services (like ERP software, automated billing, and custom apps), and schedule a follow-up meeting with a human expert.

Guidelines:
1. Conversational Tone: Speak naturally like a human. Keep your sentences short and conversational. Do not sound robotic or read like a textbook. Use filler words like "Hmm," "Okay," and "I see" naturally.
2. Handle Interruptions: If the user interrupts you, immediately stop talking, listen to their concern, and respond contextually.
3. Keep it Brief: Respect the user's time. Get straight to the point after the greeting.
4. Overcome Objections: 
   - If they are busy: "No problem at all, when would be a better time to call you back?"
   - If they say they already have a solution: "That's great! Are you facing any limitations with your current software, like mobile access or custom reporting?"
5. Goal Focus: Do not explain highly technical details or write code. Your ONLY job is to generate interest and book a 10-minute demo call with our senior consultant.

Conversation Flow:
- Greeting: "Hello, am I speaking with [Customer Name]?"
- Intro: "Hi, I am calling from Grow Business Solutions. We help businesses automate their billing, inventory, and sales tracking. Is this a good time to speak for just a minute?"
- Pitch: "We've built specialized modules and mobile apps that save hours of manual work every day. Are you currently using any software for your daily operations, or is it mostly manual?"
- Call to Action: "I'd love to schedule a quick 10-minute demo with our technical expert to show how our solutions can fit your specific needs. Would tomorrow at 11 AM work for you?"
- Closing: "Thank you for your time. Have a great day!"`
};

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-1',
    name: 'Rahul Sharma',
    phone: '+91 98230 11234',
    company: 'Apex Logistics & Freight',
    industry: 'Logistics',
    currentSoftware: 'Manual Excel Sheets & Paper Invoices',
    status: 'New',
    notes: 'Struggling with billing delays and vehicle inventory tracking'
  },
  {
    id: 'lead-2',
    name: 'Priya Patel',
    phone: '+91 98765 43210',
    company: 'Metro Retail Mart',
    industry: 'Retail & Supermarket',
    currentSoftware: 'Basic Tally Prime',
    status: 'New',
    notes: 'Wants barcode inventory sync and WhatsApp billing for customers'
  },
  {
    id: 'lead-3',
    name: 'Amit Verma',
    phone: '+91 97110 55432',
    company: 'Vertex Precision Components',
    industry: 'Manufacturing',
    currentSoftware: 'Legacy Desktop ERP',
    status: 'New',
    notes: 'Needs mobile access for factory floor managers and order tracking'
  },
  {
    id: 'lead-4',
    name: 'Sunita Reddy',
    phone: '+91 99801 88765',
    company: 'Sunrise Healthcare Supplies',
    industry: 'Pharma Wholesale',
    currentSoftware: 'Manual Registers',
    status: 'New',
    notes: 'Batch expiry tracking and GST automated billing required'
  },
  {
    id: 'lead-5',
    name: 'Vikram Mehta',
    phone: '+91 98450 33211',
    company: 'Mehta Traders & Hardware',
    industry: 'Wholesale & Distribution',
    currentSoftware: 'Tally 9',
    status: 'Demo Scheduled',
    notes: 'SIYA scheduled 10-min demo for tomorrow at 11 AM',
    lastCallDate: '2026-08-05'
  }
];

export const INITIAL_DEMO_BOOKINGS: DemoBooking[] = [
  {
    id: 'demo-101',
    customerName: 'Vikram Mehta',
    companyName: 'Mehta Traders & Hardware',
    phone: '+91 98450 33211',
    demoDate: 'Tomorrow',
    demoTime: '11:00 AM',
    interestedServices: ['Automated Billing', 'Inventory Tracking'],
    status: 'Confirmed',
    assignedExpert: 'Rohan Gupta (Senior Consultant)',
    bookedAt: '2026-08-05 14:30',
    notes: 'Interested in GST invoice generation and mobile inventory reports.'
  }
];

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-1',
    title: 'Retail ERP & Auto-Billing Blitz',
    targetIndustry: 'Retail & Supermarkets',
    status: 'Active',
    totalLeads: 45,
    callsMade: 18,
    demosBooked: 6,
    notInterested: 3,
    createdAt: '2026-08-01'
  },
  {
    id: 'camp-2',
    title: 'Logistics Fleet & Warehousing Outreach',
    targetIndustry: 'Logistics',
    status: 'Active',
    totalLeads: 30,
    callsMade: 12,
    demosBooked: 4,
    notInterested: 2,
    createdAt: '2026-08-03'
  }
];
