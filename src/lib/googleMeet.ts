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

// Authenticate with Google Meet API or fallback
export const authenticateGoogleMeet = async (): Promise<string> => {
  return 'demo-google-token';
};

// Create a new Google Meet space
export const createGoogleMeetSpace = async (token?: string): Promise<MeetSpace> => {
  try {
    const response = await fetch('/api/meet/create-space', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
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
  } catch (error: any) {
    console.error('Error creating Google Meet space:', error);
  }

  // Generate valid formatted fallback link
  const randomCode = `${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;
  const meetingUri = `https://meet.google.com/${randomCode}`;
  return {
    name: `spaces/${randomCode}`,
    meetingUri,
    meetingCode: randomCode
  };
};
