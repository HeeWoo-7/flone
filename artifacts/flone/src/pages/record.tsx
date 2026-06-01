import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  useCreateSpendingRecord,
  getListSpendingRecordsQueryKey,
  getGetSpendingSummaryQueryKey,
  useGetUserProfile,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

// ─── Constants ───────────────────────────────────────────────────────────────

const NAVY = "#1E1A5E";
const PURPLE = "#5B5BE6";

const CATEGORIES = [
  { id: "음식", Icon: IconFork },
  { id: "카페/간식", Icon: IconCafe },
  { id: "뷰티", Icon: IconBeauty },
  { id: "의류", Icon: IconCloth },
  { id: "여행/숙박", Icon: IconTravel },
  { id: "문화/여가", Icon: IconCulture },
  { id: "생필품", Icon: IconEssential },
  { id: "전자제품", Icon: IconElec },
  { id: "주거/통신", Icon: IconHome },
  { id: "경조/선물", Icon: IconGift },
  { id: "교육/학습", Icon: IconBook },
  { id: "자녀/육아", Icon: IconBaby },
  { id: "교통/자동차", Icon: IconTransport },
  { id: "의료", Icon: IconMed },
  { id: "기타", Icon: IconMore },
];

const WHY_REASONS = [
  "기분 전환이 필요했어요",
  "광고나 SNS를 보고 궁금해졌어요",
  "다른 사람이 사용해서 사고 싶었어요",
  "미리 계획한 구매예요",
];

const EMOTIONS = [
  { id: "스트레스", label: "스트레스\n받았어요" },
  { id: "화남", label: "화가났어요" },
  { id: "불안", label: "불안했어요" },
  { id: "우울", label: "우울했어요" },
  { id: "무기력", label: "그저그랬어요" },
  { id: "외로움", label: "외로웠어요" },
  { id: "기쁨", label: "기뻤어요" },
  { id: "설렘", label: "설렜어요" },
];

// ─── Category Icons ───────────────────────────────────────────────────────────

