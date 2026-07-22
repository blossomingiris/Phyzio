import { useBreadcrumb } from "@/shared/lib/react/use-breadcrumb";
import { ROUTES } from "@/shared/model/routes";
import { AsyncWrapper } from "@/shared/ui/async-wrapper";
import { BackButton } from "@/shared/ui/back-button";
import { Badge, Group, Stack, Title } from "@mantine/core";
import { useParams } from "react-router";
import { useUserQuery } from "./model/use-user-query";
import { UserOverview } from "./ui/user-overview";

export function UserItemPage() {
  const { id } = useParams<{ id: string }>();
  const query = useUserQuery(id!);
  const user = query.data;

  useBreadcrumb(user ? `${user.firstName} ${user.lastName}` : "User");

  return (
    <Stack gap="sm" align="flex-start" style={{ width: "100%" }}>
      <BackButton to={ROUTES.USERS} />
      <Group gap="xs">
        <Title>{user ? `${user.firstName} ${user.lastName}` : "User"}</Title>
        {user?.deletedAt && (
          <Badge color="error" variant="light">
            Deleted
          </Badge>
        )}
      </Group>
      <AsyncWrapper
        query={query}
        errorMessage="User not found"
        render={(user) => <UserOverview user={user} />}
      />
    </Stack>
  );
}
