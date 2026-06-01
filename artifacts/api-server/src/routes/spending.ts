import { Router, type IRouter } from "express";
import { eq, desc, sql } from "drizzle-orm";
import { db, spendingRecordsTable } from "@workspace/db";
import {
  CreateSpendingRecordBody,
  GetSpendingRecordParams,
  DeleteSpendingRecordParams,
  ListSpendingRecordsQueryParams,
} from "@workspace/api-zod";
import { generateEmotionalAnalysis } from "../lib/emotionAnalysis";

const router: IRouter = Router();

router.get("/spending/summary", async (req, res): Promise<void> => {
  const records = await db
    .select()
    .from(spendingRecordsTable)
    .orderBy(desc(spendingRecordsTable.createdAt));

  if (records.length === 0) {
    res.json({
      totalAmount: 0,
      totalCount: 0,
      topEmotion: "",
      topCategory: "",
      emotionBreakdown: [],
      categoryBreakdown: [],
      weeklyTrend: [],
      overallInsight: null,
    });
    return;
  }

  const totalAmount = records.reduce((sum, r) => sum + r.amount, 0);
  const totalCount = records.length;

  const emotionMap: Record<string, { count: number; amount: number }> = {};
  const categoryMap: Record<string, { count: number; amount: number }> = {};

  for (const r of records) {
    if (!emotionMap[r.emotion]) emotionMap[r.emotion] = { count: 0, amount: 0 };
    emotionMap[r.emotion].count++;
    emotionMap[r.emotion].amount += r.amount;

    if (!categoryMap[r.category])
      categoryMap[r.category] = { count: 0, amount: 0 };
    categoryMap[r.category].count++;
    categoryMap[r.category].amount += r.amount;
  }

  const emotionBreakdown = Object.entries(emotionMap)
    .map(([label, { count, amount }]) => ({ label, count, amount }))
    .sort((a, b) => b.amount - a.amount);

  const categoryBreakdown = Object.entries(categoryMap)
    .map(([label, { count, amount }]) => ({ label, count, amount }))
    .sort((a, b) => b.amount - a.amount);

  const topEmotion = emotionBreakdown[0]?.label ?? "";
  const topCategory = categoryBreakdown[0]?.label ?? "";

  // Weekly trend — last 4 weeks
  const weeklyMap: Record<string, { amount: number; count: number }> = {};
  for (const r of records) {
    const d = new Date(r.createdAt);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const weekKey = weekStart.toISOString().slice(0, 10);
    if (!weeklyMap[weekKey]) weeklyMap[weekKey] = { amount: 0, count: 0 };
    weeklyMap[weekKey].amount += r.amount;
    weeklyMap[weekKey].count++;
  }

  const weeklyTrend = Object.entries(weeklyMap)
    .map(([week, { amount, count }]) => ({ week, amount, count }))
    .sort((a, b) => a.week.localeCompare(b.week))
    .slice(-6);

  let overallInsight: string | null = null;
  if (topEmotion) {
    overallInsight = `가장 많은 감정 소비는 '${topEmotion}' 상태에서 발생했으며, '${topCategory}' 카테고리에 가장 많은 금액이 지출되었습니다. 감정 패턴을 인식하고 소비 습관을 개선해보세요.`;
  }

  res.json({
    totalAmount,
    totalCount,
    topEmotion,
    topCategory,
    emotionBreakdown,
    categoryBreakdown,
    weeklyTrend,
    overallInsight,
  });
});

router.get("/spending", async (req, res): Promise<void> => {
  const query = ListSpendingRecordsQueryParams.safeParse(req.query);
  const limit = query.success ? (query.data.limit ?? 20) : 20;
  const offset = query.success ? (query.data.offset ?? 0) : 0;

  const records = await db
    .select()
    .from(spendingRecordsTable)
    .orderBy(desc(spendingRecordsTable.createdAt))
    .limit(limit)
    .offset(offset);

  const result = records.map((r) => ({
    id: r.id,
    amount: r.amount,
    category: r.category,
    emotion: r.emotion,
    reason: r.reason,
    note: r.note ?? null,
    createdAt: r.createdAt.toISOString(),
    analysis: r.analysisSpendingPattern
      ? {
          spendingPattern: r.analysisSpendingPattern,
          emotionalTrigger: r.analysisEmotionalTrigger ?? "",
          personalizedAdvice: r.analysisPersonalizedAdvice ?? "",
        }
      : undefined,
  }));

  res.json(result);
});

router.post("/spending", async (req, res): Promise<void> => {
  const parsed = CreateSpendingRecordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const analysis = generateEmotionalAnalysis(parsed.data);

  const [record] = await db
    .insert(spendingRecordsTable)
    .values({
      amount: parsed.data.amount,
      category: parsed.data.category,
      emotion: parsed.data.emotion,
      reason: parsed.data.reason,
      note: parsed.data.note ?? null,
      analysisSpendingPattern: analysis.spendingPattern,
      analysisEmotionalTrigger: analysis.emotionalTrigger,
      analysisPersonalizedAdvice: analysis.personalizedAdvice,
    })
    .returning();

  res.status(201).json({
    id: record.id,
    amount: record.amount,
    category: record.category,
    emotion: record.emotion,
    reason: record.reason,
    note: record.note ?? null,
    createdAt: record.createdAt.toISOString(),
    analysis: {
      spendingPattern: record.analysisSpendingPattern!,
      emotionalTrigger: record.analysisEmotionalTrigger!,
      personalizedAdvice: record.analysisPersonalizedAdvice!,
    },
  });
});

router.get("/spending/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetSpendingRecordParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [record] = await db
    .select()
    .from(spendingRecordsTable)
    .where(eq(spendingRecordsTable.id, params.data.id));

  if (!record) {
    res.status(404).json({ error: "Record not found" });
    return;
  }

  res.json({
    id: record.id,
    amount: record.amount,
    category: record.category,
    emotion: record.emotion,
    reason: record.reason,
    note: record.note ?? null,
    createdAt: record.createdAt.toISOString(),
    analysis: record.analysisSpendingPattern
      ? {
          spendingPattern: record.analysisSpendingPattern,
          emotionalTrigger: record.analysisEmotionalTrigger ?? "",
          personalizedAdvice: record.analysisPersonalizedAdvice ?? "",
        }
      : undefined,
  });
});

router.delete("/spending/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteSpendingRecordParams.safeParse({
    id: parseInt(raw, 10),
  });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [deleted] = await db
    .delete(spendingRecordsTable)
    .where(eq(spendingRecordsTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Record not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
