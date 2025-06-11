
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import type { NewsArticle, BoardMember, Pilot, FaqItem, Sponsor } from '@/types';
import { db } from '@/lib/firebaseConfig'; 
import { collection, getDocs, query, where, orderBy, limit, Timestamp, doc, getDoc } from 'firebase/firestore';

const dataDirectory = path.join(process.cwd(), 'src/data');

// Helper function to sanitize strings by removing leading/trailing quotes
function sanitizeString(str: string | undefined | null): string {
  if (typeof str === 'string') {
    // First remove outer quotes, then trim whitespace
    let processedStr = str.replace(/^["']|["']$/g, '').trim();
    return processedStr;
  }
  return str || ''; 
}


function parseCSV<T>(filePath: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    Papa.parse<T>(fileContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false, 
      transformHeader: header => sanitizeString(header).trim(),
      transform: (value, header) => {
         // Check if the header is one that should not be trimmed or have quotes removed, e.g., 'content'
        if (header === 'content' || header === 'answer' || header === 'bio' || header === 'description') {
          return value; // Return raw value for HTML content
        }
        return sanitizeString(value);
      },
      complete: (results) => {
        if (results.errors.length > 0) {
          console.error("CSV Parsing Errors for file:", filePath, results.errors);
          reject(new Error(`Error parsing CSV file: ${filePath}`));
          return;
        }
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

// --- News Articles ---
export async function getAllNewsArticles(): Promise<NewsArticle[]> {
  try {
    const newsCollectionRef = collection(db, "news");
    const q = query(newsCollectionRef, orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    
    const articles: NewsArticle[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      articles.push({
        id: doc.id,
        slug: sanitizeString(data.slug),
        title: sanitizeString(data.title),
        date: sanitizeString(data.date), 
        categories: Array.isArray(data.categories) ? data.categories.map(c => sanitizeString(c as string)) : [],
        excerpt: sanitizeString(data.excerpt),
        content: data.content, // HTML content, should not be sanitized aggressively
        heroImageUrl: data.heroImageUrl ? sanitizeString(data.heroImageUrl) : undefined,
        dataAiHint: data.dataAiHint ? sanitizeString(data.dataAiHint) : undefined,
        youtubeEmbed: data.youtubeEmbed ? sanitizeString(data.youtubeEmbed) : undefined,
        createdAt: data.createdAt, 
      } as NewsArticle);
    });
    return articles;
  } catch (error) {
    console.error("Error fetching news articles from Firestore:", error);
    return [];
  }
}

export async function getNewsArticleBySlug(slug: string): Promise<NewsArticle | undefined> {
  const sanitizedSlug = sanitizeString(slug);
  try {
    const newsCollectionRef = collection(db, "news");
    const q = query(newsCollectionRef, where("slug", "==", sanitizedSlug), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log(`No news article found with slug: ${sanitizedSlug}`);
      return undefined;
    }

    const docSnap = querySnapshot.docs[0];
    const data = docSnap.data();
    
    return {
      id: docSnap.id,
      slug: sanitizeString(data.slug),
      title: sanitizeString(data.title),
      date: sanitizeString(data.date),
      categories: Array.isArray(data.categories) ? data.categories.map(c => sanitizeString(c as string)) : [],
      excerpt: sanitizeString(data.excerpt),
      content: data.content,
      heroImageUrl: data.heroImageUrl ? sanitizeString(data.heroImageUrl) : undefined,
      dataAiHint: data.dataAiHint ? sanitizeString(data.dataAiHint) : undefined,
      youtubeEmbed: data.youtubeEmbed ? sanitizeString(data.youtubeEmbed) : undefined,
      createdAt: data.createdAt,
    } as NewsArticle;
  } catch (error) {
    console.error(`Error fetching news article by slug ${sanitizedSlug} from Firestore:`, error);
    return undefined;
  }
}

// --- Board Members (still from CSV for now) ---
export async function getAllBoardMembers(): Promise<BoardMember[]> {
  const filePath = path.join(dataDirectory, 'vorstand/board-members.csv');
  const members = await parseCSV<any>(filePath);
   return members.map(member => ({
    id: sanitizeString(member.id),
    name: sanitizeString(member.name),
    role: sanitizeString(member.role),
    term: sanitizeString(member.term),
    email: sanitizeString(member.email),
    imageUrl: sanitizeString(member.imageUrl),
    slug: sanitizeString(member.slug),
    description: member.description, // Keep HTML/rich text
    order: member.order ? parseInt(sanitizeString(member.order), 10) : undefined,
    createdAt: undefined, // Not in CSV
  }));
}

export async function getBoardMemberBySlug(slug: string): Promise<BoardMember | undefined> {
  const members = await getAllBoardMembers();
  return members.find(member => member.slug?.toLowerCase() === sanitizeString(slug)?.toLowerCase());
}

// --- Pilots (from Firestore) ---
export async function getAllPilots(): Promise<Pilot[]> {
  try {
    const pilotsCollectionRef = collection(db, "pilots");
    const q = query(pilotsCollectionRef, orderBy("name", "asc")); // Example: order by name
    const querySnapshot = await getDocs(q);
    
    const pilots: Pilot[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      pilots.push({
        id: doc.id,
        name: sanitizeString(data.name),
        profileSlug: data.profileSlug ? sanitizeString(data.profileSlug) : undefined,
        imageUrl: data.imageUrl ? sanitizeString(data.imageUrl) : undefined,
        bio: data.bio, // Keep HTML/rich text if any
        achievements: Array.isArray(data.achievements) ? data.achievements.map(a => sanitizeString(a as string)) : [],
        createdAt: data.createdAt,
      } as Pilot);
    });
    return pilots;
  } catch (error) {
    console.error("Error fetching pilots from Firestore:", error);
    return [];
  }
}

export async function getPilotBySlug(slug: string): Promise<Pilot | undefined> {
  const sanitizedSlug = sanitizeString(slug);
  try {
    const pilotsCollectionRef = collection(db, "pilots");
    const q = query(pilotsCollectionRef, where("profileSlug", "==", sanitizedSlug), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log(`No pilot found with slug: ${sanitizedSlug}`);
      return undefined;
    }

    const docSnap = querySnapshot.docs[0];
    const data = docSnap.data();
    
    return {
      id: docSnap.id,
      name: sanitizeString(data.name),
      profileSlug: data.profileSlug ? sanitizeString(data.profileSlug) : undefined,
      imageUrl: data.imageUrl ? sanitizeString(data.imageUrl) : undefined,
      bio: data.bio,
      achievements: Array.isArray(data.achievements) ? data.achievements.map(a => sanitizeString(a as string)) : [],
      createdAt: data.createdAt,
    } as Pilot;
  } catch (error) {
    console.error(`Error fetching pilot by slug ${sanitizedSlug} from Firestore:`, error);
    return undefined;
  }
}


// --- FAQ Items (still from CSV for now) ---
export async function getAllFaqItems(): Promise<FaqItem[]> {
  const filePath = path.join(dataDirectory, 'faq/faq.csv');
  const items = await parseCSV<any>(filePath);
  return items.map(item => ({
    id: sanitizeString(item.id),
    question: sanitizeString(item.question),
    answer: item.answer, // Keep HTML/rich text
    category: sanitizeString(item.category),
    displayOrder: item.displayOrder ? parseInt(sanitizeString(item.displayOrder), 10) : undefined,
  }));
}

// --- Sponsors (still from CSV for now) ---
export async function getAllSponsors(): Promise<Sponsor[]> {
  const filePath = path.join(dataDirectory, 'sponsoren/sponsors.csv');
  const sponsors = await parseCSV<any>(filePath);
  return sponsors.map(sponsor => ({
    id: sanitizeString(sponsor.id),
    name: sanitizeString(sponsor.name),
    level: sanitizeString(sponsor.level),
    logoUrl: sanitizeString(sponsor.logoUrl),
    websiteUrl: sanitizeString(sponsor.websiteUrl),
    dataAiHint: sanitizeString(sponsor.dataAiHint),
    displayOrder: sponsor.displayOrder ? parseInt(sanitizeString(sponsor.displayOrder), 10) : undefined,
    isActive: sponsor.isActive ? sanitizeString(sponsor.isActive).toLowerCase() === 'true' : undefined,
    createdAt: undefined, // Not in CSV
  }));
}
