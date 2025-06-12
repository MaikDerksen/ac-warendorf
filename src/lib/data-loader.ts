
'use server';

import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import type { NewsArticle, BoardMember, Pilot, FaqItem, Sponsor, SiteSettings } from '@/types';
import { adminApp } from '@/lib/firebaseAdminConfig'; 
import { FieldValue } from 'firebase-admin/firestore';

// --- Constants for Placeholders ---
const PLACEHOLDER_IMAGE_LARGE = "https://placehold.co/1200x675.png";
const PLACEHOLDER_IMAGE_MEDIUM = "https://placehold.co/600x400.png";
const PLACEHOLDER_IMAGE_SQUARE = "https://placehold.co/400x400.png";
const PLACEHOLDER_LOGO_SMALL = "https://placehold.co/80x80.png";

// Helper function to sanitize strings
function sanitizeString(str: string | undefined | null): string {
  if (typeof str === 'string') {
    return str.replace(/^["']|["']$/g, '').trim();
  }
  return str || ''; 
}

// Helper to construct Firebase Storage public URL
function getFirebaseStoragePublicUrl(filePath: string): string {
  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!bucketName) {
    console.warn(`NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is not set. Using placeholder for path: ${filePath}`);
    if (filePath.includes('logo')) return PLACEHOLDER_LOGO_SMALL;
    if (filePath.includes('hero') || filePath.includes('kart_in_dry') || filePath.includes('kart_in_rain')) return PLACEHOLDER_IMAGE_LARGE;
    return PLACEHOLDER_IMAGE_MEDIUM;
  }
  const objectPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
  return `https://storage.googleapis.com/${bucketName}/${objectPath}`;
}

function parseCSV<T>(filePath: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      console.warn(`CSV file not found at ${filePath}. Returning empty array.`);
      resolve([]);
      return;
    }
    const fileContent = fs.readFileSync(filePath, 'utf8');
    Papa.parse<T>(fileContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false, 
      transformHeader: header => sanitizeString(header).trim(),
      transform: (value, header) => {
        if (header === 'content' || header === 'answer' || header === 'bio' || header === 'description') {
          return value;
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

// --- Site Settings (using Admin SDK) ---
export async function getSiteSettings(): Promise<SiteSettings> {
  const defaultSettings: SiteSettings = {
    logoUrl: getFirebaseStoragePublicUrl('images/logo/logo_80px.png'), 
    homepageHeroImageUrl: getFirebaseStoragePublicUrl('images/general/kart_in_dry.jpg'),
    contactPersonIds: [],
  };

  if (!adminApp) {
    console.error("CRITICAL: Firebase Admin App not initialized in getSiteSettings. Returning default settings.");
    return defaultSettings;
  }
  const firestoreDb = adminApp.firestore();

  try {
    const settingsDocRef = firestoreDb.collection("siteSettings").doc("config");
    const docSnap = await settingsDocRef.get();

    if (docSnap.exists) {
      const data = docSnap.data();
      return {
        logoUrl: sanitizeString(data?.logoUrl) || defaultSettings.logoUrl,
        homepageHeroImageUrl: sanitizeString(data?.homepageHeroImageUrl) || defaultSettings.homepageHeroImageUrl,
        contactPersonIds: Array.isArray(data?.contactPersonIds) ? data.contactPersonIds.map(id => sanitizeString(id as string)) : [],
      };
    } else {
      console.log("Site settings document (siteSettings/config) does not exist in Firestore. Returning defaults.");
      return defaultSettings;
    }
  } catch (error) {
    console.error("Error fetching site settings from Firestore (ADMIN SDK), returning defaults:", error);
    return defaultSettings;
  }
}

// --- News Articles (from Firestore, using Admin SDK) ---
export async function getAllNewsArticles(): Promise<NewsArticle[]> {
  if (!adminApp) {
    console.error("CRITICAL: Firebase Admin App not initialized in getAllNewsArticles. Returning empty array.");
    return [];
  }
  const firestoreDb = adminApp.firestore();
  try {
    const newsCollectionRef = firestoreDb.collection("news");
    const q = newsCollectionRef.orderBy("date", "desc");
    const querySnapshot = await q.get();
    
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
        content: data.content, // Keep as is, might contain HTML
        heroImageUrl: data.heroImageUrl ? sanitizeString(data.heroImageUrl) : PLACEHOLDER_IMAGE_MEDIUM,
        dataAiHint: data.dataAiHint ? sanitizeString(data.dataAiHint) : undefined,
        youtubeEmbed: data.youtubeEmbed ? sanitizeString(data.youtubeEmbed) : undefined,
        createdAt: data.createdAt, 
        authorId: data.authorId ? sanitizeString(data.authorId) : undefined,
      } as NewsArticle);
    });
    return articles;
  } catch (error) {
    console.error("Error fetching news articles from Firestore (Admin SDK):", error);
    return [];
  }
}

