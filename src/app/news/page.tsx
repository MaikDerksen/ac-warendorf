import { PageHeader } from '@/components/page-header';
import { NewsCard } from '@/components/news-card';
import { mockNewsArticles } from '@/lib/mock-data';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from 'lucide-react';

// This is a client component to allow for future filtering/searching
// For now, it just displays all mock articles
// 'use client';
// import { useState } from 'react';

export default function NewsArchivPage() {
  // const [searchTerm, setSearchTerm] = useState('');
  // const [selectedCategory, setSelectedCategory] = useState('');

  // const filteredArticles = mockNewsArticles.filter(article => {
  //   const matchesSearchTerm = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //                             article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
  //   const matchesCategory = selectedCategory ? article.categories.includes(selectedCategory) : true;
  //   return matchesSearchTerm && matchesCategory;
  // });
  
  // const allCategories = Array.from(new Set(mockNewsArticles.flatMap(article => article.categories)));

  return (
    <div className="space-y-8">
      <PageHeader 
        title="News & Artikel Archiv" 
        subtitle="Alle Nachrichten und Berichte des AC Warendorf auf einen Blick."
      />
      
      {/* TODO: Search and Filter Section - Placeholder for now */}
      {/* 
      <div className="mb-8 p-4 bg-card rounded-lg shadow">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Input 
              type="text"
              placeholder="Artikel suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
              icon={<Search className="h-4 w-4 text-muted-foreground" />}
            />
          </div>
          <div>
            <Select onValueChange={setSelectedCategory} value={selectedCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Kategorie wählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Alle Kategorien</SelectItem>
                {allCategories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      */}

      {mockNewsArticles.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockNewsArticles.map((article) => (
            <NewsCard key={article.slug} article={article} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-10">
          Keine Nachrichtenartikel gefunden.
        </p>
      )}
    </div>
  );
}
