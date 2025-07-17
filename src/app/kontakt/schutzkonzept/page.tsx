
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { ShieldAlert, UserCheck, MessageSquare, Info } from 'lucide-react';
import Link from 'next/link';
import { SchutzkonzeptContactForm } from '@/components/schutzkonzept-contact-form';

export default function SchutzkonzeptPage() {
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader title="Schutzkonzept des AC Warendorf" subtitle="Zum Schutz unserer Mitglieder – Gemeinsam für ein sicheres Vereinsleben, insbesondere für unsere Jugendgruppe." />
      
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-8">
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-start space-x-4">
              <ShieldAlert className="h-10 w-10 text-primary-foreground-alt mt-1 flex-shrink-0" />
              <div>
                <CardTitle className="text-2xl font-headline">Unser Engagement für ein sicheres Umfeld</CardTitle>
                <p className="text-muted-foreground">Prävention, Intervention und Aufarbeitung</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground">
              <p>
                Der Automobilclub Warendorf e.V. im ADAC (AC Warendorf) bekennt sich ausdrücklich zu seiner Verantwortung, ein sicheres, respektvolles und unterstützendes Umfeld für alle Mitglieder, insbesondere für Kinder und Jugendliche, zu gewährleisten. Unser Schutzkonzept dient dazu, präventive Maßnahmen zu etablieren, klare Handlungsrichtlinien im Falle von Grenzüberschreitungen, Diskriminierung oder (sexualisierter) Gewalt zu definieren und eine Kultur des Hinsehens und der Verantwortungsübernahme zu fördern.
              </p>
            </CardContent>
          </Card>
           <Card className="shadow-lg">
             <CardHeader><CardTitle className="text-xl font-headline">Ziele & Bausteine</CardTitle></CardHeader>
             <CardContent>
                <h3 className="text-lg font-semibold font-headline text-primary-foreground-alt">Ziele unseres Schutzkonzepts:</h3>
                <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
                    <li><strong>Prävention:</strong> Verhinderung von jeglicher Form von Gewalt, Mobbing und Diskriminierung.</li>
                    <li><strong>Sensibilisierung:</strong> Aufklärung und Schulung aller Beteiligten (Mitglieder, Trainer, Eltern, Vorstand) für das Thema Kindeswohl und grenzachtenden Umgang.</li>
                    <li><strong>Intervention:</strong> Schaffung klarer Anlaufstellen und transparenter Verfahrensweisen bei Verdachtsfällen oder Vorfällen.</li>
                    <li><strong>Stärkung:</strong> Förderung von Selbstbewusstsein und Partizipation, insbesondere bei Kindern und Jugendlichen.</li>
                    <li><strong>Kultur:</strong> Etablierung einer offenen und vertrauensvollen Vereinskultur, in der Probleme angesprochen werden können.</li>
                </ul>
                <h3 className="text-lg font-semibold font-headline text-primary-foreground-alt pt-4 mt-4 border-t">Wichtige Bausteine (Auszug):</h3>
                <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
                    <li>Benennung von Vertrauenspersonen / Ansprechpartnern für Kinderschutz.</li>
                    <li>Verpflichtung zur Vorlage erweiterter Führungszeugnisse für bestimmte Funktionsträger.</li>
                    <li>Verhaltenskodex für alle im Verein Tätigen.</li>
                    <li>Regelmäßige Information und Schulung.</li>
                    <li>Notfallplan und Interventionsleitfaden.</li>
                </ul>
                <p className="pt-4 text-sm text-muted-foreground">
                    Das vollständige Schutzkonzept des AC Warendorf ist in Ausarbeitung und wird nach Verabschiedung durch die Mitgliederversammlung hier und im Vereinsheim zur Einsicht bereitgestellt. 
                </p>
             </CardContent>
           </Card>
        </div>

        <div className="space-y-8 lg:sticky lg:top-24">
            <SchutzkonzeptContactForm />
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl font-headline flex items-center"><UserCheck className="mr-2 h-6 w-6 text-primary-foreground-alt"/> An wen wende ich mich?</CardTitle>
                </CardHeader>
                 <CardContent className="space-y-3 text-foreground">
                    <p>
                        Ihre erste Ansprechpartnerin bei Fragen, Anliegen oder Verdachtsfällen im Kontext des Schutzkonzepts ist unsere Schutzbeauftragte, <strong>Lorraine Schürhörster</strong>.
                    </p>
                    <p className="text-sm text-muted-foreground pt-2">
                        Nutzen Sie das vertrauliche Kontaktformular auf dieser Seite, um sie direkt zu erreichen. Alternativ können Sie sich auch jederzeit an den <Link href="/vorstand" className="text-primary-foreground-alt hover:underline">Vorstand des AC Warendorf</Link> wenden.
                    </p>
                </CardContent>
            </Card>
        </div>
      </div>

       <p className="text-sm text-center text-muted-foreground pt-8">
        Stand: {currentDate || 'Lädt...'}
      </p>
    </div>
  );
}
