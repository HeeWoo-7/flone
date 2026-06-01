import { useState } from "react";
import { motion } from "framer-motion";
import {
  useGetUserProfile,
  getGetUserProfileQueryKey,
  useUpdateUserProfile,
  useGetSpendingSummary,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatKRW } from "@/lib/format";
import { BottomNav } from "@/components/bottom-nav";

export default function MyPage() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading: profileLoading } = useGetUserProfile();
  const { data: summary } = useGetSpendingSummary();
  const updateProfile = useUpdateUserProfile();

  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState("");
  const [goal, setGoal] = useState("");

  const handleEdit = () => {
    setNickname(profile?.nickname ?? "");
    setGoal(profile?.spendingGoal?.toString() ?? "");
    setEditing(true);
  };

  const handleSave = () => {
    updateProfile.mutate(
      { data: { nickname: nickname.trim() || undefined, spendingGoal: goal ? parseInt(goal) : null } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetUserProfileQueryKey() });
          setEditing(false);
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-background pb-28 max-w-[390px] mx-auto">
      {/* Header */}
      <div className="px-6 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-foreground">마이 페이지</h1>
      </div>

      {/* Profile card */}
      <div className="px-6 mb-4">
        <motion.div className="bg-gradient-to-br from-[hsl(260,55%,87%)] to-[hsl(290,45%,84%)] rounded-3xl p-5 shadow-sm"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {!editing ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[hsl(260,40%,45%)] mb-0.5">닉네임</p>
                <p className="text-xl font-bold text-[hsl(260,60%,25%)]">{profile?.nickname ?? "플로네"}</p>
                {profile?.spendingGoal && (
                  <p className="text-xs text-[hsl(260,40%,45%)] mt-1">
                    월 목표: {formatKRW(profile.spendingGoal)}
                  </p>
                )}
              </div>
              <button onClick={handleEdit} data-testid="button-edit-profile"
                className="text-xs font-medium text-[hsl(260,60%,40%)] bg-white/60 px-3 py-1.5 rounded-full">
                수정
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <input value={nickname} onChange={e => setNickname(e.target.value)}
                placeholder="닉네임" data-testid="input-edit-nickname"
                className="w-full px-3 py-2.5 rounded-xl border border-white/50 bg-white/70 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(260,60%,75%)]" />
              <input value={goal} onChange={e => setGoal(e.target.value)}
                type="number" placeholder="월 소비 목표 (원)" data-testid="input-edit-goal"
                className="w-full px-3 py-2.5 rounded-xl border border-white/50 bg-white/70 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(260,60%,75%)]" />
              <div className="flex gap-2">
                <button onClick={handleSave} disabled={updateProfile.isPending}
                  data-testid="button-save-profile"
                  className="flex-1 py-2 rounded-xl text-xs font-semibold text-[hsl(260,80%,20%)] disabled:opacity-60"
                  style={{ background: "hsl(260 65% 78%)" }}>
                  {updateProfile.isPending ? "저장 중..." : "저장"}
                </button>
                <button onClick={() => setEditing(false)} data-testid="button-cancel-edit"
                  className="flex-1 py-2 rounded-xl text-xs font-medium text-[hsl(260,40%,45%)] bg-white/60">
                  취소
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Summary stats */}
      {summary && (
        <div className="px-6 space-y-4">
          <h2 className="text-base font-semibold text-foreground">소비 통계</h2>

          {/* Top stats */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div className="bg-card rounded-3xl p-4 border border-card-border shadow-sm"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
              <p className="text-xs text-muted-foreground mb-1">총 소비</p>
              <p className="text-lg font-bold text-foreground">{formatKRW(summary.totalAmount)}</p>
              <p className="text-xs text-muted-foreground">{summary.totalCount}건</p>
            </motion.div>
            <motion.div className="bg-card rounded-3xl p-4 border border-card-border shadow-sm"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}>
              <p className="text-xs text-muted-foreground mb-1">주요 감정</p>
              <p className="text-lg font-bold text-foreground">{summary.topEmotion || "-"}</p>
              <p className="text-xs text-muted-foreground">{summary.topCategory || "-"}</p>
            </motion.div>
          </div>

          {/* Overall insight */}
          {summary.overallInsight && (
            <motion.div className="bg-card rounded-3xl p-4 border border-card-border shadow-sm"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <p className="text-xs font-semibold text-[hsl(260,60%,50%)] mb-1">종합 인사이트</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{summary.overallInsight}</p>
            </motion.div>
          )}

          {/* Emotion breakdown */}
          {summary.emotionBreakdown.length > 0 && (
            <motion.div className="bg-card rounded-3xl p-4 border border-card-border shadow-sm"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <p className="text-sm font-semibold text-foreground mb-3">감정별 소비</p>
              <div className="space-y-2">
                {summary.emotionBreakdown.map((item) => {
                  const maxAmount = summary.emotionBreakdown[0]?.amount ?? 1;
                  const pct = Math.round((item.amount / maxAmount) * 100);
                  return (
                    <div key={item.label} className="space-y-1" data-testid={`stat-emotion-${item.label}`}>
                      <div className="flex justify-between text-xs">
                        <span className="text-foreground font-medium">{item.label}</span>
                        <span className="text-muted-foreground">{formatKRW(item.amount)} ({item.count}건)</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{
                          width: `${pct}%`,
                          background: "hsl(260 60% 75%)"
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Category breakdown */}
          {summary.categoryBreakdown.length > 0 && (
            <motion.div className="bg-card rounded-3xl p-4 border border-card-border shadow-sm"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <p className="text-sm font-semibold text-foreground mb-3">카테고리별 소비</p>
              <div className="space-y-2">
                {summary.categoryBreakdown.map((item) => {
                  const maxAmount = summary.categoryBreakdown[0]?.amount ?? 1;
                  const pct = Math.round((item.amount / maxAmount) * 100);
                  return (
                    <div key={item.label} className="space-y-1" data-testid={`stat-category-${item.label}`}>
                      <div className="flex justify-between text-xs">
                        <span className="text-foreground font-medium">{item.label}</span>
                        <span className="text-muted-foreground">{formatKRW(item.amount)}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{
                          width: `${pct}%`,
                          background: "hsl(330 50% 78%)"
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {summary.totalCount === 0 && (
            <p className="text-center text-muted-foreground text-sm py-6">기록이 없어요. 첫 소비를 기록해보세요!</p>
          )}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
