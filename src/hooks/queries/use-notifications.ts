import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "@/actions/notification";

export const useNotifications = () => {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotifications(),
    refetchInterval: 1000 * 60,
  });
};
