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
} from "@tabler/icons-react";
import { useParams } from "react-router";
import { useClientQuery } from "./model/use-client-query";
import { useClientItemCounts } from "./model/use-client-item-counts";
import { ClientAppointmentsTable } from "./ui/client-appointments-table";
import { ClientOverview } from "./ui/client-overview";
import { ClientTreatmentPlansTable } from "./ui/client-treatment-plans-table";

export function ClientItemPage() {
  const { id } = useParams<{ id: string }>();
  const query = useClientQuery(id!);
  const client = query.data;

  useBreadcrumb(client ? `${client.firstName} ${client.lastName}` : "Client");

  const counts = useClientItemCounts(Number(id));

  return (
    <Stack gap="sm" align="flex-start" style={{ width: "100%" }}>
      <BackButton to={ROUTES.CLIENTS} />
      <Group gap="xs">
        <Title>
          {client ? `${client.firstName} ${client.lastName}` : "Client"}
        </Title>
        {client?.deletedAt && (
          <Badge color="error" variant="light">
            Deleted
          </Badge>
        )}
      </Group>
      <AsyncWrapper
        query={query}
        errorMessage="Client not found"
        render={(client) => (
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
              <ClientOverview client={client} />
            </Tabs.Panel>

            <Tabs.Panel value="appointments" pt="lg">
              <ClientAppointmentsTable clientId={client.id} />
            </Tabs.Panel>

            <Tabs.Panel value="treatment-plans" pt="lg">
              <ClientTreatmentPlansTable clientId={client.id} />
            </Tabs.Panel>
          </Tabs>
        )}
      />
    </Stack>
  );
}
