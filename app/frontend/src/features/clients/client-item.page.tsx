import {
  PREFERRED_COMMUNICATION_LABELS,
  type ClientDetail,
} from "@/shared/domain/client";
import { formatDate } from "@/shared/lib/date/format-date";
import { useBreadcrumb } from "@/shared/lib/react/use-breadcrumb";
import { ROUTES } from "@/shared/model/routes";
import { AsyncWrapper } from "@/shared/ui/async-wrapper";
import { BackButton } from "@/shared/ui/back-button";
import { Group, Stack, Text, Title } from "@mantine/core";
import { useParams } from "react-router";
import { useClientQuery } from "./use-client-query";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <Group gap="xs">
      <Text size="sm" c="dimmed" w={160}>
        {label}
      </Text>
      <Text size="sm">{value}</Text>
    </Group>
  );
}

function ClientOverview({ client }: { client: ClientDetail }) {
  return (
    <Stack gap="xs">
      <Field label="Phone" value={client.phone ?? "—"} />
      <Field label="Email" value={client.email ?? "—"} />
      <Field label="Birth Date" value={formatDate(client.birthDate)} />
      <Field
        label="Preferred Communication"
        value={PREFERRED_COMMUNICATION_LABELS[client.preferredCommunication]}
      />
      <Field
        label="Therapist"
        value={
          client.therapist
            ? `${client.therapist.firstName} ${client.therapist.lastName}`
            : "—"
        }
      />
      <Field label="Medical Notes" value={client.medicalNotes ?? "—"} />
      <Field label="Created" value={formatDate(client.createdAt)} />
    </Stack>
  );
}

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
        render={(client) => <ClientOverview client={client} />}
      />
    </Stack>
  );
}
