
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

export interface MessageTemplate {
    id: string;
    name: string;
    language: string;
    status: TemplateStatus;
    content: string;
}

export interface BusinessProfile {
    businessName: string;
    email: string;
    phone: string;
    businessType: string;
    timezone: Timezone;
    operatingHours: string;
    services: string;
    instructions: string;
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