export async function getNewsArticleBySlug(slug: string): Promise<NewsArticle | undefined> {
  if (!adminApp) {
    console.error("CRITICAL: Firebase Admin App not initialized in getNewsArticleBySlug. Returning undefined.");
    return undefined;
  }
  const firestoreDb = adminApp.firestore();
  const sanitizedSlug = sanitizeString(slug);
  try {
    const newsCollectionRef = firestoreDb.collection("news");
    const q = newsCollectionRef.where("slug", "==", sanitizedSlug).limit(1);
    const querySnapshot = await q.get();

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
      heroImageUrl: data.heroImageUrl ? sanitizeString(data.heroImageUrl) : PLACEHOLDER_IMAGE_LARGE,
      dataAiHint: data.dataAiHint ? sanitizeString(data.dataAiHint) : undefined,
      youtubeEmbed: data.youtubeEmbed ? sanitizeString(data.youtubeEmbed) : undefined,
      createdAt: data.createdAt,
      authorId: data.authorId ? sanitizeString(data.authorId) : undefined,
    } as NewsArticle;
  } catch (error) {
    console.error(`Error fetching news article by slug ${sanitizedSlug} from Firestore (Admin SDK):`, error);
    return undefined;
  }
}

// --- Board Members (from Firestore, using Admin SDK) ---
export async function getAllBoardMembers(): Promise<BoardMember[]> {
  if (!adminApp) {
    console.error("CRITICAL: Firebase Admin App not initialized in getAllBoardMembers. Returning empty array.");
    return [];
  }
  const firestoreDb = adminApp.firestore();
  try {
    const membersCollectionRef = firestoreDb.collection("boardMembers");
    const q = membersCollectionRef.orderBy("order", "asc").orderBy("name", "asc");
    const querySnapshot = await q.get();
    
    const members: BoardMember[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      members.push({
        id: doc.id, // Firestore document ID
        name: sanitizeString(data.name),
        role: sanitizeString(data.role),
        term: data.term ? sanitizeString(data.term) : undefined,
        email: sanitizeString(data.email), // Store as is, handle [at] on display
        imageUrl: data.imageUrl ? sanitizeString(data.imageUrl) : PLACEHOLDER_IMAGE_SQUARE,
        slug: data.slug ? sanitizeString(data.slug) : doc.id, // Fallback slug to doc.id if not present
        description: data.description ? data.description : undefined, // Keep as is
        order: data.order !== undefined ? Number(data.order) : 0,
        createdAt: data.createdAt,
        createdBy: data.createdBy ? sanitizeString(data.createdBy) : undefined,
      } as BoardMember);
    });
    return members;
  } catch (error) {
    console.error("Error fetching board members from Firestore (Admin SDK):", error);
    return [];
  }
}

export async function getBoardMemberBySlug(slug: string): Promise<BoardMember | undefined> {
  if (!adminApp) {
    console.error("CRITICAL: Firebase Admin App not initialized in getBoardMemberBySlug. Returning undefined.");
    return undefined;
  }
  const firestoreDb = adminApp.firestore();
  const sanitizedSlug = sanitizeString(slug);
  try {
    const membersCollectionRef = firestoreDb.collection("boardMembers");
    // Query by 'slug' field. If 'slug' can be the document ID, you might query by ID.
    const q = membersCollectionRef.where("slug", "==", sanitizedSlug).limit(1);
    const querySnapshot = await q.get();

    if (querySnapshot.empty) {
      // Try fetching by document ID if slug matches ID pattern and no slug match found
      const docById = await membersCollectionRef.doc(sanitizedSlug).get();
      if (docById.exists) {
        const data = docById.data()!;
         return {
          id: docById.id,
          name: sanitizeString(data.name),
          role: sanitizeString(data.role),
          term: data.term ? sanitizeString(data.term) : undefined,
          email: sanitizeString(data.email),
          imageUrl: data.imageUrl ? sanitizeString(data.imageUrl) : PLACEHOLDER_IMAGE_SQUARE,
          slug: data.slug ? sanitizeString(data.slug) : docById.id,
          description: data.description ? data.description : undefined,
          order: data.order !== undefined ? Number(data.order) : 0,
          createdAt: data.createdAt,
          createdBy: data.createdBy ? sanitizeString(data.createdBy) : undefined,
        } as BoardMember;
      }
      console.log(`No board member found with slug or ID: ${sanitizedSlug}`);
      return undefined;
    }

    const docSnap = querySnapshot.docs[0];
    const data = docSnap.data();
    
    return {
      id: docSnap.id,
      name: sanitizeString(data.name),
      role: sanitizeString(data.role),
      term: data.term ? sanitizeString(data.term) : undefined,
      email: sanitizeString(data.email),
      imageUrl: data.imageUrl ? sanitizeString(data.imageUrl) : PLACEHOLDER_IMAGE_SQUARE,
      slug: data.slug ? sanitizeString(data.slug) : docSnap.id,
      description: data.description ? data.description : undefined,
      order: data.order !== undefined ? Number(data.order) : 0,
      createdAt: data.createdAt,
      createdBy: data.createdBy ? sanitizeString(data.createdBy) : undefined,
    } as BoardMember;
  } catch (error) {
    console.error(`Error fetching board member by slug/ID ${sanitizedSlug} from Firestore (Admin SDK):`, error);
    return undefined;
  }
}


