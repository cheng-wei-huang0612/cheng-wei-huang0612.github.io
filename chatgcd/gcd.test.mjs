import test from "node:test";
import assert from "node:assert/strict";
import {
  InputError,
  MAX_DIGITS,
  MAX_INPUT_LENGTH,
  gcd,
  parseIntegerPair,
} from "./gcd.js";

function rejectsWithCode(input, code) {
  assert.throws(
    () => parseIntegerPair(input),
    (error) => error instanceof InputError && error.code === code,
    `Expected ${code} for ${JSON.stringify(input.slice(0, 40))}`,
  );
}

test("parses signed decimal integers with ASCII surrounding whitespace", () => {
  assert.deepEqual(parseIntegerPair("48,18"), [48n, 18n]);
  assert.deepEqual(parseIntegerPair(" \t-48 \r\n,\t +18 \n"), [-48n, 18n]);
  assert.deepEqual(parseIntegerPair("+00048,-00018"), [48n, -18n]);
  assert.deepEqual(parseIntegerPair("-0,+0"), [0n, 0n]);
});

test("preserves integer precision beyond Number's safe range", () => {
  const pair = parseIntegerPair("9007199254740993,9007199254740995");
  assert.deepEqual(pair, [9007199254740993n, 9007199254740995n]);
  assert.equal(gcd(...pair), 1n);

  const factor = 123456789012345678901234567890123456789n;
  assert.equal(gcd(factor * 12n, factor * 35n), factor);
});

test("accepts exactly the digit limit, including leading zeros", () => {
  const large = "9".repeat(MAX_DIGITS);
  assert.deepEqual(parseIntegerPair(`+${large},-${large}`), [BigInt(large), -BigInt(large)]);
  assert.deepEqual(parseIntegerPair(`${"0".repeat(MAX_DIGITS)},1`), [0n, 1n]);
});

test("rejects either integer above the digit limit before BigInt conversion", () => {
  const tooManyDigits = "1".repeat(MAX_DIGITS + 1);
  rejectsWithCode(`${tooManyDigits},1`, "too-many-digits");
  rejectsWithCode(`1,-${tooManyDigits}`, "too-many-digits");
  rejectsWithCode(`${"0".repeat(MAX_DIGITS + 1)},0`, "too-many-digits");
});

test("accepts the raw character limit and rejects one extra character", () => {
  const digits = "9".repeat(MAX_DIGITS);
  const body = `+${digits},-${digits}`;
  const atLimit = " ".repeat(MAX_INPUT_LENGTH - body.length) + body;
  assert.equal(atLimit.length, MAX_INPUT_LENGTH);
  assert.deepEqual(parseIntegerPair(atLimit), [BigInt(digits), -BigInt(digits)]);
  rejectsWithCode(`${atLimit} `, "too-long");
});

test("applies the raw length limit before whitespace or format processing", () => {
  rejectsWithCode(" ".repeat(MAX_INPUT_LENGTH + 1), "too-long");
  rejectsWithCode("x".repeat(MAX_INPUT_LENGTH + 1), "too-long");
  rejectsWithCode(`1,2${" ".repeat(MAX_INPUT_LENGTH)}`, "too-long");
  rejectsWithCode(" ".repeat(MAX_INPUT_LENGTH), "format");
});

test("rejects ambiguous, nondecimal, and non-ASCII formats", () => {
  const invalid = [
    "", " ", "42", "1 2", "1;2", "1，2", "1,2,3", "1,,2", ",2", "1,",
    "1.0,2", "1e3,2", "0x10,2", "0b10,2", "1_000,2", "1,000,2",
    "+,2", "--1,2", "+-1,2", "- 1,2", "1, + 2", "1 0,2", "1\n0,2",
    "NaN,2", "Infinity,2", "1n,2", "(1,2)", "gcd(1,2)", "1,2 hello",
    "１,2", "١,2", "−1,2", "\u00a01,2", "1,2\u00a0", "\v1,2", "1,2\f",
    "1,2\u2028", "1,2\u2029", "1,2\u0000", "<script>,2",
  ];
  for (const input of invalid) {
    rejectsWithCode(input, "format");
  }
});

test("gcd handles all signs and the explicit zero convention", () => {
  for (const [a, b, expected] of [
    [48n, 18n, 6n], [-48n, 18n, 6n], [48n, -18n, 6n], [-48n, -18n, 6n],
    [0n, 0n, 0n], [0n, -42n, 42n], [-42n, 0n, 42n],
    [17n, 31n, 1n], [42n, 42n, 42n], [1n, 999999999999999999999n, 1n],
  ]) {
    assert.equal(gcd(a, b), expected);
  }
});

test("gcd agrees with an independent small-integer divisor oracle", () => {
  for (let a = -25; a <= 25; a += 1) {
    for (let b = -25; b <= 25; b += 1) {
      let expected = 0;
      for (let divisor = 1; divisor <= Math.max(Math.abs(a), Math.abs(b)); divisor += 1) {
        if (a % divisor === 0 && b % divisor === 0) expected = divisor;
      }
      const actual = gcd(BigInt(a), BigInt(b));
      assert.equal(actual, BigInt(expected), `gcd(${a}, ${b})`);
      assert.equal(actual, gcd(BigInt(b), BigInt(a)));
      assert.ok(actual >= 0n);
      if (actual !== 0n) {
        assert.equal(BigInt(a) % actual, 0n);
        assert.equal(BigInt(b) % actual, 0n);
      }
    }
  }
});

test("gcd handles consecutive Fibonacci numbers near the digit limit", () => {
  let previous = 0n;
  let current = 1n;
  while ((previous + current).toString().length <= MAX_DIGITS) {
    [previous, current] = [current, previous + current];
  }
  assert.equal(current.toString().length, MAX_DIGITS);
  assert.equal(gcd(...parseIntegerPair(`${current},${previous}`)), 1n);
});
