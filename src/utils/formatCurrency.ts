export const formatCurrency = (value: number) => {
  if (value == null || isNaN(value)) return "₹0";

  return value.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
