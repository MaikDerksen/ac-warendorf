
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function ImpressumPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <PageHeader title="Impressum" />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline">Informationsanbieter (verantwortlich für den Inhalt)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-foreground">
          <p>
            <strong>Automobilclub-Warendorf und Umgebung e. v. im ADAC</strong><br />
            Christian Peitz<br />
            Zurstraßenweg 27<br />
            48231 Warendorf
          </p>
          <div>
            <h3 className="font-semibold">Kontakt:</h3>
            <p>
              Tel: 0 25 81 / 78 96 79 1<br />
              E-Mail: vorstand1@automobilclub-warendorf.de
            </p>
          </div>
          <div>
             <h3 className="font-semibold">Finanzamt:</h3>
             <p>Warendorf mit Steuernummer:</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-headline">Kommentare und Anregungen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground">
            <p>
              Kommentare und Anregungen zur Webseite bitte an » <a href="mailto:webmaster@automobilclub-warendorf.de" className="text-primary-foreground-alt hover:underline">webmaster@automobilclub-warendorf.de</a>
            </p>
          </CardContent>
        </Card>

       <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline">Disclaimer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links. Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.</p>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline">Gesetzliche Verpflichtungen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>Die hier gegebenen Informationen erfolgten zur Erfüllung nachfolgend genannter gesetzlicher Verpflichtungen:</p>
            <ul className="list-disc list-inside ml-4">
                <li>§ 5 und § 6 Telemediengesetz (TMG)</li>
                <li>§ 4 Abs. 3 Bundesdatenschutzgesetz (BDSG)</li>
                <li>§ 312c Bürgerliches Gesetzbuch (BGB)</li>
                <li>§ 1 BGB-Informationspflichten-Verordnung (BGB-InfoV)</li>
            </ul>
        </CardContent>
      </Card>

       <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline">© Copyright</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>Struktur und Inhalt dieses Internetauftrittes sind urheberrechtlich geschützt.</p>
            <p>Die Vervielfältigung von Informationen oder Daten, insbesondere die Verwendung von Bildern, Texten oder Textteilen bedarf der Zustimmung. Auf vorherige schriftliche Anfrage an den Internetbeauftragten ist die Verwendung bei Nennung der Quelle möglich.</p>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline">Keine Abmahnung ohne Kontakt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            Im Falle der Geltendmachung von Ansprüchen jeglicher Art aus urheberrechtlichen, wettbewerbsrechtlichen, datenschutzrechtlichen sowie markenrechtlichen Angelegenheiten bitten wir, zur Vermeidung unnötiger Rechtsstreitigkeiten, Abmahnungen und Kosten, uns umgehend zu kontaktieren. Falls Ansprüche der oben genannten Art reklamiert werden, sagen wir bereits hier vor einer endgültigen rechtsverbindlichen Klärung Abhilfe zu, durch die eine eventuelle Wiederholungsgefahr verbindlich ausgeschlossen ist. Eine dennoch ergehende Kostennote einer anwaltlichen Abmahnung ohne vorhergehende Kontaktaufnahme würde sodann wegen Nichtbeachtung einer Schadensminderungspflicht zurückgewiesen. Bei in diesem Sinne unnötigen bzw. unberechtigten Abmahnungen und Folgemaßnahmen würde mit einer negativen Feststellungsklage beantwortet.
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline">Haftungsausschluss (Disclaimer)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <h3 className="font-semibold text-foreground">Haftung für Inhalte</h3>
          <p>
            Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
          </p>
          <h3 className="font-semibold text-foreground mt-4">Haftung für Links</h3>
          <p>
            Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.
          </p>
          <h3 className="font-semibold text-foreground mt-4">Urheberrecht</h3>
          <p>
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet. Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Die Autoren sind bestrebt, in allen Publikationen die Urheberrechte der verwendeten Bilder, Grafiken, Tondokumente, Videosequenzen und Texte zu beachten, von ihm selbst erstellte Bilder, Grafiken, Tondokumente, Videosequenzen und Texte zu nutzen oder auf lizenzfreie Grafiken, Tondokumente, Videosequenzen und Texte zurückzugreifen. Alle innerhalb des Internetangebotes genannten und ggf. durch Dritte geschützten Marken- und Warenzeichen unterliegen uneingeschränkt den Bestimmungen des jeweils gültigen Kennzeichenrechts und den Besitzrechten der jeweiligen eingetragenen Eigentümer. Allein aufgrund der bloßen Nennung ist nicht der Schluss zu ziehen, dass Markenzeichen nicht durch Rechte Dritter geschützt sind!
          </p>
          <p>
            Das Copyright für veröffentlichte, vom Autor selbst erstellte Objekte bleibt allein beim Autor der Seiten. Eine Vervielfältigung oder Verwendung solcher Grafiken, Tondokumente, Videosequenzen und Texte in anderen elektronischen oder gedruckten Publikationen ist ohne ausdrückliche Zustimmung des Autors nicht gestattet.
          </p>
          <p>
            Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
          </p>
        </CardContent>
      </Card>

       <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline">Hinweise</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
             <p>
                Einige Dokumente sind im pdf-Format hinterlegt. Um diese lesen zu können, ist ein Programm erforderlich, dass diese Dateien anzeigen kann. Ein bekanntes Programm ist der Acrobat Reader©. Diesen kannst du auf der Seite <a href="http://get.adobe.com/de/reader/" target="_blank" rel="noopener noreferrer" className="text-primary-foreground-alt hover:underline">http://get.adobe.com/de/reader/</a> herunterladen.
            </p>
            <div>
                <h3 className="font-semibold text-foreground">Bildnachweis</h3>
                <p>
                    © vegefox.com<br />
                    © 977_rex_977<br />
                    © Nomad_Soul<br />
                    © Raimondas<br />
                    © jamesteohart
                </p>
            </div>
             <p className="pt-4">
                <strong>Automobilclub Warendorf</strong>
            </p>
        </CardContent>
      </Card>
    </div>
  );
}

