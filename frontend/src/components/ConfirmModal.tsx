import { AlertTriangle } from 'lucide-react';

type ConfirmModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmModal({
  cancelLabel = 'Annuler',
  confirmLabel = 'Confirmer',
  description,
  loading = false,
  onCancel,
  onConfirm,
  open,
  title,
}: ConfirmModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal modal-open" role="dialog" aria-modal="true">
      <div className="modal-box max-w-lg">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-error/10 p-3 text-error">
            <AlertTriangle className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-base-content/70">{description}</p>
          </div>
        </div>
        <div className="modal-action">
          <button className="btn btn-ghost" disabled={loading} onClick={onCancel} type="button">
            {cancelLabel}
          </button>
          <button className="btn btn-error" disabled={loading} onClick={onConfirm} type="button">
            {loading && <span className="loading loading-spinner loading-sm" />}
            {confirmLabel}
          </button>
        </div>
      </div>
      <button className="modal-backdrop" onClick={onCancel} type="button">
        Fermer
      </button>
    </div>
  );
}
