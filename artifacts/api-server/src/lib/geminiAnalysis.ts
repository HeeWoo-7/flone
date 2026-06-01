const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

export interface MonthlyReportResult {
  summary: string;
  emotionAnalysis: string;
  topCategory: string;
  advice: string;
  warningSign: string | null;
}

export async function generateMonthlyReport(data: {
  year: number;
  month: number;
  totalAmount: number;
  spendingList: {
    date: string;
    amount: number;
    category: string;
    note: string;
    emotion: string;
    reason: string;
  }[];
}): Promise<MonthlyReportResult> {
  const memoList = data.spendingList
    .filter((s) => s.note?.trim() || s.reason?.trim())
    .map(
      (s) =>
        `[${s.date}] ${s.category} ${s.amount.toLocaleString()}원 / 감정: ${s.emotion} / 메모: ${s.note || s.reason}`,
    )
    .join("\n");

  const prompt = `당신은 소비 심리 전문가입니다. 아래는 사용자의 ${data.year}년 ${data.month}월 가계부 데이터입니다.

총 지출: ${data.totalAmount.toLocaleString()}원
지출 내역:
${memoList || "메모 없음"}

위 데이터를 분석해서 아래 JSON 형식으로만 답하세요. 다른 말은 절대 하지 마세요.

{
  "summary": "이번 달 소비 전체 요약 (2~3문장, 따뜻한 말투)",
  "emotionAnalysis": "메모에서 읽히는 감정 패턴 분석 (2~3문장)",
  "topCategory": "가장 많이 지출한 카테고리와 이유 추측 (1~2문장)",
  "advice": "다음 달을 위한 현실적인 조언 (2~3문장)",
  "warningSign": "걱정되는 소비 패턴이 있으면 한 문장, 없으면 null"
}`;

  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const json = await res.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Gemini 응답 파싱 실패: " + text);

  return JSON.parse(match[0]) as MonthlyReportResult;
}
