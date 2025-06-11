
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import type { NewsArticle, BoardMember, Pilot, FaqItem, Sponsor } from '@/types';

const dataDirectory = path.join(process.cwd(), 'src/data');

function parseCSV<T>(filePath: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    Papa.parse<T>(fileContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: (field: string | number), : boolean | string => {
        // Add fields here that you want to be dynamically typed (e.g. booleans)
        // For now, we'll handle type conversion manually after parsing for more control.
        return false; 
      },
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

export async function getAllNewsArticles(): Promise<NewsArticle[]> {
  const filePath = path.join(dataDirectory, 'news/news.csv');
  const articles = await parseCSV<any>(filePath);
  return articles.map(article => ({
    ...article,
    categories: article.categories ? (article.categories as string).split('|') : [],
    // Ensure other fields are correctly typed if necessary, e.g., date strings
  })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getNewsArticleBySlug(slug: string): Promise<NewsArticle | undefined> {
  const articles = await getAllNewsArticles();
  return articles.find(article => article.slug === slug);
}

export async function getAllBoardMembers(): Promise<BoardMember[]> {
  const filePath = path.join(dataDirectory, 'vorstand/board-members.csv');
  const members = await parseCSV<any>(filePath);
   return members.map(member => ({
    ...member,
    // Add any specific type conversions if needed
  }));
}

export async function getBoardMemberBySlug(slug: string): Promise<BoardMember | undefined> {
  const members = await getAllBoardMembers();
  return members.find(member => member.slug === slug);
}

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

export async function getAllFaqItems(): Promise<FaqItem[]> {
  const filePath = path.join(dataDirectory, 'faq/faq.csv');
  return parseCSV<FaqItem>(filePath);
}

export async function getAllSponsors(): Promise<Sponsor[]> {
  const filePath = path.join(dataDirectory, 'sponsoren/sponsors.csv');
  return parseCSV<Sponsor>(filePath);
}
