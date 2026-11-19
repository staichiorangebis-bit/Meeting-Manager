import type { Meeting } from "@/types/meeting";

const API_URL = "/api/meetings";

const requestHeaders = {
  "Content-Type": "application/json",
};

// ミーティング一覧を取得
export const fetchMeetings = async (
  signal?: AbortSignal
): Promise<Meeting[]> => {
  const response = await fetch(API_URL, {
    signal,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("データの取得に失敗しました");
  }

  const data = await response.json();

  if (!Array.isArray(data.meetings)) {
    throw new Error("取得したデータの形式が正しくありません");
  }

  return data.meetings;
};

// ミーティングを登録
export const createMeeting = async (
  meeting: Meeting
): Promise<Meeting> => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: requestHeaders,
    body: JSON.stringify(meeting),
  });

  if (!response.ok) {
    throw new Error("ミーティングの登録に失敗しました");
  }

  const result = await response.json();

  if (!result.meeting) {
    throw new Error("保存結果にミーティングがありません");
  }

  return result.meeting;
};


type MeetingUpdateData = Pick<
  Meeting,
  "date" | "startTime" | "endTime" | "title" | "comment" | "url"
>;

// ミーティングを更新
export const updateMeetingApi = async (
  id: string,
  meeting: MeetingUpdateData
): Promise<Meeting> => {
  const response = await fetch(API_URL, {
    method: "PATCH",
    headers: requestHeaders,
    body: JSON.stringify({
      id,
      meeting,
    }),
  });

  if (!response.ok) {
    throw new Error("ミーティングの更新に失敗しました");
  }

  const result = await response.json();

  if (!result.meeting || result.meeting.id !== id) {
    throw new Error("更新結果が正しくありません");
  }

  return result.meeting;
};

  // ミーティングを削除
  export const deleteMeetingApi = async (
    id: string
  ): Promise<void> => {
    const response = await fetch(API_URL, {
      method: "DELETE",
      headers: requestHeaders,
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      throw new Error("ミーティングの削除に失敗しました");
    }

    const result = await response.json();

    if (result.deletedId !== id) {
      throw new Error("削除結果のIDが一致しません");
    }
  };