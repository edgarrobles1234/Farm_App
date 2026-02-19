import { useQuery } from "@tanstack/react-query";
import { fetchFarms } from "@/lib/farms";

export function useFarms() {
  return useQuery({
    queryKey: ["farms"],
    queryFn: fetchFarms,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
