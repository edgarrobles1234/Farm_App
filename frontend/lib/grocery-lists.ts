import { apiRequest } from "@/lib/api";

export type CreateGroceryListItemInput = {
  name: string;
  quantity?: number | null;
  unit?: string | null;
  checked?: boolean;
  category?: string | null;
  isPinned?: boolean;
  sortOrder?: number;
};

export type CreateGroceryListInput = {
  title: string;
  isPinned?: boolean;
  items?: CreateGroceryListItemInput[];
};

export type CreateGroceryListResponse = {
  id: string;
};

export async function createGroceryList(
  accessToken: string,
  body: CreateGroceryListInput
): Promise<CreateGroceryListResponse> {
  return apiRequest<CreateGroceryListResponse>("/grocery-lists", {
    method: "POST",
    accessToken,
    body,
  });
}
