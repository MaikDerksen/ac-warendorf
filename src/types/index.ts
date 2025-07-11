

export interface NewsArticle {
  id: string; 
  slug: string;
  title: string;
  date: string; // YYYY-MM-DD
  categories: string[];
  excerpt: string;
  content: string; // HTML content
  heroImageUrl?: string;
  dataAiHint?: string;
  youtubeEmbed?: string;
  createdAt?: any; 
  authorId?: string;
  updatedAt?: any;
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
  order: number;
  createdAt?: any; 
  createdBy?: string; 
  updatedAt?: any;
  updatedBy?: string;
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
  updatedAt?: any;
}

export interface FaqItem {
  id: string; // Should be unique, e.g., "faq-was-kostet"
  question: string;
  answer: string; // Can be HTML
  category?: string;
  displayOrder?: number;
  icon?: string; 
}

export interface Sponsor {
  id: string; 
  name: string;
  level: string; 
  logoUrl: string; 
  websiteUrl?: string;
  dataAiHint?: string;
  displayOrder: number;
  isActive?: boolean;
  createdAt?: any; 
  createdBy?: string;
  updatedAt?: any;
}

export interface SiteSettings {
  logoUrl?: string;
  homepageHeroImageUrl?: string;
}

export interface AktivitaetenPageContent {
  mainImageUrl?: string;
  kartSlalomSectionTitle?: string;
  kartSlalomIntroParagraph?: string; // HTML allowed
  kartSlalomDetailParagraph1?: string; // HTML allowed
  kartSlalomDetailParagraph2?: string; // HTML allowed
  youtubeEmbedId?: string;
  youtubeSectionTitle?: string;
  youtubeSectionText?: string; // HTML allowed
  futurePossibilitiesTitle?: string;
  futurePossibilitiesIntro?: string; // HTML allowed
  futurePossibilitiesItems?: string[]; // Each item can be HTML
}

export interface MitgliedWerdenPageContent {
  imageUrl?: string;
  pageTitle?: string;
  pageSubtitle?: string;
  faqSectionTitle?: string; // New: Title for the FAQ section
  faqItems?: FaqItem[];
  whatIsKartSlalomTitle?: string;
  whatIsKartSlalomText?: string; // HTML allowed
  wikipediaLinkText?: string; // New: Text for the Wikipedia link
  wikipediaLinkUrl?: string;
  sidebarTitle?: string;
  sidebarText?: string; // HTML allowed
  sidebarButtonText?: string; // New: Text for the sidebar button
  sidebarButtonLink?: string; // New: Link for the sidebar button
}

export interface KontaktPageContent {
  pageTitle?: string;
  pageSubtitle?: string;
  formTitle?: string;
  alternativeContactTitle?: string;
  addressStreet?: string;
  addressCity?: string;
  examplePhoneNumber?: string;
  dataPrivacyNoteHtml?: string; // HTML allowed
}

export type EventCategory = 'Training' | 'Rennen' | 'Sitzung' | 'Feier' | 'Arbeitseinsatz' | 'Sonstiges';

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO 8601 format
  end: string;   // ISO 8601 format
  allDay: boolean;
  location?: string;
  description?: string;
  category: EventCategory;
  createdAt?: any;
  updatedAt?: any;
  createdBy?: string;
  recurrenceGroupId?: string; // New: To group recurring events
}
