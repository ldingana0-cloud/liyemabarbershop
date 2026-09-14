export interface Service {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  duration_minutes: number;
  category: string;
  active: boolean;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  loyalty_points: number;
  total_visits: number;
  notes: string | null;
  created_at: string;
}

export interface Appointment {
  id: string;
  customer_id: string | null;
  customer_name: string;
  service_id: string | null;
  service_name: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  status: string;
  notes: string | null;
  reminder_sent: boolean;
  created_at: string;
}

export interface ContentGeneration {
  id: string;
  content_type: string;
  prompt: string;
  output: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface LoyaltyTransaction {
  id: string;
  customer_id: string;
  points: number;
  transaction_type: string;
  description: string | null;
  appointment_id: string | null;
  created_at: string;
}

export interface SocialPost {
  id: string;
  platform: string;
  caption: string;
  content: string | null;
  image_prompt: string | null;
  status: string;
  scheduled_for: string | null;
  created_at: string;
}

export type ContentType = 'text' | 'email' | 'code' | 'image';

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no-show';

export type SocialPlatform = 'instagram' | 'tiktok' | 'linkedin' | 'whatsapp';
