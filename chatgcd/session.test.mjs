import test from "node:test";
import assert from "node:assert/strict";
import {
  ChatSession,
  MAX_CHATS,
  MAX_DRAFT_LENGTH,
  MAX_EXCHANGES,
} from "./session.js";

test("starts with one empty room and reuses it until it contains a draft or exchange", () => {
  const session = new ChatSession();
  const initial = session.active;
  assert.deepEqual(initial, {
    id: 1, title: "New chat", draft: "", scrollTop: 0, exchanges: [],
  });
  assert.equal(session.create(), initial);
  assert.equal(session.chats.length, 1);

  session.setDraft("48, 18");
  const next = session.create();
  assert.notEqual(next, initial);
  assert.equal(next.id, 2);
  assert.deepEqual(session.chats, [next, initial]);
  assert.equal(initial.draft, "48, 18");
  assert.equal(session.create(), next);
});

test("keeps room history, drafts, titles, and scroll positions independent", () => {
  const session = new ChatSession();
  const firstExchange = { input: "48, 18", result: "6" };
  const first = session.append(firstExchange, "48, 18");
  first.scrollTop = 123;
  session.setDraft("-12, 8");

  const second = session.create();
  session.append({ input: "17, 31", result: "1" }, "17, 31");
  second.scrollTop = 45;
  session.setDraft("0, 0");

  assert.equal(session.select(first.id), true);
  assert.equal(session.active, first);
  assert.deepEqual(session.active.exchanges, [firstExchange]);
  assert.equal(session.active.title, "48, 18");
  assert.equal(session.active.draft, "-12, 8");
  assert.equal(session.active.scrollTop, 123);
  assert.equal(session.select(second.id), true);
  assert.equal(session.active.draft, "0, 0");
  assert.equal(session.active.scrollTop, 45);
  assert.equal(session.active.exchanges[0].result, "1");
  assert.deepEqual(session.chats, [second, first]);
});

test("unknown selections and deletions preserve the active room and all history", () => {
  const session = new ChatSession();
  const initial = session.append("entry", "48, 18");
  assert.equal(session.select(-1), false);
  assert.equal(session.delete(-1), false);
  assert.equal(session.active, initial);
  assert.deepEqual(session.chats, [initial]);
  assert.deepEqual(initial.exchanges, ["entry"]);
});

test("deleting inactive rooms preserves selection and deleting active rooms selects a survivor", () => {
  const session = new ChatSession();
  const oldest = session.append("first", "1, 2");
  const middle = session.create();
  session.append("second", "3, 4");
  const newest = session.create();
  session.append("third", "5, 6");

  assert.equal(session.delete(oldest.id), true);
  assert.equal(session.active, newest);
  assert.deepEqual(session.chats, [newest, middle]);
  assert.equal(session.delete(newest.id), true);
  assert.equal(session.active, middle);
  assert.deepEqual(session.active.exchanges, ["second"]);
});

test("deleting the final room creates a fresh room with a never-reused ID", () => {
  const session = new ChatSession();
  const initial = session.append("entry", "48, 18");
  session.setDraft("private draft");
  assert.equal(session.delete(initial.id), true);
  assert.equal(session.chats.length, 1);
  assert.equal(session.active.id, initial.id + 1);
  assert.equal(session.active.title, "New chat");
  assert.equal(session.active.draft, "");
  assert.deepEqual(session.active.exchanges, []);
  assert.equal(session.select(initial.id), false);
  assert.equal(session.delete(initial.id), false);
  assert.equal(session.create(), session.active);
});

test("enforces the room limit, still reuses empty rooms, and frees capacity after deletion", () => {
  const session = new ChatSession();
  for (let index = 1; index < MAX_CHATS; index += 1) {
    session.append(index, `${index}, 1`);
    assert.ok(session.create());
  }
  assert.equal(session.chats.length, MAX_CHATS);
  const empty = session.active;
  assert.equal(session.create(), empty);
  session.setDraft("draft");
  assert.equal(session.create(), null);
  assert.equal(session.active, empty);
  assert.equal(session.active.draft, "draft");

  const removed = session.chats.at(-1);
  assert.equal(session.delete(removed.id), true);
  const replacement = session.create();
  assert.ok(replacement);
  assert.equal(session.chats.length, MAX_CHATS);
  assert.equal(replacement.id, MAX_CHATS + 1);
  assert.equal(session.chats.includes(removed), false);
});

test("retains the most recent exchanges and preserves the initial title", () => {
  const session = new ChatSession();
  session.append(0, "first title");
  for (let index = 1; index < MAX_EXCHANGES + 7; index += 1) {
    session.append(index, "later title");
  }
  assert.equal(session.active.exchanges.length, MAX_EXCHANGES);
  assert.deepEqual(
    session.active.exchanges,
    Array.from({ length: MAX_EXCHANGES }, (_, index) => index + 7),
  );
  assert.equal(session.active.title, "first title");
});

test("normalizes first-message titles, bounds their length, and handles empty titles", () => {
  const session = new ChatSession();
  session.append("entry", " \n 48,\t\r\n18   ");
  assert.equal(session.active.title, "48, 18");

  session.create();
  session.append("entry", "x".repeat(100));
  assert.equal(session.active.title, "x".repeat(48));

  session.create();
  session.append("entry", "😀".repeat(49));
  assert.equal(session.active.title, "😀".repeat(48));

  session.create();
  session.append("entry", " \t\n");
  assert.equal(session.active.title, "New chat");
});

test("accepts exactly the draft limit and rejects oversized drafts without changes", () => {
  const session = new ChatSession();
  const initial = session.active;
  const atLimit = "x".repeat(MAX_DRAFT_LENGTH);
  assert.equal(session.setDraft(atLimit), true);
  assert.equal(session.setDraft(`${atLimit}x`), false);
  assert.equal(session.active, initial);
  assert.equal(initial.draft, atLimit);

  const second = session.create();
  assert.equal(session.setDraft("y".repeat(MAX_DRAFT_LENGTH + 1)), false);
  assert.equal(session.active, second);
  assert.equal(second.draft, "");
  assert.equal(initial.draft, atLimit);
  assert.equal(session.setDraft(""), true);
});
