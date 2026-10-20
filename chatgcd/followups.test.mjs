import test from "node:test";
import assert from "node:assert/strict";
import { createFollowUps } from "./followups.js";
import { gcd, MAX_DIGITS, MAX_INPUT_LENGTH, parseIntegerPair } from "./gcd.js";

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

test("offers the three actions with strictly formatted, parseable integers", () => {
  const suggestions = createFollowUps(6n, seededRandom(123));
  assert.deepEqual(suggestions.map(({ label }) => label), [
    "Try a random pair", "Use answer as first number", "Try coprime numbers",
  ]);
  for (const { input } of suggestions) {
    assert.match(input, /^[0-9]+, [0-9]+$/);
    assert.ok(input.length <= MAX_INPUT_LENGTH);
    assert.equal(parseIntegerPair(input).length, 2);
  }
});

test("omits answer reuse when the previous GCD is one", () => {
  const suggestions = createFollowUps(1n, seededRandom(123));
  assert.deepEqual(suggestions.map(({ label }) => label), [
    "Try a random pair", "Try coprime numbers",
  ]);
  for (const { input } of suggestions) {
    const [a, b] = parseIntegerPair(input);
    assert.ok(a >= 2n && b >= 2n);
  }
  assert.equal(gcd(...parseIntegerPair(suggestions[1].input)), 1n);
});

test("varies all suggestions across calls and samples diverse common factors", () => {
  const random = seededRandom(456);
  const inputs = [new Set(), new Set(), new Set()];
  const commonFactors = new Set();
  let nontrivialFactors = 0;
  for (let iteration = 0; iteration < 200; iteration += 1) {
    const suggestions = createFollowUps(6n, random);
    suggestions.forEach(({ input }, index) => inputs[index].add(input));
    const [a, b] = parseIntegerPair(suggestions[0].input);
    const commonFactor = gcd(a, b);
    commonFactors.add(commonFactor);
    if (commonFactor > 1n) nontrivialFactors += 1;
    assert.ok(a >= 2n && a <= 9999n);
    assert.ok(b >= 2n && b <= 9999n);
    assert.notEqual(a, b);
    const [reused, partner] = parseIntegerPair(suggestions[1].input);
    assert.equal(reused, 6n);
    assert.ok(partner >= 2n && partner <= 9999n);
  }
  for (const distinctInputs of inputs) assert.ok(distinctInputs.size > 150);
  assert.ok(commonFactors.size > 40);
  assert.ok(nontrivialFactors > 100);
});

test("coprime suggestions are fresh positive pairs and always have GCD one", () => {
  for (const seed of [1, 2, 37, 4444, 0xffffffff]) {
    const random = seededRandom(seed);
    for (let iteration = 0; iteration < 50; iteration += 1) {
      const pair = parseIntegerPair(createFollowUps(0n, random)[2].input);
      assert.ok(pair[0] >= 2n && pair[0] <= 9998n);
      assert.equal(pair[1], pair[0] + 1n);
      assert.equal(gcd(...pair), 1n);
    }
  }
});

test("reuses zero and a maximum-length GCD without precision loss", () => {
  for (const value of [0n, 9007199254740993n, BigInt("9".repeat(MAX_DIGITS))]) {
    const input = createFollowUps(value, seededRandom(789))[1].input;
    const [reused, partner] = parseIntegerPair(input);
    assert.equal(reused, value);
    assert.ok(partner >= 2n && partner <= 9999n);
    assert.ok(input.length <= MAX_INPUT_LENGTH);
  }
});

test("constant random sources at either endpoint terminate with valid bounds", () => {
  for (const sample of [0, 1 - Number.EPSILON]) {
    let calls = 0;
    const suggestions = createFollowUps(0n, () => {
      calls += 1;
      assert.ok(calls <= 5, "Generation must not depend on a successful retry");
      return sample;
    });
    assert.equal(calls, 5);
    const [a, b] = parseIntegerPair(suggestions[0].input);
    assert.ok(a >= 2n && a <= 9999n);
    assert.ok(b >= 2n && b <= 9999n);
    assert.notEqual(a, b);
    const [, partner] = parseIntegerPair(suggestions[1].input);
    assert.equal(partner, sample === 0 ? 2n : 9999n);
    const coprime = parseIntegerPair(suggestions[2].input);
    assert.equal(gcd(...coprime), 1n);
    assert.ok(coprime[0] >= 2n && coprime[1] <= 9999n);
  }
});
