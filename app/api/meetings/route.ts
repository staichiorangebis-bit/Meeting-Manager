import { NextResponse } from "next/server";

export async function GET() {
  try {
    const gasUrl = process.env.GAS_API_URL;

    if (!gasUrl) {
      return NextResponse.json(
        { error: "GAS_API_URLが設定されていません" },
        { status: 500 }
      );
    }

    const response = await fetch(gasUrl, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("GASからデータを取得できませんでした");
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET API Error:", error);

    return NextResponse.json(
      { error: "ミーティングの取得に失敗しました" },
      { status: 500 }
    );
  }
}


export async function POST(request: Request) {
  try {
    //ブラウザから送信されたデータを取得
    const body = await request.json();

    //必須項目を確認
    if (
      typeof body?.date !== "string" ||
      !body.date ||
      typeof body?.startTime !== "string" ||
      !body.startTime ||
      typeof body?.endTime !== "string" ||
      !body.endTime ||
      typeof body?.title !== "string" ||
      !body.title.trim()
    ) {
      return NextResponse.json(
        { error: "必須項目が入力されていません" },
        { status: 400 }
      );
    }

    //時間の整合性を確認
    if (body.startTime >= body.endTime) {
      return NextResponse.json(
        { error: "終了時間は開始時間より後にしてください" },
        { status: 400 }
      );
    }

    //GASの設定を取得
    const gasUrl = process.env.GAS_API_URL;
    const apiKey = process.env.GAS_WRITE_API_KEY;

    if (!gasUrl || !apiKey) {
      return NextResponse.json(
        { error: "GASの接続設定が不足しています" },
        { status: 500 }
      );
    }

    //GASへ送信するミーティングデータ
    const meeting = {
      date: body.date,
      startTime: body.startTime,
      endTime: body.endTime,
      title: body.title.trim(),
      comment:
        typeof body.comment === "string" ? body.comment : "",
      url:
        typeof body.url === "string" ? body.url : "",
    };

    // GASにPOSTリクエストを送信
    const response = await fetch(gasUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        apiKey,
        meeting,
      }),
      cache: "no-store",
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error("GASへの通信に失敗しました");
    }

    //GASからの結果を取得
    const result = await response.json();

    if (result.success !== true || !result.meeting) {
      console.error("GAS保存エラー:", result.error);
      return NextResponse.json(
        { error: "ミーティングの保存に失敗しました" },
        { status: 502 }
      );
    }

    //保存されたデータをブラウザに返す
    return NextResponse.json({
      message: "ミーティングを保存しました",
      meeting: result.meeting,
    });

  } catch (error) {
    console.error("POST API Error:", error);

    return NextResponse.json(
      { error: "ミーティングの保存に失敗しました" },
      { status: 500 }
    );
  }
}

//削除リクエスト
export async function DELETE(request: Request) {
  try {
    //ブラウザから削除対象のIDを取得
    const body = await request.json();

    if (typeof body?.id !== "string" || !body.id.trim()) {
      return NextResponse.json(
        { error: "削除対象のIDが指定されていません" },
        { status: 400 }
      );
    }

    //GASの接続設定を取得
    const gasUrl = process.env.GAS_API_URL;
    const apiKey = process.env.GAS_WRITE_API_KEY;

    if (!gasUrl || !apiKey) {
      return NextResponse.json(
        { error: "GASの接続設定が不足しています" },
        { status: 500 }
      );
    }

    //GASへ削除リクエストを送信
    const response = await fetch(gasUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        apiKey,
        action: "delete",
        id: body.id,
      }),
      cache: "no-store",
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error("GASへの通信に失敗しました");
    }

    //GASから削除結果を取得
    const result = await response.json();
    console.log("GAS削除結果:", {
      success: result.success,
      error: result.error,
      idMatches: result.deletedId === body.id,
    });

    if (result.success !== true || result.deletedId !== body.id) {
      return NextResponse.json(
        { error: "ミーティングの削除に失敗しました" },
        { status: 502 }
      );
    }

    //削除成功をブラウザに返す
    return NextResponse.json({
      message: "ミーティングを削除しました",
      deletedId: result.deletedId,
    });

  } catch (error) {
    console.error("DELETE API Error:", error);

    return NextResponse.json(
      { error: "ミーティングの削除に失敗しました" },
      { status: 500 }
    );
  }
}


export async function PATCH(request: Request) {
  try {
    // ① フロントエンドから送られたデータを取得
    const body = await request.json();

    const { id, meeting } = body;

    // ② IDの確認
    if (typeof id !== "string" || !id.trim()) {
      return NextResponse.json(
        { error: "更新対象のIDが指定されていません" },
        { status: 400 }
      );
    }

    // ③ 入力内容の確認
    if (
      !meeting ||
      typeof meeting.date !== "string" ||
      !meeting.date ||
      typeof meeting.startTime !== "string" ||
      !meeting.startTime ||
      typeof meeting.endTime !== "string" ||
      !meeting.endTime ||
      typeof meeting.title !== "string" ||
      !meeting.title.trim() ||
      meeting.startTime >= meeting.endTime
    ) {
      return NextResponse.json(
        { error: "入力内容が不正です" },
        { status: 400 }
      );
    }

    // ④ 環境変数を取得
    const gasUrl = process.env.GAS_API_URL;
    const apiKey = process.env.GAS_WRITE_API_KEY;

    if (!gasUrl || !apiKey) {
      return NextResponse.json(
        { error: "GASの接続設定が不足しています" },
        { status: 500 }
      );
    }

    // ⑤ GASへ更新リクエストを送信
    const response = await fetch(gasUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        apiKey,
        action: "update",
        id,
        meeting,
      }),
      cache: "no-store",
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error("GASへの通信に失敗しました");
    }

    // ⑥ GASからの結果を取得
    const result = await response.json();

    if (
      result.success !== true ||
      !result.meeting ||
      result.meeting.id !== id
    ) {
      return NextResponse.json(
        { error: "ミーティングの更新に失敗しました" },
        { status: 502 }
      );
    }

    // ⑦ 更新したミーティングを返す
    return NextResponse.json({
      message: "ミーティングを更新しました",
      meeting: result.meeting,
    });

  } catch (error) {
    console.error("PATCH API Error:", error);

    return NextResponse.json(
      { error: "ミーティングの更新に失敗しました" },
      { status: 500 }
    );
  }
}