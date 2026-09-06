/* Pure CSS project — tiny class joiner (no tailwind-merge). */
export function cn(...inputs: Array<string | undefined | null | false>): string {
  return inputs.filter(Boolean).join(" ");
}
