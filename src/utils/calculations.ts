export const calculateProgress = (collected: number, target: number): number => {
  if (target === 0) return 0;
  return Math.min(Math.round((collected / target) * 100), 100);
};