
export interface NewsArticle {
  slug: string;
  title: string;
  date: string; // YYYY-MM-DD
  categories: string[];
  excerpt: string;
  content: string; // HTML or Markdown
  heroImageUrl?: string;
  dataAiHint?: string; // For AI image generation hints
  youtubeEmbed?: string; // YouTube video ID or full embed code
}

export interface BoardMember {
  id: string;
  name: string;
  role: string; // Funktion
  term?: string; // Amtszeit (e.g., "→ 2026")
  email: string;
  imageUrl?: string; // Path to image in /public folder
  slug?: string; // For individual profile page
  description?: string; // Additional details about the member or their role
}

export interface Pilot {
  id: string;
  name: string; // Vorname or Pseudonym
  profileSlug?: string; // For future profile page
  imageUrl?: string; // Path to image in /public folder
  bio?: string; // For the "About Me" section on their profile
  achievements?: string[]; // List of achievements
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}
