
export interface NewsArticle {
  slug: string;
  title: string;
  date: string; // YYYY-MM-DD
  categories: string[]; // Will be pipe-separated in CSV
  excerpt: string;
  content: string; // HTML content
  heroImageUrl?: string;
  dataAiHint?: string;
  youtubeEmbed?: string;
}

export interface BoardMember {
  id: string;
  name: string;
  role: string;
  term?: string;
  email: string;
  imageUrl?: string;
  slug?: string;
  description?: string;
}

export interface Pilot {
  id: string;
  name: string;
  profileSlug?: string;
  imageUrl?: string;
  bio?: string;
  achievements?: string[]; // Will be pipe-separated in CSV
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface Sponsor {
  id: string;
  name: string;
  level: string; // e.g., Hauptsponsor, Premium Partner
  logoUrl: string;
  websiteUrl?: string;
  dataAiHint?: string;
}
