
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import type { NewsArticle, BoardMember, Pilot, FaqItem, Sponsor } from '@/types';
import { db } from '@/lib/firebaseConfig'; // Ensure db is correctly imported
import { collection, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';

const dataDirectory = path.join(process.cwd(), 'src/data');

// Helper function to sanitize strings by removing leading/trailing quotes
function sanitizeString(str: string | undefined | null): string {
  if (typeof str === 'string') {
    return str.replace(/^"|"$/g, '').replace(/^'|'$/g, ''); // Remove leading/trailing " or '
  }
  return str || ''; // Return empty string if undefined, null, or not a string
}


function parseCSV<T>(filePath: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    Papa.parse<T>(fileContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false, 
      complete: (results) => {
        if (results.errors.length > 0) {
          console.error("CSV Parsing Errors:", results.errors);
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
        date: sanitizeString(data.date), // Assuming YYYY-MM-DD string
        categories: Array.isArray(data.categories) ? data.categories.map(sanitizeString) : [],
        excerpt: sanitizeString(data.excerpt),
        content: sanitizeString(data.content), // Content might be HTML, usually doesn't have surrounding quotes
        heroImageUrl: sanitizeString(data.heroImageUrl),
        dataAiHint: sanitizeString(data.dataAiHint),
        youtubeEmbed: sanitizeString(data.youtubeEmbed),
        createdAt: data.createdAt, // Keep as Firestore Timestamp or convert as needed
      } as NewsArticle);
    });
    return articles;
  } catch (error) {
    console.error("Error fetching news articles from Firestore:", error);
    return [];
  }
}

export async function getNewsArticleBySlug(slug: string): Promise<NewsArticle | undefined> {
  const sanitizedSlug = sanitizeString(slug); // Sanitize input slug as well
  try {
    const newsCollectionRef = collection(db, "news");
    // Querying by sanitized slug might be needed if slugs in DB are also quoted
    // For now, assuming slugs in DB are clean, or will be cleaned upon retrieval.
    const q = query(newsCollectionRef, where("slug", "==", sanitizedSlug), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // Try querying with potentially quoted slug if the first attempt fails (defensive)
      const qFallback = query(newsCollectionRef, where("slug", "==", `"${sanitizedSlug}"`), limit(1));
      const querySnapshotFallback = await getDocs(qFallback);
      if(querySnapshotFallback.empty) {
        console.log(`No news article found with slug: ${sanitizedSlug} (or quoted version)`);
        return undefined;
      }
      const doc = querySnapshotFallback.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        slug: sanitizeString(data.slug),
        title: sanitizeString(data.title),
        date: sanitizeString(data.date),
        categories: Array.isArray(data.categories) ? data.categories.map(sanitizeString) : [],
        excerpt: sanitizeString(data.excerpt),
        content: sanitizeString(data.content),
        heroImageUrl: sanitizeString(data.heroImageUrl),
        dataAiHint: sanitizeString(data.dataAiHint),
        youtubeEmbed: sanitizeString(data.youtubeEmbed),
        createdAt: data.createdAt,
      } as NewsArticle;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      slug: sanitizeString(data.slug),
      title: sanitizeString(data.title),
      date: sanitizeString(data.date),
      categories: Array.isArray(data.categories) ? data.categories.map(sanitizeString) : [],
      excerpt: sanitizeString(data.excerpt),
      content: sanitizeString(data.content),
      heroImageUrl: sanitizeString(data.heroImageUrl),
      dataAiHint: sanitizeString(data.dataAiHint),
      youtubeEmbed: sanitizeString(data.youtubeEmbed),
      createdAt: data.createdAt,
    } as NewsArticle;
  } catch (error) {
    console.error(`Error fetching news article by slug ${sanitizedSlug} from Firestore:`, error);
    return undefined;
  }
}

// --- Board Members (still from CSV for now) ---
// Consider similar sanitization if/when moving these to Firestore
export async function getAllBoardMembers(): Promise<BoardMember[]> {
  const filePath = path.join(dataDirectory, 'vorstand/board-members.csv');
  const members = await parseCSV<any>(filePath);
   return members.map(member => ({
    ...member,
    // Sanitize string fields from CSV if necessary
    name: sanitizeString(member.name),
    role: sanitizeString(member.role),
    term: sanitizeString(member.term),
    email: sanitizeString(member.email),
    imageUrl: sanitizeString(member.imageUrl),
    slug: sanitizeString(member.slug),
    description: sanitizeString(member.description),
  }));
}

export async function getBoardMemberBySlug(slug: string): Promise<BoardMember | undefined> {
  const members = await getAllBoardMembers();
  // Slug comparison should be case-insensitive and against sanitized slugs
  return members.find(member => sanitizeString(member.slug)?.toLowerCase() === sanitizeString(slug)?.toLowerCase());
}

// --- Pilots (still from CSV for now) ---
// Consider similar sanitization if/when moving these to Firestore
export async function getAllPilots(): Promise<Pilot[]> {
  const filePath = path.join(dataDirectory, 'pilots/pilots.csv');
  const pilotsData = await parseCSV<any>(filePath);
  return pilotsData.map(pilot => ({
    id: sanitizeString(pilot.id),
    name: sanitizeString(pilot.name),
    profileSlug: sanitizeString(pilot.profileSlug),
    imageUrl: sanitizeString(pilot.imageUrl),
    bio: sanitizeString(pilot.bio),
    achievements: pilot.achievements ? (sanitizeString(pilot.achievements) as string).split('|').map(s => s.trim()) : [],
  }));
}

export async function getPilotBySlug(slug: string): Promise<Pilot | undefined> {
  const pilots = await getAllPilots();
  return pilots.find(pilot => sanitizeString(pilot.profileSlug)?.toLowerCase() === sanitizeString(slug)?.toLowerCase());
}

// --- FAQ Items (still from CSV for now) ---
// Consider similar sanitization if/when moving these to Firestore
export async function getAllFaqItems(): Promise<FaqItem[]> {
  const filePath = path.join(dataDirectory, 'faq/faq.csv');
  const items = await parseCSV<FaqItem>(filePath);
  return items.map(item => ({
    ...item,
    question: sanitizeString(item.question),
    answer: sanitizeString(item.answer), // Answer might contain HTML, usually not quoted
  }));
}

// --- Sponsors (still from CSV for now) ---
// Consider similar sanitization if/when moving these to Firestore
export async function getAllSponsors(): Promise<Sponsor[]> {
  const filePath = path.join(dataDirectory, 'sponsoren/sponsors.csv');
  const sponsors = await parseCSV<Sponsor>(filePath);
  return sponsors.map(sponsor => ({
    ...sponsor,
    name: sanitizeString(sponsor.name),
    level: sanitizeString(sponsor.level),
    logoUrl: sanitizeString(sponsor.logoUrl),
    websiteUrl: sanitizeString(sponsor.websiteUrl),
    dataAiHint: sanitizeString(sponsor.dataAiHint),
  }));
}

