import type { Meeting } from "@/types/meeting";

// 時間の形式を HH:mm に統一する
export const normalizeTime = (value: string): string => {
  const match = value.match(/^(\d{1,2}):(\d{2})/);

  if (!match) return "";

  return `${match[1].padStart(2, "0")}:${match[2]}`;
};

// ミーティングの日付を日本語で表示する
export const formatMeetingDate = (date: string): string => {
  const [year, month, day] = date.split("-").map(Number);

  const dateObject = new Date(year, month - 1, day);

  if (Number.isNaN(dateObject.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("ja-JP", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(dateObject);
};

// 過去のミーティングか判定する
export const isPastMeeting = (
  meeting: Meeting,
  currentTime: number
): boolean => {
  const endTime = normalizeTime(meeting.endTime);

  if (!endTime) return false;

  const endDateTime = new Date(`${meeting.date}T${endTime}:00`);

  if (Number.isNaN(endDateTime.getTime())) {
    return false;
  }

  return endDateTime.getTime() < currentTime;
};

// 本日のミーティングか判定する
export const isTodayMeeting = (meeting: Meeting): boolean => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return meeting.date === `${year}-${month}-${day}`;
};

// 開始30分前から開始時刻までの予定か判定する
export const isStartingSoon = (
  meeting: Meeting,
  currentTime: number
): boolean => {
  const startTime = normalizeTime(meeting.startTime);

  if (!startTime || !meeting.date) return false;

  const startDateTime = new Date(
    `${meeting.date}T${startTime}:00`
  );

  const remainingMinutes =
    (startDateTime.getTime() - currentTime) / 60000;

  return remainingMinutes >= 0 && remainingMinutes <= 30;
};
