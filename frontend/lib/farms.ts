import { supabase } from "@/lib/supabase";
import type { FarmWithCoords } from "@/lib/location";

export async function fetchFarms(): Promise<FarmWithCoords[]> {
  const { data, error } = await supabase
    .from("farms")
    .select("id,name,rating,reviews,products,latitude,longitude,street,city,state,postal_code,country")
    .order("id", { ascending: true });
    
  if (error) throw error;
  return (data ?? []) as FarmWithCoords[];
}
