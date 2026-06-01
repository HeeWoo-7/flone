import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useCompleteOnboarding } from "@workspace/api-client-react";
import slide1Img from "@assets/image_1780240609862.png";
import slide2Img from "@assets/image_1780240627731.png";
import slide3Img from "@assets/image_1780240636600.png";

const INTRO_SLIDES = [
  {
    img: slide1Img,
    title: "왜 썼는지 알면\n소비가 달라집니다.",
    subtitle: "감정과 소비의 연결고리를 발견해보세요.",
    bullets: ["반복되는 소비 패턴 발견", "충동 소비 원인 파악", "나만의 소비 습관 이해"],
    footer: "변화는 소비를 기록하는 순간부터 시작됩니다.",
  },
  {
    img: slide2Img,
    title: "소비보다 감정을\n기록해보세요.",
    subtitle: "얼마를 썼는지보다\n어떤 이유로 소비했는지 기록합니다.",
    bullets: [],
    footer: null,
  },
  {
    img: slide3Img,
    title: "당신은 돈을 쓴 걸까요,\n감정을 달랜 걸까요?",
    subtitle: "소비를 기록하는 것만으로는\n습관을 바꾸기 어렵습니다.",
    body: "플론은 소비 당시의 감정과 계기를 함께 기록해\n나만의 소비 패턴을 발견하도록 돕습니다.",
    bullets: [],
    footer: null,
  },
];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [phase, setPhase] = useState<"intro" | "nickname" | "goal">("intro");
  const [slideIndex, setSlideIndex] = useState(0);
  const [dragDir, setDragDir] = useState(0);
  const [nickname, setNickname] = useState("");
  const [goal, setGoal] = useState("");
  const completeOnboarding = useCompleteOnboarding();

  const goToSlide = (next: number) => {
    if (next < 0 || next >= INTRO_SLIDES.length) return;
    setDragDir(next > slideIndex ? -1 : 1);
    setSlideIndex(next);
  };

  const handleSubmit = (skipGoal = false) => {
    completeOnboarding.mutate(
      { data: { nickname: nickname.trim() || "플로네", spendingGoal: !skipGoal && goal ? parseInt(goal) : null } },
      { onSuccess: () => setLocation("/home") }
    );
  };

  if (phase === "intro") {
    const slide = INTRO_SLIDES[slideIndex];
    const isLast = slideIndex === INTRO_SLIDES.length - 1;

    return (
      <div className="min-h-screen flex flex-col bg-[#F2F2F7]"
        style={{ paddingTop: "env(safe-area-inset-top, 44px)" }}>
        <div className="flex-1 flex flex-col items-center px-6 pt-6 overflow-hidden">
          <AnimatePresence mode="wait" custom={dragDir}>
            <motion.div
              key={slideIndex}
              custom={dragDir}
              variants={{
                enter: (d: number) => ({ opacity: 0, x: d < 0 ? 60 : -60 }),
                center: { opacity: 1, x: 0 },
                exit: (d: number) => ({ opacity: 0, x: d < 0 ? -60 : 60 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: "easeInOut" }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.x < -50) goToSlide(slideIndex + 1);
                else if (info.offset.x > 50) goToSlide(slideIndex - 1);
              }}
              className="flex flex-col items-center w-full select-none cursor-grab active:cursor-grabbing"
              style={{ touchAction: "pan-y" }}
            >
              <div className="w-52 h-52 flex items-center justify-center mb-6">
                <img src={slide.img} alt="" className="w-full h-full object-contain" draggable={false} />
              </div>

              <h1 className="text-[26px] font-bold text-center leading-tight mb-3"
                style={{ color: "#1C1C1E", whiteSpace: "pre-line" }}>
                {slide.title}
              </h1>

              <p className="text-[15px] text-center leading-snug mb-4"
                style={{ color: "#6B6B7B", whiteSpace: "pre-line" }}>
                {slide.subtitle}
              </p>

              {slide.bullets.length > 0 && (
                <div className="flex flex-col gap-1.5 mb-4 text-[15px]" style={{ color: "#6B6B7B" }}>
                  {slide.bullets.map((b) => (
                    <p key={b} className="text-center">• {b}</p>
                  ))}
                </div>
              )}

              {"body" in slide && slide.body && (
                <p className="text-[15px] text-center font-medium leading-relaxed"
                  style={{ color: "#3A3A4C", whiteSpace: "pre-line" }}>
                  {slide.body}
                </p>
              )}

              {slide.footer && (
                <p className="text-[15px] text-center font-semibold mt-2" style={{ color: "#3A3A4C" }}>
                  {slide.footer}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 py-5">
          {INTRO_SLIDES.map((_, i) => (
            <button key={i} onClick={() => goToSlide(i)}
              className="rounded-full transition-all duration-300"
              style={{ width: i === slideIndex ? 20 : 8, height: 8, background: i === slideIndex ? "#5B5BE6" : "#C7C7D9" }}
            />
          ))}
        </div>

        <div className="px-5 space-y-3" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 20px) + 12px)" }}>
          <div className="flex items-center gap-3 rounded-2xl px-4 py-3" style={{ background: "#E9E9EF" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-[10px] font-bold"
              style={{ background: "#5B5BE6" }}>
              FLONE
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium" style={{ color: "#8E8E93" }}>이미 계정이 있으신가요?</p>
              <p className="text-[13px] font-semibold truncate" style={{ color: "#3A3A4C" }}>로그인하고 이어서 기록하기</p>
            </div>
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#C7C7D9" }}>
              <span style={{ color: "#5B5BE6", fontSize: 14, fontWeight: 700 }}>›</span>
            </div>
          </div>

          <button
            onClick={() => isLast ? setPhase("nickname") : goToSlide(slideIndex + 1)}
            data-testid="button-start"
            className="w-full py-4 rounded-2xl font-bold text-[17px] text-white transition-all active:scale-95"
            style={{ background: "#5B5BE6" }}>
            시작하기
          </button>
        </div>
      </div>
    );
  }

  if (phase === "nickname") {
    return (
      <div className="min-h-screen flex flex-col bg-background px-6"
        style={{ paddingTop: "env(safe-area-inset-top, 44px)" }}>
        <motion.div className="flex flex-col flex-1 justify-center w-full gap-8"
          initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">어떻게 불러드릴까요?</h2>
            <p className="text-muted-foreground text-sm">나만의 닉네임을 정해보세요</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">닉네임</label>
            <input type="text" value={nickname} onChange={e => setNickname(e.target.value)}
              placeholder="닉네임을 입력하세요" data-testid="input-nickname"
              className="w-full px-4 py-3.5 rounded-2xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(260,60%,75%)] transition-all" />
          </div>
          <button onClick={() => setPhase("goal")} data-testid="button-next"
            className="w-full py-4 rounded-2xl font-semibold text-white text-base transition-all active:scale-95"
            style={{ background: "#5B5BE6" }}>
            다음
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background px-6"
      style={{ paddingTop: "env(safe-area-inset-top, 44px)" }}>
      <motion.div className="flex flex-col flex-1 justify-center w-full gap-8"
        initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">월 소비 목표를<br />설정해볼까요?</h2>
          <p className="text-muted-foreground text-sm">건너뛰어도 괜찮아요</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">월 소비 목표 (원)</label>
          <input type="number" value={goal} onChange={e => setGoal(e.target.value)}
            placeholder="예: 300000" data-testid="input-goal"
            className="w-full px-4 py-3.5 rounded-2xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(260,60%,75%)] transition-all" />
        </div>
        <div className="space-y-3">
          <button onClick={() => handleSubmit(false)} disabled={completeOnboarding.isPending}
            data-testid="button-complete"
            className="w-full py-4 rounded-2xl font-semibold text-white text-base transition-all active:scale-95 disabled:opacity-60"
            style={{ background: "#5B5BE6" }}>
            {completeOnboarding.isPending ? "저장 중..." : "완료"}
          </button>
          <button onClick={() => handleSubmit(true)} data-testid="button-skip"
            className="w-full py-3 rounded-2xl font-medium text-muted-foreground text-sm">
            건너뛰기
          </button>
        </div>
      </motion.div>
    </div>
  );
}