// --- Pilots (from Firestore, using Admin SDK) ---
export async function getAllPilots(): Promise<Pilot[]> {
  if (!adminApp) {
    console.error("CRITICAL: Firebase Admin App not initialized in getAllPilots. Returning empty array.");
    return [];
  }
  const firestoreDb = adminApp.firestore();
  try {
    const pilotsCollectionRef = firestoreDb.collection("pilots");
    const q = pilotsCollectionRef.orderBy("name", "asc");
    const querySnapshot = await q.get();
    
    const pilots: Pilot[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      pilots.push({
        id: doc.id,
        name: sanitizeString(data.name),
        profileSlug: data.profileSlug ? sanitizeString(data.profileSlug) : undefined,
        imageUrl: data.imageUrl ? sanitizeString(data.imageUrl) : PLACEHOLDER_IMAGE_SQUARE,
        bio: data.bio, 
        achievements: Array.isArray(data.achievements) ? data.achievements.map(a => sanitizeString(a as string)) : [],
        createdAt: data.createdAt,
        createdBy: data.createdBy ? sanitizeString(data.createdBy) : undefined,
      } as Pilot);
    });
    return pilots;
  } catch (error) {
    console.error("Error fetching pilots from Firestore (Admin SDK):", error);
    return [];
  }
}

export async function getPilotBySlug(slug: string): Promise<Pilot | undefined> {
  if (!adminApp) {
    console.error("CRITICAL: Firebase Admin App not initialized in getPilotBySlug. Returning undefined.");
    return undefined;
  }
  const firestoreDb = adminApp.firestore();
  const sanitizedSlug = sanitizeString(slug);
  try {
    const pilotsCollectionRef = firestoreDb.collection("pilots");
    const q = pilotsCollectionRef.where("profileSlug", "==", sanitizedSlug).limit(1);
    const querySnapshot = await q.get();

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
      imageUrl: data.imageUrl ? sanitizeString(data.imageUrl) : PLACEHOLDER_IMAGE_SQUARE,
      bio: data.bio,
      achievements: Array.isArray(data.achievements) ? data.achievements.map(a => sanitizeString(a as string)) : [],
      createdAt: data.createdAt,
      createdBy: data.createdBy ? sanitizeString(data.createdBy) : undefined,
    } as Pilot;
  } catch (error) {
    console.error(`Error fetching pilot by slug ${sanitizedSlug} from Firestore (Admin SDK):`, error);
    return undefined;
  }
}

// --- FAQ Items (still from CSV for now) ---
// TODO: Migrate FAQ to Firestore and update this function
export async function getAllFaqItems(): Promise<FaqItem[]> {
  const filePath = path.join(process.cwd(), 'src/data/faq/faq.csv');
  const items = await parseCSV<any>(filePath);
  return items.map(item => ({
    id: sanitizeString(item.id),
    question: sanitizeString(item.question),
    answer: item.answer, // Keep as is
    category: sanitizeString(item.category),
    icon: sanitizeString(item.icon) || 'HelpCircle', 
    displayOrder: item.displayOrder ? parseInt(sanitizeString(item.displayOrder), 10) : undefined,
  }));
}

// --- Sponsors (from Firestore, using Admin SDK) ---
export async function getAllSponsors(): Promise<Sponsor[]> {
  if (!adminApp) {
    console.error("CRITICAL: Firebase Admin App not initialized in getAllSponsors. Returning empty array.");
    return [];
  }
  const firestoreDb = adminApp.firestore();
  try {
    const sponsorsCollectionRef = firestoreDb.collection("sponsors");
    const q = sponsorsCollectionRef.orderBy("displayOrder", "asc").orderBy("name", "asc");
    const querySnapshot = await q.get();
    
    const sponsors: Sponsor[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      sponsors.push({
        id: doc.id,
        name: sanitizeString(data.name),
        level: sanitizeString(data.level),
        logoUrl: data.logoUrl ? sanitizeString(data.logoUrl) : PLACEHOLDER_LOGO_SMALL,
        websiteUrl: data.websiteUrl ? sanitizeString(data.websiteUrl) : undefined,
        dataAiHint: data.dataAiHint ? sanitizeString(data.dataAiHint) : 'company logo',
        displayOrder: data.displayOrder !== undefined ? Number(data.displayOrder) : 0,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
        createdAt: data.createdAt,
        createdBy: data.createdBy ? sanitizeString(data.createdBy) : undefined,
      } as Sponsor);
    });
    return sponsors;
  } catch (error: any) {
    console.error("Error fetching sponsors from Firestore (Admin SDK):", error);
    if ((error as any).code === 9) { // FAILED_PRECONDITION for missing index
        console.error("Firestore query requires an index. Please create it in the Firebase console. Link:", (error as any).details);
    }
    return [];
  }
}

