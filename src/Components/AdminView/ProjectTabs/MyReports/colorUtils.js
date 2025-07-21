// Shared color utility functions for risk assessment and treatment components

export const getRatingColor = (value) => {
  if (!value || value === 0) return 'bg-gray-100 text-gray-600';
  if (value <= 3) return 'bg-green-100 text-green-800';
  if (value <= 6) return 'bg-yellow-100 text-yellow-800';
  if (value <= 9) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
};

export const getRiskRatingColor = (value) => {
  if (!value || value === 0) return 'bg-gray-100 text-gray-600';
  if (value <= 9) return 'bg-green-100 text-green-800';
  if (value <= 18) return 'bg-yellow-100 text-yellow-800';
  if (value <= 27) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
};

export const getImpactColor = (value) => {
  if (!value) return 'bg-gray-100 text-gray-600';
  if (value === 'Y' || value === 'Yes') return 'bg-red-100 text-red-800';
  if (value === 'N' || value === 'No') return 'bg-green-100 text-green-800';
  return 'bg-gray-100 text-gray-600';
};

export const getResidualRiskColor = (value) => {
  if (!value || value === 0) return 'bg-gray-100 text-gray-600';
  if (value <= 9) return 'bg-green-100 text-green-800';
  if (value <= 18) return 'bg-yellow-100 text-yellow-800';
  if (value <= 27) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
}; 