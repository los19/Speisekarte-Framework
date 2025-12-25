import { useState } from 'react';
import type { ContactSection as ContactSectionConfig, RestaurantInfo } from '../../types/menu';
import '../../styles/sections/ContactSection.css';

interface ContactSectionProps {
  config: ContactSectionConfig;
  restaurant: RestaurantInfo | null;
}

export function ContactSection({ config, restaurant }: ContactSectionProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!config.formEndpoint) {
      console.warn('No form endpoint configured');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch(config.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCall = () => {
    if (restaurant?.phone) {
      window.location.href = `tel:${restaurant.phone.replace(/\s/g, '')}`;
    }
  };

  const handleEmail = () => {
    const email = config.email || restaurant?.email || 'info@restaurant.de';
    window.location.href = `mailto:${email}`;
  };

  const showForm = config.showForm && config.formEndpoint;
  const email = config.email || restaurant?.email || 'info@restaurant.de';

  return (
    <div className="contact-section">
      <div className="contact-container">
        <h2 className="contact-title">{config.title || 'Kontakt'}</h2>

        <div className={`contact-content ${!showForm ? 'no-form' : ''}`}>
          {/* Contact Info */}
          <div className="contact-info">
            {config.showAddress !== false && restaurant?.address && (
              <div className="contact-info-item">
                <span className="contact-icon">📍</span>
                <strong>Adresse</strong>
                <p>{restaurant.address}</p>
              </div>
            )}
            
            {config.showPhone !== false && restaurant?.phone && (
              <div className="contact-info-item clickable" onClick={handleCall}>
                <span className="contact-icon">📞</span>
                <strong>Telefon</strong>
                <p>{restaurant.phone}</p>
              </div>
            )}
            
            {config.showEmail !== false && (
              <div className="contact-info-item clickable" onClick={handleEmail}>
                <span className="contact-icon">✉️</span>
                <strong>E-Mail</strong>
                <p>{email}</p>
              </div>
            )}
          </div>

          {/* Contact Form */}
          {showForm && (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="contact-name">Name *</label>
                <input
                  type="text"
                  id="contact-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="contact-email">E-Mail *</label>
                <input
                  type="email"
                  id="contact-email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="contact-phone">Telefon</label>
                <input
                  type="tel"
                  id="contact-phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="contact-message">Nachricht *</label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={5}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="contact-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Wird gesendet...' : 'Nachricht senden'}
              </button>

              {submitStatus === 'success' && (
                <p className="form-success">Vielen Dank! Ihre Nachricht wurde gesendet.</p>
              )}
              {submitStatus === 'error' && (
                <p className="form-error">Fehler beim Senden. Bitte versuchen Sie es erneut.</p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContactSection;

