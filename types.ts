
export enum TaskUrgency {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
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
  name: string;
  email: string;
  phone: string;
  lastContact: string;
  notes?: string;
  avatarUrl: string;
}

export interface Task {
  id: string;
  title: string;
  createdAt: string;
  urgency: TaskUrgency;
  client?: string;
}

export interface Booking {
  id: string;
  clientName: string;
  service: string;
  dateTime: string;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
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
