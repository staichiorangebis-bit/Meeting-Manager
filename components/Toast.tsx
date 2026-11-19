"use client";

type ToastProps = {
  message: string;
  onClose: () => void;
};

export default function Toast({ message, onClose }: ToastProps) {
  if (!message) return null;

  return (
    <div
      role="status"
      className="fixed right-6 top-6 z-[100] flex items-center gap-3 rounded-lg border border-green-200 bg-white px-5 py-4 shadow-lg"
    >
      <span className="text-green-600">✓</span>

      <p className="text-sm font-medium text-gray-800">
        {message}
      </p>

      <button
        type="button"
        onClick={onClose}
        aria-label="通知を閉じる"
        className="ml-3 text-gray-400 hover:text-gray-700"
      >
        ×
      </button>
    </div>
  );
}