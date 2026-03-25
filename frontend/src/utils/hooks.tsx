import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import {
  ItemsPage,
  SettingsData,
  SharedUsersData,
  StatsData,
  StatsPeriod,
  MutateUserPayload,
  MutateSettingsPayload,
  MutateItemsPayload,
} from "@/utils/types";
import { fetchPost, fetchGet } from "./functions";

export const useItemsQuery = () => {
  return useInfiniteQuery<ItemsPage, Error>({
    queryKey: ["items"],
    queryFn: async ({ pageParam }): Promise<ItemsPage> => {
      const resJson = await fetchGet(`/api/getItems?page=${pageParam}`);
      if (resJson.status === "success") return resJson.data;
      throw new Error(resJson.message || "Failed to load items.");
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => (lastPage.hasMore ? allPages.length : undefined), // lastPage = { items, defaultCurrency, hasMore }, allPages = [[items, defaultCurrency, hasMore]]
    staleTime: Infinity,
    gcTime: Infinity,
  });
};

export const useSettingsQuery = (activeWorkspaceId: string | null) => {
  return useQuery<SettingsData, Error>({
    queryKey: ["settings", activeWorkspaceId],
    queryFn: async (): Promise<SettingsData> => {
      const resJson = await fetchGet(`/api/getSettings?activeWorkspaceId=${activeWorkspaceId}`);
      if (resJson.status === "success") return resJson.data;
      throw new Error(resJson.message || "Failed to load settings.");
    },
    enabled: !!activeWorkspaceId,
    staleTime: Infinity,
    gcTime: Infinity,
  });
};

export const useSharedUsersQuery = (workspaceId: string | null | undefined) => {
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
};

export const useStatsQuery = (email: string | null | undefined, period: StatsPeriod, date: string) => {
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
};

export const useItemsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: MutateItemsPayload) => {
      const resJson = await fetchPost("/api/mutateItems", payload);
      if (resJson.status === "success") return;
      throw new Error(resJson?.message || "Failed to save item.");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["items"] }),
  });
};

export const useSettingsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: MutateSettingsPayload) => {
      const resJson = await fetchPost("/api/mutateSettings", payload);
      if (resJson.status === "success") return;
      throw new Error(resJson?.message || "Unknown error. Please try again.");
    },
    onSuccess: (_data, payload) => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      if (payload.type === "changeCurrency") {
        queryClient.invalidateQueries({ queryKey: ["items"] });
      }
    },
  });
};

export const useUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: MutateUserPayload) => {
      const resJson = await fetchPost("/api/mutateUser", payload);
      if (resJson.status === "success") return;
      throw new Error(resJson?.message || "Unknown error. Please try again.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["sharedUsers"] });
    },
  });
};

export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    setIsDesktop(mediaQuery.matches);
  }, []);
  return isDesktop;
}
