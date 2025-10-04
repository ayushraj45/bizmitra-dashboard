import React from 'react';
interface GoogleConnectProps {
  onSuccess?: (code: string) => void;
  onError?: (error: string) => void;
  businessID?: string;
}

// Handles Google OAuth flow and sends auth code to backend
const GoogleConnect: React.FC<GoogleConnectProps> = ({ onSuccess, onError, businessID }) => {
  const handleConnect = async () => {
    const clientId = import.meta.env.VITE_REACT_APP_GOOGLE_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_REACT_APP_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      onError?.('Google client ID or redirect URI is not set.');
      return;
    }
    
    const scope = 'https://www.googleapis.com/auth/calendar';
    const responseType = 'code';
    const accessType = 'offline';
    const prompt = 'consent';
    const state = businessID ?? ''; 
    // Optional: use state to maintain context
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `response_type=${responseType}&` +
      `access_type=${accessType}&` +
      `prompt=${prompt}&`+
      `state=${encodeURIComponent(state)}`;

    // const authUrl = await getGoogleAuthUrl();
      
    // console.log('Opening Google auth URL:', authUrl);

    // if (!authUrl) {
    //   onError?.('Google auth URL is not available.');
    //   return;
    // } 

    // Open popup for OAuth flow
    const popup = window.open(authUrl, 'google-auth', 'width=500,height=600');
    
    // Listen for auth code from popup
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);
        onError?.('Authentication was cancelled');
      }
    }, 1000);

    // Listen for message from popup with auth code
    const messageListener = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        clearInterval(checkClosed);
        popup?.close();
        window.removeEventListener('message', messageListener);
        console.log('Received auth code from Google:', event.data.code);
        // Send auth code to backend
        //sendCodeToBackend(event.data.code);
      } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
        clearInterval(checkClosed);
        popup?.close();
        window.removeEventListener('message', messageListener);
        onError?.(event.data.error);
      }
    };

    window.addEventListener('message', messageListener);
  };

  // Sends authorization code to backend for token exchange
  const sendCodeToBackend = async (code: string) => {
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (response.ok) {
        onSuccess?.(code);
      } else {
        const error = await response.text();
        onError?.(error);
      }
    } catch (error) {
      onError?.('Failed to connect to Google');
    }
  };

  return (
    <button onClick={handleConnect} className="google-connect-btn"
    style={{ 
          backgroundColor: '#EA4335', 
          border: 0, 
          borderRadius: '4px', 
          color: '#fff', 
          cursor: 'pointer', 
          fontFamily: 'Helvetica, Arial, sans-serif', 
          fontSize: '16px', 
          fontWeight: 'bold', 
          height: '60px', 
          padding: '0 24px' 
        }}>
      Connect Google
    </button>
  );
};

export default GoogleConnect;