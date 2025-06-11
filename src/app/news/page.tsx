
import { PageHeader } from '@/components/page-header';
import { NewsCard } from '@/components/news-card';
import { getAllNewsArticles } from '@/lib/data-loader'; // Now fetches from Firestore


export default async function NewsArchivPage() {
  const allArticles = await getAllNewsArticles(); // Now fetches from Firestore
  
  return (
    <div className="space-y-8">
      <PageHeader 
        title="News & Artikel Archiv" 
        subtitle="Alle Nachrichten und Berichte des AC Warendorf auf einen Blick."
      />
      
      {allArticles.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allArticles.map((article) => (
            <NewsCard key={article.id} article={article} /> // Use Firestore id as key
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-10">
          Momentan sind keine Nachrichtenartikel in Firestore vorhanden oder es gab ein Problem beim Laden.
        </p>
      )}
    </div>
  );
}
