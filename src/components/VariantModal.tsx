import type { PriceVariants } from '../types/menu';
import '../styles/VariantModal.css';

interface VariantModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  itemNumber?: number | string | null;
  variants: PriceVariants;
  onSelectVariant: (variantKey: string, price: number) => void;
}

export const VariantModal = ({
  isOpen,
  onClose,
  itemName,
  itemNumber,
  variants,
  onSelectVariant,
}: VariantModalProps) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const sortedVariants = Object.entries(variants).sort(([, a], [, b]) => a - b);

  return (
    <div className="variant-modal-backdrop" onClick={handleBackdropClick}>
      <div className="variant-modal">
        <button className="variant-modal-close" onClick={onClose}>
          ×
        </button>
        <h3 className="variant-modal-title">
          {itemNumber && <span className="variant-item-number">Nr. {itemNumber}</span>}
          {itemName}
        </h3>
        <p className="variant-modal-subtitle">Bitte Größe wählen:</p>
        <div className="variant-options">
          {sortedVariants.map(([size, price]) => (
            <button
              key={size}
              className="variant-option"
              onClick={() => onSelectVariant(size, price)}
            >
              <span className="variant-size">{size}</span>
              <span className="variant-price">{price.toFixed(2)} €</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

