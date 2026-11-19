"use client";

import { CalendarCheck, History, ChevronDown, ChevronUp } from "lucide-react";
import MeetingCard from "@/components/MeetingCard";
import type { Meeting } from "@/types/meeting";

type MeetingListProps = {
  upcomingMeetings: Meeting[];
  pastMeetings: Meeting[];
  expandedMeetingId: string | null;
  showPastMeetings: boolean;
  deletingMeetingId: string | null;
  currentTime: number | null;
  onToggleMeeting: (id: string) => void;
  onTogglePastMeetings: () => void;
  onEdit: (meeting: Meeting) => void;
  onDelete: (id: string) => void;
  onCopyResult: (message: string) => void;
  isPastMeeting: (meeting: Meeting) => boolean;
  isTodayMeeting: (meeting: Meeting) => boolean;
  isStartingSoon: (meeting: Meeting) => boolean;
  normalizeTime: (value: string) => string;
  formatMeetingDate: (date: string) => string;
};

export default function MeetingList({
  upcomingMeetings,
  pastMeetings,
  expandedMeetingId,
  showPastMeetings,
  deletingMeetingId,
  onToggleMeeting,
  onTogglePastMeetings,
  onEdit,
  onDelete,
  onCopyResult,
  isPastMeeting,
  isTodayMeeting,
  isStartingSoon,
  normalizeTime,
  formatMeetingDate,
}: MeetingListProps) {
  const renderCard = (meeting: Meeting) => (
    <MeetingCard
      key={meeting.id}
      meeting={meeting}
      isExpanded={expandedMeetingId === meeting.id}
      isPast={isPastMeeting(meeting)}
      isToday={isTodayMeeting(meeting)}
      isStartingSoon={isStartingSoon(meeting)}
      isDeleting={deletingMeetingId === meeting.id}
      isDeleteDisabled={deletingMeetingId !== null}
      onToggle={onToggleMeeting}
      onEdit={onEdit}
      onDelete={onDelete}
      onCopyResult={onCopyResult}
      normalizeTime={normalizeTime}
      formatMeetingDate={formatMeetingDate}
    />
  );

  return (
    <div className="space-y-10">
      {/* 今後の予定 */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
            <CalendarCheck size={20} className="text-blue-600" />
            今後の予定
          </h3>

          <span className="text-sm text-gray-500">
            {upcomingMeetings.length} 件
          </span>
        </div>

        {upcomingMeetings.length === 0 ? (
          <p className="rounded-lg border bg-white p-6 text-center text-sm text-gray-500">
            今後の予定はありません
          </p>
        ) : (
          <div className="space-y-4">
            {upcomingMeetings.map(renderCard)}
          </div>
        )}
      </section>

      {/* 終了した予定 */}
      <section>
        <button
          type="button"
          onClick={onTogglePastMeetings}
          aria-expanded={showPastMeetings}
          className="mb-4 flex w-full items-center justify-between rounded-lg px-2 py-3 text-left transition hover:bg-gray-100"
        >
          <div className="flex items-center gap-2">
            <History size={20} className="text-gray-500" />

            <h3 className="text-lg font-semibold text-gray-800">
              終了した予定
            </h3>

            <span className="text-sm text-gray-500">
              {pastMeetings.length} 件
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>
              {showPastMeetings ? "閉じる" : "表示する"}
            </span>

            {showPastMeetings ? (
              <ChevronUp size={20} />
            ) : (
              <ChevronDown size={20} />
            )}
          </div>
        </button>

        {showPastMeetings &&
          (pastMeetings.length === 0 ? (
            <p className="rounded-lg border bg-white p-6 text-center text-sm text-gray-500">
              終了した予定はありません
            </p>
          ) : (
            <div className="space-y-4">
              {pastMeetings.map(renderCard)}
            </div>
          ))}
      </section>
    </div>
  );
}
