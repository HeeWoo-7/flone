import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import { db, spendingRecordsTable } from "@workspace/db";
import { generateMonthlyReport } from "../lib/geminiAnalysis";

const router: IRouter = Router();

// GET /api/report/monthly?year=2025&month=6
router.get("/report/monthly", async (req, res): Promise<void> => {
  const year = Number(req.query.year);
  const month = Number(req.query.month);

  if (!year || !month || month < 1 || month > 12) {
    res.status(400).json({ error: "year, month 파라미터가 필요해요 (month: 1~12)" });
    return;
  }

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  const all = await db
    .select()
    .from(spendingRecordsTable)
    .orderBy(desc(spendingRecordsTable.createdAt));

  const records = all.filter(r => {
    const d = new Date(r.createdAt);
    return d >= startDate && d <= endDate;
  });

  if (records.length === 0) {
    res.json({ empty: true, message: "이번 달 소비 기록이 없어요" });
    return;
  }

  const totalAmount = records.reduce((sum, r) => sum + r.amount, 0);

  const report = await generateMonthlyReport({
    year,
    month,
    totalAmount,
    spendingList: records.map(r => ({
      date: r.createdAt.toISOString().slice(0, 10),
      amount: r.amount,
      category: r.category,
      note: r.note ?? "",
      emotion: r.emotion,
      reason: r.reason ?? "",
    })),
  });

  res.json({ year, month, totalAmount, report });
});

export default router;
