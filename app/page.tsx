"use client";
import { useEffect, useState } from "react";
import {
  CalendarPlus,
  Plus,
} from "lucide-react";

import {
  normalizeTime,
  formatMeetingDate,
  isPastMeeting as checkPastMeeting,
  isTodayMeeting,
  isStartingSoon as checkStartingSoon,
} from "@/lib/meetingUtils";

import type { Meeting } from "@/types/meeting";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import MeetingFormModal from "@/components/MeetingFormModal";
import Toast from "@/components/Toast";
import MeetingList from "@/components/MeetingList";
import {
  fetchMeetings,
  createMeeting,
  updateMeetingApi,
  deleteMeetingApi,
} from "@/lib/meetingApi";

const initialFormData = {
  date: "",
  startTime: "",
  endTime: "",
  title: "",
  comment: "",
  url: "",
};

export default function Home() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deletingMeetingId, setDeletingMeetingId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [currentTime, setCurrentTime] = useState<number | null>(null);
  
  // 編集対象のミーティングID
  const [editingMeetingId, setEditingMeetingId] = useState<string | null>(null);

    // ミーティング一覧を取得
  useEffect(() => {
    const controller = new AbortController();

    const loadMeetings = async () => {
      try {
        const data = await fetchMeetings(controller.signal);

        if (!controller.signal.aborted) {
          setMeetings(data);
        }
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error("ミーティング取得エラー:", error);
        setLoadError("ミーティングの取得に失敗しました");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    loadMeetings();

    return () => controller.abort();
  }, []);

  // トースト通知を5秒後に自動で閉じる
  useEffect(() => {
    if (!toastMessage) return;

    const timer = window.setTimeout(() => {
      setToastMessage("");
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  // 現在時刻を1分ごとに更新
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(Date.now());
    };

    updateTime();

    const timer = window.setInterval(updateTime, 60 * 1000);

    return () => window.clearInterval(timer);
  }, []);

  const isPastMeeting = (meeting: Meeting) => {
    return checkPastMeeting(meeting, currentTime ?? Date.now());
  };

  // 並び替える
  const sortedMeetings = [...meetings].sort((a, b) => {
    const aIsPast = isPastMeeting(a);
    const bIsPast = isPastMeeting(b);

    if (aIsPast !== bIsPast) {
      return aIsPast ? 1 : -1;
    }

    const aDateTime = `${a.date}T${normalizeTime(a.startTime)}`;
    const bDateTime = `${b.date}T${normalizeTime(b.startTime)}`;

    return aIsPast
      ? bDateTime.localeCompare(aDateTime)
      : aDateTime.localeCompare(bDateTime);
  });

  // 今後の予定
  const upcomingMeetings = sortedMeetings.filter(
    (meeting) => !isPastMeeting(meeting)
  );

  // 終了した予定
  const pastMeetings = sortedMeetings.filter(
    (meeting) => isPastMeeting(meeting)
  );

  //展開中のミーティングIDを管理
  const [expandedMeetingId, setExpandedMeetingId] = useState<string | null>(null);
  const [showPastMeetings, setShowPastMeetings] = useState(false);

  //ミーティングの開閉処理
  const toggleMeeting = (id: string) => {
    setExpandedMeetingId((currentId) =>
      currentId === id ? null : id
    );
  };
  

  //ミーティングの削除
  const deleteMeeting = async (id: string) => {
    // 削除処理中は重複操作を防ぐ  
    if (deletingMeetingId !== null) return false;

    setDeletingMeetingId(id);

    try {
      // 共通API関数でミーティングを削除
      await deleteMeetingApi(id);
      // 削除したミーティングを一覧から除外
      setMeetings((prevMeetings) =>
        prevMeetings.filter((meeting) => meeting.id !== id)
      );
      // 展開中のミーティングを閉じる
      setExpandedMeetingId(null);
      // 削除完了通知
      setToastMessage("ミーティングを削除しました");

      return true;
    } catch (error) {
      console.error("削除エラー:", error);
      alert("ミーティングの削除に失敗しました");
      return false;
    } finally {
      setDeletingMeetingId(null);
    }
  };

  // モーダルの開閉状態
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  //フォームのの表示非表示管理
  const [formData, setFormData] = useState(initialFormData);

  //入力内容を更新
  const updateForm = (
    field: keyof typeof formData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

    // フォームの入力内容をチェックする
  const validateMeetingForm = (): string => {
    // 必須項目の確認
    if (
      !formData.date ||
      !formData.startTime ||
      !formData.endTime ||
      !formData.title.trim()
    ) {
      return "日付・時間・タイトルを入力してください";
    }

    // 終了時間の確認
    if (formData.startTime >= formData.endTime) {
      return "終了時間は開始時間より後にしてください";
    }
    // 問題がなければ空文字を返す
    return "";
  };
  
  const addMeeting = async () => {
    setFormError("");

    // 共通の入力チェックを実行
    const validationError = validateMeetingForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    // 新しいミーティングを作成
    const newMeeting: Meeting = {
      id: crypto.randomUUID(),
      ...formData,
      title: formData.title.trim(),
      createdAt: new Date().toISOString(),
    };

    if (isSaving) return;
    setIsSaving(true);

    try {
      // 共通API関数でミーティングを登録
      const savedMeeting = await createMeeting(newMeeting);

      // 登録したミーティングを一覧に反映
      setMeetings((prevMeetings) => [
        ...prevMeetings,
        savedMeeting,
      ]);
    } catch (error) {
      console.error("送信エラー:", error);
      setFormError("ミーティングの登録に失敗しました");
      return;
    } finally {
      setIsSaving(false);
    }

    // 入力フォームを初期化
    setFormData(initialFormData);

    // モーダルを閉じる
    setIsModalOpen(false);
    setToastMessage("ミーティングを登録しました");
  };
  
  // 既存のミーティングの更新
  const updateMeeting = async () => {
  setFormError("");
  if (!editingMeetingId) return;

  // 共通の入力チェックを実行
  const validationError = validateMeetingForm();

  if (validationError) {
    setFormError(validationError);
    return;
  }

    if (isSaving) return;
    setIsSaving(true);

    try {
      // 共通API関数でミーティングを更新
      const updatedMeeting = await updateMeetingApi(
        editingMeetingId,
        formData
      );

      // 更新されたミーティングを一覧に反映
      setMeetings((prevMeetings) =>
        prevMeetings.map((meeting) =>
          meeting.id === editingMeetingId
            ? updatedMeeting
            : meeting
        )
      );

      // モーダルを閉じる
      setIsModalOpen(false);
      setEditingMeetingId(null);
      setToastMessage("ミーティングを更新しました");

    } catch (error) {
      console.error("更新エラー:", error);
      setFormError("ミーティングの更新に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

   // 登録・編集モーダルを閉じる
  const closeFormModal = () => {
    setIsModalOpen(false);
    setEditingMeetingId(null);
    setFormError("");
  };

  // 新規登録モーダルを開く
  const openAddModal = () => {
    setFormError("");
    setEditingMeetingId(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  const openEditModal = (meeting: Meeting) => {
  setFormError("");
  setEditingMeetingId(meeting.id);

  setFormData({
    date: meeting.date,
    startTime: normalizeTime(meeting.startTime),
    endTime: normalizeTime(meeting.endTime),
    title: meeting.title,
    comment: meeting.comment,
    url: meeting.url,
  });

  setIsModalOpen(true);
};

  // 開始30分前から開始時刻までの予定か判定
  const isStartingSoon = (meeting: Meeting) => {
    return checkStartingSoon(meeting, currentTime ?? Date.now());
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 吹き出し */}
      <Toast
        message={toastMessage}
        onClose={() => setToastMessage("")}
      />

      {/* ヘッダー */}
      <header className="border-b bg-white px-8 py-5">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-2xl font-bold text-gray-800">
            Meeting Manager
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            ミーティングスケジュール管理
          </p>
        </div>
      </header>

      {/* メインコンテンツ */}
      <section className="mx-auto max-w-5xl px-8 py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              スケジュール一覧
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              全 {meetings.length} 件の予定
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={18} />
            スケジュール入力
          </button>
        </div>

        {/* 読み込み中の表示 */}
        {isLoading && (
          <p className="text-center text-gray-500">
            ミーティングを読み込み中...
          </p>
        )}

        {/* エラー発生時の表示 */}
        {loadError && (
          <p role="alert" className="text-center text-red-500">
            {loadError}
          </p>
        )}

        {/* ミーティング一覧・予定なし表示 */}
        {!isLoading && !loadError && (
          <>
            {meetings.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16">
                <CalendarPlus
                  size={48}
                  className="mb-4 text-gray-400"
                />

                <h3 className="font-semibold text-gray-700">
                  まだ予定がありません
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  スケジュールを入力して予定を追加しましょう。
                </p>
              </div>
            ) : (
              <MeetingList
                upcomingMeetings={upcomingMeetings}
                pastMeetings={pastMeetings}
                expandedMeetingId={expandedMeetingId}
                showPastMeetings={showPastMeetings}
                deletingMeetingId={deletingMeetingId}
                currentTime={currentTime}
                onToggleMeeting={toggleMeeting}
                onTogglePastMeetings={() =>
                  setShowPastMeetings((prev) => !prev)
                }
                onEdit={openEditModal}
                onDelete={setDeleteTargetId}
                onCopyResult={setToastMessage}
                isPastMeeting={isPastMeeting}
                isTodayMeeting={isTodayMeeting}
                isStartingSoon={isStartingSoon}
                normalizeTime={normalizeTime}
                formatMeetingDate={formatMeetingDate}
              />
            )}
          </>
        )}
      </section>
      {/* スケジュール登録・編集モーダル */}
      <MeetingFormModal
        isOpen={isModalOpen}
        isEditing={editingMeetingId !== null}
        isSaving={isSaving}
        formData={formData}
        formError={formError}
        onChange={updateForm}
        onSubmit={editingMeetingId ? updateMeeting : addMeeting}
        onCancel={closeFormModal}
      />
      
      {/* 削除確認モーダル */}
      <DeleteConfirmModal
        isOpen={deleteTargetId !== null}
        isDeleting={deletingMeetingId !== null}
        onCancel={() => setDeleteTargetId(null)}
        onConfirm={async () => {
          if (deleteTargetId === null) return;

          const success = await deleteMeeting(deleteTargetId);

          if (success) {
            setDeleteTargetId(null);
          }
        }}
      />
    </main>
  );
}
