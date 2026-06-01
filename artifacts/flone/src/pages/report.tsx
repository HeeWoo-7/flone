import { useListSpendingRecords, useGetSpendingSummary, useGetUserProfile } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { BottomNav } from "@/components/bottom-nav";

// ─── AI Report Types ──────────────────────────────────────────────────────────

interface AIReport {
  summary: string;
  emotionAnalysis: string;
  topCategory: string;
  advice: string;
  warningSign: string | null;
}

async function fetchAIReport(year: number, month: number): Promise<AIReport> {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const res = await fetch(`${base}/api/report/monthly?year=${year}&month=${month}`);
  if (!res.ok) throw new Error(`서버 오류 (${res.status})`);
  const data = await res.json() as { empty?: boolean; message?: string; report?: AIReport };
  if (data.empty) throw new Error(data.message ?? "이번 달 기록이 없어요");
  if (!data.report) throw new Error("AI 분석 결과를 받지 못했어요");
  return data.report;
}

const NAVY = "#1E1A5E";
const PURPLE = "#5B5BE6";

// ─── Spending Type Classification ─────────────────────────────────────────────

type SpendingType = "감정해소형" | "보상형" | "충동형" | "사회영향형" | "SNS홀릭형" | "계획형";

const TYPE_INFO: Record<SpendingType, {
  color: string; bg: string; icon: string; desc: string;
  tags: string[]; tip: string; tipTitle: string;
}> = {
  감정해소형: {
    color: "#E85D75", bg: "#FFF0F3",
    icon: "😮‍💨", desc: "감정이 소비를 이끌었어요",
    tags: ["#스트레스소비", "#즉흥구매", "#후회가능"],
    tipTitle: "소비 전 잠깐 멈추기",
    tip: "구매하고 싶을 때 10분만 기다려봐요. 감정이 가라앉으면 필요한지 더 명확하게 보여요.",
  },
  보상형: {
    color: "#F57C3A", bg: "#FFF4EE",
    icon: "🎁", desc: "나를 위한 보상으로 소비했어요",
    tags: ["#오늘수고했어", "#셀프선물", "#기분소비"],
    tipTitle: "보상 예산 만들기",
    tip: "월초에 '나를 위한 예산'을 따로 정해두면 보상 소비도 계획적으로 즐길 수 있어요.",
  },
  충동형: {
    color: "#E6B800", bg: "#FFFBEA",
    icon: "⚡", desc: "순간적으로 결정한 소비예요",
    tags: ["#클릭3초컷", "#충동구매", "#비계획소비"],
    tipTitle: "장바구니 하루 룰",
    tip: "바로 사지 말고 장바구니에 담아두세요. 24시간 후에도 원하면 그때 사도 늦지 않아요.",
  },
  사회영향형: {
    color: "#9B59B6", bg: "#F5F0FF",
    icon: "👥", desc: "주변 영향을 받은 소비예요",
    tags: ["#따라쓰기", "#유행소비", "#다들사니까"],
    tipTitle: "'나에게 필요한가?' 먼저 묻기",
    tip: "남들이 산다고 나도 필요한 건 아니에요. '이게 내 라이프스타일에 맞나요?' 먼저 물어봐요.",
  },
  SNS홀릭형: {
    color: "#5B5BE6", bg: "#ECEAFC",
    icon: "📱", desc: "SNS·광고가 소비 욕구를 자극했어요",
    tags: ["#광고소비", "#인스타쇼핑", "#콘텐츠→구매"],
    tipTitle: "저장 후 하루 뒤 확인하기",
    tip: "피드에서 본 제품, 바로 사지 말고 저장해두세요. 하루 지나면 10개 중 7개는 안 사도 돼요.",
  },
  계획형: {
    color: "#00A878", bg: "#EDFAF5",
    icon: "✅", desc: "계획하고 실행한 건강한 소비예요",
    tags: ["#계획소비", "#알뜰살뜰", "#후회없음"],
    tipTitle: "이 습관, 계속 유지해요!",
    tip: "계획 소비는 가장 건강한 소비 패턴이에요. 이 리듬을 유지하면서 예산 범위도 조금씩 넓혀봐요.",
  },
};

