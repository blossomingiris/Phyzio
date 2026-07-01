import "dotenv/config";

import bcrypt from "bcrypt";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";

import { AUTH_BCRYPT_ROUNDS } from "#app/config/auth.ts";
import { APP_DATABASE_URL } from "#app/config/db.ts";
import {
  appointments,
  clients,
  therapists,
  treatmentPlanItems,
  treatmentPlans,
  treatments,
  users,
  type WorkingHours,
} from "#app/database/schemas.ts";

const DEFAULT_PASSWORD = "password123";
const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, AUTH_BCRYPT_ROUNDS);

const fullDays: WorkingHours = {
  mon: [{ start: "09:00", end: "17:00" }],
  tue: [{ start: "09:00", end: "17:00" }],
  wed: [{ start: "09:00", end: "17:00" }],
  thu: [{ start: "09:00", end: "17:00" }],
  fri: [{ start: "09:00", end: "15:00" }],
};

const partTime: WorkingHours = {
  mon: [{ start: "12:00", end: "18:00" }],
  wed: [{ start: "12:00", end: "18:00" }],
  fri: [{ start: "12:00", end: "18:00" }],
};

const splitShift: WorkingHours = {
  tue: [
    { start: "08:00", end: "12:00" },
    { start: "14:00", end: "18:00" },
  ],
  thu: [
    { start: "08:00", end: "12:00" },
    { start: "14:00", end: "18:00" },
  ],
};

function at(dayOffset: number, hour: number, minute = 0): Date {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  d.setDate(d.getDate() + dayOffset);
  return d;
}