function Ico({ d, children }: { d?: string; children?: React.ReactNode }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {d ? <path d={d} /> : children}
    </svg>
  );
}
function IconFork() { return <Ico><line x1="8" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="16" y2="21" /><path d="M8 8 Q12 4 16 8" /></Ico>; }
function IconCafe() { return <Ico><path d="M6 2v6a6 6 0 0 0 12 0V2" /><rect x="4" y="20" width="16" height="2" rx="1" /></Ico>; }
function IconBeauty() { return <Ico><rect x="9" y="2" width="6" height="5" rx="2" /><rect x="7" y="7" width="10" height="14" rx="2" /><line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" /></Ico>; }
function IconCloth() { return <Ico d="M3 6l3-3 6 3 6-3 3 3-3 3v11H6V9L3 6z" />; }
function IconTravel() { return <Ico d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.93 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.88 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />; }
function IconCulture() { return <Ico><circle cx="12" cy="12" r="2" /><circle cx="12" cy="4" r="2" /><circle cx="12" cy="20" r="2" /><circle cx="4" cy="8" r="2" /><circle cx="20" cy="8" r="2" /><circle cx="4" cy="16" r="2" /><circle cx="20" cy="16" r="2" /></Ico>; }
function IconEssential() { return <Ico><path d="M12 2C9 2 7 4 7 7v1H5v14h14V8h-2V7c0-3-2-5-5-5z" /><circle cx="12" cy="14" r="2" /></Ico>; }
function IconElec() { return <Ico><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></Ico>; }
function IconHome() { return <Ico d="M22 16.92V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v13a1 1 0 0 0 1 1h4l3 3 3-3h4a1 1 0 0 0 1-1z" />; }
function IconGift() { return <Ico><polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" /></Ico>; }
function IconBook() { return <Ico><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></Ico>; }
function IconBaby() { return <Ico><circle cx="12" cy="8" r="4" /><path d="M8 14s-4 2-4 6h16c0-4-4-6-4-6" /></Ico>; }
function IconTransport() { return <Ico><rect x="1" y="3" width="15" height="13" rx="2" /><path d="M16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></Ico>; }
function IconMed() { return <Ico d="M22 12h-4l-3 9L9 3l-3 9H2" />; }
function IconMore() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="5" cy="12" r="1.5" fill="currentColor" /><circle cx="12" cy="12" r="1.5" fill="currentColor" /><circle cx="19" cy="12" r="1.5" fill="currentColor" /></svg>; }

function CatIcon({ id }: { id: string }) {
  const cat = CATEGORIES.find(c => c.id === id);
  if (!cat) return <IconMore />;
  const { Icon } = cat;
  return <Icon />;
}

// ─── Emotion Faces ────────────────────────────────────────────────────────────

function EmotionFace({ id, size = 44 }: { id: string; size?: number }) {
  const s = size;
  const cx = s / 2, cy = s / 2, r = s * 0.45;
  const eyeY = cy - s * 0.06;
  const eyeOff = s * 0.15;
  const cheekColor = "#F9A8C9";
  const strokeColor = "#3D3580";

  const faces: Record<string, React.ReactNode> = {
    스트레스: <>
      <circle cx={cx - eyeOff} cy={eyeY} r={s * 0.06} fill={strokeColor} />
      <circle cx={cx + eyeOff} cy={eyeY} r={s * 0.06} fill={strokeColor} />
      <path d={`M${cx - s * 0.18} ${cy + s * 0.2} Q${cx} ${cy + s * 0.1} ${cx + s * 0.18} ${cy + s * 0.2}`} stroke={strokeColor} strokeWidth={s * 0.04} fill="none" strokeLinecap="round" />
      <path d={`M${cx - s * 0.22} ${cy - s * 0.22} L${cx - s * 0.1} ${cy - s * 0.15}`} stroke={strokeColor} strokeWidth={s * 0.05} strokeLinecap="round" />
      <path d={`M${cx + s * 0.22} ${cy - s * 0.22} L${cx + s * 0.1} ${cy - s * 0.15}`} stroke={strokeColor} strokeWidth={s * 0.05} strokeLinecap="round" />
    </>,
    화남: <>
      <circle cx={cx - eyeOff} cy={eyeY} r={s * 0.06} fill={strokeColor} />
      <circle cx={cx + eyeOff} cy={eyeY} r={s * 0.06} fill={strokeColor} />
      <path d={`M${cx - s * 0.18} ${cy + s * 0.22} Q${cx} ${cy + s * 0.12} ${cx + s * 0.18} ${cy + s * 0.22}`} stroke={strokeColor} strokeWidth={s * 0.04} fill="none" strokeLinecap="round" />
      <path d={`M${cx - s * 0.24} ${cy - s * 0.2} L${cx - s * 0.08} ${cy - s * 0.1}`} stroke={strokeColor} strokeWidth={s * 0.055} strokeLinecap="round" />
      <path d={`M${cx + s * 0.24} ${cy - s * 0.2} L${cx + s * 0.08} ${cy - s * 0.1}`} stroke={strokeColor} strokeWidth={s * 0.055} strokeLinecap="round" />
    </>,
    불안: <>
      <circle cx={cx - eyeOff} cy={eyeY - s * 0.02} r={s * 0.07} fill={strokeColor} />
      <circle cx={cx + eyeOff} cy={eyeY - s * 0.02} r={s * 0.07} fill={strokeColor} />
      <path d={`M${cx - s * 0.16} ${cy + s * 0.2} Q${cx - s * 0.06} ${cy + s * 0.13} ${cx} ${cy + s * 0.2} Q${cx + s * 0.06} ${cy + s * 0.13} ${cx + s * 0.16} ${cy + s * 0.2}`} stroke={strokeColor} strokeWidth={s * 0.04} fill="none" strokeLinecap="round" />
      <path d={`M${cx - s * 0.1} ${cy - s * 0.22} L${cx + s * 0.1} ${cy - s * 0.22}`} stroke={strokeColor} strokeWidth={s * 0.05} strokeLinecap="round" />
    </>,
    우울: <>
      <circle cx={cx - eyeOff} cy={eyeY} r={s * 0.05} fill={strokeColor} />
      <circle cx={cx + eyeOff} cy={eyeY} r={s * 0.05} fill={strokeColor} />
      <path d={`M${cx - s * 0.18} ${cy + s * 0.24} Q${cx} ${cy + s * 0.16} ${cx + s * 0.18} ${cy + s * 0.24}`} stroke={strokeColor} strokeWidth={s * 0.04} fill="none" strokeLinecap="round" />
      <ellipse cx={cx + s * 0.22} cy={cy + s * 0.05} rx={s * 0.04} ry={s * 0.06} fill="#8BBCF0" opacity={0.8} />
    </>,
    무기력: <>
      <line x1={cx - s * 0.2} y1={eyeY} x2={cx - s * 0.07} y2={eyeY} stroke={strokeColor} strokeWidth={s * 0.06} strokeLinecap="round" />
      <line x1={cx + s * 0.07} y1={eyeY} x2={cx + s * 0.2} y2={eyeY} stroke={strokeColor} strokeWidth={s * 0.06} strokeLinecap="round" />
      <line x1={cx - s * 0.16} y1={cy + s * 0.22} x2={cx + s * 0.16} y2={cy + s * 0.22} stroke={strokeColor} strokeWidth={s * 0.04} strokeLinecap="round" />
    </>,
    외로움: <>
      <circle cx={cx - eyeOff} cy={eyeY} r={s * 0.055} fill={strokeColor} />
      <circle cx={cx + eyeOff} cy={eyeY} r={s * 0.055} fill={strokeColor} />
      <path d={`M${cx - s * 0.16} ${cy + s * 0.2} Q${cx} ${cy + s * 0.14} ${cx + s * 0.16} ${cy + s * 0.2}`} stroke={strokeColor} strokeWidth={s * 0.04} fill="none" strokeLinecap="round" />
      <circle cx={cx + s * 0.3} cy={cy + s * 0.18} r={s * 0.045} fill="#8BBCF0" opacity={0.8} />
    </>,
    기쁨: <>
      <path d={`M${cx - s * 0.18} ${cy - s * 0.04} Q${cx - s * 0.14} ${cy - s * 0.14} ${cx - s * 0.1} ${cy - s * 0.04}`} stroke={strokeColor} strokeWidth={s * 0.05} fill="none" strokeLinecap="round" />
      <path d={`M${cx + s * 0.1} ${cy - s * 0.04} Q${cx + s * 0.14} ${cy - s * 0.14} ${cx + s * 0.18} ${cy - s * 0.04}`} stroke={strokeColor} strokeWidth={s * 0.05} fill="none" strokeLinecap="round" />
      <path d={`M${cx - s * 0.18} ${cy + s * 0.14} Q${cx} ${cy + s * 0.28} ${cx + s * 0.18} ${cy + s * 0.14}`} stroke={strokeColor} strokeWidth={s * 0.04} fill="none" strokeLinecap="round" />
      <circle cx={cx - s * 0.25} cy={cy + s * 0.1} r={s * 0.06} fill={cheekColor} opacity={0.7} />
      <circle cx={cx + s * 0.25} cy={cy + s * 0.1} r={s * 0.06} fill={cheekColor} opacity={0.7} />
    </>,
    설렘: <>
      <path d={`M${cx - s * 0.18} ${cy - s * 0.04} Q${cx - s * 0.14} ${cy - s * 0.14} ${cx - s * 0.1} ${cy - s * 0.04}`} stroke={strokeColor} strokeWidth={s * 0.05} fill="none" strokeLinecap="round" />
      <path d={`M${cx + s * 0.1} ${cy - s * 0.04} Q${cx + s * 0.14} ${cy - s * 0.14} ${cx + s * 0.18} ${cy - s * 0.04}`} stroke={strokeColor} strokeWidth={s * 0.05} fill="none" strokeLinecap="round" />
      <path d={`M${cx - s * 0.18} ${cy + s * 0.14} Q${cx} ${cy + s * 0.28} ${cx + s * 0.18} ${cy + s * 0.14}`} stroke={strokeColor} strokeWidth={s * 0.04} fill="none" strokeLinecap="round" />
      <circle cx={cx - s * 0.25} cy={cy + s * 0.1} r={s * 0.06} fill={cheekColor} opacity={0.7} />
      <circle cx={cx + s * 0.25} cy={cy + s * 0.1} r={s * 0.06} fill={cheekColor} opacity={0.7} />
      <polygon points={`${cx + s * 0.3},${cy - s * 0.35} ${cx + s * 0.36},${cy - s * 0.22} ${cx + s * 0.22},${cy - s * 0.26}`} fill="#C084FC" />
    </>,
  };

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      <circle cx={cx} cy={cy} r={r} fill="#ECEAFC" />
      {faces[id] ?? faces["무기력"]}
    </svg>
  );
}

// ─── Shared Layout Components ─────────────────────────────────────────────────

function NavBar({ onBack, progress }: { onBack: () => void; progress: number }) {
  return (
    <div>
      <div className="flex items-center justify-center relative px-5 pt-12 pb-3">
        <button onClick={onBack} className="absolute left-5 top-12 p-1" data-testid="button-back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="text-[17px] font-semibold text-white">소비 기록</span>
      </div>
      <div className="h-[3px] mx-5 rounded-full mb-1" style={{ background: "rgba(255,255,255,0.2)" }}>
        <motion.div className="h-full rounded-full bg-white"
          initial={false} animate={{ width: `${progress}%` }} transition={{ duration: 0.35 }} />
      </div>
    </div>
  );
}

function ScallopDivider() {
  return (
    <div className="w-full overflow-hidden leading-none" style={{ height: 14 }}>
      <svg viewBox="0 0 390 14" preserveAspectRatio="none" width="100%" height="14">
        <path d={Array.from({ length: 14 }, (_, i) => {
          const x = i * 28;
          return `M${x},0 Q${x + 14},14 ${x + 28},0`;
        }).join(" ")} fill="white" />
      </svg>
    </div>
  );
}

function MiniReceipt({ amount, itemName, category }: { amount: string; itemName: string; category: string }) {
  const parsed = parseInt(amount) || 0;
  return (
    <div>
      <ScallopDivider />
      <div className="bg-white px-5 pt-4 pb-5">
        <p className="text-center text-[13px]" style={{ color: "#8E8E93" }}>{category}</p>
        <p className="text-center text-[16px] font-bold mt-0.5" style={{ color: "#1C1C1E" }}>{itemName || "소비 항목"}</p>
        <p className="text-center text-[28px] font-bold mt-1" style={{ color: "#1C1C1E" }}>
          {new Intl.NumberFormat("ko-KR").format(parsed)}원
        </p>
        <p className="text-center text-[12px] mt-1" style={{ color: "#C7C7CC" }}>
          {new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

type Step = "entry" | "category" | "fixed" | "why" | "emotion" | "done";

export default function Record() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const createRecord = useCreateSpendingRecord();
  const { data: profile } = useGetUserProfile();

  const [step, setStep] = useState<Step>("entry");
  const [showCategorySheet, setShowCategorySheet] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  const [amount, setAmount] = useState("");
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("생필품");
  const [whyReason, setWhyReason] = useState("");
  const [emotion, setEmotion] = useState("");
  const [emotionNote, setEmotionNote] = useState("");

  const [savedAnalysis, setSavedAnalysis] = useState<{
    shortPattern: string;
    advice: string;
    emotion: string;
    category: string;
    amount: number;
  } | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const submitRecord = (opts: { emotion: string; reason: string }) => {
    const note = [itemName.trim(), emotionNote.trim()].filter(Boolean).join(" — ") || null;
    const amountNum = parseInt(amount);
    createRecord.mutate(
      { data: { amount: amountNum, category, emotion: opts.emotion, reason: opts.reason, note } },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: getListSpendingRecordsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetSpendingSummaryQueryKey() });
          const raw = data.analysis as { shortPattern?: string; personalizedAdvice?: string } | undefined;
          setSavedAnalysis({
            shortPattern: raw?.shortPattern ?? opts.emotion + " 상태에서 한 소비예요",
            advice: raw?.personalizedAdvice ?? "",
            emotion: opts.emotion,
            category,
            amount: amountNum,
          });
          setStep("done");
          setTimeout(() => setShowPopup(true), 900);
        },
      }
    );
  };

  const backTo = (s: Step) => () => setStep(s);

  const PROGRESS: Record<Step, number> = {
    entry: 16, category: 33, fixed: 50, why: 66, emotion: 83, done: 100,
  };

  // ── Step: Entry (amount + item name, already styled with navy) ──────────────
  if (step === "entry") {
    const amountNum = parseInt(amount);
    const valid = amount !== "" && !isNaN(amountNum) && amountNum > 0;

    return (
      <div className="min-h-screen flex flex-col" style={{ background: NAVY }}>
        <NavBar onBack={() => setLocation("/home")} progress={PROGRESS.entry} />

        {/* Receipt-style input card */}
        <div className="flex-1 flex flex-col">
          <ScallopDivider />
          <div className="bg-white flex-1 flex flex-col">
            <div className="px-6 pt-6 pb-4 border-b border-dashed border-gray-200">
              {/* Category tag */}
              <button onClick={() => setShowCategorySheet(true)}
                className="flex items-center gap-1.5 mx-auto mb-3 px-3 py-1 rounded-full"
                style={{ background: "#F0EFFE" }}>
                <div style={{ color: "#5B5BE6" }}><CatIcon id={category} /></div>
                <span className="text-[13px] font-semibold" style={{ color: "#5B5BE6" }}>{category}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5B5BE6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
              </button>

              {/* Amount input */}
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <input
                  type="number" value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0"
                  data-testid="input-amount"
                  inputMode="numeric"
                  className="text-center text-[42px] font-bold focus:outline-none bg-transparent w-full"
                  style={{ color: amount ? "#1C1C1E" : "#C7C7CC" }}
                />
              </div>
              <p className="text-center text-[16px] font-medium" style={{ color: "#8E8E93" }}>원</p>
            </div>

            {/* Item name */}
            <div className="px-6 pt-4 pb-2">
              <input
                type="text" value={itemName}
                onChange={e => setItemName(e.target.value)}
                placeholder="상품명 또는 메모 (선택)"
                data-testid="input-item-name"
                className="w-full text-center text-[16px] focus:outline-none bg-transparent border-b border-gray-100 pb-2"
                style={{ color: "#1C1C1E" }}
              />
            </div>

            <div className="flex-1" />

            <div className="px-5 pb-8" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 20px) + 12px)" }}>
              <button onClick={() => { if (valid) { setShowTooltip(true); setStep("category"); } }}
                disabled={!valid} data-testid="button-entry-next"
                className="w-full py-4 rounded-2xl font-bold text-[17px] text-white transition-all active:scale-95 disabled:opacity-40"
                style={{ background: PURPLE }}>
                다음
              </button>
            </div>
          </div>
        </div>

        {/* Category Sheet */}
        <CategorySheet
          open={showCategorySheet}
          current={category}
          onSelect={c => { setCategory(c); setShowCategorySheet(false); }}
          onClose={() => setShowCategorySheet(false)}
        />
      </div>
    );
  }

  // ── Step: Category confirmation ──────────────────────────────────────────────
  if (step === "category") {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: NAVY }}>
        <NavBar onBack={backTo("entry")} progress={PROGRESS.category} />
        <MiniReceipt amount={amount} itemName={itemName} category={category} />

        <div className="flex-1 bg-[#F2F2F7] px-5 pt-6">
          <div className="flex items-center justify-between">
            <span className="text-[20px] font-bold" style={{ color: "#1C1C1E" }}>카테고리</span>
            <div className="relative">
              {showTooltip && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="absolute -top-10 right-0 bg-gray-800 text-white text-[12px] rounded-xl px-3 py-1.5 whitespace-nowrap z-10"
                  style={{ pointerEvents: "none" }}>
                  정확한 카테고리인가요?
                  <div className="absolute bottom-[-5px] right-8 w-2.5 h-2.5 bg-gray-800 rotate-45" />
                </motion.div>
              )}
              <button onClick={() => { setShowTooltip(false); setShowCategorySheet(true); }}
                data-testid="button-open-category"
                className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2.5 shadow-sm">
                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "#ECEAFC", color: "#3D3580" }}>
                  <CatIcon id={category} />
                </div>
                <span className="text-[15px] font-semibold" style={{ color: "#1C1C1E" }}>{category}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-[#F2F2F7] px-5 pb-8 pt-4" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 20px) + 12px)" }}>
          <button onClick={() => setStep("fixed")} data-testid="button-category-confirm"
            className="w-full py-4 rounded-2xl font-bold text-[17px] text-white active:scale-95 transition-all"
            style={{ background: PURPLE }}>
            정확해요
          </button>
        </div>

        <CategorySheet open={showCategorySheet} current={category}
          onSelect={c => { setCategory(c); setShowCategorySheet(false); }}
          onClose={() => setShowCategorySheet(false)} />
      </div>
    );
  }

  // ── Step: Fixed expense ───────────────────────────────────────────────────────
  if (step === "fixed") {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: NAVY }}>
        <NavBar onBack={backTo("category")} progress={PROGRESS.fixed} />
        <MiniReceipt amount={amount} itemName={itemName} category={category} />

        <div className="flex-1 bg-[#F2F2F7] px-5 pt-6 pb-8" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 20px) + 12px)" }}>
          <h2 className="text-[24px] font-bold mb-5" style={{ color: "#1C1C1E" }}>고정 지출인가요?</h2>
          <div className="space-y-3">
            {["아니요", "네"].map((label) => (
              <button key={label}
                onClick={() => setStep("why")}
                data-testid={`button-fixed-${label}`}
                className="w-full py-4 bg-white rounded-2xl text-[17px] font-semibold text-center transition-all active:scale-95"
                style={{ color: "#1C1C1E" }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Step: Why ────────────────────────────────────────────────────────────────
  if (step === "why") {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: NAVY }}>
        <NavBar onBack={backTo("fixed")} progress={PROGRESS.why} />
        <MiniReceipt amount={amount} itemName={itemName} category={category} />

        <div className="flex-1 bg-[#F2F2F7] px-5 pt-6 pb-8" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 20px) + 12px)" }}>
          <h2 className="text-[22px] font-bold mb-5" style={{ color: "#1C1C1E" }}>왜 이 소비를 했다고 느끼세요?</h2>
          <div className="space-y-3">
            {WHY_REASONS.map((r) => (
              <button key={r}
                onClick={() => {
                  setWhyReason(r);
                  if (r === "미리 계획한 구매예요") {
                    submitRecord({ emotion: "계획소비", reason: r });
                  } else {
                    setStep("emotion");
                  }
                }}
                data-testid={`button-why-${r}`}
                disabled={createRecord.isPending}
                className="w-full py-4 rounded-2xl text-[15px] font-semibold text-center transition-all active:scale-95 border-2"
                style={{
                  background: "white",
                  color: "#1C1C1E",
                  borderColor: whyReason === r ? PURPLE : "transparent",
                }}>
                {r}
              </button>
            ))}
          </div>
          {createRecord.isPending && (
            <p className="text-center text-sm mt-4" style={{ color: "#8E8E93" }}>저장 중...</p>
          )}
        </div>
      </div>
    );
  }

  // ── Step: Emotion ─────────────────────────────────────────────────────────────
  if (step === "emotion") {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: NAVY }}>
        <NavBar onBack={backTo("why")} progress={PROGRESS.emotion} />
        <MiniReceipt amount={amount} itemName={itemName} category={category} />

        <div className="flex-1 bg-[#F2F2F7] px-5 pt-5 pb-4 flex flex-col">
          <h2 className="text-[20px] font-bold mb-4" style={{ color: "#1C1C1E" }}>
            이 소비는 어떤 기분에서 시작됐나요?
          </h2>

          <div style={{ overflowX: "auto", overflowY: "visible", marginLeft: -20, marginRight: -20 }}
            className="pb-3 mb-4">
            <div style={{ display: "flex", gap: 16, paddingLeft: 20, paddingRight: 20, width: "max-content" }}>
              {EMOTIONS.map((em) => (
                <button key={em.id} onClick={() => setEmotion(em.id)}
                  data-testid={`button-emotion-${em.id}`}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0, background: "none", border: "none", padding: 0, cursor: "pointer" }}
                  className="transition-all active:scale-95">
                  <div className="rounded-full transition-all"
                    style={{
                      outline: emotion === em.id ? `2.5px solid ${PURPLE}` : "2.5px solid transparent",
                      outlineOffset: 2,
                    }}>
                    <EmotionFace id={em.id} size={52} />
                  </div>
                  <span style={{ fontSize: 11, textAlign: "center", lineHeight: 1.3, color: "#3A3A4C", whiteSpace: "pre-line", maxWidth: 56 }}>
                    {em.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <p className="text-[14px] font-semibold mb-2" style={{ color: "#1C1C1E" }}>
            소비 직전의 상황과 기분에 대해 기록해요.
          </p>
          <textarea
            value={emotionNote}
            onChange={e => setEmotionNote(e.target.value)}
            placeholder="여기에 입력해주세요."
            rows={4}
            data-testid="input-emotion-note"
            className="w-full bg-white rounded-2xl border border-gray-100 px-4 py-3 text-[14px] resize-none focus:outline-none mb-4"
            style={{ color: "#1C1C1E" }}
          />

          <button
            onClick={() => { if (emotion) submitRecord({ emotion, reason: whyReason }); }}
            disabled={!emotion || createRecord.isPending}
            data-testid="button-complete"
            className="w-full py-4 rounded-2xl font-bold text-[17px] text-white transition-all active:scale-95 disabled:opacity-40"
            style={{ background: PURPLE }}>
            {createRecord.isPending ? "저장 중..." : "완료"}
          </button>
        </div>
      </div>
    );
  }

  // ── Step: Done + Popup ────────────────────────────────────────────────────────
  const doneEmotion = savedAnalysis?.emotion ?? emotion;
  const isPositive = ["기쁨", "설렘", "계획소비"].includes(doneEmotion);

  const doneTitleMap: Record<string, string> = {
    스트레스: "스트레스 속에서도\n기록해줘서 고마워요",
    화남: "화가 났던 순간도\n솔직하게 기록했어요",
    불안: "불안했지만 마주한\n용기가 대단해요",
    우울: "우울한 하루도\n기록으로 남겼어요",
    무기력: "그저그런 날에도\n기록을 이어갔어요",
    외로움: "외로운 마음을\n솔직하게 적어줬어요",
    기쁨: "기쁜 날의 소비도\n소중한 기록이에요",
    설렘: "설레는 마음의 소비,\n잘 기록되었어요",
    계획소비: "계획한 소비를\n잘 실천했어요",
  };

  const doneTitle = doneTitleMap[doneEmotion] ?? "소비가 잘\n기록되었어요";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: NAVY }}>
      {/* Top bar */}
      <div className="flex items-center justify-center pt-12 pb-3 px-5">
        <span className="text-[17px] font-semibold text-white">소비 기록</span>
      </div>

      {/* Done card */}
      <ScallopDivider />
      <div className="flex-1 bg-[#F2F2F7] flex flex-col items-center justify-center px-8 pb-24">
        <motion.div className="flex flex-col items-center text-center"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>

          {/* Checkmark ring */}
          <div className="mb-6 relative">
            <div className="w-28 h-28 rounded-full flex items-center justify-center"
              style={{ background: isPositive ? "#E8F5E9" : "#ECEAFC" }}>
              <EmotionFace id={doneEmotion} size={72} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: PURPLE }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>

          <h2 className="text-[22px] font-bold mb-3 leading-snug" style={{ color: "#1C1C1E", whiteSpace: "pre-line" }}>
            {doneTitle}
          </h2>

          {savedAnalysis && (
            <div className="bg-white rounded-2xl px-5 py-4 text-left w-full max-w-[320px]">
              <p className="text-[11px] font-semibold mb-1" style={{ color: PURPLE }}>오늘의 소비</p>
              <p className="text-[15px] font-bold mb-0.5" style={{ color: "#1C1C1E" }}>
                {new Intl.NumberFormat("ko-KR").format(savedAnalysis.amount)}원 · {savedAnalysis.category}
              </p>
              <p className="text-[13px]" style={{ color: "#8E8E93" }}>{savedAnalysis.shortPattern}</p>
            </div>
          )}

          <p className="text-[13px] mt-5" style={{ color: "#8E8E93" }}>
            잠시 후 AI 분석 결과를 보여드릴게요
          </p>
        </motion.div>
      </div>

      <AnimatePresence>
        {showPopup && savedAnalysis && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.45 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40" />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] rounded-t-3xl z-50 overflow-hidden"
              style={{ background: "white", paddingBottom: "calc(env(safe-area-inset-bottom, 20px) + 16px)" }}>

              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-gray-200" />
              </div>

              {/* Header strip */}
              <div className="px-6 pt-3 pb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: isPositive ? "#E8F5E9" : "#ECEAFC" }}>
                    <EmotionFace id={doneEmotion} size={40} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold" style={{ color: PURPLE }}>AI 소비 분석</p>
                    <p className="text-[15px] font-bold leading-snug" style={{ color: "#1C1C1E" }}>
                      {savedAnalysis.shortPattern}
                    </p>
                  </div>
                </div>

                {/* Advice card */}
                <div className="rounded-2xl px-4 py-4 mb-4" style={{ background: "#F6F5FF" }}>
                  <p className="text-[12px] font-semibold mb-2" style={{ color: PURPLE }}>
                    {profile?.nickname ? `${profile.nickname}에게 드리는 조언` : "나에게 드리는 조언"}
                  </p>
                  <p className="text-[14px] leading-relaxed" style={{ color: "#3A3A4C" }}>
                    {savedAnalysis.advice}
                  </p>
                </div>

                <p className="text-[12px] text-center mb-4" style={{ color: "#C7C7CC" }}>
                  {new Intl.NumberFormat("ko-KR").format(savedAnalysis.amount)}원 · {savedAnalysis.category} · {doneEmotion}
                </p>

                <button onClick={() => setLocation("/home")} data-testid="button-popup-confirm"
                  className="w-full py-4 rounded-2xl font-bold text-[16px] text-white active:scale-95 transition-all"
                  style={{ background: PURPLE }}>
                  확인
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Category Sheet ────────────────────────────────────────────────────────────

function CategorySheet({ open, current, onSelect, onClose }: {
  open: boolean; current: string;
  onSelect: (id: string) => void; onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40" onClick={onClose} />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-white rounded-t-3xl z-50"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 20px) + 12px)" }}>
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>
            <h3 className="text-[17px] font-bold text-center pt-2 pb-4" style={{ color: "#1C1C1E" }}>카테고리</h3>
            <div className="h-px bg-gray-100 mx-5 mb-5" />
            <div className="grid grid-cols-3 gap-y-6 px-6">
              {CATEGORIES.map(({ id, Icon }) => (
                <button key={id} onClick={() => onSelect(id)} data-testid={`cat-${id}`}
                  className="flex flex-col items-center gap-2 transition-all active:scale-95">
                  <div className="w-[56px] h-[56px] rounded-full flex items-center justify-center"
                    style={{
                      background: current === id ? "#3D3580" : "#ECEAFC",
                      color: current === id ? "white" : "#3D3580",
                    }}>
                    <Icon />
                  </div>
                  <span className="text-[12px] text-center leading-tight" style={{ color: "#3A3A4C" }}>{id}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
