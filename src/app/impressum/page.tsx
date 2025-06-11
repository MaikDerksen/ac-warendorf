
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllBoardMembers } from '@/lib/data-loader';

export default async function ImpressumPage() {
  const boardMembers = await getAllBoardMembers();
  const webmaster = boardMembers.find(member => member.role.toLowerCase() === 'programmierer'); // Assuming 'Programmierer' is webmaster
  const chairman = boardMembers.find(member => member.role.toLowerCase() === '1. vorsitzender');
  
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <PageHeader title="Impressum" />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline">Angaben gemäß § 5 TMG</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-foreground">
          <p>
            <strong>Automobilclub Warendorf e. V. im ADAC</strong><br />
            Musterstraße 1<br />
            48231 Warendorf
          </p>

          <div>
            <h3 className="font-semibold">Vertreten durch:</h3>
            <p>{chairman ? chairman.name : 'Vorname Nachname'} ({chairman ? chairman.role : '1. Vorsitzender'})</p>
          </div>

          <div>
            <h3 className="font-semibold">Kontakt:</h3>
            <p>
              Telefon: +49 (0) 1234 567890 (Beispiel)<br />
              Fax: +49 (0) 1234 567891 (Beispiel, falls vorhanden)<br />
              E-Mail: {chairman ? chairman.email.replace('[at]', '@') : 'info[at]automobilclub-warendorf.de'}
            </p>
          </div>

          <div>
            <h3 className="font-semibold">Registereintrag:</h3>
            <p>
              Eintragung im Vereinsregister.<br />
              Registergericht: Amtsgericht Musterstadt<br />
              Registernummer: VR 12345 (Beispiel)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-foreground">
          <p>
            {chairman ? chairman.name : 'Vorname Nachname'}<br />
            Musterstraße 1<br />
            48231 Warendorf
          </p>
        </CardContent>
      </Card>
      
      {webmaster && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-headline">Webverantwortlicher (Webmaster):</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground">
            <p>
              {webmaster.name}<br />
              E-Mail: {webmaster.email.replace('[at]', '@')}
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline">Haftungsausschluss (Disclaimer)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            <strong>Haftung für Inhalte</strong><br />
            Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
          </p>
          <p>
            <strong>Haftung für Links</strong><br />
            Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.
          </p>
          <p>
            <strong>Urheberrecht</strong><br />
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet. Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
