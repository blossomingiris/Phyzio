import { getApiErrorMessage, isApiFieldError } from "@/shared/api/errors";
import { Alert, Center, List, Loader, LoadingOverlay } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import type { UseQueryResult } from "@tanstack/react-query";
import type { ReactNode } from "react";

export type AsyncWrapperProps<T, TError = unknown> = {
  query: UseQueryResult<T, TError>;
  render: (data: T) => ReactNode;
  loaderRender?: () => ReactNode;
};

export function AsyncWrapper<T, TError = unknown>({
  query,
  render,
  loaderRender = defaultLoaderRender,
}: AsyncWrapperProps<T, TError>) {
  const { isPending, isFetching, isError, error, data } = query;

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
      }}
    >
      {isPending ? (
        loaderRender()
      ) : isError ? (
        <Alert
          color="error"
          title="Error"
          variant="light"
          icon={<IconAlertCircle />}
        >
          {getApiErrorMessage(error)}
          {isApiFieldError(error) && error.errors.length > 0 && (
            <List size="sm" mt="xs">
              {error.errors.map((fieldError) => (
                <List.Item key={fieldError.field}>
                  {fieldError.field}: {fieldError.message}
                </List.Item>
              ))}
            </List>
          )}
        </Alert>
      ) : (
        <>
          <LoadingOverlay
            visible={isFetching}
            loaderProps={{ color: "primary" }}
          />
          {render(data as T)}
        </>
      )}
    </div>
  );
}

function defaultLoaderRender(): ReactNode {
  return (
    <Center mih={200} style={{ flex: 1 }}>
      <Loader type="bars" />
    </Center>
  );
}