async function seed() {
  const client = new Client({ connectionString: APP_DATABASE_URL });
  await client.connect();
  const db = drizzle(client);

  try {
    console.log("🧹 Clearing existing data...");
    await db.execute(sql`
      TRUNCATE TABLE
        ${appointments},
        ${treatmentPlanItems},
        ${treatmentPlans},
        ${treatments},
        ${clients},
        ${therapists},
        ${users}
      RESTART IDENTITY CASCADE
    `);

    console.log("👤 Seeding users...");
    const insertedUsers = await db
      .insert(users)
      .values([
        {
          firstName: "Admin",
          lastName: "User",
          email: "admin@phyzio.test",
          password: hashedPassword,
          role: "admin",
        },
        {
          firstName: "Sarah",
          lastName: "Connor",
          email: "sarah.connor@phyzio.test",
          password: hashedPassword,
          role: "therapist",
        },
        {
          firstName: "James",
          lastName: "Reed",
          email: "james.reed@phyzio.test",
          password: hashedPassword,
          role: "therapist",
        },
        {
          firstName: "Maria",
          lastName: "Lopez",
          email: "maria.lopez@phyzio.test",
          password: hashedPassword,
          role: "therapist",
        },
      ])
      .returning();

    const [, sarahU, jamesU, mariaU] = insertedUsers;

    console.log("🩺 Seeding therapists...");
    await db.insert(therapists).values([
      {
        userId: sarahU!.id,
        speciality: "orthopedic",
        phone: "+1-202-555-0142",
        workingHours: fullDays,
        isActive: true,
      },
      {
        userId: jamesU!.id,
        speciality: "sports",
        phone: "+1-202-555-0173",
        workingHours: splitShift,
        isActive: true,
      },
      {
        userId: mariaU!.id,
        speciality: "pediatric",
        phone: "+1-202-555-0199",
        workingHours: partTime,
        isActive: false,
      },
    ]);

    console.log("🧑‍🤝‍🧑 Seeding clients...");
    const insertedClients = await db
      .insert(clients)
      .values([
        {
          therapistId: sarahU!.id,
          firstName: "Emily",
          lastName: "Stone",
          birthDate: "1990-04-12",
          phone: "+1-202-555-0210",
          email: "emily.stone@example.com",
          origin: "whats_up",
          preferredCommunication: "whats_up",
          medicalNotes: "Recovering from ACL reconstruction.",
        },
        {
          therapistId: sarahU!.id,
          firstName: "David",
          lastName: "Park",
          birthDate: "1985-11-30",
          phone: "+1-202-555-0234",
          email: "david.park@example.com",
          origin: "phone",
          preferredCommunication: "phone",
          medicalNotes: "Chronic lower-back pain.",
        },
        {
          therapistId: jamesU!.id,
          firstName: "Olivia",
          lastName: "Brown",
          birthDate: "1998-07-22",
          phone: "+1-202-555-0256",
          email: "olivia.brown@example.com",
          origin: "walk_in",
          preferredCommunication: "email",
          medicalNotes: "Marathon runner, recurring shin splints.",
        },
        {
          therapistId: jamesU!.id,
          firstName: "Noah",
          lastName: "Williams",
          birthDate: "2002-01-15",
          phone: "+1-202-555-0278",
          email: "noah.williams@example.com",
          origin: "other",
          preferredCommunication: "email",
        },
        {
          therapistId: mariaU!.id,
          firstName: "Mia",
          lastName: "Garcia",
          birthDate: "2016-09-03",
          phone: "+1-202-555-0291",
          email: "mia.garcia@example.com",
          origin: "whats_up",
          preferredCommunication: "whats_up",
          medicalNotes: "Pediatric gait training.",
        },
        {
          // unassigned client (therapistId nullable)
          firstName: "Liam",
          lastName: "Johnson",
          birthDate: "1979-03-08",
          email: "liam.johnson@example.com",
          origin: "phone",
          preferredCommunication: "email",
        },
      ])
      .returning();

    const [emily, david, olivia, , mia] = insertedClients;

    console.log("💊 Seeding treatments...");
    const insertedTreatments = await db
      .insert(treatments)
      .values([
        {
          category: "ortho_sports",
          pricePerUnit: "80.00",
          quantity: 10,
          durationMinutes: 45,
        },
        {
          category: "ortho_sports",
          pricePerUnit: "95.00",
          quantity: 6,
          durationMinutes: 60,
        },
        {
          category: "neuro_vestibular",
          pricePerUnit: "110.00",
          quantity: 8,
          durationMinutes: 50,
        },
        {
          category: "pediatrics",
          pricePerUnit: "70.00",
          quantity: 12,
          durationMinutes: 40,
        },
        {
          category: "geriatrics",
          pricePerUnit: "75.00",
          quantity: 10,
          durationMinutes: 45,
        },
        {
          category: "evaluations",
          pricePerUnit: "120.00",
          quantity: 1,
          durationMinutes: 60,
        },
        {
          category: "general_tech",
          pricePerUnit: "60.00",
          quantity: 15,
          durationMinutes: 30,
          isActive: false,
        },
      ])
      .returning();

    const [orthoBasic, orthoAdv, neuro, pediatric, , evaluation] =
      insertedTreatments;

    console.log("📋 Seeding treatment plans...");
    const insertedPlans = await db
      .insert(treatmentPlans)
      .values([
        {
          therapistId: sarahU!.id,
          clientId: emily!.id,
          primaryDiagnostic: "Post-operative ACL rehabilitation",
          clinicalGoals: "Restore full knee range of motion and quad strength.",
          contraindications: "Avoid high-impact loading for first 6 weeks.",
          status: "in_progress",
          startDate: at(-21, 9),
        },
        {
          therapistId: sarahU!.id,
          clientId: david!.id,
          primaryDiagnostic: "Chronic lumbar strain",
          clinicalGoals: "Reduce pain and improve core stability.",
          status: "open",
          startDate: at(-7, 10),
        },
        {
          therapistId: jamesU!.id,
          clientId: olivia!.id,
          primaryDiagnostic: "Medial tibial stress syndrome",
          clinicalGoals: "Return to running pain-free within 8 weeks.",
          status: "completed",
          startDate: at(-60, 9),
          endDate: at(-5, 11),
        },
        {
          therapistId: mariaU!.id,
          clientId: mia!.id,
          primaryDiagnostic: "Developmental gait abnormality",
          clinicalGoals: "Improve heel-to-toe gait pattern.",
          status: "paused",
          startDate: at(-14, 12),
        },
      ])
      .returning();

    const [emilyPlan, davidPlan, oliviaPlan, miaPlan] = insertedPlans;

    console.log("🧾 Seeding treatment plan items...");
    await db.insert(treatmentPlanItems).values([
      {
        treatmentPlanId: emilyPlan!.id,
        treatmentId: orthoBasic!.id,
        quantityCompleted: 4,
      },
      {
        treatmentPlanId: emilyPlan!.id,
        treatmentId: evaluation!.id,
        quantityCompleted: 1,
      },
      {
        treatmentPlanId: davidPlan!.id,
        treatmentId: orthoAdv!.id,
        quantityCompleted: 0,
      },
      {
        treatmentPlanId: oliviaPlan!.id,
        treatmentId: orthoBasic!.id,
        quantityCompleted: 10,
      },
      {
        treatmentPlanId: miaPlan!.id,
        treatmentId: pediatric!.id,
        quantityCompleted: 3,
      },
      {
        treatmentPlanId: miaPlan!.id,
        treatmentId: neuro!.id,
        quantityCompleted: 1,
      },
    ]);

    console.log("📅 Seeding appointments...");
    await db.insert(appointments).values([
      {
        therapistId: sarahU!.id,
        clientId: emily!.id,
        treatmentPlanId: emilyPlan!.id,
        startedAt: at(-21, 9),
        endedAt: at(-21, 9, 45),
        status: "completed",
        notes: "Initial assessment and gentle mobilisation.",
      },
      {
        therapistId: sarahU!.id,
        clientId: emily!.id,
        treatmentPlanId: emilyPlan!.id,
        startedAt: at(2, 9),
        endedAt: at(2, 9, 45),
        status: "confirmed",
      },
      {
        therapistId: sarahU!.id,
        clientId: david!.id,
        treatmentPlanId: davidPlan!.id,
        startedAt: at(3, 10),
        endedAt: at(3, 11),
        status: "scheduled",
      },
      {
        therapistId: jamesU!.id,
        clientId: olivia!.id,
        treatmentPlanId: oliviaPlan!.id,
        startedAt: at(-5, 9),
        endedAt: at(-5, 9, 45),
        status: "completed",
        notes: "Final session, cleared for return to running.",
      },
      {
        therapistId: jamesU!.id,
        clientId: olivia!.id,
        startedAt: at(-10, 14),
        endedAt: at(-10, 14, 45),
        status: "no_show",
      },
      {
        therapistId: mariaU!.id,
        clientId: mia!.id,
        treatmentPlanId: miaPlan!.id,
        startedAt: at(-2, 12),
        endedAt: at(-2, 12, 40),
        status: "cancelled",
        cancellationReason: "client_request",
        cancellationNote: "Child unwell, rescheduling next week.",
      },
      {
        therapistId: sarahU!.id,
        clientId: emily!.id,
        startedAt: at(5, 11),
        endedAt: at(5, 11, 45),
        status: "requested",
      },
    ]);

    console.log("✅ Seed completed successfully.");
  } finally {
    await client.end();
  }
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
