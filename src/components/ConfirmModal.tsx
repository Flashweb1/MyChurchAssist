"use client";

import { X, AlertTriangle, Loader2, CheckCircle2, Info } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default" | "primary";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: "bg-red-100",
      iconColor: "text-red-600",
      iconBg: <AlertTriangle className="w-5 h-5 text-red-600" />,
      button: "bg-red-600 hover:bg-red-700",
    },
    warning: {
      icon: "bg-amber-100",
      iconColor: "text-amber-600",
      iconBg: <AlertTriangle className="w-5 h-5 text-amber-600" />,
      button: "bg-amber-600 hover:bg-amber-700",
    },
    default: {
      icon: "bg-blue-100",
      iconColor: "text-blue-600",
      iconBg: <Info className="w-5 h-5 text-blue-600" />,
      button: "bg-[var(--brand-blue)] hover:bg-[var(--brand-blue-dark)]",
    },
    primary: {
      icon: "bg-emerald-100",
      iconColor: "text-emerald-600",
      iconBg: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      button: "bg-[var(--brand-blue)] hover:bg-[var(--brand-blue-dark)]",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 scale-in">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl ${styles.icon} flex items-center justify-center shrink-0`}>
            {styles.iconBg}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[var(--brand-navy)]">{title}</h3>
              <button
                onClick={onCancel}
                disabled={loading}
                className="p-1.5 hover:bg-[var(--brand-bg)] rounded-lg text-[var(--brand-muted)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-[var(--brand-muted)] mt-2">{message}</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[var(--brand-border)]">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-[var(--brand-bg)] rounded-xl transition-colors disabled:opacity-50 focus-ring"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2.5 text-sm font-medium text-white rounded-xl transition-all disabled:opacity-70 flex items-center gap-2 shadow-sm ${styles.button}`}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
