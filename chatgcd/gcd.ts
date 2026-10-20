export const MAX_DIGITS = 1024;
export const MAX_INPUT_LENGTH = 2 * MAX_DIGITS + 64;

export type InputErrorCode = "format" | "too-long" | "too-many-digits";

export class InputError extends Error {
  readonly code: InputErrorCode;

  constructor(code: InputErrorCode, message: string) {
    super(message);
    this.name = "InputError";
    this.code = code;
  }
}

// Only ASCII whitespace, signs, decimal digits, and one comma are accepted.
// The final assertion requires the entire input, including line terminators.
const INTEGER_PAIR = /^[ \t\r\n]*([+-]?[0-9]+)[ \t\r\n]*,[ \t\r\n]*([+-]?[0-9]+)[ \t\r\n]*(?![\s\S])/;

export function parseIntegerPair(input: string): readonly [bigint, bigint] {
  // Check the raw length before parsing or constructing any BigInts.
  if (input.length > MAX_INPUT_LENGTH) {
    throw new InputError(
      "too-long",
      `Keep the whole message within ${MAX_INPUT_LENGTH.toLocaleString("en-US")} characters.`,
    );
  }

  const match = INTEGER_PAIR.exec(input);
  if (match === null) {
    throw new InputError(
      "format",
      "Enter two decimal integers separated by one comma, for example: -48, 18.",
    );
  }

  const tokens = [match[1], match[2]] as const;
  for (const token of tokens) {
    const signLength = token[0] === "+" || token[0] === "-" ? 1 : 0;
    if (token.length - signLength > MAX_DIGITS) {
      throw new InputError(
        "too-many-digits",
        `Each integer can have at most ${MAX_DIGITS.toLocaleString("en-US")} digits, including leading zeros.`,
      );
    }
  }

  return [BigInt(tokens[0]), BigInt(tokens[1])];
}

export function gcd(a: bigint, b: bigint): bigint {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;

  // This is the ordinary variable-time Euclidean algorithm.
  // Returning zero for gcd(0, 0) is an explicit convention used by ChatGCD.
  while (b !== 0n) {
    const remainder = a % b;
    a = b;
    b = remainder;
  }

  return a;
}
