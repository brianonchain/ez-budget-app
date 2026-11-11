import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import {
  ItemsPage,
  WorkspaceData,
  SharedUsersData,
  StatsData,
  StatsPeriod,
  MutateUserPayload,
  MutateWorkspacePayload,
  MutateItemsPayload,
} from "@/utils/types";
import { fetchPost, fetchGet } from "./functions";

export function useItemsQuery() {
  return useInfiniteQuery<ItemsPage, Error>({
    queryKey: ["items"],
    queryFn: async ({ pageParam }): Promise<ItemsPage> => {
      console.log("useItemsQuery ran");
      const resJson = await fetchGet(`/api/getItems?page=${pageParam}`);
      if (resJson.status === "success") return resJson.data;
      throw new Error(resJson.message || "Failed to load items.");
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => (lastPage.hasMore ? allPages.length : undefined), // lastPage = { items, defaultCurrency, hasMore }, allPages = [[items, defaultCurrency, hasMore]]
    staleTime: 30 * 1000, // why use short stale time?
    gcTime: 1000 * 60 * 60 * 24, // 1 day
  });
}

export function useWorkspaceQuery(activeWorkspaceId: string | null) {
  return useQuery<WorkspaceData, Error>({
    queryKey: ["workspace", activeWorkspaceId],
    queryFn: async (): Promise<WorkspaceData> => {
      console.log("useWorkspaceQuery ran");
      const resJson = await fetchGet(`/api/getWorkspace?activeWorkspaceId=${activeWorkspaceId}`);
      if (resJson.status === "success") return resJson.data;
      throw new Error(resJson.message || "Failed to load settings.");
    },
    enabled: !!activeWorkspaceId,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

export function useSharedUsersQuery(workspaceId: string | null | undefined) {
  return useQuery<SharedUsersData, Error>({
    queryKey: ["sharedUsers", workspaceId],
    queryFn: async (): Promise<SharedUsersData> => {
      const resJson = await fetchGet(`/api/getSharedUsers?workspaceId=${workspaceId}`);
      if (resJson.status === "success") return resJson.data;
      throw new Error(resJson.message || "Failed to load shared users.");
    },
    enabled: !!workspaceId,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useStatsQuery(email: string | null | undefined, period: StatsPeriod, date: string) {
  return useQuery<StatsData, Error>({
    queryKey: ["stats", period, date],
    queryFn: async (): Promise<StatsData> => {
      const resJson = await fetchGet(`/api/getStats?period=${period}&date=${encodeURIComponent(date)}`);
      if (resJson.status === "success") return resJson.data;
      throw new Error(resJson.message || "Failed to load stats.");
    },
    enabled: !!email,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useItemsMutation() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, MutateItemsPayload>({
    mutationFn: async (payload) => {
      const resJson = await fetchPost("/api/mutateItems", payload);
      if (resJson.status === "success") return;
      throw new Error(resJson?.message || "Failed to save item.");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["items"] }),
  });
}

export function useWorkspaceMutation() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, MutateWorkspacePayload>({
    mutationFn: async (payload) => {
      const resJson = await fetchPost("/api/mutateWorkspace", payload);
      if (resJson.status === "success") return;
      throw new Error(resJson?.message || "Unknown error. Please try again.");
    },
    onSuccess: (_data, payload) => {
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
      if (payload.type === "changeCurrency") {
        queryClient.invalidateQueries({ queryKey: ["items"] });
      }
    },
  });
}

export function useUserMutation() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, MutateUserPayload>({
    mutationFn: async (payload) => {
      const resJson = await fetchPost("/api/mutateUser", payload);
      if (resJson.status === "success") return;
      throw new Error(resJson?.message || "Unknown error. Please try again.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["sharedUsers"] });
    },
  });
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => (typeof window !== "undefined" ? window.matchMedia(query).matches : false));

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);
    function handleChange(e: MediaQueryListEvent) {
      setMatches(e.matches);
    }
    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [query]);

  return matches;
}

export function useLoadTime(isDataLoaded: boolean) {
  const [time, setTime] = useState<number | null>(null);

  useEffect(() => {
    if (isDataLoaded && time === null) {
      setTime(performance.now());
    }
  }, [isDataLoaded, time]);

  return time;
}
