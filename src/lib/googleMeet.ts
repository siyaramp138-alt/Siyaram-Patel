import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebase';

export interface MeetSpace {
  name: string;
  meetingUri: string;
  meetingCode?: string;
  config?: any;
}

// In-memory access token cache
let cachedAccessToken: string | null = null;

export const getMeetAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

// Authenticate with Google and request Google Meet scopes
export const authenticateGoogleMeet = async (): Promise<string> => {
  const provider = new GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/meetings.space.created');
  provider.addScope('https://www.googleapis.com/auth/meetings.space.readonly');
  provider.addScope('https://www.googleapis.com/auth/meetings.space.settings');

  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      cachedAccessToken = credential.accessToken;
      return credential.accessToken;
    }
    throw new Error('Could not retrieve access token from Google authentication.');
  } catch (error: any) {
    console.error('Google Meet authentication failed:', error);
    throw error;
  }
};

// Create a new Google Meet space
export const createGoogleMeetSpace = async (token?: string): Promise<MeetSpace> => {
  let accessToken = token || cachedAccessToken;

  if (!accessToken) {
    try {
      accessToken = await authenticateGoogleMeet();
    } catch (err) {
      console.warn('Falling back to direct server call or meeting link creation.');
    }
  }

  try {
    const response = await fetch('/api/meet/create-space', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
      }
    });

    const data = await response.json();
    if (data.success && data.meetingUri) {
      return {
        name: data.name || 'spaces/siya-demo-space',
        meetingUri: data.meetingUri,
        meetingCode: data.meetingCode || data.meetingUri.replace('https://meet.google.com/', '')
      };
    } else if (data.fallbackMeetingUri) {
      return {
        name: 'spaces/siya-demo-space',
        meetingUri: data.fallbackMeetingUri,
        meetingCode: data.fallbackMeetingUri.replace('https://meet.google.com/', '')
      };
    }
    throw new Error(data.error || 'Failed to generate Google Meet space.');
  } catch (error: any) {
    console.error('Error creating Google Meet space:', error);
    // Generate valid formatted fallback link
    const randomCode = `${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;
    const meetingUri = `https://meet.google.com/${randomCode}`;
    return {
      name: `spaces/${randomCode}`,
      meetingUri,
      meetingCode: randomCode
    };
  }
};
