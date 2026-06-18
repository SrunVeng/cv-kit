import { ExternalLink, HeartHandshake, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import abaQr from '../assets/donation-aba.jpg';
import khqrQr from '../assets/donation-khqr.jpg';

const paymentMethods = [
  {
    id: 'khqr',
    label: 'KHQR',
    account: 'Veng Srun',
    image: khqrQr,
    alt: 'KHQR donation code for Veng Srun',
  },
  {
    id: 'aba',
    label: 'ABA Bank',
    account: 'Srun Veng',
    image: abaQr,
    alt: 'ABA Bank KHQR donation code for Srun Veng',
  },
];

function DonationDialog({ isOpen, onClose }) {
  const [activeMethodId, setActiveMethodId] = useState(paymentMethods[0].id);
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);
  const activeMethod =
    paymentMethods.find((method) => method.id === activeMethodId) ?? paymentMethods[0];

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    previousFocusRef.current = document.activeElement;

    const handleDialogKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusableElements = Array.from(
        dialogRef.current?.querySelectorAll(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])',
        ) ?? [],
      );
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleDialogKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleDialogKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="donation-backdrop" role="presentation" onClick={onClose}>
      <section
        className="donation-dialog"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="donation-title"
        aria-describedby="donation-description"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="donation-header">
          <span className="donation-icon" aria-hidden="true">
            <HeartHandshake size={23} />
          </span>
          <div>
            <p className="eyebrow">Support the developer</p>
            <h2 id="donation-title">Support Khmer-CV</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close donation dialog" autoFocus>
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <div className="donation-appreciation" id="donation-description">
          <p>
            Thank you for supporting Khmer-CV. Your contribution helps keep the builder free,
            improve its templates, and support continued development.
          </p>
          <p lang="km">
            សូមអរគុណចំពោះការគាំទ្រ Khmer-CV។ ការរួមចំណែករបស់អ្នកជួយឱ្យកម្មវិធីនេះបន្តប្រើប្រាស់ដោយឥតគិតថ្លៃ
            កែលម្អគំរូ CV និងបន្តការអភិវឌ្ឍឱ្យកាន់តែប្រសើរ។
          </p>
        </div>

        <div className="donation-method-tabs" role="tablist" aria-label="Donation payment method">
          {paymentMethods.map((method) => (
            <button
              className={method.id === activeMethod.id ? 'active' : ''}
              type="button"
              key={method.id}
              onClick={() => setActiveMethodId(method.id)}
              role="tab"
              aria-selected={method.id === activeMethod.id}
              aria-controls="donation-payment-panel"
            >
              <strong>{method.label}</strong>
              <span>{method.account}</span>
            </button>
          ))}
        </div>

        <div
          className="donation-payment-panel"
          id="donation-payment-panel"
          role="tabpanel"
          aria-label={`${activeMethod.label} donation QR`}
        >
          <div className="donation-payment-heading">
            <div>
              <p className="eyebrow">Scan to contribute</p>
              <h3>{activeMethod.label}</h3>
            </div>
            <span>{activeMethod.account}</span>
          </div>

          <a
            className="donation-qr-link"
            href={activeMethod.image}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${activeMethod.label} QR code full size`}
          >
            <img src={activeMethod.image} alt={activeMethod.alt} decoding="async" />
          </a>

          <a
            className="donation-fullsize-link"
            href={activeMethod.image}
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink size={15} aria-hidden="true" />
            <span>Open QR full size</span>
          </a>
        </div>

        <p className="donation-thanks" lang="km">
          ការគាំទ្ររបស់អ្នកមានតម្លៃខ្លាំងណាស់។ សូមអរគុណពីចិត្ត។
          <span>Your support means a great deal. Thank you from the heart.</span>
        </p>
      </section>
    </div>
  );
}

export default DonationDialog;
