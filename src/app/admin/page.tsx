
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Users, Newspaper, Shield, Image as ImageIcon, Car } from 'lucide-react';

export default function AdminDashboardPage() {
  const managementSections = [
    { title: 'News Verwalten', icon: Newspaper, href: '/admin/news', description: 'Artikel erstellen, bearbeiten und löschen.' },
    { title: 'Vorstand Verwalten', icon: Users, href: '/admin/vorstand', description: 'Vorstandsmitglieder und Rollen pflegen.' },
    { title: 'Piloten Verwalten', icon: Car, href: '/admin/piloten', description: 'Fahrerprofile und Erfolge aktualisieren.' },
    { title: 'Sponsoren Verwalten', icon: Shield, href: '/admin/sponsoren', description: 'Sponsorenlogos und -informationen verwalten.' },
    { title: 'Bildergalerie Verwalten', icon: ImageIcon, href: '/admin/galerie', description: 'Bilder hochladen und organisieren.' },
  ];

  return (
    <div className="space-y-8">
      <PageHeader title="Admin Dashboard" subtitle="Willkommen im Verwaltungsbereich des AC Warendorf." />

      <Card>
        <CardHeader>
          <CardTitle>Übersicht</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Hier können Sie die Inhalte der Webseite verwalten. Wählen Sie einen Bereich zur Bearbeitung aus.
            Die Bearbeitungsfunktionen in diesem Panel sind in Entwicklung. Aktuell werden die Daten über CSV-Dateien im Projekt verwaltet.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {managementSections.map((section) => (
          <Card key={section.title} className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium font-headline">{section.title}</CardTitle>
              <section.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">{section.description}</p>
              <Button variant="outline" className="w-full" asChild>
                <Link href={section.href}>Verwalten</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
