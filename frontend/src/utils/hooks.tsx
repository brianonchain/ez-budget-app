import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { Settings, Item } from "@/db/UserModel";
import { User } from "@/utils/types";
import { fetchPost, fetchGet } from "./functions";

export const useUserQuery = (email: string | null | undefined) => {
  return useQuery({
    queryKey: ["user"],
    queryFn: async (): Promise<User | null> => {
      console.log("useUserQuery queryFn ran");
      const resJson = await fetchGet("/api/getUser");
      if (resJson.status === "success") {
        return resJson.data;
      }
      if (resJson === "error") {
        console.log("useUserQuery error");
      }
      throw new Error();
    },
    enabled: email ? true : false,
    staleTime: Infinity, // won't make network request unless query key invoked
    gcTime: Infinity, // query will always be cached
  });
};

export const useSettingsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (changes: { [key: string]: any }) => {
      console.log("useSettingsMutation mutationFn");
      const resJson = await fetchPost("/api/mutateSettings", { changes });
      if (resJson === "saved") return;
      throw new Error();
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["user"] }),
  });
};

export const useItemsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (item: Item) => {
      console.log("useItemsMutation mutationFn ran");
      const resJson = await fetchPost("/api/mutateItems", { item }); // should throw error if !response.ok
      if (resJson === "saved") return;
      throw new Error();
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["user"] }),
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
