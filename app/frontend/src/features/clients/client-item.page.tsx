import { useBreadcrumb } from "@/shared/lib/react/use-breadcrumb";
import { ROUTES } from "@/shared/model/routes";
import { AsyncWrapper } from "@/shared/ui/async-wrapper";
import { BackButton } from "@/shared/ui/back-button";
import { Tabs } from "@/shared/ui/tabs/tabs";
import { Stack, Text, Title } from "@mantine/core";
import {
  IconCalendar,
  IconClipboardList,
  IconUserCircle,
} from "@tabler/icons-react";
import { useParams } from "react-router";
import { ClientAppointmentsTable } from "./ui/client-appointments-table";
import { ClientOverview } from "./ui/client-overview";
import { useClientQuery } from "./use-client-query";

export function ClientItemPage() {
  const { id } = useParams<{ id: string }>();
  const query = useClientQuery(id!);
  const client = query.data;

  useBreadcrumb(client ? `${client.firstName} ${client.lastName}` : "Client");

  return (
    <Stack gap="sm" align="flex-start" style={{ width: "100%" }}>
      <BackButton to={ROUTES.CLIENTS} />
      <Title>
        {client ? `${client.firstName} ${client.lastName}` : "Client"}
      </Title>
      <AsyncWrapper
        query={query}
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
              >
                Appointments
              </Tabs.Tab>
              <Tabs.Tab
                value="treatment-plans"
                leftSection={<IconClipboardList size={16} />}
              >
                Treatment Plans
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="overview" pt="md">
              <ClientOverview client={client} />
            </Tabs.Panel>

            <Tabs.Panel value="appointments" pt="md">
              <ClientAppointmentsTable clientId={client.id} />
            </Tabs.Panel>

            <Tabs.Panel value="treatment-plans" pt="md">
              <Text size="sm" c="dimmed">
                No treatment plans yet.
              </Text>
            </Tabs.Panel>
          </Tabs>
        )}
      />
    </Stack>
  );
}
