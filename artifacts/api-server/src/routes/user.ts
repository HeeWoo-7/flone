import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, userProfilesTable } from "@workspace/db";
import {
  UpdateUserProfileBody,
  CompleteOnboardingBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function getOrCreateProfile() {
  const profiles = await db.select().from(userProfilesTable).limit(1);
  if (profiles.length > 0) return profiles[0];
  const [created] = await db
    .insert(userProfilesTable)
    .values({ nickname: "플로네", onboardingCompleted: false })
    .returning();
  return created;
}

router.get("/user/profile", async (_req, res): Promise<void> => {
  const profile = await getOrCreateProfile();
  res.json({
    id: profile.id,
    nickname: profile.nickname,
    spendingGoal: profile.spendingGoal ?? null,
    onboardingCompleted: profile.onboardingCompleted,
    createdAt: profile.createdAt.toISOString(),
  });
});

router.put("/user/profile", async (req, res): Promise<void> => {
  const parsed = UpdateUserProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const profile = await getOrCreateProfile();

  const updates: { nickname?: string; spendingGoal?: number | null } = {};
  if (parsed.data.nickname != null) updates.nickname = parsed.data.nickname;
  if (parsed.data.spendingGoal !== undefined) updates.spendingGoal = parsed.data.spendingGoal;

  const [updated] = await db
    .update(userProfilesTable)
    .set(updates)
    .where(eq(userProfilesTable.id, profile.id))
    .returning();

  res.json({
    id: updated.id,
    nickname: updated.nickname,
    spendingGoal: updated.spendingGoal ?? null,
    onboardingCompleted: updated.onboardingCompleted,
    createdAt: updated.createdAt.toISOString(),
  });
});

router.post("/user/onboarding", async (req, res): Promise<void> => {
  const parsed = CompleteOnboardingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const profile = await getOrCreateProfile();

  const [updated] = await db
    .update(userProfilesTable)
    .set({
      nickname: parsed.data.nickname,
      spendingGoal: parsed.data.spendingGoal ?? null,
      onboardingCompleted: true,
    })
    .where(eq(userProfilesTable.id, profile.id))
    .returning();

  res.json({
    id: updated.id,
    nickname: updated.nickname,
    spendingGoal: updated.spendingGoal ?? null,
    onboardingCompleted: updated.onboardingCompleted,
    createdAt: updated.createdAt.toISOString(),
  });
});

export default router;
