
'use server';

import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import type { NewsArticle, BoardMember, Pilot, FaqItem, Sponsor, SiteSettings, AktivitaetenPageContent, MitgliedWerdenPageContent, KontaktPageContent } from '@/types';
import { adminApp } from '@/lib/firebaseAdminConfig'; 
import { FieldValue } from 'firebase-admin/firestore';

// --- Constants for Placeholders ---
const PLACEHOLDER_IMAGE_LARGE = "https://placehold.co/1200x675.png";
const PLACEHOLDER_IMAGE_MEDIUM = "https://placehold.co/600x400.png";
const PLACEHOLDER_IMAGE_SQUARE = "https://placehold.co/400x400.png";
const PLACEHOLDER_LOGO_SMALL = "https://placehold.co/80x80.png";
const PLACEHOLDER_IMAGE_AKTIVITAETEN = "https://placehold.co/600x400.png"; // Default for Aktivitaeten main image
const PLACEHOLDER_IMAGE_MITGLIED_WERDEN = "https://placehold.co/400x250.png"; // Default for Mitglied werden sidebar image


// Helper function to sanitize strings
function sanitizeString(str: string | undefined | null): string {
  if (typeof str === 'string') {
    return str.replace(/^["']|["']$/g, '').trim();
  }
  return str || ''; 
}

// --- Site Settings (Images Only, contacts are dynamic) ---
export async function getSiteSettings(): Promise<SiteSettings> {
  const defaultSettings: SiteSettings = {
    logoUrl: PLACEHOLDER_LOGO_SMALL, 
    homepageHeroImageUrl: PLACEHOLDER_IMAGE_LARGE,
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
    // Primary sort by 'order' (user-defined for importance), then by 'name'
    const q = membersCollectionRef.orderBy("order", "asc").orderBy("name", "asc");
    const querySnapshot = await q.get();
    
    const members: BoardMember[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      members.push({
        id: doc.id, 
        name: sanitizeString(data.name),
        role: sanitizeString(data.role),
        term: data.term ? sanitizeString(data.term) : undefined,
        email: sanitizeString(data.email), 
        imageUrl: data.imageUrl ? sanitizeString(data.imageUrl) : PLACEHOLDER_IMAGE_SQUARE,
        slug: data.slug ? sanitizeString(data.slug) : doc.id, 
        description: data.description ? data.description : undefined,
        order: data.order !== undefined ? Number(data.order) : 99, // Default high order if not set
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
    const q = membersCollectionRef.where("slug", "==", sanitizedSlug).limit(1);
    const querySnapshot = await q.get();

    if (querySnapshot.empty) {
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
          order: data.order !== undefined ? Number(data.order) : 99,
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
      order: data.order !== undefined ? Number(data.order) : 99,
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

// --- FAQ Items (from Firestore) ---
export async function getAllFaqItems(): Promise<FaqItem[]> {
  if (!adminApp) {
    console.error("CRITICAL: Firebase Admin App not initialized in getAllFaqItems. Returning empty array.");
    return [];
  }
  const firestoreDb = adminApp.firestore();
  try {
    const docRef = firestoreDb.collection("siteContent").doc("mitgliedWerden");
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      const data = docSnap.data();
      if (Array.isArray(data?.faqItems)) {
        return data.faqItems.map((item: any) => ({
          id: sanitizeString(item.id) || Math.random().toString(36).substring(7), // Fallback ID
          question: sanitizeString(item.question),
          answer: item.answer, // Keep as is
          category: item.category ? sanitizeString(item.category) : undefined,
          icon: sanitizeString(item.icon) || 'HelpCircle',
          displayOrder: item.displayOrder !== undefined ? Number(item.displayOrder) : 0,
        })).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      }
    }
    console.log("No FAQ items found in siteContent/mitgliedWerden or document doesn't exist.");
    return [];
  } catch (error) {
    console.error("Error fetching FAQ items from Firestore:", error);
    return [];
  }
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
    if ((error as any).code === 9) { 
        console.error("Firestore query requires an index. Please create it in the Firebase console. Link:", (error as any).details);
    }
    return [];
  }
}

// --- Aktivitaeten Page Content ---
export async function getAktivitaetenPageContent(): Promise<AktivitaetenPageContent> {
  const defaults: AktivitaetenPageContent = {
    mainImageUrl: PLACEHOLDER_IMAGE_AKTIVITAETEN,
    kartSlalomSectionTitle: "Kart-Slalom: Unsere Hauptaktivität",
    kartSlalomIntroParagraph: "Zur Zeit konzentriert sich der AC Warendorf e.V. auf den <strong>Kart-Slalom</strong>. Diese spannende und anspruchsvolle Disziplin ist der perfekte Einstieg in den Motorsport für Kinder und Jugendliche.",
    kartSlalomDetailParagraph1: "Im Kart-Slalom geht es darum, einen mit Pylonen abgesteckten Parcours möglichst schnell und fehlerfrei zu durchfahren. Dabei werden wichtige Fähigkeiten wie Fahrzeugbeherrschung, Konzentration und Reaktionsschnelligkeit trainiert.",
    kartSlalomDetailParagraph2: "Unsere jungen Talente nehmen regelmäßig an regionalen und überregionalen Wettbewerben teil und haben dabei schon beachtliche Erfolge erzielt.",
    youtubeEmbedId: "RCK5CPkfXbY",
    youtubeSectionTitle: "Kart-Slalom in Aktion",
    youtubeSectionText: "Sehen Sie hier ein Beispielvideo, um einen Eindruck vom Kart-Slalom zu bekommen.",
    futurePossibilitiesTitle: "Zukünftige Möglichkeiten",
    futurePossibilitiesIntro: "Wenn ausreichend Interesse besteht, könnten zukünftig auch andere Motorsportarten im AC Warendorf angeboten werden. Denkbar wären beispielsweise:",
    futurePossibilitiesItems: [
      "<strong>SimRacing:</strong> Virtueller Motorsport an professionellen Simulatoren.",
      "<strong>Youngster Slalom Cup:</strong> Der nächste Schritt nach dem Kart-Slalom, mit Serienfahrzeugen auf abgesperrten Strecken.",
      "<strong>Oldtimer-Ausfahrten oder -Treffen:</strong> Für Liebhaber klassischer Fahrzeuge."
    ]
  };

  if (!adminApp) {
    console.error("CRITICAL: Firebase Admin App not initialized in getAktivitaetenPageContent. Returning defaults.");
    return defaults;
  }
  const firestoreDb = adminApp.firestore();
  try {
    const docRef = firestoreDb.collection("siteContent").doc("aktivitaeten");
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      const data = docSnap.data() as Partial<AktivitaetenPageContent>;
      return { ...defaults, ...data };
    }
    return defaults;
  } catch (error) {
    console.error("Error fetching Aktivitaeten page content:", error);
    return defaults;
  }
}

// --- MitgliedWerden Page Content ---
export async function getMitgliedWerdenPageContent(): Promise<MitgliedWerdenPageContent> {
  const defaults: MitgliedWerdenPageContent = {
    imageUrl: PLACEHOLDER_IMAGE_MITGLIED_WERDEN,
    faqItems: [], // Will be populated by getAllFaqItems if needed, or fetched directly
    pageTitle: "Mitglied werden im Kart-Slalom Team",
    pageSubtitle: "Alle wichtigen Informationen für den Einstieg",
    whatIsKartSlalomTitle: "Was ist Kartslalom?",
    whatIsKartSlalomText: "\"Kartslalom ist die Breitensportvariante des Kartsports. Es wird auf großen Parkplätzen, Industrieflächen oder ähnlichen befestigten ebenen Flächen ausgetragen. Die Strecke wird hierbei mit Pylonen markiert. Ziel ist es, die Strecke möglichst schnell und fehlerfrei zu absolvieren. Für das Umwerfen oder Verschieben von Pylonen aus ihrer Markierung gibt es Strafsekunden, welche zur Fahrzeit addiert werden.\"",
    wikipediaLinkText: "Wikipedia - Kartslalom", // Added default
    wikipediaLinkUrl: "https://de.wikipedia.org/wiki/Kartslalom", // Added default
    sidebarTitle: "Interesse geweckt?",
    sidebarText: "Kart-Slalom ist ein faszinierender und sicherer Einstieg in die Welt des Motorsports. Es fördert Konzentration, Geschicklichkeit und Teamgeist.",
    sidebarButtonText: "Jetzt Kontakt aufnehmen!", // Added default
    sidebarButtonLink: "/kontakt" // Added default
  };

  if (!adminApp) {
    console.error("CRITICAL: Firebase Admin App not initialized in getMitgliedWerdenPageContent. Returning defaults.");
    return { ...defaults, faqItems: await getAllFaqItems() }; // try to get FAQs even if main content fails
  }
  const firestoreDb = adminApp.firestore();
  try {
    const docRef = firestoreDb.collection("siteContent").doc("mitgliedWerden");
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      const data = docSnap.data() as Partial<MitgliedWerdenPageContent>;
      const fetchedFaqs = Array.isArray(data.faqItems) ? data.faqItems.map((item: any) => ({
          id: sanitizeString(item.id) || Math.random().toString(36).substring(7),
          question: sanitizeString(item.question),
          answer: item.answer,
          category: item.category ? sanitizeString(item.category) : undefined,
          icon: sanitizeString(item.icon) || 'HelpCircle',
          displayOrder: item.displayOrder !== undefined ? Number(item.displayOrder) : 0,
        })).sort((a,b) => (a.displayOrder || 0) - (b.displayOrder || 0)) 
        : await getAllFaqItems(); // Fallback to separate fetch if not in doc

      return { ...defaults, ...data, faqItems: fetchedFaqs };
    }
    return { ...defaults, faqItems: await getAllFaqItems() }; // fetch FAQs if doc doesn't exist
  } catch (error) {
    console.error("Error fetching MitgliedWerden page content:", error);
    return { ...defaults, faqItems: await getAllFaqItems() };
  }
}

// --- Kontakt Page Content ---
export async function getKontaktPageContent(): Promise<KontaktPageContent> {
  const defaults: KontaktPageContent = {
    pageTitle: "Kontakt aufnehmen",
    pageSubtitle: "Wir freuen uns auf Ihre Nachricht!",
    formTitle: "Schreiben Sie uns eine Nachricht",
    alternativeContactTitle: "Alternative Kontaktmöglichkeiten",
    addressStreet: "Musterstraße 1",
    addressCity: "48231 Warendorf",
    examplePhoneNumber: "+49 123 4567890 (Vorstand, falls angegeben)",
    dataPrivacyNoteHtml: "Bitte beachten Sie unsere <a href=\"/datenschutz\" class=\"text-primary hover:underline\">Datenschutzerklärung</a> bei der Übermittlung Ihrer Daten."
  };

  if (!adminApp) {
    console.error("CRITICAL: Firebase Admin App not initialized in getKontaktPageContent. Returning defaults.");
    return defaults;
  }
  const firestoreDb = adminApp.firestore();
  try {
    const docRef = firestoreDb.collection("siteContent").doc("kontaktPage");
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      const data = docSnap.data() as Partial<KontaktPageContent>;
      return { ...defaults, ...data };
    }
    return defaults;
  } catch (error) {
    console.error("Error fetching Kontakt page content:", error);
    return defaults;
  }
}

    