function classifyRecord(r: { emotion: string; reason: string | null }): SpendingType {
  if (r.emotion === "계획소비" || r.reason === "미리 계획한 구매예요") return "계획형";
  if (r.reason === "광고나 SNS를 보고 궁금해졌어요") return "SNS홀릭형";
  if (r.reason === "다른 사람이 사용해서 사고 싶었어요") return "사회영향형";
  if (["스트레스", "화남", "우울", "불안"].includes(r.emotion)) return "감정해소형";
  if (["기쁨", "설렘"].includes(r.emotion)) return "보상형";
  return "충동형";
}

// ─── Mini SVG Donut ────────────────────────────────────────────────────────────

function DonutChart({ pct, color, size = 96 }: { pct: number; color: string; size?: number }) {
  const r = size * 0.38, cx = size / 2, cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const dash = (pct / 100) * circumference;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#EBEBEB" strokeWidth={size * 0.13} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={size * 0.13}
        strokeDasharray={`${dash} ${circumference}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`} />
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize={size * 0.2} fontWeight="700" fill={color}>
        {Math.round(pct)}%
      </text>
    </svg>
  );
}

// ─── Bar ──────────────────────────────────────────────────────────────────────

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

// ─── Emoji face ring ──────────────────────────────────────────────────────────

