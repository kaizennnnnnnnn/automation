export type UserRole = "designer" | "caller" | "both";

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
}

export interface TemplateField {
  key: string;
  label: string;
  type: "text" | "color" | "image" | "textarea";
  required: boolean;
}

export interface Template {
  id: string;
  designer_id: string;
  name: string;
  niche: string;
  description: string;
  preview_image_url: string | null;
  html_content: string;
  fields: TemplateField[];
  price: number;
  is_active: boolean;
  downloads: number;
  rating: number;
  created_at: string;
  // Joined fields
  designer?: Profile;
}

export interface Preview {
  id: string;
  caller_id: string;
  template_id: string;
  slug: string;
  field_values: Record<string, string>;
  html_snapshot: string;
  prospect_name: string | null;
  created_at: string;
  expires_at: string | null;
  // Joined fields
  template?: Template;
}

export interface Purchase {
  id: string;
  caller_id: string;
  template_id: string;
  amount: number;
  stripe_payment_id: string;
  created_at: string;
}

export interface Review {
  id: string;
  caller_id: string;
  template_id: string;
  rating: number;
  comment: string;
  created_at: string;
  // Joined fields
  caller?: Profile;
}

export const NICHES = [
  "Restaurant",
  "Dentist",
  "Gym",
  "Cake Shop",
  "Hair Salon",
  "Real Estate",
  "Law Firm",
  "Barbershop",
  "Yoga Studio",
  "Pet Shop",
] as const;

export type Niche = (typeof NICHES)[number];
