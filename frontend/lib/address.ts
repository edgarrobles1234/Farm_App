type AddressFields = {
  street?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
};

export function formatAddress(a: AddressFields) {
  const line1 = a.street?.trim() || "";
  const line2 = [a.city, a.state, a.postal_code]
    .filter((x) => x && x.trim())
    .join(", ");
  const line3 = a.country?.trim() || "";

  return [line1, line2, line3].filter(Boolean).join(" ");
}
