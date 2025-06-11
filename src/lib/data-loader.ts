
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import type { NewsArticle, BoardMember, Pilot, FaqItem, Sponsor } from '@/types';
import { db } from '@/lib/firebaseConfig';
import { collection, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';

const dataDirectory = path.join(process.cwd(), 'src/data');

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
    // Order by 'date' field descending. Assuming 'date' is stored as 'YYYY-MM-DD' string.
    // Firestore can order strings lexicographically. For true date ordering,
    // storing dates as Timestamps or ISO strings convertible to dates is better.
    // For 'YYYY-MM-DD', string sort order should work fine for descending dates.
    const q = query(newsCollectionRef, orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    
    const articles: NewsArticle[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Ensure createdAt is handled if needed, though NewsArticle type doesn't currently have it.
      // If 'date' field from Firestore isn't a string, convert it.
      // Categories should already be an array from the API.
      articles.push({
        id: doc.id, // Firestore document ID
        slug: data.slug || '',
        title: data.title || '',
        date: data.date || '', // Assuming YYYY-MM-DD string
        categories: Array.isArray(data.categories) ? data.categories : [],
        excerpt: data.excerpt || '',
        content: data.content || '',
        heroImageUrl: data.heroImageUrl || '',
        dataAiHint: data.dataAiHint || '',
        youtubeEmbed: data.youtubeEmbed || '',
      } as NewsArticle); // Explicitly cast to NewsArticle type for safety
    });
    return articles;
  } catch (error) {
    console.error("Error fetching news articles from Firestore:", error);
    return []; // Return empty array on error
  }
}

export async function getNewsArticleBySlug(slug: string): Promise<NewsArticle | undefined> {
  try {
    const newsCollectionRef = collection(db, "news");
    const q = query(newsCollectionRef, where("slug", "==", slug), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log(`No news article found with slug: ${slug}`);
      return undefined;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      slug: data.slug || '',
      title: data.title || '',
      date: data.date || '',
      categories: Array.isArray(data.categories) ? data.categories : [],
      excerpt: data.excerpt || '',
      content: data.content || '',
      heroImageUrl: data.heroImageUrl || '',
      dataAiHint: data.dataAiHint || '',
      youtubeEmbed: data.youtubeEmbed || '',
    } as NewsArticle;
  } catch (error) {
    console.error(`Error fetching news article by slug ${slug} from Firestore:`, error);
    return undefined;
  }
}

// --- Board Members (still from CSV for now) ---
export async function getAllBoardMembers(): Promise<BoardMember[]> {
  const filePath = path.join(dataDirectory, 'vorstand/board-members.csv');
  const members = await parseCSV<any>(filePath);
   return members.map(member => ({
    ...member,
  }));
}

export async function getBoardMemberBySlug(slug: string): Promise<BoardMember | undefined> {
  const members = await getAllBoardMembers();
  return members.find(member => member.slug === slug);
}

// --- Pilots (still from CSV for now) ---
export async function getAllPilots(): Promise<Pilot[]> {
  const filePath = path.join(dataDirectory, 'pilots/pilots.csv');
  const pilots = await parseCSV<any>(filePath);
  return pilots.map(pilot => ({
    ...pilot,
    achievements: pilot.achievements ? (pilot.achievements as string).split('|') : [],
  }));
}

export async function getPilotBySlug(slug: string): Promise<Pilot | undefined> {
  const pilots = await getAllPilots();
  return pilots.find(pilot => pilot.profileSlug === slug);
}

// --- FAQ Items (still from CSV for now) ---
export async function getAllFaqItems(): Promise<FaqItem[]> {
  const filePath = path.join(dataDirectory, 'faq/faq.csv');
  return parseCSV<FaqItem>(filePath);
}

// --- Sponsors (still from CSV for now) ---
export async function getAllSponsors(): Promise<Sponsor[]> {
  const filePath = path.join(dataDirectory, 'sponsoren/sponsors.csv');
  return parseCSV<Sponsor>(filePath);
}
