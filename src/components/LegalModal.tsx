import { useLegal, useRestaurant } from '../config/ConfigProvider';
import '../styles/LegalModal.css';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'imprint' | 'privacy';
}

export const LegalModal = ({ isOpen, onClose, type }: LegalModalProps) => {
  const legal = useLegal();
  const restaurant = useRestaurant();

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const renderImprint = () => {
    if (!legal?.imprint) {
      return <p>Impressum nicht verfügbar.</p>;
    }

    const imp = legal.imprint;

    return (
      <div className="legal-content">
        <h3>Angaben gemäß § 5 TMG</h3>
        
        <p className="legal-company">{imp.companyName}</p>
        {imp.owner && <p>{imp.owner}</p>}
        <p>{imp.address}</p>
        <p>{imp.zipCity}</p>
        {imp.country && <p>{imp.country}</p>}

        <h4>Kontakt</h4>
        {imp.phone && <p>Telefon: {imp.phone}</p>}
        {imp.email && <p>E-Mail: {imp.email}</p>}

        {imp.taxId && (
          <>
            <h4>Umsatzsteuer-ID</h4>
            <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: {imp.taxId}</p>
          </>
        )}

        {imp.tradeRegister && (
          <>
            <h4>Handelsregister</h4>
            <p>{imp.tradeRegister}</p>
          </>
        )}

        {imp.responsibleContent && (
          <>
            <h4>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h4>
            <p>{imp.responsibleContent}</p>
            <p>{imp.address}</p>
            <p>{imp.zipCity}</p>
          </>
        )}

        <h4>Streitschlichtung</h4>
        <p>
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
          <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">
            https://ec.europa.eu/consumers/odr/
          </a>
        </p>
        <p>
          Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer 
          Verbraucherschlichtungsstelle teilzunehmen.
        </p>
      </div>
    );
  };

  const renderPrivacy = () => {
    const companyName = legal?.imprint?.companyName || restaurant?.name || 'das Restaurant';
    const lastUpdated = legal?.privacy?.lastUpdated || 'Unbekannt';

    return (
      <div className="legal-content">
        <p className="legal-updated">Stand: {lastUpdated}</p>

        <h3>1. Datenschutz auf einen Blick</h3>
        
        <h4>Allgemeine Hinweise</h4>
        <p>
          Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren 
          personenbezogenen Daten passiert, wenn Sie diese Speisekarten-Website besuchen.
        </p>

        <h4>Datenerfassung auf dieser Website</h4>
        <p>
          <strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong><br />
          Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber: {companyName}.
        </p>

        <h3>2. Welche Daten werden erfasst?</h3>
        
        <h4>Cookies</h4>
        <p>
          Diese Website verwendet <strong>keine Cookies</strong>. Es werden keine 
          Tracking-Cookies, Analyse-Cookies oder Werbe-Cookies eingesetzt.
        </p>

        <h4>Lokale Speicherung (LocalStorage)</h4>
        <p>
          Diese Website speichert Ihren Warenkorb lokal in Ihrem Browser (LocalStorage). 
          Diese Daten werden <strong>nicht</strong> an uns übertragen und verbleiben 
          ausschließlich auf Ihrem Gerät. Sie können diese Daten jederzeit durch Löschen 
          Ihrer Browser-Daten entfernen.
        </p>

        <h4>Server-Log-Dateien</h4>
        <p>
          Der Provider der Seiten erhebt und speichert automatisch Informationen in 
          sogenannten Server-Log-Dateien, die Ihr Browser automatisch übermittelt. Dies sind:
        </p>
        <ul>
          <li>Browsertyp und Browserversion</li>
          <li>verwendetes Betriebssystem</li>
          <li>Referrer URL</li>
          <li>Hostname des zugreifenden Rechners</li>
          <li>Uhrzeit der Serveranfrage</li>
          <li>IP-Adresse</li>
        </ul>
        <p>
          Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen.
        </p>

        <h3>3. Externe Dienste</h3>
        
        <h4>WhatsApp-Bestellung</h4>
        <p>
          Wenn Sie die optionale WhatsApp-Bestellfunktion nutzen, werden Sie zu WhatsApp 
          weitergeleitet. Die Datenverarbeitung erfolgt dann gemäß der Datenschutzrichtlinie 
          von WhatsApp/Meta. Wir haben keinen Einfluss auf die dortige Datenverarbeitung.
        </p>

        <h4>Google Maps</h4>
        <p>
          Wenn Sie die "Route planen"-Funktion nutzen, werden Sie zu Google Maps 
          weitergeleitet. Die Datenverarbeitung erfolgt dann gemäß der Datenschutzrichtlinie 
          von Google.
        </p>

        <h3>4. Ihre Rechte</h3>
        <p>
          Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger 
          und Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben 
          außerdem ein Recht, die Berichtigung oder Löschung dieser Daten zu verlangen.
        </p>

        {legal?.privacy?.customSections?.map((section, index) => (
          <div key={index}>
            <h3>{section.title}</h3>
            <p>{section.content}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="legal-backdrop" onClick={handleBackdropClick}>
      <div className="legal-modal">
        <div className="legal-header">
          <h2>{type === 'imprint' ? 'Impressum' : 'Datenschutzerklärung'}</h2>
          <button className="legal-close" onClick={onClose}>×</button>
        </div>
        <div className="legal-body">
          {type === 'imprint' ? renderImprint() : renderPrivacy()}
        </div>
      </div>
    </div>
  );
};

