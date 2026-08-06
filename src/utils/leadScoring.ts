import { Lead } from '../types';

export interface ScoreBreakdown {
  score: number;
  factors: { label: string; points: number }[];
}

export function calculateLeadScore(lead: Lead): ScoreBreakdown {
  // If lead already has a manual custom score override
  if (lead.score !== undefined && lead.score >= 1 && lead.score <= 10) {
    return {
      score: lead.score,
      factors: [{ label: 'Manual Score Override', points: lead.score }]
    };
  }

  let score = 4; // Base starting score
  const factors: { label: string; points: number }[] = [
    { label: 'Base Lead Qualification', points: 4 }
  ];

  // 1. Current Software / Tech Gap (High opportunity if manual / Excel / paper)
  const softwareLower = (lead.currentSoftware || '').toLowerCase();
  if (
    softwareLower.includes('manual') ||
    softwareLower.includes('excel') ||
    softwareLower.includes('register') ||
    softwareLower.includes('paper')
  ) {
    score += 2;
    factors.push({ label: 'High Need: Using Manual/Excel process', points: +2 });
  } else if (softwareLower.includes('legacy') || softwareLower.includes('tally 9') || softwareLower.includes('basic')) {
    score += 1;
    factors.push({ label: 'Upgrade Ready: Using Legacy software', points: +1 });
  }

  // 2. High-value Industry Fit (Logistics, Retail, Manufacturing, Pharma)
  const indLower = (lead.industry || '').toLowerCase();
  if (
    indLower.includes('manufacturing') ||
    indLower.includes('logistics') ||
    indLower.includes('pharma') ||
    indLower.includes('retail') ||
    indLower.includes('wholesale')
  ) {
    score += 2;
    factors.push({ label: 'High Fit: Target Industry Vertical', points: +2 });
  }

  // 3. Status & Interaction History
  if (lead.status === 'Demo Scheduled') {
    score += 2;
    factors.push({ label: 'High Engagement: Demo Scheduled', points: +2 });
  } else if (lead.status === 'Callback Requested') {
    score += 1;
    factors.push({ label: 'Warm Engagement: Callback Requested', points: +1 });
  } else if (lead.status === 'Not Interested') {
    score -= 3;
    factors.push({ label: 'Low Prospect: Marked Not Interested', points: -3 });
  }

  // 4. Notes Keyword Analysis for Pain Points & Urgency
  const notesLower = (lead.notes || '').toLowerCase();
  if (
    notesLower.includes('struggling') ||
    notesLower.includes('delay') ||
    notesLower.includes('urgent') ||
    notesLower.includes('wants') ||
    notesLower.includes('needs') ||
    notesLower.includes('required')
  ) {
    score += 1;
    factors.push({ label: 'Active Need / Pain Point in Notes', points: +1 });
  }

  const finalScore = Math.min(10, Math.max(1, score));

  return {
    score: finalScore,
    factors
  };
}
