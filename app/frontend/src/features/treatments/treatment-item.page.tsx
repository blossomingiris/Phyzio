import { TREATMENT_CATEGORY_ICONS } from "@/shared/domain/treatment";
import { useBreadcrumb } from "@/shared/lib/react/use-breadcrumb";
import { ROUTES } from "@/shared/model/routes";
import { AsyncWrapper } from "@/shared/ui/async-wrapper";
import { BackButton } from "@/shared/ui/back-button";
import { Badge, Group, Stack, Title } from "@mantine/core";
import { useParams } from "react-router";
import { useTreatmentQuery } from "./model/use-treatment-query";
import { TreatmentOverview } from "./ui/treatment-overview";

export function TreatmentItemPage() {
  const { id } = useParams<{ id: string }>();
  const query = useTreatmentQuery(id!);
  const treatment = query.data;

  useBreadcrumb(treatment ? treatment.name : "Treatment");

  const CategoryIcon = treatment
    ? TREATMENT_CATEGORY_ICONS[treatment.category]
    : null;

  return (
    <Stack gap="sm" align="flex-start" style={{ width: "100%" }}>
      <BackButton to={ROUTES.TREATMENTS} />
      <Group gap="xs">
        {CategoryIcon && (
          <CategoryIcon
            size={24}
            stroke={1.5}
            color="var(--mantine-color-dimmed)"
          />
        )}
        <Title>{treatment ? treatment.name : "Treatment"}</Title>
        {treatment && (
          <Badge
            color={treatment.isActive ? "success" : "error"}
            variant="light"
          >
            {treatment.isActive ? "Active" : "Inactive"}
          </Badge>
        )}
      </Group>
      <AsyncWrapper
        query={query}
        render={(treatment) => <TreatmentOverview treatment={treatment} />}
      />
    </Stack>
  );
}
