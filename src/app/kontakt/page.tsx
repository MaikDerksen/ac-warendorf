
import { PageHeader } from '@/components/page-header';
import { ContactForm } from '@/components/contact-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MapPin } from 'lucide-react';
import { getAllBoardMembers } from '@/lib/data-loader';

export default async function KontaktPage() {
  const boardMembers = await getAllBoardMembers();
  const chairman = boardMembers.find(m => m.role === "1. Vorsitzender");

  return (
    <div className="space-y-12">
      <PageHeader title="Kontakt aufnehmen" subtitle="Wir freuen uns auf Ihre Nachricht!" />
      
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <ContactForm />

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary">Alternative Kontaktmöglichkeiten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {chairman && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">1. Vorsitzender</h3>
                <p className="text-muted-foreground">{chairman.name}</p>
                <a href={`mailto:${chairman.email.replace('[at]', '@')}`} className="text-primary hover:underline flex items-center mt-1">
                  <Mail className="h-4 w-4 mr-2" />
                  {chairman.email.replace('[at]', '@')}
                </a>
              </div>
            )}
            
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Postanschrift</h3>
              <p className="text-muted-foreground flex items-start">
                <MapPin className="h-5 w-5 mr-2 mt-1 flex-shrink-0 text-primary" />
                <span>
                  Automobilclub Warendorf e.V. im ADAC<br />
                  Musterstraße 1<br />
                  48231 Warendorf
                </span>
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Telefon (Beispiel)</h3>
              <p className="text-muted-foreground flex items-center">
                <Phone className="h-4 w-4 mr-2 text-primary" />
                <span>+49 123 4567890 (Vorstand, falls angegeben)</span>
              </p>
            </div>
            
            <p className="text-sm text-muted-foreground pt-4 border-t">
              Bitte beachten Sie unsere <a href="/datenschutz" className="text-primary hover:underline">Datenschutzerklärung</a> bei der Übermittlung Ihrer Daten.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
