import { AddButton } from "@/shared/components/add-button/add-button";
import { useHeaderActions } from "@/shared/hooks/use-header-actions";
import { Title } from "@mantine/core";

export function AppointmentsPage() {
  useHeaderActions(<AddButton label="New Appointment" />);

  return <Title order={1}>Appointments</Title>;
}
