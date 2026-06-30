import type { DrizzleClient } from "#app/database/drizzle-client.ts";
import { treatmentPlans } from "#app/database/schemas.ts";
import { BadRequestError, UnprocessableEntityError } from "#app/errors/httpErrors.ts";
import { eq } from "drizzle-orm";
import type {
  UpdateTreatmentPlanAdminBody,
  UpdateTreatmentPlanStatusAdminBody,
} from "./treatment-plans.admin.dto.ts";
import { TERMINAL_STATUSES, TreatmentPlansService } from "./treatment-plans.resource.service.ts";

export class TreatmentPlansAdminService {
  private db: DrizzleClient;
  private planService: TreatmentPlansService;

  constructor(db: DrizzleClient, planService: TreatmentPlansService) {
    this.db = db;
    this.planService = planService;
  }

  async update(id: number, data: UpdateTreatmentPlanAdminBody) {
    await this.db
      .update(treatmentPlans)
      .set({
        therapistId: data.therapistId,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate:
          data.endDate !== undefined
            ? data.endDate
              ? new Date(data.endDate)
              : null
            : undefined,
        updatedAt: new Date(),
      })
      .where(eq(treatmentPlans.id, id));

    return (await this.planService.one({ id }))!;
  }

  async cancel(id: number, data: UpdateTreatmentPlanStatusAdminBody) {
    const [row] = await this.db
      .select({ status: treatmentPlans.status })
      .from(treatmentPlans)
      .where(eq(treatmentPlans.id, id));

    if (TERMINAL_STATUSES.includes(row!.status)) {
      throw new UnprocessableEntityError(`Plan is already ${row!.status}`);
    }

    let cancellationNote: string | null = null;
    if (data.cancellationReason === "other") {
      if (!data.cancellationNote) {
        throw new BadRequestError(
          "cancellationNote is required when cancellationReason is 'other'",
          [
            {
              field: "cancellationNote",
              message: "is required when cancellationReason is 'other'",
            },
          ],
        );
      }
      cancellationNote = data.cancellationNote;
    }

    await this.db
      .update(treatmentPlans)
      .set({
        status: "cancelled",
        cancellationReason: data.cancellationReason,
        cancellationNote,
        updatedAt: new Date(),
      })
      .where(eq(treatmentPlans.id, id));

    return (await this.planService.one({ id }))!;
  }
}
