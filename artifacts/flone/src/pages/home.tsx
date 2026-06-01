import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  useListSpendingRecords,
  getListSpendingRecordsQueryKey,
  useGetUserProfile,
  useDeleteSpendingRecord,
  getGetSpendingSummaryQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatKRW, formatDate } from "@/lib/format";
import { EmptyIllustration } from "@/components/illustrations";
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

export default function Home() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: profile } = useGetUserProfile();
  const { data: records, isLoading } = useListSpendingRecords({ limit: 20, offset: 0 });
  const deleteRecord = useDeleteSpendingRecord();

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("이 기록을 삭제할까요?")) return;
    deleteRecord.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSpendingRecordsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetSpendingSummaryQueryKey() });
      }
    });
  };

  return (
    <div className="min-h-screen bg-background pb-28 max-w-[390px] mx-auto">
      {/* Header */}
      <div className="px-6 pt-12 pb-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm text-muted-foreground">안녕하세요</p>
          <h1 className="text-2xl font-bold text-foreground">
            {profile?.nickname ?? "플로네"}님 <span className="text-[hsl(260,60%,65%)]">의 감정 지갑</span>
          </h1>
        </motion.div>
      </div>

      {/* Quick summary card */}
      {records && records.length > 0 && (
        <motion.div className="mx-6 mb-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="bg-gradient-to-br from-[hsl(260,60%,85%)] to-[hsl(290,50%,82%)] rounded-3xl p-4 shadow-sm">
            <p className="text-xs font-medium text-[hsl(260,50%,35%)] mb-1">총 기록</p>
            <p className="text-2xl font-bold text-[hsl(260,60%,28%)]">{records.length}건</p>
            <p className="text-xs text-[hsl(260,40%,45%)] mt-1">소비 패턴을 분석하고 있어요</p>
          </div>
        </motion.div>
      )}

      {/* Records list */}
      <div className="px-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">최근 기록</h2>
          <button onClick={() => setLocation("/record")} data-testid="button-add-record"
            className="text-xs font-medium text-[hsl(260,60%,55%)] bg-[hsl(260,50%,95%)] px-3 py-1.5 rounded-full">
            + 새 기록
          </button>
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card rounded-3xl p-4 shadow-sm animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && (!records || records.length === 0) && (
          <motion.div className="flex flex-col items-center py-12 gap-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="w-36 h-36">
              <EmptyIllustration />
            </div>
            <p className="text-muted-foreground text-sm text-center">
              아직 기록이 없어요<br/>첫 감정 소비를 기록해볼까요?
            </p>
            <button onClick={() => setLocation("/record")} data-testid="button-first-record"
              className="py-3 px-6 rounded-2xl font-semibold text-[hsl(260,80%,20%)] text-sm transition-all active:scale-95"
              style={{ background: "hsl(260 70% 80%)" }}>
              기록 시작하기
            </button>
          </motion.div>
        )}

        <div className="space-y-3">
          {records?.map((record, i) => (
            <motion.div key={record.id}
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              data-testid={`card-record-${record.id}`}
              className="bg-card rounded-3xl p-4 shadow-sm border border-card-border cursor-pointer hover-elevate"
              onClick={() => setLocation(`/result/${record.id}`)}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${CATEGORY_COLORS[record.category] ?? "bg-purple-100 text-purple-600"}`}>
                      {record.category}
                    </span>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${EMOTION_COLORS[record.emotion] ?? "bg-purple-100 text-purple-600"}`}>
                      {record.emotion}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-foreground">{formatKRW(record.amount)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{record.reason}</p>
                </div>
                <div className="flex flex-col items-end gap-2 ml-3">
                  <p className="text-xs text-muted-foreground">{formatDate(record.createdAt)}</p>
                  <button
                    onClick={(e) => handleDelete(record.id, e)}
                    data-testid={`button-delete-${record.id}`}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors p-1">
                    삭제
                  </button>
                </div>
              </div>
              {record.analysis && (
                <div className="mt-2 pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground line-clamp-1">{record.analysis.spendingPattern}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* FAB */}
      <button onClick={() => setLocation("/record")} data-testid="button-fab"
        className="fixed bottom-24 right-[calc(50%-180px)] w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl font-light transition-all active:scale-95 z-40"
        style={{ background: "hsl(260 70% 65%)", color: "white" }}>
        +
      </button>

      <BottomNav />
    </div>
  );
}
