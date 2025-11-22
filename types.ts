
export enum TaskUrgency {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum TemplateStatus {
    APPROVED = 'Approved',
    PENDING = 'Pending',
    REJECTED = 'Rejected'
}

export enum Timezone {
    US = 'America/New_York',
    INDIA = 'Asia/Kolkata',
    EUROPE = 'Europe/London'
}

export interface Client {
  id: string;
  name?: string;
  email?: string;
  phone_number: string;
  last_interaction_at?: string;
  notes?: string;
  avatarUrl: string;
  business_id: string;
  thread_id?: string; // Optional, if the client has a thread
  createdAt?: string; // Optional, if the client has a creation date
  updatedAt?: string; // Optional, if the client has an update date
}

export interface Task {
  id: string;
  description: string;
  createdAt: string;
  priority: TaskUrgency;
  status: 'in_progress' | 'resolved';
  client_name?: string;
}

export interface Booking {
  id: string;
  client_name: string;
  session_type: string;
  start_time: string;
  status: 'pending' | 'completed' | 'cancelled' | 'confirmed';
}
export interface TemplateComponent {
    type: 'BODY';
    text: string;
    example?: {
        body_text: string[][];
    };
}
export enum TemplateCategory {
    UTILITY = 'UTILITY',
    TRANSACTIONAL = 'TRANSACTIONAL',
    OTP = 'OTP',
    MARKETING = 'MARKETING'
}

export interface MessageTemplate {
    id: string;
    name: string;
    language: string;
    status: TemplateStatus;
    category: TemplateCategory;
    components: TemplateComponent[];
}


export interface Service {
    name: string;
    price: number | string;
    time: string;
}

export interface BusinessProfile {
    id:string;
    tone: string;
    about: string;
    business_id: string;
    business_type: string;
    timezone: Timezone;
    hours_of_operation: string;
    services: Service[];
    instructions: string;
}

export interface BusinessProfileInfo {
    id: string;
    name: string;
    email: string;
    phone_number: string;
}
export interface Business {
  id: string;
  name: string;
  profile: BusinessProfile;
  clients: Client[];
  tasks: Task[];
  bookings: Booking[];
  messageTemplates: MessageTemplate[];
}

export interface Chat {
  id: string;
  status: string;
  last_message_timestamp: string;
  metadata: {
    source?: string;
  };
  created_at: string;
  BClient: {
    name: string;
    email: string;
  }
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_type: 'client' | 'system';
  content: string;
  timestamp: string;
}

export interface Connectors {
    WAConnection: boolean;
    GoogleConnection: boolean;
}