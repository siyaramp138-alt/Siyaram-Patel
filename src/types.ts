export interface Lead {
  id: string;
  name: string;
  phone: string;
  company: string;
  industry: string;
  currentSoftware: string;
  status: 'New' | 'Calling' | 'Demo Scheduled' | 'Callback Requested' | 'Not Interested' | 'Completed';
  notes?: string;
  lastCallDate?: string;
  score?: number; // 1 to 10 priority score
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: string;
  audioUrl?: string;
  interrupted?: boolean;
}

export interface CallSession {
  id: string;
  leadId: string;
  customerName: string;
  companyName: string;
  phone: string;
  startTime: string;
  endTime?: string;
  durationSeconds: number;
  status: 'dialing' | 'connected' | 'ended';
  messages: ConversationMessage[];
  isMuted: boolean;
  speakerOn: boolean;
  interruptedCount: number;
  aiPhase: 'Greeting' | 'Intro' | 'Pitch' | 'Objection Handling' | 'Call to Action' | 'Closing' | 'Completed';
  analysis?: CallAnalysis;
}

export interface CallAnalysis {
  outcome: 'Demo Booked' | 'Callback Requested' | 'Not Interested' | 'Information Shared';
  interestScore: number; // 0-100
  customerPainPoints: string[];
  objectionsRaised: string[];
  demoDetails?: {
    date: string;
    time: string;
    interestedModules: string[];
  };
  recommendedNextAction: string;
  summary: string;
}

export interface DemoBooking {
  id: string;
  customerName: string;
  companyName: string;
  phone: string;
  demoDate: string;
  demoTime: string;
  interestedServices: string[];
  status: 'Confirmed' | 'Completed' | 'Cancelled';
  assignedExpert: string;
  bookedAt: string;
  notes: string;
}

export interface Campaign {
  id: string;
  title: string;
  targetIndustry: string;
  status: 'Draft' | 'Active' | 'Paused' | 'Completed';
  totalLeads: number;
  callsMade: number;
  demosBooked: number;
  notInterested: number;
  createdAt: string;
}

export interface SystemPromptConfig {
  agentName: string;
  companyName: string;
  services: string[];
  tone: string;
  fillerWordsEnabled: boolean;
  objectionRules: {
    busy: string;
    hasSolution: string;
    price: string;
  };
  customSystemPrompt: string;
}

export interface CallAnalytics {
  totalCalls: number;
  connectedCalls: number;
  demosBooked: number;
  conversionRate: number;
  avgDurationSeconds: number;
  objectionsHandled: number;
}
