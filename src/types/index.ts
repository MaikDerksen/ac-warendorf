
export interface NewsArticle {
  id: string; // Added for Firestore document ID
  slug: string;
  title: string;
  date: string; // YYYY-MM-DD
  categories: string[];
  excerpt: string;
  content: string; // HTML content
  heroImageUrl?: string;
  dataAiHint?: string;
  youtubeEmbed?: string;
  createdAt?: any; // Firestore Timestamp
  authorId?: string;
}

export interface BoardMember {
  id: string; // Firestore document ID (e.g. a slug-like identifier like 'max-mustermann')
  name: string;
  role: string;
  term?: string;
  email: string;
  imageUrl?: string; // Firebase Storage URL
  slug?: string; // For profile page URL, can be same as id
  description?: string;
  order?: number; // For custom sorting
  createdAt?: any; // Firestore Timestamp
  createdBy?: string; // UID of admin who created/updated
}

export interface Pilot {
  id: string;
  name: string;
  profileSlug?: string;
  imageUrl?: string;
  bio?: string;
  achievements?: string[];
  createdAt?: any;
  createdBy?: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  displayOrder?: number;
  icon?: string; // Optional: if we want to specify icons from admin
}

export interface Sponsor {
  id: string; // Firestore document ID
  name: string;
  level: string; // e.g., Hauptsponsor, Premium Partner
  logoUrl: string; // Firebase Storage URL
  websiteUrl?: string;
  dataAiHint?: string;
  displayOrder?: number;
  isActive?: boolean;
  createdAt?: any; // Firestore Timestamp
  createdBy?: string;
}

export interface SiteSettings {
  logoUrl?: string;
  homepageHeroImageUrl?: string;
  // Add other global site settings here as needed
}
