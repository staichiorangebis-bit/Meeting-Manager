"use client";

type MeetingFormData = {
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  comment: string;
  url: string;
};

type MeetingFormModalProps = {
  isOpen: boolean;
  isEditing: boolean;
  isSaving: boolean;
  formData: MeetingFormData;
  formError: string;
  onChange: (field: keyof MeetingFormData, value: string) => void;
  onCancel: () => void;
  onSubmit: () => void | Promise<void>;
};

export default function MeetingFormModal({
  isOpen,
  isEditing,
  isSaving,
  formData,
  formError,
  onChange,
  onCancel,
  onSubmit,
}: MeetingFormModalProps) {
  if (!isOpen) return null;

  const inputClassName =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="meeting-modal-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <div className="mb-6 border-b border-gray-200 pb-4">
          <h2
            id="meeting-modal-title"
            className="text-xl font-bold text-gray-900"
          >
            {isEditing ? "ミーティング編集" : "スケジュール入力"}
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {isEditing
              ? "登録済みのスケジュールを編集できます。"
              : "新しいスケジュールを登録してください。"}
          </p>
        </div>

        <div className="mt-6">
          <div className="space-y-4">
            {/* 日付 */}
            <div>
              <label
                htmlFor="meeting-date"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                日付 <span className="text-red-500">*</span>
              </label>
              <input
                id="meeting-date"
                type="date"
                value={formData.date}
                onChange={(e) => onChange("date", e.target.value)}
                className={inputClassName}
              />
            </div>

            {/* 開始時間・終了時間 */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="meeting-start-time"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  開始時間 <span className="text-red-500">*</span>
                </label>
                <input
                  id="meeting-start-time"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => onChange("startTime", e.target.value)}
                  required
                  className={inputClassName}
                />
              </div>

              <div>
                <label
                  htmlFor="meeting-end-time"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  終了時間 <span className="text-red-500">*</span>
                </label>
                <input
                  id="meeting-end-time"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => onChange("endTime", e.target.value)}
                  required
                  className={inputClassName}
                />
              </div>
            </div>

            {/* ミーティングタイトル */}
            <div>
              <label
                htmlFor="meeting-title"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                ミーティングタイトル <span className="text-red-500">*</span>
              </label>
              <input
                id="meeting-title"
                type="text"
                value={formData.title}
                onChange={(e) => onChange("title", e.target.value)}
                placeholder="例：開発ミーティング"
                className={inputClassName}
              />
            </div>

            {/* コメント */}
            <div>
              <label
                htmlFor="meeting-comment"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                コメント
              </label>
              <textarea
                id="meeting-comment"
                value={formData.comment}
                onChange={(e) => onChange("comment", e.target.value)}
                placeholder="ミーティングの内容を入力"
                rows={3}
                className={inputClassName}
              />
            </div>

            {/* URL */}
            <div>
              <label
                htmlFor="meeting-url"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                ミーティングURL
                <span className="ml-2 text-xs font-normal text-gray-400">
                  任意
                </span>
              </label>
              <input
                id="meeting-url"
                type="url"
                value={formData.url}
                onChange={(e) => onChange("url", e.target.value)}
                placeholder="https://xxxxx.com/xxx-xxxx-xxx"
                className={inputClassName}
              />
              <p className="mt-1 text-xs text-gray-400">
                Google MeetやZoomなどのURLを入力できます。
              </p>
            </div>
          </div>

          {/* エラー表示 */}
          {formError && (
            <p
              role="alert"
              className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              {formError}
            </p>
          )}

          {/* 操作ボタン */}
          <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              キャンセル
            </button>

            <button
              type="button"
              onClick={() => void onSubmit()}
              disabled={isSaving}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving
                ? "保存中..."
                : isEditing
                  ? "変更を保存"
                  : "入力完了"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
