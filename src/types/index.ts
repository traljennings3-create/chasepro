export interface Profile {
  id: string;
  fullName: string;
  businessName: string;
  email: string;
  phone?: string;
  timezone: string;
  plan: 'free' | 'starter' | 'pro' | 'agency';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  onboarded: boolean;
  createdAt: number;
}

export interface Client {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  tags?: string[];
  payScore: number;
  avgDaysToPay?: number;
  preferredChannel: 'email' | 'sms' | 'both';
  notes?: string;
  createdAt: number;
}

export interface Invoice {
  id: string;
  userId: string;
  clientId: string;
  invoiceNumber: string;
  description: string;
  amount: number;
  currency: string;
  issuedDate: string;
  dueDate: string;
  paidDate?: number;
  status: 'draft' | 'sent' | 'viewed' | 'partial' | 'paid' | 'overdue' | 'written_off';
  stripePaymentLink?: string;
  stripePaymentIntentId?: string;
  viewedAt?: number;
  reminderPaused: boolean;
  escalationLevel: number;
  notes?: string;
  createdAt: number;
}

export interface ChaseLog {
  id: string;
  invoiceId: string;
  userId: string;
  clientId: string;
  channel: 'email' | 'sms';
  tone: string;
  subject: string;
  body: string;
  sentAt: number;
  openedAt?: number;
  clickedAt?: number;
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
}

export interface Template {
  id: string;
  userId: string;
  name: string;
  tone: string;
  channel: 'email' | 'sms';
  subject: string;
  body: string;
  isAiGenerated: boolean;
  createdAt: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'invoice_viewed' | 'payment_received' | 'invoice_overdue' | 'chase_sent' | 'client_score_change';
  title: string;
  body: string;
  read: boolean;
  metadata?: any;
  createdAt: number;
}
