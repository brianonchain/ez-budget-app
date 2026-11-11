"use client";
import { useState } from "react";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";

const ONE_DAY = 1000 * 60 * 60 * 24;

function trimItemsInfiniteQueryToFirstPage(data: unknown) {
  if (
    data &&
    typeof data === "object" &&
    "pages" in data &&
    "pageParams" in data &&
    Array.isArray((data as { pages?: unknown }).pages) &&
    Array.isArray((data as { pageParams?: unknown }).pageParams)
  ) {
    const infiniteData = data as {
      pages: unknown[];
      pageParams: unknown[];
      [key: string]: unknown;
    };

    return {
      ...infiniteData,
      pages: infiniteData.pages.slice(0, 1),
      pageParams: infiniteData.pageParams.slice(0, 1),
    };
  }

  return data;
}

export default function ContextProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            gcTime: ONE_DAY,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  const [persister] = useState(() =>
    createAsyncStoragePersister({
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      key: "ezb:queryCache",
    }),
  );

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: ONE_DAY,
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            return query.state.status === "success" && query.queryKey[0] === "items";
          },
          serializeData: (data) => {
            return trimItemsInfiniteQueryToFirstPage(data);
          },
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
