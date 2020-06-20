// use sine-based function to provide an offset based on an index within a range specified by amount
export const adjustment = (i: number, amount: number): number => {
  return Math.sin((i % 5) / -3) * amount
}
