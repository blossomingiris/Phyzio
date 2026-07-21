import { SPECIALITY_ICONS } from "@/shared/domain/therapist";
import { useBreadcrumb } from "@/shared/lib/react/use-breadcrumb";
import { ROUTES } from "@/shared/model/routes";
import { AsyncWrapper } from "@/shared/ui/async-wrapper";
import { BackButton } from "@/shared/ui/back-button";
import { TabCountBadge } from "@/shared/ui/tabs/tab-count-badge";
import { Tabs } from "@/shared/ui/tabs/tabs";
import { Badge, Group, Stack, Title } from "@mantine/core";
import {
  IconCalendar,
  IconClipboardList,
  IconUserCircle,
  IconUsers,
} from "@tabler/icons-react";
import { useParams } from "react-router";
import { useTherapistQuery } from "./model/use-therapist-query";
import { useTherapistItemCounts } from "./model/use-therapist-item-counts";
import { TherapistAppointmentsTable } from "./ui/therapist-appointments-table";
import { TherapistClientsTable } from "./ui/therapist-clients-table";
import { TherapistOverview } from "./ui/therapist-overview";
import { TherapistTreatmentPlansTable } from "./ui/therapist-treatment-plans-table";

export function TherapistItemPage() {
  const { id } = useParams<{ id: string }>();
  const query = useTherapistQuery(id!);
  const therapist = query.data;

  useBreadcrumb(
    therapist ? `${therapist.firstName} ${therapist.lastName}` : "Therapist",
  );

  const counts = useTherapistItemCounts(Number(id));

  const SpecialityIcon = therapist
    ? SPECIALITY_ICONS[therapist.speciality]
    : null;

  return (
    <Stack gap="sm" align="flex-start" style={{ width: "100%" }}>
      <BackButton to={ROUTES.THERAPISTS} />
      <Group gap="xs">
        {SpecialityIcon && (
          <SpecialityIcon
            size={24}
            stroke={1.5}
            color="var(--mantine-color-dimmed)"
          />
        )}
        <Title>
          {therapist
            ? `${therapist.firstName} ${therapist.lastName}`
            : "Therapist"}
        </Title>
        {therapist?.deletedAt && (
          <Badge color="error" variant="light">
            Deleted
          </Badge>
        )}
      </Group>
      <AsyncWrapper
        query={query}
        errorMessage="Therapist not found"
        render={(therapist) => (
          <Tabs
            defaultValue="overview"
            keepMounted={false}
            style={{ width: "100%" }}
          >
            <Tabs.List>
              <Tabs.Tab
                value="overview"
                leftSection={<IconUserCircle size={16} />}
              >
                Overview
              </Tabs.Tab>
              <Tabs.Tab
                value="clients"
                leftSection={<IconUsers size={16} />}
                rightSection={<TabCountBadge count={counts.clients} />}
              >
                Clients
              </Tabs.Tab>
              <Tabs.Tab
                value="appointments"
                leftSection={<IconCalendar size={16} />}
                rightSection={<TabCountBadge count={counts.appointments} />}
              >
                Appointments
              </Tabs.Tab>
              <Tabs.Tab
                value="treatment-plans"
                leftSection={<IconClipboardList size={16} />}
                rightSection={<TabCountBadge count={counts.treatmentPlans} />}
              >
                Treatment Plans
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="overview" pt="xl">
              <TherapistOverview therapist={therapist} />
            </Tabs.Panel>

            <Tabs.Panel value="clients" pt="lg">
              <TherapistClientsTable therapistId={therapist.id} />
            </Tabs.Panel>

            <Tabs.Panel value="appointments" pt="lg">
              <TherapistAppointmentsTable therapistId={therapist.id} />
            </Tabs.Panel>

            <Tabs.Panel value="treatment-plans" pt="lg">
              <TherapistTreatmentPlansTable therapistId={therapist.id} />
            </Tabs.Panel>
          </Tabs>
        )}
      />
    </Stack>
  );
}
