// Format currency for display
export const formatCurrency = (value, short = false) => {
  if (short && value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)}Cr`;
  }
  if (short && value >= 100000) {
    return `₹${(value / 100000).toFixed(2)}L`;
  }
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

// Format chart data for Recharts
export const formatChartData = (simulationData) => {
  if (!simulationData) return [];
  
  const { currentPlan, newScenario, comparison } = simulationData;
  
  return comparison.years.map((year, index) => ({
    year,
    currentPlan: currentPlan.values[index] || 0,
    newScenario: newScenario.values[index] || 0,
    difference: (newScenario.values[index] || 0) - (currentPlan.values[index] || 0)
  }));
};

// Calculate years between two dates
export const calculateYears = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 365));
};

// Calculate progress percentage
export const calculateProgress = (current, target) => {
  return Math.min((current / target) * 100, 100);
};