import { updateAccessCode, updateWithMeta } from '@/services/api';
import React, { useEffect } from 'react';

// Define types for the Facebook SDK on the window object for TypeScript
declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

const WhatsAppLoginButton: React.FC = () => {

  useEffect(() => {
    // This function handles the response from the FB.login dialog.
    const fbLoginCallback = (response: any) => {
      console.log('FB.login callback response:', response);
      if (response.authResponse) {
        const code = response.authResponse.code;
        console.log('Authorization Code:', code);
        const biztoken = updateAccessCode(code);
        console.log('Sent code to backend, response:', biztoken);
        // TODO: Send this code to your backend server to exchange for an access token.
      } else {
        console.log('User cancelled login or did not fully authorize.', response);
      }
    };

    // This function handles session data sent via window.postMessage.
    const handleMessage = async (event: MessageEvent) => {
      console.log('Received postMessage event:', {
        origin: event.origin,
        data: event.data,
        type: typeof event.data
      });

      // Only accept messages from Facebook domains
      if (!event.origin.endsWith('facebook.com')) {
        console.log('Ignoring message from non-Facebook origin:', event.origin);
        return;
      }
      
      try {
        // Try to parse as JSON first
        const data = JSON.parse(event.data);
        console.log('✅ Received JSON message from Facebook:', data);
        
        if (data.type === 'WA_EMBEDDED_SIGNUP') {
          console.log('🚀 WhatsApp Embedded Signup Event:', data);
          
          // Handle different event types
          switch (data.event) {
            case 'FINISH':
              console.log('✅ Flow completed successfully:', {
                phone_number_id: data.data?.phone_number_id,
                waba_id: data.data?.waba_id,
                business_id: data.data?.business_id
              });

              const updatedBiz = await updateWithMeta({
                waba_id: data.data?.waba_id,
                phone_number_id: data.data?.phone_number_id, 
                customer_business_id: data.data?.business_id});
              console.log('Updated business with WhatsApp metadata: ', updatedBiz);
              // TODO: Handle successful completion - send data to your backend
              break;
              
            case 'CANCEL':
              console.log('❌ Flow was cancelled:', data.data);
              // TODO: Handle cancellation
              break;
              
            default:
              console.log('ℹ️ Other event type:', data.event, data.data);
          }
        } else {
          console.log('Other JSON message type:', data.type);
        }
      } catch (error) {
        // This catches non-JSON messages (URL-encoded data)
        console.log('⚠️ Received non-JSON message:', event.data);
        
        // If this is the only type of message you're getting, 
        // it means the sessionInfoVersion is not working properly
        if (typeof event.data === 'string') {
          // Try to extract any useful info from URL-encoded data
          if (event.data.includes('code=')) {
            try {
              const urlParams = new URLSearchParams(event.data);
              const code = urlParams.get('code');
              if (code) {
                console.log('Extracted authorization code from non-JSON message:', code);
                // This is a fallback, but you should still fix the JSON issue
              }
            } catch (parseError) {
              console.log('Could not parse URL parameters:', parseError);
            }
          }
        }
      }
    };

    // Assign the callback to the window object so the SDK can call it.
    (window as any).fbLoginCallback = fbLoginCallback;
    window.addEventListener('message', handleMessage);

    // Define the main SDK initialization function.
    window.fbAsyncInit = function() {
      console.log('Initializing Facebook SDK...');
      window.FB.init({
        appId: import.meta.env.VITE_META_APP_ID,
        cookie: true, // ⭐ CRITICAL: This was missing and is required for sessionInfoVersion
        autoLogAppEvents: true,
        xfbml: true,
        version: 'v23.0'
      });
      console.log('Facebook SDK initialized');
    };

    // Load the Facebook SDK script.
    if (!document.getElementById('facebook-jssdk')) {
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = "https://connect.facebook.net/en_US/sdk.js";
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      document.body.appendChild(script);
    }

    // Cleanup function to remove the event listener when the component unmounts.
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // This function is called when the user clicks the button.
  const launchWhatsAppSignup = () => {
    console.log('Launching WhatsApp signup...');
    
    if (!window.FB) {
      console.error("❌ Facebook SDK has not loaded yet.");
      return;
    }

    console.log('Calling FB.login with config:', {
      config_id: import.meta.env.VITE_ES_CONFIG_ID,
      response_type: 'code',
      override_default_response_type: true,
      extras: {
        setup: {},
        feature_type: '',
        sessionInfoVersion: '3', // ⭐ This should trigger JSON responses
      }
    });

    window.FB.login((window as any).fbLoginCallback, {
      config_id: import.meta.env.VITE_ES_CONFIG_ID, // Make sure this is your actual config ID
      response_type: 'code',
      override_default_response_type: true,
      extras: {
        setup: {}, // Required empty object
        feature_type: '', // Leave empty for default flow
        sessionInfoVersion: '3', // ⭐ This should enable JSON postMessage events
      }
    });
  };

  return (
    <div>
      <button 
        onClick={launchWhatsAppSignup} 
        style={{ 
          backgroundColor: '#25D366', 
          border: 0, 
          borderRadius: '4px', 
          color: '#fff', 
          cursor: 'pointer', 
          fontFamily: 'Helvetica, Arial, sans-serif', 
          fontSize: '16px', 
          fontWeight: 'bold', 
          height: '60px', 
          padding: '0 24px' 
        }}
      >
       Connect WhatsApp
      </button>
      
      {/* Debug info */}
      <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
        {/* <p>Check browser console for detailed logs</p> */}
        {/* <p>App ID: {process.env.VITE_META_APP_ID ? '✅ Set' : '❌ Missing'}</p> */}
      </div>
    </div>
  );
};

export default WhatsAppLoginButton;