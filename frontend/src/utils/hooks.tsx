import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { Settings, Item } from "@/db/UserModel";
import { UserData } from "@/utils/types";
import { fetchPost, fetchGet } from "./functions";
import { MutateSettingsPayload, MutateItemsPayload } from "./types";

export const useUserQuery = (email: string | null | undefined) => {
  return useQuery<UserData | null, Error>({
    queryKey: ["user"],
    queryFn: async (): Promise<UserData | null> => {
      const resJson = await fetchGet("/api/getUser");
      if (resJson.status === "success") return resJson.data;
      throw new Error(resJson.message || "Failed to load user.");
    },
    enabled: email ? true : false,
    staleTime: Infinity, // won't make network request unless query key invoked
    gcTime: Infinity, // query will always be cached
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user"] }),
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user"] }),
  });
};

// export const useTxnsQuery = (w3Info: W3Info | null, flashInfo: FlashInfo, filter: Filter) => {
//   const logout = useLogout();
//   return useInfiniteQuery({
//     queryKey: ["txns", filter],
//     queryFn: async ({ pageParam }): Promise<Transaction[] | null> => {
//       console.log("useTxnsQuery queryFn ran, pageParam:", pageParam);

//       const res = await fetch("/api/getPayments", {
//         method: "POST",
//         headers: { "content-type": "application/json" },
//         body: JSON.stringify({ pageParam, w3Info, flashInfo, filter }),
//       });
//       const resJson = await res.json();
//       if (resJson.status === "success") {
//         console.log("txns fetched", resJson.data);
//         return resJson.data;
//       }
//       if (resJson === "create new user") return null;
//       if (resJson.status === "not verified") {
//         logout();
//         return null;
//       }
//       throw new Error();
//     },
//     initialPageParam: 0,
//     getNextPageParam: (lastPage, allPages) => (lastPage?.length ? allPages.length : undefined), // lastPage = [10 items], allPages = [[10 items]]; should return "undefined" if no next page
//     enabled: (flashInfo && flashInfo.userType === "owner" && w3Info) || (flashInfo && flashInfo.userType === "employee") ? true : false,
//   });
// };
