import { TREATMENT_CATEGORY_LABELS } from "@/shared/domain/treatment";
import {
  NumberInput,
  Select,
  SimpleGrid,
  Switch,
  Textarea,
  TextInput,
} from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import {
  IconCash,
  IconClock,
  IconFileDescription,
  IconRoute,
  IconStack2,
  IconTag,
} from "@tabler/icons-react";
import type { TreatmentFormValues } from "../model/treatment-form-values";

const CATEGORY_OPTIONS = Object.entries(TREATMENT_CATEGORY_LABELS).map(
  ([value, label]) => ({ value, label }),
);

export function TreatmentFormFields({
  form,
  showActiveToggle = false,
}: {
  form: UseFormReturnType<TreatmentFormValues>;
  showActiveToggle?: boolean;
}) {
  return (
    <>
      <SimpleGrid cols={2} spacing="lg">
        <TextInput
          label="Name"
          placeholder="e.g. Sports Rehab Session"
          leftSection={<IconTag size={16} />}
          withAsterisk
          {...form.getInputProps("name")}
        />
        <Select
          label="Category"
          placeholder="Select a category"
          leftSection={<IconRoute size={16} />}
          data={CATEGORY_OPTIONS}
          allowDeselect={false}
          withAsterisk
          {...form.getInputProps("category")}
        />
      </SimpleGrid>

      <SimpleGrid cols={3} spacing="lg">
        <NumberInput
          label="Duration (min)"
          placeholder="30"
          leftSection={<IconClock size={16} />}
          min={1}
          withAsterisk
          {...form.getInputProps("durationMinutes")}
        />
        <NumberInput
          label="Quantity"
          placeholder="1"
          leftSection={<IconStack2 size={16} />}
          min={1}
          withAsterisk
          {...form.getInputProps("quantity")}
        />
        <TextInput
          label="Price per Unit"
          placeholder="50.00"
          leftSection={<IconCash size={16} />}
          withAsterisk
          {...form.getInputProps("pricePerUnit")}
        />
      </SimpleGrid>

      <Textarea
        label="Description"
        placeholder="Optional details about this treatment"
        leftSection={<IconFileDescription size={16} />}
        leftSectionProps={{
          style: { alignItems: "flex-start", paddingTop: 11 },
        }}
        autosize
        minRows={2}
        {...form.getInputProps("description")}
      />

      {showActiveToggle && (
        <Switch
          label="Active"
          description="Inactive treatments can't be added to new treatment plans."
          {...form.getInputProps("isActive", { type: "checkbox" })}
          size="lg"
          styles={{
            body: { alignItems: "center" },
            labelWrapper: { pointerEvents: "none" },
          }}
        />
      )}
    </>
  );
}
