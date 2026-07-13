import { useHeaderActions } from "@/shared/lib/use-header-actions";
import { AddButton } from "@/shared/ui/add-button";
import { Title } from "@mantine/core";

export function AppointmentListPage() {
  useHeaderActions(<AddButton label="New Appointment" />);

  return <Title>Appointments</Title>;
}
