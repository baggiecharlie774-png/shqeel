import type { Role, TicketCategory, TicketPriority, TicketStatus } from "@/lib/constants";

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string | null;
  location: string | null;
  address: string | null;
  avatar_url: string | null;
  specialization: string | null;
  status: string | null;
  created_at: string;
}

export interface Ticket {
  id: number;
  ticket_code: string;
  title: string;
  category: TicketCategory;
  description: string;
  location: string | null;
  priority: TicketPriority | null;
  status: TicketStatus;
  client_id: string;
  technician_id: string | null;
  created_at: string;
  updated_at: string;
  client?: Pick<Profile, "id" | "name" | "email"> | null;
  technician?: Pick<Profile, "id" | "name" | "email"> | null;
}

export interface TicketDetails extends Ticket {
  work_notes: WorkNote[];
  messages: Message[];
  attachments: Attachment[];
  timeline: TimelineEvent[];
}

export interface WorkNote {
  id: number;
  ticket_id: number;
  author_id: string;
  note: string;
  created_at: string;
  author?: Pick<Profile, "id" | "name" | "role"> | null;
}

export interface Message {
  id: number;
  ticket_id: number;
  sender_id: string;
  text: string;
  created_at: string;
  sender?: Pick<Profile, "id" | "name" | "role"> | null;
}

export interface Notification {
  id: number;
  user_id: string;
  icon: string;
  message: string;
  link: string | null;
  read: boolean;
  created_at: string;
}

export interface Attachment {
  id: number;
  ticket_id: number;
  filename: string;
  filepath: string;
  uploaded_at: string;
}

export interface TimelineEvent {
  id: number;
  ticket_id: number;
  title: string;
  description: string | null;
  created_at: string;
}

export interface Conversation {
  ticket_id: number;
  ticket_code: string;
  title: string;
  status: TicketStatus;
  client_name: string | null;
  technician_name: string | null;
  last_message: string | null;
  last_message_time: string | null;
}

export interface Stats {
  tickets: {
    total: number;
    new: number;
    under_review: number;
    assigned: number;
    in_progress: number;
    pending: number;
    resolved: number;
    closed: number;
    high_priority: number;
  };
  users: {
    total_clients: number;
    total_technicians: number;
    available: number;
    busy: number;
    offline: number;
  };
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile> & { id: string }; Update: Partial<Profile> };
      tickets: { Row: Ticket; Insert: Partial<Ticket>; Update: Partial<Ticket> };
      work_notes: { Row: WorkNote; Insert: Partial<WorkNote>; Update: Partial<WorkNote> };
      messages: { Row: Message; Insert: Partial<Message>; Update: Partial<Message> };
      notifications: { Row: Notification; Insert: Partial<Notification>; Update: Partial<Notification> };
      attachments: { Row: Attachment; Insert: Partial<Attachment>; Update: Partial<Attachment> };
      timeline_events: { Row: TimelineEvent; Insert: Partial<TimelineEvent>; Update: Partial<TimelineEvent> };
    };
  };
}
