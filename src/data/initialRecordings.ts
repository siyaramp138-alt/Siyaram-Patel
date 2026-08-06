import { CallSession, SupportedLanguage } from '../types';

export interface CallRecording {
  id: string;
  leadId: string;
  customerName: string;
  companyName: string;
  phone: string;
  recordedAt: string;
  durationSeconds: number;
  language: SupportedLanguage;
  outcome: 'Demo Scheduled' | 'Callback Requested' | 'Not Interested' | 'Completed';
  interestScore: number;
  summary: string;
  audioSampleUrl?: string; // Optional audio file or synthetic speech
  messages: Array<{
    id: string;
    role: 'user' | 'model';
    text: string;
    timestamp: string;
    timestampSeconds: number;
  }>;
}

export const INITIAL_RECORDINGS: CallRecording[] = [
  {
    id: 'rec-001',
    leadId: '1',
    customerName: 'Rajesh Sharma',
    companyName: 'Apex Logistics & Freight',
    phone: '+91 98200 12345',
    recordedAt: '2026-08-05 11:30 AM',
    durationSeconds: 105,
    language: 'Hindi',
    outcome: 'Demo Scheduled',
    interestScore: 92,
    summary: 'Rajesh was struggling with vehicle tracking and billing delays in Excel. SIYA explained our GST automated billing module in Hindi and successfully booked a 10-minute demo for tomorrow at 11 AM.',
    messages: [
      {
        id: 'm1',
        role: 'model',
        text: 'नमस्कार! क्या मेरी बात राजेश शर्मा जी से हो रही है?',
        timestamp: '11:30:02 AM',
        timestampSeconds: 0
      },
      {
        id: 'm2',
        role: 'user',
        text: 'जी हाँ, राजेश बोल रहा हूँ। आप कौन?',
        timestamp: '11:30:08 AM',
        timestampSeconds: 6
      },
      {
        id: 'm3',
        role: 'model',
        text: 'नमस्कार राजेश जी! मैं ग्रो बिजनेस सॉल्यूशंस से सिया बात कर रही हूँ। हम लॉजिस्टिक्स कंपनियों के लिए ऑटोमैटिक बिलिंग और इन्वेंटरी सॉफ्टवेअर प्रदान करते हैं।',
        timestamp: '11:30:16 AM',
        timestampSeconds: 14
      },
      {
        id: 'm4',
        role: 'user',
        text: 'अरे हाँ, हमें एक्सेल में बिलिंग करने में बहुत समय लगता है। पर क्या आपका सॉफ्टवेयर मोबाइल पर चलेगा?',
        timestamp: '11:30:30 AM',
        timestampSeconds: 28
      },
      {
        id: 'm5',
        role: 'model',
        text: 'जी बिल्कुल सर! हमारा सॉफ्टवेयर मोबाइल ऐप और कंप्यूटर दोनों पर चलता है। आप सीधे व्हाट्सएप पर ग्राहकों को बिल भेज सकते हैं।',
        timestamp: '11:30:45 AM',
        timestampSeconds: 43
      },
      {
        id: 'm6',
        role: 'user',
        text: 'अरे वाह! यह तो बहुत बढ़िया सुविधा है। क्या मुझे इसका ऑनलाइन डेमो मिल सकता है?',
        timestamp: '11:31:00 AM',
        timestampSeconds: 58
      },
      {
        id: 'm7',
        role: 'model',
        text: 'जी बिल्कुल! क्या मैं कल सुबह 11 बजे हमारे टेक्निकल कंसलटेंट के साथ आपका 10 मिनट का फ्री डेमो फिक्स कर दूँ?',
        timestamp: '11:31:18 AM',
        timestampSeconds: 76
      },
      {
        id: 'm8',
        role: 'user',
        text: 'जी हाँ, कल सुबह 11 बजे बिल्कुल ठीक रहेगा। धन्यवाद!',
        timestamp: '11:31:32 AM',
        timestampSeconds: 90
      }
    ]
  },
  {
    id: 'rec-002',
    leadId: '2',
    customerName: 'Priya Patel',
    companyName: 'FreshBasket Supermarket',
    phone: '+91 98980 67890',
    recordedAt: '2026-08-04 03:15 PM',
    durationSeconds: 88,
    language: 'Marathi',
    outcome: 'Demo Scheduled',
    interestScore: 88,
    summary: 'Priya Patel manages a retail chain and wants barcode inventory sync. SIYA addressed her requirements in Marathi and scheduled an online expert demo.',
    messages: [
      {
        id: 'm1',
        role: 'model',
        text: 'नमस्कार! माझी बोलणे प्रिया पटेल मॅडमशी होत आहे का?',
        timestamp: '03:15:02 PM',
        timestampSeconds: 0
      },
      {
        id: 'm2',
        role: 'user',
        text: 'हो, प्रिया बोलतेय. सांगा काय काम होते?',
        timestamp: '03:15:07 PM',
        timestampSeconds: 5
      },
      {
        id: 'm3',
        role: 'model',
        text: 'नमस्कार मॅडम! मी ग्रो बिझनेस सोल्युशन्स मधून सिया बोलत आहे. आम्ही सुपरमार्केटसाठी बारकोड इन्व्हेंटरी आणि ऑटोमेटेड बिलिंग सॉफ्टवेअर देतो.',
        timestamp: '03:15:16 PM',
        timestampSeconds: 14
      },
      {
        id: 'm4',
        role: 'user',
        text: 'आम्ही सध्या टॅली वापरत आहोत, पण त्यात बारकोड स्कॅनिंग आणि स्टॉक सिंक होण्यात अडचण येते.',
        timestamp: '03:15:32 PM',
        timestampSeconds: 30
      },
      {
        id: 'm5',
        role: 'model',
        text: 'नक्कीच मॅडम! आमच्या सॉफ्टवेअरमध्ये हाय-स्पीड बारकोड स्कॅनिंग आणि रिअल-टाईम स्टॉक सिंक मिळतो. रोजचा २ तासांचा वेळ वाचतो.',
        timestamp: '03:15:48 PM',
        timestampSeconds: 46
      },
      {
        id: 'm6',
        role: 'user',
        text: 'छान आहे! मला याचा प्रात्यक्षिक (डेमो) बघायचा आहे.',
        timestamp: '03:16:05 PM',
        timestampSeconds: 63
      },
      {
        id: 'm7',
        role: 'model',
        text: 'मी उद्या दुपारी ३ वाजता आमच्या एक्सपर्ट टीमसोबत तुमचा १० मिनिटांचा डेमो नक्की करू का?',
        timestamp: '03:16:18 PM',
        timestampSeconds: 76
      },
      {
        id: 'm8',
        role: 'user',
        text: 'हो नक्कीच, उद्या दुपारी ३ वाजता चालेल.',
        timestamp: '03:16:28 PM',
        timestampSeconds: 86
      }
    ]
  },
  {
    id: 'rec-003',
    leadId: '3',
    customerName: 'Amit Banerjee',
    companyName: 'Bengal Engineering Components',
    phone: '+91 97110 55432',
    recordedAt: '2026-08-03 04:45 PM',
    durationSeconds: 96,
    language: 'Bengali',
    outcome: 'Callback Requested',
    interestScore: 75,
    summary: 'Amit showed interest in manufacturing inventory ERP in Bengali. Requested a callback after discussing with factory manager.',
    messages: [
      {
        id: 'm1',
        role: 'model',
        text: 'নমস্কার! আমি কি অমিত বন্দ্যোপাধ্যায় স্যারের সাথে কথা বলছি?',
        timestamp: '04:45:02 PM',
        timestampSeconds: 0
      },
      {
        id: 'm2',
        role: 'user',
        text: 'হ্যাঁ, আমি অমিত বলছি। আপনারা কে?',
        timestamp: '04:45:08 PM',
        timestampSeconds: 6
      },
      {
        id: 'm3',
        role: 'model',
        text: 'জি, আমি গ্রো বিজনেস সলিউশনস থেকে সিয়া বলছি। আমরা ম্যানুফ্যাকচারিং প্ল্যান্টের জন্য অর্ডার ট্র্যাকিং ও ক্লাউড ইআরপি সফটওয়্যার দিয়ে থাকি।',
        timestamp: '04:45:18 PM',
        timestampSeconds: 16
      },
      {
        id: 'm4',
        role: 'user',
        text: 'আমাদের ফ্যাক্টরি ম্যানেজারের সাথে আগে আলোচনা করতে হবে। আপনারা কি কাল সকালে আবার কল করবেন?',
        timestamp: '04:45:35 PM',
        timestampSeconds: 33
      },
      {
        id: 'm5',
        role: 'model',
        text: 'জি অবশ্যই স্যার! আমি আগামীকাল সকাল ১০:৩০ টায় আপনাকে পুনরায় কল করব। ধন্যবাদ!',
        timestamp: '04:45:50 PM',
        timestampSeconds: 48
      }
    ]
  }
];
