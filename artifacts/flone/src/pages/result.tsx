import { useLocation, useRoute } from "wouter";
import { motion } from "framer-motion";
import {
  useGetSpendingRecord,
  getGetSpendingRecordQueryKey,
  useDeleteSpendingRecord,
  getListSpendingRecordsQueryKey,
  getGetSpendingSummaryQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatKRW, formatDate } from "@/lib/format";
import { AnalysisIllustration } from "@/components/illustrations";
import { BottomNav } from "@/components/bottom-nav";

const EMOTION_COLORS: Record<string, string> = {
  스트레스: "bg-red-100 text-red-600",
  슬픔: "bg-blue-100 text-blue-600",
  기쁨: "bg-yellow-100 text-yellow-600",
  외로움: "bg-indigo-100 text-indigo-500",
  무료함: "bg-gray-100 text-gray-500",
  보상: "bg-green-100 text-green-600",
};

const CATEGORY_COLORS: Record<string, string> = {
  음식: "bg-orange-100 text-orange-600",
  쇼핑: "bg-pink-100 text-pink-600",
  오락: "bg-purple-100 text-purple-600",
  뷰티: "bg-rose-100 text-rose-500",
  교통: "bg-cyan-100 text-cyan-600",
  카페: "bg-amber-100 text-amber-600",
};

export default function Result() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/result/:id");
  const queryClient = useQueryClient();
  const id = parseInt(params?.id ?? "0");

  const { data: record, isLoading } = useGetSpendingRecord(id, {
    query: { enabled: !!id, queryKey: getGetSpendingRecordQueryKey(id) }
  });
  const deleteRecord = useDeleteSpendingRecord();

  const handleDelete = () => {
    if (!confirm("이 기록을 삭제할까요?")) return;
    deleteRecord.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSpendingRecordsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetSpendingSummaryQueryKey() });
        setLocation("/home");
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center max-w-[390px] mx-auto">
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 animate-pulse">
            <AnalysisIllustration />
          </div>
          <p className="text-muted-foreground text-sm">분석 중...</p>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 max-w-[390px] mx-auto px-6">
        <p className="text-muted-foreground">기록을 찾을 수 없어요</p>
        <button onClick={() => setLocation("/home")} className="text-[hsl(260,60%,55%)] text-sm">홈으로</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28 max-w-[390px] mx-auto">
      {/* Header */}
      <div className="px-6 pt-12 pb-4">
        <button onClick={() => setLocation("/home")} data-testid="button-back"
          className="text-muted-foreground text-sm mb-4 flex items-center gap-1">
          ← 홈으로
        </button>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 flex-shrink-0">
            <AnalysisIllustration />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{formatDate(record.createdAt)}</p>
            <p className="text-3xl font-bold text-foreground">{formatKRW(record.amount)}</p>
            <div className="flex gap-1.5 mt-1 flex-wrap">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${CATEGORY_COLORS[record.category] ?? "bg-purple-100 text-purple-600"}`}>
                {record.category}
              </span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${EMOTION_COLORS[record.emotion] ?? "bg-purple-100 text-purple-600"}`}>
                {record.emotion}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Record details */}
      <div className="px-6 mb-4">
        <div className="bg-card rounded-3xl p-4 border border-card-border shadow-sm">
          <p className="text-xs text-muted-foreground mb-1">소비 이유</p>
          <p className="text-sm text-foreground">{record.reason}</p>
          {record.note && (
            <>
              <p className="text-xs text-muted-foreground mt-2 mb-1">메모</p>
              <p className="text-sm text-foreground">{record.note}</p>
            </>
          )}
        </div>
      </div>

      {/* Analysis */}
      {record.analysis && (
        <div className="px-6 space-y-3">
          <h2 className="text-base font-semibold text-foreground">AI 분석 결과</h2>

          <motion.div className="bg-card rounded-3xl p-4 border border-card-border shadow-sm"
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: "hsl(260 60% 85%)", color: "hsl(260 60% 30%)" }}>1</span>
              <p className="text-sm font-semibold text-foreground">소비 패턴</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{record.analysis.spendingPattern}</p>
          </motion.div>

          <motion.div className="bg-card rounded-3xl p-4 border border-card-border shadow-sm"
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: "hsl(330 50% 85%)", color: "hsl(330 60% 30%)" }}>2</span>
              <p className="text-sm font-semibold text-foreground">감정 트리거</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{record.analysis.emotionalTrigger}</p>
          </motion.div>

          <motion.div className="bg-card rounded-3xl p-4 border border-card-border shadow-sm"
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: "hsl(140 40% 82%)", color: "hsl(140 50% 25%)" }}>3</span>
              <p className="text-sm font-semibold text-foreground">맞춤 조언</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{record.analysis.personalizedAdvice}</p>
          </motion.div>
        </div>
      )}

      {/* Actions */}
      <div className="px-6 mt-6 space-y-3">
        <button onClick={() => setLocation("/record")} data-testid="button-new-record"
          className="w-full py-4 rounded-2xl font-semibold text-[hsl(260,80%,20%)] text-sm transition-all active:scale-95"
          style={{ background: "hsl(260 70% 80%)" }}>
          새 기록 추가
        </button>
        <button onClick={handleDelete} disabled={deleteRecord.isPending}
          data-testid="button-delete"
          className="w-full py-3 rounded-2xl font-medium text-destructive text-sm border border-destructive/30 transition-all active:scale-95 disabled:opacity-60">
          {deleteRecord.isPending ? "삭제 중..." : "이 기록 삭제"}
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
