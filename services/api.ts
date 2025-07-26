
import { Client, Task, Booking, MessageTemplate, BusinessProfile, TaskUrgency, TemplateStatus, Timezone } from '../types';

// MOCK DATABASE
const MOCK_CLIENTS: Client[] = [
  { id: '1', name: 'John Doe', email: 'john.d@example.com', phone: '123-456-7890', lastContact: '2024-07-20', avatarUrl: 'https://picsum.photos/id/237/200/200', notes: 'Interested in web design services.' },
  { id: '2', name: 'Jane Smith', email: 'jane.s@example.com', phone: '234-567-8901', lastContact: '2024-07-18', avatarUrl: 'https://picsum.photos/id/238/200/200', notes: '' },
  { id: '3', name: 'Sam Wilson', email: 'sam.w@example.com', phone: '345-678-9012', lastContact: '2024-07-21', avatarUrl: 'https://picsum.photos/id/239/200/200', notes: 'Scheduled a follow-up call.' },
];

const MOCK_TASKS: Task[] = [
  { id: 't1', title: 'Follow up with John Doe', createdAt: '2024-07-20', urgency: TaskUrgency.HIGH, client: 'John Doe' },
  { id: 't2', title: 'Prepare proposal for Jane Smith', createdAt: '2024-07-19', urgency: TaskUrgency.MEDIUM },
  { id: 't3', title: 'Send invoice to Acme Corp', createdAt: '2024-07-22', urgency: TaskUrgency.LOW },
  { id: 't4', title: 'Fix landing page bug', createdAt: '2024-07-22', urgency: TaskUrgency.CRITICAL },
];

const MOCK_BOOKINGS: Booking[] = [
    { id: 'b1', clientName: 'Alice Johnson', service: 'Consultation Call', dateTime: '2024-08-01T10:00:00', status: 'Upcoming' },
    { id: 'b2', clientName: 'Bob Williams', service: 'Project Kickoff', dateTime: '2024-08-02T14:30:00', status: 'Upcoming' },
    { id: 'b3', clientName: 'Charlie Brown', service: 'Final Review', dateTime: '2024-07-15T11:00:00', status: 'Completed' },
];

const MOCK_TEMPLATES: MessageTemplate[] = [
    { id: 'mt1', name: 'welcome_message', language: 'English', status: TemplateStatus.APPROVED, content: 'Hello {{1}}! Welcome to our service.' },
    { id: 'mt2', name: 'appointment_reminder', language: 'English', status: TemplateStatus.APPROVED, content: 'Hi {{1}}, this is a reminder for your appointment on {{2}}.' },
    { id: 'mt3', name: 'offer_promo', language: 'Spanish', status: TemplateStatus.PENDING, content: 'Hola {{1}}, tenemos una nueva oferta para ti!' },
];

let MOCK_PROFILE: BusinessProfile = {
    businessName: 'Creative Solutions Inc.',
    email: 'contact@creativesolutions.com',
    phone: '555-123-4567',
    businessType: 'Digital Agency',
    timezone: Timezone.US,
    operatingHours: 'Mon-Fri, 9 AM - 6 PM EST',
    services: 'Web Design, SEO, Social Media Marketing',
    instructions: 'For urgent matters, please call. For all other inquiries, please allow up to 24 hours for a response via WhatsApp.',
};

// Simulate network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));


// API Functions
export const login = async (email: string, pass: string) => {
    await delay(500);
    if (email && pass) {
        return { success: true, token: 'fake-jwt-token' };
    }
    throw new Error('Invalid credentials');
};

export const register = async (data: any) => {
    await delay(700);
    console.log('Registering with data:', data);
    return { success: true, token: 'fake-jwt-token-new' };
};

export const getDashboardSummary = async () => {
    await delay(500);
    return {
        upcomingBookings: MOCK_BOOKINGS.filter(b => b.status === 'Upcoming').length,
        openTasks: MOCK_TASKS.length,
        totalClients: MOCK_CLIENTS.length,
        revenue: 5230.75
    };
};

export const getNewTasks = async () => {
    await delay(300);
    return MOCK_TASKS.slice(0, 5);
};

export const getProfile = async (): Promise<BusinessProfile> => {
    await delay(400);
    return MOCK_PROFILE;
};

export const updateProfile = async (profile: BusinessProfile): Promise<BusinessProfile> => {
    await delay(600);
    MOCK_PROFILE = { ...profile };
    return MOCK_PROFILE;
};


export const getClients = async (): Promise<Client[]> => {
    await delay(500);
    return MOCK_CLIENTS;
};

export const updateClient = async (client: Client): Promise<Client> => {
    await delay(500);
    const index = MOCK_CLIENTS.findIndex(c => c.id === client.id);
    if (index !== -1) {
        MOCK_CLIENTS[index] = client;
        return client;
    }
    throw new Error('Client not found');
};

export const addClient = async (clientData: Omit<Client, 'id' | 'avatarUrl' | 'lastContact'>): Promise<Client> => {
    await delay(500);
    const newClient: Client = {
        ...clientData,
        id: new Date().toISOString(),
        avatarUrl: `https://picsum.photos/id/${Math.floor(Math.random() * 200) + 200}/200/200`,
        lastContact: new Date().toISOString().split('T')[0],
    };
    MOCK_CLIENTS.unshift(newClient);
    return newClient;
};


export const getBookings = async (): Promise<Booking[]> => {
    await delay(500);
    return MOCK_BOOKINGS;
};

export const getTasks = async (): Promise<Task[]> => {
    await delay(500);
    return MOCK_TASKS;
};

export const getTemplates = async (): Promise<MessageTemplate[]> => {
    await delay(500);
    return MOCK_TEMPLATES;
};

export const addTemplate = async (templateData: Omit<MessageTemplate, 'id'| 'status'>): Promise<MessageTemplate> => {
    await delay(500);
    const newTemplate: MessageTemplate = {
        ...templateData,
        id: `mt-${new Date().getTime()}`,
        status: TemplateStatus.PENDING,
    };
    MOCK_TEMPLATES.unshift(newTemplate);
    return newTemplate;
};
