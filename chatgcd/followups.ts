export type FollowUpSuggestion = { label: string; input: string };

export function createFollowUps(
  gcdValue: bigint,
  random: () => number = Math.random,
): FollowUpSuggestion[] {
  const integer = (minimum: number, maximum: number): number =>
    minimum + Math.floor(random() * (maximum - minimum + 1));

  // Sample a common factor so examples have a useful variety of GCDs.
  const factor = integer(1, 99);
  const largestCofactor = Math.floor(9999 / factor);
  const firstCofactor = integer(2, largestCofactor);
  let secondCofactor = integer(2, largestCofactor - 1);
  // Skip the first value without retrying, even with a constant random source.
  if (secondCofactor >= firstCofactor) secondCofactor += 1;

  const partner = integer(2, 9999);
  const consecutive = integer(2, 9998);

  return [
    {
      label: "Try a random pair",
      input: `${factor * firstCofactor}, ${factor * secondCofactor}`,
    },
    ...(gcdValue === 1n ? [] : [{
      label: "Use answer as first number",
      input: `${gcdValue}, ${partner}`,
    }]),
    { label: "Try coprime numbers", input: `${consecutive}, ${consecutive + 1}` },
  ];
}
