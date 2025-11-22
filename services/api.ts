import { Client, Task, Booking, MessageTemplate, BusinessProfile, BusinessProfileInfo, Business , Chat, Connectors, ChatMessage} from '../types';
import { API_URL } from '../constants';
import { data } from 'react-router-dom';

// --- Helper function for API requests ---
// This function will automatically add the auth token to requests
// and handle basic error scenarios.
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('authToken');
    
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Throw an error if API_URL is not set.
    if (!API_URL) {
        throw new Error("API_URL is not configured. Please set it in constants.tsx.");
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {

        if (response.status === 401 ||  response.status === 403) {
            localStorage.removeItem('authToken');
            window.location.reload();
            // We throw an error to prevent the rest of the code in the calling function from executing.
            throw new Error("Session expired. Please log in again.");
        }


        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            errorData = { message: `HTTP Error: ${response.statusText}` };
        }
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    // Return null for 204 No Content responses
    if (response.status === 204) {
        return null;
    }

    return response.json();
};


// --- Authentication ---
// NOTE: Adjust the '/auth/login' endpoint if yours is different.
export const login = async (email: string, pass: string) => {
    const data = await apiFetch('/business/login', {
        method: 'POST',
        body: JSON.stringify({ email, password: pass }),
    });
    // The backend should return a { token: '...' } object on success
    if (data && data.token) {
        console.log('Login successful, token received:', data.token);
        console.log('Login successful, data received:', data);

        localStorage.setItem('authToken', data.token);
    } else {
         throw new Error('Login successful, but no token was provided.');
    }
    return data;
};

// NOTE: Adjust the '/auth/register' endpoint if yours is different.
export const register = async (registerData: any) => {
        console.log('Register payload:', registerData);
     const data = await apiFetch('/business/register', {
        method: 'POST',
        body: JSON.stringify(registerData),
    });
    if (data && data.token) {
        localStorage.setItem('authToken', data.token);
    } else {
         throw new Error('Registration successful, but no token was provided.');
    }
    return data;
};

// --- Dashboard ---
// NOTE: Endpoint '/dashboard/summary' is an assumption. Change if needed.
export const getDashboardSummary = async () => {
    const tasks = (await getTasks()).btasks.length;
    console.log('Fetched tasks:', tasks);

    const clients = (await getClients()).bclients.length;
    console.log('Fetched clients:', clients);
    const bookings = (await getBookings()).bookings.length;
    console.log('Fetched bookings:', bookings);
    const revenue = 0;
    return {
        openTasks: tasks,
        totalClients: clients,
        upcomingBookings: bookings,   
        revenue
    }
};

export const getNewTasks = async () => {
    // Fetches the 5 most recent tasks. Assumes the API supports query params.
    return apiFetch('/api/btasks?limit=5&sort=newest');
};


// --- Profile ---
// Uses the '/business' endpoint as requested.
export const getProfile = async (): Promise<BusinessProfile> => {
    return apiFetch('/businessProfile');
};

export const getProfileInfo = async (): Promise<BusinessProfileInfo> => {
    return apiFetch('/business/info');
};

export const updateProfile = async (profile: BusinessProfile): Promise< BusinessProfile> => {
    
    return apiFetch('/businessProfile/'+profile.id, {
        method: 'PUT',
        body: JSON.stringify(profile),
    });
};

export const updateAccessCode = async (code: string): Promise<{message:string}> => {
    return await apiFetch('/business/getToken/', {
        method: 'PUT',
        body: JSON.stringify({ waba_access_code: code }),
    });
}

export const updateWithMeta = async (data: { waba_id: string; phone_number_id: string; customer_business_id: string; existence: boolean}) : Promise<Business> => {
    return apiFetch('/business/updateWithMeta', {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export const updateProfileInfo = async (profileInfo: BusinessProfileInfo): Promise<{business:BusinessProfileInfo}> => {
    return apiFetch('/business', {
        method: 'PUT',
        body: JSON.stringify(profileInfo),
    });
};

export const getApiKey = async (): Promise<{apiKey: string}> => {
    return apiFetch('/business/apiKey');
};

// export const getGoogleAuthUrl = async () => {
     
//     try {
//       const response = await fetch('http://localhost:3000/auth/google');

//      return response.json();
//     } catch (error) {
//       console.error('Error fetching Google auth URL:', error);
//       throw new Error('Failed to fetch Google auth URL');
//     }
// }

// --- Clients ---
// Uses the '/api/bclients' endpoint as requested.
export const getClients = async (): Promise<{bclients:Client[]}> => {
    const client = await apiFetch('/bclients/clients');
    console.log('Fetched clients:', client);
    return client;
};

export const updateClient = async (client: Client): Promise<Client> => {
    return apiFetch(`/bclients/${client.id}`, {
        method: 'PUT',
        body: JSON.stringify(client),
    });
};

export const addClient = async (clientData: Omit<Client, 'id' | 'avatarUrl' | 'lastContact'>): Promise<Client> => {
    return apiFetch('/api/bclients', {
        method: 'POST',
        body: JSON.stringify(clientData),
    });
};


// --- Bookings ---
// Uses the '/api/bookings' endpoint as requested.
export const getBookings = async (): Promise<{bookings: Booking[]}> => {
    return apiFetch('/bookings');
};


// --- Tasks ---
// Uses the '/api/btasks' endpoint as requested.
export const getTasks = async (): Promise<{btasks: Task[]}> => {
    return apiFetch('/btasks');
};

export const updateTask = async (task: Task): Promise<Task> => {
    return apiFetch(`/btasks/${task.id}`, {
        method: 'PUT',
        body: JSON.stringify(task),
    });
};


// --- Templates ---
// NOTE: Endpoint '/api/btemplates' is an assumption. Change if needed.
export const getTemplates = async (): Promise<MessageTemplate[]> => {
    return apiFetch('/btemplates');
};

export const addTemplate = async (templateData: Omit<MessageTemplate, 'id'| 'status'>): Promise<MessageTemplate> => {
    return apiFetch('/btemplates', {
        method: 'POST',
        body: JSON.stringify(templateData),
    });
};

export const getChats = async (): Promise<Chat[]> => {
    return apiFetch('/chat');
};

// NOTE: Endpoint '/api/chats/${chatId}/messages' is an assumption. Change if needed.
export const getChatMessages = async (chatId: string): Promise<ChatMessage[]> => {
    return apiFetch(`/chat/${chatId}/messages`);
};

export const getConnectors = async (): Promise<Connectors> => {
     return apiFetch('/business/connectionStatus');
};

// Dummy function for fetching website content - Replace with actual API endpoint later
export const fetchWebsiteContent = async (url: string): Promise<{ content: string }> => {
    return apiFetch('/businessProfile/addFromWebsite', { method: 'POST', body: JSON.stringify({ url }) });
};