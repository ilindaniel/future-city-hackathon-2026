import { CheckIcon, CopyIcon, XIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

type ShareOfferDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
};

export function ShareOfferDialog({ isOpen, onClose, shareUrl }: ShareOfferDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [qrCodeError, setQrCodeError] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    let isCancelled = false;
    setQrCodeUrl("");
    setQrCodeError(false);
    void import("qrcode")
      .then(({ default: QRCode }) => QRCode.toDataURL(shareUrl, {
        color: { dark: "#201010", light: "#fffdf8" },
        errorCorrectionLevel: "M",
        margin: 2,
        width: 336,
      }))
      .then((dataUrl) => {
        if (!isCancelled) setQrCodeUrl(dataUrl);
      })
      .catch(() => {
        if (!isCancelled) setQrCodeError(true);
      });
    return () => {
      isCancelled = true;
    };
  }, [isOpen, shareUrl]);

  useEffect(() => {
    if (!isCopied) return;
    const timeout = window.setTimeout(() => setIsCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [isCopied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
    } catch {
      setIsCopied(false);
    }
  };

  return (
    <dialog className="share-dialog" onCancel={onClose} onClose={onClose} ref={dialogRef}>
      <button aria-label="Fenster schließen" className="icon-button share-close" onClick={onClose} type="button">
        <XIcon aria-hidden="true" size={24} weight="bold" />
      </button>
      <h2>Zeig das deinen Eltern</h2>
      {qrCodeUrl && !qrCodeError ? (
        <img alt="QR-Code zu den gemerkten Angeboten" className="share-qr" src={qrCodeUrl} />
      ) : qrCodeError ? (
        <div className="share-qr-placeholder" role="alert">Der QR-Code konnte nicht erstellt werden. Kopiere stattdessen den Link.</div>
      ) : (
        <div className="share-qr-placeholder">QR-Code wird erstellt...</div>
      )}
      <p>Der Code zeigt nur deine gemerkten Angebote. Was du gesagt hast, ist nicht im Link.</p>
      <button className="button button-bobby button-block" onClick={() => void handleCopy()} type="button">
        {isCopied ? <CheckIcon aria-hidden="true" size={24} weight="bold" /> : <CopyIcon aria-hidden="true" size={24} weight="bold" />}
        <span>{isCopied ? "Link kopiert" : "Link kopieren"}</span>
      </button>
    </dialog>
  );
}
