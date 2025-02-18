export const generateDisplayId = (num: number): string => {
  return `#${num.toString().padStart(4, "0")}`;
};
