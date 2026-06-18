import {
  Download,
  ExternalLink,
  HeartHandshake,
  LayoutTemplate,
  Sparkles,
  X,
} from 'lucide-react';
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
    width: 1044,
    height: 1514,
  },
  {
    id: 'aba',
    label: 'ABA Bank',
    account: 'Srun Veng',
    image: abaQr,
    alt: 'ABA Bank KHQR donation code for Srun Veng',
    width: 1730,
    height: 2445,
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
            <p className="eyebrow">Pay it forward</p>
            <h2 id="donation-title">Help keep Khmer-CV free</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close donation dialog" autoFocus>
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <div className="donation-content">
          <div className="donation-story">
            <div className="donation-appreciation" id="donation-description">
              <p className="eyebrow">Built for the community</p>
              <h3>A small gift can help the next job seeker.</h3>
              <p>
                If Khmer-CV made your job search a little easier, your support helps keep the
                builder accessible and improving for everyone.
              </p>
              <p lang="km">
                បើ Khmer-CV បានជួយឱ្យការស្វែងរកការងាររបស់អ្នកកាន់តែងាយស្រួល
                ការគាំទ្ររបស់អ្នកនឹងជួយឱ្យកម្មវិធីនេះបន្តឥតគិតថ្លៃ និងកាន់តែប្រសើរសម្រាប់មនុស្សគ្រប់គ្នា។
              </p>
            </div>

            <div className="donation-impact">
              <p className="eyebrow">Your support helps fund</p>
              <ul>
                <li>
                  <span aria-hidden="true"><Download size={17} /></span>
                  <div>
                    <strong>Free CV downloads</strong>
                    <small>Keep the core builder useful and accessible.</small>
                  </div>
                </li>
                <li>
                  <span aria-hidden="true"><LayoutTemplate size={17} /></span>
                  <div>
                    <strong>Better templates</strong>
                    <small>More polished options for different careers.</small>
                  </div>
                </li>
                <li>
                  <span aria-hidden="true"><Sparkles size={17} /></span>
                  <div>
                    <strong>Thoughtful improvements</strong>
                    <small>More time to refine and maintain Khmer-CV.</small>
                  </div>
                </li>
              </ul>
            </div>

            <p className="donation-optional">
              <HeartHandshake size={16} aria-hidden="true" />
              <span>Completely optional. Any amount is appreciated.</span>
            </p>
          </div>

          <div className="donation-action">
            <div className="donation-action-heading">
              <p className="eyebrow">Choose how to support</p>
              <h3>Scan with your banking app</h3>
              <p>Pick a payment method, then scan the QR code.</p>
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
                  <p className="eyebrow">Ready to scan</p>
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
                <img
                  src={activeMethod.image}
                  alt={activeMethod.alt}
                  width={activeMethod.width}
                  height={activeMethod.height}
                  decoding="async"
                />
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
              សូមអរគុណពីចិត្ត។
              <span>Thank you for helping Khmer-CV grow.</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DonationDialog;
