// Helper to calculate days between two dates
export const calculateDays = (start: string, end: string): number => {
  if (!start || !end) return 1;
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1;
};

// Helper to calculate cost
export const calculateRentalCost = (price: number, qty: number, days: number): number => {
  return price * qty * days;
};