const EMOTION_LABEL: Record<string, string> = {
  스트레스: "😤", 화남: "😠", 불안: "😰", 우울: "😔",
  무기력: "😶", 외로움: "🥺", 기쁨: "😄", 설렘: "🤩", 계획소비: "✅",
};

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onRecord }: { onRecord: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 pb-24 text-center">
      <div className="text-5xl mb-4">📊</div>
      <h3 className="text-[18px] font-bold mb-2" style={{ color: "#1C1C1E" }}>아직 기록이 없어요</h3>
      <p className="text-[14px] leading-relaxed mb-6" style={{ color: "#8E8E93" }}>
        소비를 기록하면 이번 달<br />나의 소비 패턴을 분석해드려요
      </p>
      <button onClick={onRecord}
        className="px-8 py-3 rounded-2xl font-bold text-[15px] text-white"
        style={{ background: PURPLE }}>
        첫 소비 기록하기
      </button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Report() {
  const [, setLocation] = useLocation();
  const { data: profile } = useGetUserProfile();
  const { data: records = [] } = useListSpendingRecords({ limit: 100, offset: 0 });
  const { data: summary } = useGetSpendingSummary();
  const [aiReport, setAiReport] = useState<AIReport | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const now = new Date();
  const monthLabel = `${now.getFullYear()}년 ${now.getMonth() + 1}월`;

  const handleAIAnalysis = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const result = await fetchAIReport(now.getFullYear(), now.getMonth() + 1);
      setAiReport(result);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "분석 중 오류가 발생했어요");
    } finally {
      setAiLoading(false);
    }
  };

  // Filter to current month
  const thisMonth = records.filter(r => {
    const d = new Date(r.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  // Type breakdown
  const typeCounts: Record<SpendingType, number> = {
    감정해소형: 0, 보상형: 0, 충동형: 0, 사회영향형: 0, SNS홀릭형: 0, 계획형: 0,
  };
  for (const r of thisMonth) typeCounts[classifyRecord(r)]++;

  const total = thisMonth.length || 1;
  const sortedTypes = (Object.entries(typeCounts) as [SpendingType, number][])
    .sort((a, b) => b[1] - a[1]);
  const [dominantType, dominantCount] = sortedTypes[0] ?? ["충동형", 0];
  const dominantInfo = TYPE_INFO[dominantType];
  const dominantPct = Math.round((dominantCount / total) * 100);

  // Category top3
  const catTop3 = (summary?.categoryBreakdown ?? []).slice(0, 3);

  // Emotion breakdown
  const emotionBreakdown = (summary?.emotionBreakdown ?? []).slice(0, 6);
  const maxEmoCount = Math.max(...emotionBreakdown.map(e => e.count), 1);

  // Totals
  const totalAmount = thisMonth.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F2F2F7" }}>
      {/* ── Header ── */}
      <div className="px-5 pt-12 pb-5" style={{ background: NAVY }}>
        <p className="text-[13px] text-white/60 mb-0.5">{monthLabel}</p>
        <h1 className="text-[22px] font-bold text-white">
          {profile?.nickname ? `${profile.nickname}의 소비 리포트` : "이번 달 소비 리포트"}
        </h1>
      </div>

      {thisMonth.length === 0 ? (
        <>
          <EmptyState onRecord={() => setLocation("/record")} />
          <BottomNav />
        </>
      ) : (
        <div className="flex-1 overflow-y-auto pb-24">

          {/* ── Hero type card ── */}
          <div className="mx-4 mt-4 rounded-3xl overflow-hidden shadow-sm" style={{ background: "white" }}>
            <div className="px-5 pt-5 pb-4">
              <p className="text-[12px] font-semibold mb-1" style={{ color: PURPLE }}>이번 달 나의 소비 유형</p>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[26px] font-bold leading-tight" style={{ color: dominantInfo.color }}>
                    {dominantType}
                  </h2>
                  <p className="text-[13px] mt-0.5" style={{ color: "#8E8E93" }}>{dominantInfo.desc}</p>
                </div>
                <DonutChart pct={dominantPct} color={dominantInfo.color} size={88} />
              </div>

              {/* Hashtags */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {dominantInfo.tags.map(tag => (
                  <span key={tag} className="text-[12px] font-medium px-2.5 py-0.5 rounded-full"
                    style={{ background: dominantInfo.bg, color: dominantInfo.color }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Total summary strip */}
            <div className="flex divide-x border-t" style={{ borderColor: "#F2F2F7" }}>
              {[
                { label: "총 소비 횟수", value: `${thisMonth.length}회` },
                { label: "총 소비 금액", value: `${new Intl.NumberFormat("ko-KR").format(totalAmount)}원` },
              ].map(({ label, value }) => (
                <div key={label} className="flex-1 px-4 py-3 text-center">
                  <p className="text-[11px]" style={{ color: "#8E8E93" }}>{label}</p>
                  <p className="text-[15px] font-bold" style={{ color: "#1C1C1E" }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Type Breakdown ── */}
          <div className="mx-4 mt-3 bg-white rounded-3xl px-5 py-4 shadow-sm">
            <p className="text-[14px] font-bold mb-3" style={{ color: "#1C1C1E" }}>소비 유형 분포</p>
            <div className="space-y-2.5">
              {sortedTypes.map(([type, count]) => {
                const info = TYPE_INFO[type];
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={type} className="flex items-center gap-2">
                    <span className="text-[13px] w-20 shrink-0" style={{ color: "#3A3A4C" }}>{type}</span>
                    <Bar pct={pct} color={info.color} />
                    <span className="text-[12px] w-8 text-right shrink-0" style={{ color: "#8E8E93" }}>
                      {count}회
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Category TOP 3 ── */}
          {catTop3.length > 0 && (
            <div className="mx-4 mt-3 bg-white rounded-3xl px-5 py-4 shadow-sm">
              <p className="text-[14px] font-bold mb-3" style={{ color: "#1C1C1E" }}>카테고리 TOP 3</p>
              <div className="space-y-3">
                {catTop3.map(({ label, count, amount }, i) => {
                  const pct = Math.round((amount / (summary?.totalAmount || 1)) * 100);
                  const medals = ["🥇", "🥈", "🥉"];
                  return (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[15px]">{medals[i]}</span>
                          <span className="text-[14px] font-semibold" style={{ color: "#1C1C1E" }}>{label}</span>
                          <span className="text-[12px]" style={{ color: "#8E8E93" }}>{count}회</span>
                        </div>
                        <span className="text-[13px] font-bold" style={{ color: PURPLE }}>
                          {new Intl.NumberFormat("ko-KR").format(amount)}원
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: PURPLE }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Emotion Distribution ── */}
          {emotionBreakdown.length > 0 && (
            <div className="mx-4 mt-3 bg-white rounded-3xl px-5 py-4 shadow-sm">
              <p className="text-[14px] font-bold mb-3" style={{ color: "#1C1C1E" }}>감정 분포</p>
              <div className="grid grid-cols-3 gap-2">
                {emotionBreakdown.map(({ label, count }) => {
                  const pct = Math.round((count / maxEmoCount) * 100);
                  return (
                    <div key={label} className="flex flex-col items-center gap-1 p-2 rounded-2xl"
                      style={{ background: "#F6F5FF" }}>
                      <span className="text-[22px]">{EMOTION_LABEL[label] ?? "😶"}</span>
                      <span className="text-[11px] font-medium" style={{ color: "#3A3A4C" }}>{label}</span>
                      <div className="w-full h-1 rounded-full bg-white overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: PURPLE }} />
                      </div>
                      <span className="text-[10px]" style={{ color: "#8E8E93" }}>{count}회</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Insight / Tip card ── */}
          <div className="mx-4 mt-3 mb-2 rounded-3xl px-5 py-5 shadow-sm"
            style={{ background: NAVY }}>
            <p className="text-[11px] font-semibold mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>
              이달의 조언
            </p>
            <p className="text-[16px] font-bold text-white mb-2">{dominantInfo.tipTitle}</p>
            <p className="text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
              {dominantInfo.tip}
            </p>
            <div className="mt-4 pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
              <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                {monthLabel} 기준 · {thisMonth.length}건의 소비 분석
              </p>
            </div>
          </div>

          {/* ── AI 분석 섹션 ── */}
          <div className="mx-4 mt-3 mb-2">
            {!aiReport && (
              <button
                onClick={handleAIAnalysis}
                disabled={aiLoading}
                className="w-full py-4 rounded-3xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60"
                style={{ background: PURPLE, color: "white" }}>
                {aiLoading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    AI가 분석 중이에요...
                  </>
                ) : (
                  <>✨ AI 심층 분석 받기</>
                )}
              </button>
            )}

            {aiError && (
              <div className="bg-red-50 rounded-2xl px-4 py-3 text-center">
                <p className="text-[13px] text-red-500">{aiError}</p>
                <button onClick={handleAIAnalysis}
                  className="text-[12px] font-semibold mt-1 underline text-red-400">
                  다시 시도
                </button>
              </div>
            )}

            {aiReport && (
              <div className="space-y-3">
                {/* 전체 요약 */}
                <div className="bg-white rounded-3xl px-5 py-4 shadow-sm">
                  <p className="text-[11px] font-semibold mb-2" style={{ color: PURPLE }}>✨ AI 종합 분석</p>
                  <p className="text-[14px] leading-relaxed" style={{ color: "#1C1C1E" }}>{aiReport.summary}</p>
                </div>

                {/* 감정 패턴 */}
                <div className="bg-white rounded-3xl px-5 py-4 shadow-sm">
                  <p className="text-[11px] font-semibold mb-2" style={{ color: "#E85D75" }}>💭 감정 패턴</p>
                  <p className="text-[14px] leading-relaxed" style={{ color: "#1C1C1E" }}>{aiReport.emotionAnalysis}</p>
                </div>

                {/* 카테고리 인사이트 */}
                <div className="bg-white rounded-3xl px-5 py-4 shadow-sm">
                  <p className="text-[11px] font-semibold mb-2" style={{ color: "#F57C3A" }}>🛍 카테고리 인사이트</p>
                  <p className="text-[14px] leading-relaxed" style={{ color: "#1C1C1E" }}>{aiReport.topCategory}</p>
                </div>

                {/* 경고 패턴 (있을 때만) */}
                {aiReport.warningSign && (
                  <div className="rounded-3xl px-5 py-4" style={{ background: "#FFF0F3" }}>
                    <p className="text-[11px] font-semibold mb-2" style={{ color: "#E85D75" }}>⚠️ 주의 패턴</p>
                    <p className="text-[14px] leading-relaxed" style={{ color: "#E85D75" }}>{aiReport.warningSign}</p>
                  </div>
                )}

                {/* 다음 달 조언 */}
                <div className="rounded-3xl px-5 py-5" style={{ background: NAVY }}>
                  <p className="text-[11px] font-semibold mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>💌 다음 달을 위한 조언</p>
                  <p className="text-[14px] leading-relaxed text-white">{aiReport.advice}</p>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      <BottomNav />
    </div>
  );
}
