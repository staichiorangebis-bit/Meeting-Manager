"use client";

import {
  CalendarDays,
  Clock,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
} from "lucide-react";

import type { Meeting } from "@/types/meeting";

type MeetingCardProps = {
  meeting: Meeting;
  isExpanded: boolean;
  isPast: boolean;
  isToday: boolean;
  isStartingSoon: boolean;
  isDeleting: boolean;
  isDeleteDisabled: boolean;
  onToggle: (id: string) => void;
  onEdit: (meeting: Meeting) => void;
  onDelete: (id: string) => void;
  onCopyResult: (message: string) => void;
  normalizeTime: (value: string) => string;
  formatMeetingDate: (date: string) => string;
};

export default function MeetingCard({
  meeting,
  isExpanded,
  isPast,
  isToday,
  isStartingSoon,
  isDeleting,
  isDeleteDisabled,
  onToggle,
  onEdit,
  onDelete,
  onCopyResult,
  normalizeTime,
  formatMeetingDate,
}: MeetingCardProps) {
  return (
    <div
      className={`overflow-hidden rounded-xl border transition-all duration-200 hover:shadow-md ${
        isStartingSoon
          ? "border-2 border-orange-400 bg-blue-50/50 shadow-md shadow-orange-100"
          : isToday
            ? "border-blue-400 bg-blue-50/50 shadow-md shadow-blue-100"
            : "border-gray-200 bg-white shadow-sm hover:border-blue-200"
      }`}
    >
      <div className="p-5">
        {/* 日付・ステータス */}
        <div className="mb-4 flex items-center justify-between gap-2">
          <div
            className={`flex items-center gap-2 text-sm ${
              isPast ? "text-gray-500" : "text-blue-600"
            }`}
          >
            <CalendarDays size={17} />
            <span className="font-medium">
              {formatMeetingDate(meeting.date)}
            </span>
          </div>

          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
              isPast
                ? "bg-gray-200 text-gray-600"
                : isStartingSoon
                  ? "bg-orange-100 text-orange-700"
                  : isToday
                    ? "bg-lime-100 text-lime-700"
                    : "bg-blue-100 text-blue-700"
            }`}
          >
            {isPast
              ? "終了"
              : isStartingSoon
                ? "まもなく開始"
                : isToday
                  ? "本日"
                  : "今後の予定"}
          </span>
        </div>

        {/* タイトル・開閉 */}
        <button
          type="button"
          onClick={() => onToggle(meeting.id)}
          aria-expanded={isExpanded}
          className="group flex w-full items-center justify-between gap-3 text-left"
        >
          <h3
            className={`min-w-0 break-words text-lg font-bold leading-relaxed transition-colors ${
              isPast
                ? "text-gray-500"
                : "text-gray-900 group-hover:text-blue-600"
            }`}
          >
            {meeting.title}
          </h3>

          {isExpanded ? (
            <ChevronUp size={20} className="shrink-0 text-gray-500" />
          ) : (
            <ChevronDown size={20} className="shrink-0 text-gray-500" />
          )}
        </button>

        {/* 時間 */}
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
          <Clock size={16} className="text-blue-500" />
          <span className="font-medium">
            {normalizeTime(meeting.startTime)}
            <span className="mx-2 text-gray-400">〜</span>
            {normalizeTime(meeting.endTime)}
          </span>
        </div>
      </div>

      {/* 展開した詳細 */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-slate-50 px-5 py-5">
          <div className="text-sm text-gray-700">
            <p className="mb-2 font-semibold text-gray-800">コメント</p>
            <p className="whitespace-pre-wrap break-words leading-relaxed text-gray-600">
              {meeting.comment || "未設定"}
            </p>
          </div>

          <div className="mt-4 text-sm">
            <p className="mb-2 font-semibold text-gray-800">
              ミーティングURL
            </p>

            {meeting.url ? (
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href={meeting.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-medium text-blue-600 underline-offset-4 transition hover:text-blue-800 hover:underline"
                >
                  <ExternalLink size={16} />
                  ミーティングに参加
                </a>

                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(meeting.url);
                      onCopyResult("URLをコピーしました");
                    } catch {
                      onCopyResult("URLのコピーに失敗しました");
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
                >
                  <Copy size={15} />
                  URLをコピー
                </button>
              </div>
            ) : (
              <p className="text-gray-400">未設定</p>
            )}
          </div>

          {/* 編集・削除 */}
          <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={() => onEdit(meeting)}
              disabled={isDeleteDisabled}
              className="rounded-lg bg-blue-500 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-600 disabled:opacity-50"
            >
              編集
            </button>

            <button
              type="button"
              onClick={() => onDelete(meeting.id)}
              disabled={isDeleteDisabled}
              className="rounded-lg bg-red-500 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-600 disabled:opacity-50"
            >
              {isDeleting ? "削除中..." : "削除"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}