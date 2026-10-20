import { gcd, InputError, parseIntegerPair } from "./gcd.js";
import { createFollowUps } from "./followups.js";
import { ChatSession, MAX_CHATS, MAX_DRAFT_LENGTH, MAX_EXCHANGES } from "./session.js";

type Reply =
  | { kind: "thinking" }
  | { kind: "result"; a: bigint; b: bigint; value: bigint }
  | { kind: "error"; message: string };

interface Exchange {
  id: number;
  echo: string;
  reply: Reply;
}

function element<T extends HTMLElement>(selector: string): T {
  const found = document.querySelector<T>(selector);
  if (found === null) throw new Error(`Missing interface element: ${selector}`);
  return found;
}

const form = element<HTMLFormElement>("#composer");
const input = element<HTMLTextAreaElement>("#message");
const send = element<HTMLButtonElement>("#send");
const welcome = element<HTMLElement>("#welcome");
const workspace = element<HTMLDivElement>("#workspace");
const conversation = element<HTMLDivElement>("#conversation");
const status = element<HTMLParagraphElement>("#runtime-status");
const followUps = element<HTMLElement>("#follow-ups");
const followUpOptions = element<HTMLDivElement>("#follow-up-options");
const newChatButtons = document.querySelectorAll<HTMLButtonElement>("[data-new-chat]");
const exampleButtons = document.querySelectorAll<HTMLButtonElement>("[data-example]");
const chatLists = document.querySelectorAll<HTMLElement>("[data-chat-list]");
const mobileChatPicker = element<HTMLDetailsElement>("#mobile-chat-picker");
const currentChatName = element<HTMLSpanElement>("#current-chat-name");
const MAX_ECHO_LENGTH = 240;
const session = new ChatSession<Exchange>();
const pendingReplies = new Map<number, number>();
let nextExchangeId = 1;
let followUpEntryId: number | null = null;

function textElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  text: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.className = className;
  node.textContent = text;
  return node;
}

function initializeWelcome(): void {
  const variants = [
    {
      title: ["Two integers.", "One common ground."],
      description: ["I find the greatest common divisor.", "That's my whole personality."],
    },
    {
      title: ["Big numbers.", "Common factors."],
      description: ["Bring any two integers.", "I'll find their greatest common divisor."],
    },
    {
      title: ["Signs may differ.", "Factors unite."],
      description: ["Positive, negative, or zero.", "Euclid can work with that."],
    },
    {
      title: ["Less small talk.", "More division."],
      description: ["Two integers go in.", "Their greatest common divisor comes out."],
    },
  ] as const;
  // Choose once per page load so changing rooms keeps the same welcome.
  const variant = variants[Math.floor(Math.random() * variants.length)];
  element<HTMLHeadingElement>("#welcome-title").replaceChildren(
    variant.title[0], document.createElement("br"), variant.title[1],
  );
  element<HTMLParagraphElement>(".welcome-description").replaceChildren(
    variant.description[0], document.createElement("br"), variant.description[1],
  );
}

function syncInput(): void {
  const thinking = pendingReplies.has(session.active.id);
  send.disabled = thinking || input.value.trim().length === 0;
  form.setAttribute("aria-busy", String(thinking));
  exampleButtons.forEach((button) => { button.disabled = thinking; });
  input.style.height = "30px";
  input.style.height = `${Math.min(input.scrollHeight, 130)}px`;
  syncFollowUps();
}

function syncFollowUps(): void {
  const chat = session.active;
  const latest = chat.exchanges[chat.exchanges.length - 1];
  if (!latest || latest.reply.kind !== "result" || pendingReplies.has(chat.id) || input.value.length !== 0) {
    followUps.hidden = true;
    return;
  }

  if (followUpEntryId !== latest.id) {
    const suggestions = createFollowUps(latest.reply.value);
    followUpOptions.replaceChildren(...suggestions.map((suggestion) => {
      const button = textElement("button", "follow-up-button", "");
      button.type = "button";
      button.append(
        textElement("span", "follow-up-label", suggestion.label),
        textElement("code", "follow-up-pair", `gcd(${suggestion.input})`),
      );
      button.title = `Calculate gcd(${suggestion.input})`;
      button.setAttribute("aria-describedby", "follow-up-hint");
      button.addEventListener("click", () => {
        const current = session.active;
        const currentLatest = current.exchanges[current.exchanges.length - 1];
        // A stale suggestion must never overwrite a draft or target another room.
        if (current.id !== chat.id || currentLatest?.id !== latest.id || pendingReplies.has(current.id) || input.value.length !== 0) return;
        input.value = suggestion.input;
        calculate();
      });
      return button;
    }));
    followUpOptions.scrollLeft = 0;
    followUpEntryId = latest.id;
  }
  followUps.hidden = false;
}

function announce(message: string, visible = false): void {
  status.className = visible ? "runtime-status" : "sr-only";
  status.textContent = message;
}

function initializeGuestMenu(): void {
  const menu = element<HTMLElement>("#guest-menu");
  const triggers = document.querySelectorAll<HTMLButtonElement>("[data-guest-menu-trigger]");
  let activeTrigger: HTMLButtonElement | null = null;

  function closeMenu(restoreFocus = false): void {
    const previousTrigger = activeTrigger;
    activeTrigger = null;
    menu.hidden = true;
    triggers.forEach((trigger) => { trigger.setAttribute("aria-expanded", "false"); });
    if (restoreFocus) previousTrigger?.focus({ preventScroll: true });
  }

  triggers.forEach((trigger) => {
    trigger.disabled = false;
    trigger.addEventListener("click", () => {
      if (activeTrigger === trigger) {
        closeMenu();
        return;
      }
      closeMenu();
      activeTrigger = trigger;
      trigger.setAttribute("aria-expanded", "true");
      menu.hidden = false;

      // The shared panel sits outside the scrolling sidebar to avoid clipping.
      const anchor = trigger.getBoundingClientRect();
      const edge = 12;
      const gap = 8;
      const preferredTop = anchor.top >= menu.offsetHeight + gap
        ? anchor.top - menu.offsetHeight - gap
        : anchor.bottom + gap;
      menu.style.top = `${Math.max(edge, Math.min(preferredTop, window.innerHeight - menu.offsetHeight - edge))}px`;
      menu.style.left = `${Math.max(edge, Math.min(anchor.left, window.innerWidth - menu.offsetWidth - edge))}px`;
      menu.querySelector<HTMLAnchorElement>("a[href]")?.focus({ preventScroll: true });
    });
  });

  function isInside(target: EventTarget | null): boolean {
    return target instanceof Node
      && (menu.contains(target) || Array.from(triggers).some((trigger) => trigger.contains(target)));
  }

  document.addEventListener("pointerdown", (event) => {
    if (!menu.hidden && !isInside(event.target)) closeMenu();
  });
  document.addEventListener("focusin", (event) => {
    // Safari can blur a clicked link with no next focus target before navigation.
    // Close only when focus arrives outside, not on an ambiguous focusout.
    if (!menu.hidden && !isInside(event.target)) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !menu.hidden) {
      event.preventDefault();
      closeMenu(true);
    }
  });
  document.addEventListener("scroll", (event) => {
    if (!(event.target instanceof Node) || !menu.contains(event.target)) closeMenu();
  }, true);
  window.addEventListener("resize", () => { closeMenu(); });
}

function saveActiveChat(): boolean {
  if (!session.setDraft(input.value)) {
    announce(`Send or shorten your draft before switching chats. Drafts can contain up to ${MAX_DRAFT_LENGTH.toLocaleString("en-US")} characters.`, true);
    return false;
  }
  session.active.scrollTop = workspace.scrollTop;
  return true;
}

function renderChatLists(): void {
  currentChatName.textContent = session.active.title;
  document.querySelectorAll<HTMLElement>("[data-chat-count]").forEach((counter) => {
    counter.textContent = `${session.chats.length} / ${MAX_CHATS}`;
  });
  chatLists.forEach((list) => {
    const rows = session.chats.map((chat) => {
      const row = document.createElement("div");
      row.className = `chat-row${chat === session.active ? " is-active" : ""}`;
      const select = document.createElement("button");
      select.type = "button";
      select.className = "chat-select";
      select.setAttribute("aria-label", `Open chat ${chat.id}: ${chat.title}`);
      select.title = chat.title;
      if (chat === session.active) select.setAttribute("aria-current", "true");
      const count = textElement("span", "chat-size", chat.exchanges.length.toString());
      count.setAttribute("aria-hidden", "true");
      select.append(textElement("span", "chat-title", chat.title), count);
      select.addEventListener("click", () => {
        if (!saveActiveChat() || !session.select(chat.id)) return;
        mobileChatPicker.open = false;
        renderActiveChat();
        announce(`Opened chat: ${chat.title}. ${chat.exchanges.length} calculations.`);
        focusChatControl();
      });
      const remove = textElement("button", "chat-delete", "×");
      remove.type = "button";
      remove.setAttribute("aria-label", `Delete chat ${chat.id}: ${chat.title}`);
      remove.addEventListener("click", () => {
        const wasActive = chat === session.active;
        const pending = pendingReplies.get(chat.id);
        if (pending !== undefined) window.clearTimeout(pending);
        pendingReplies.delete(chat.id);
        if (!session.delete(chat.id)) return;
        if (wasActive) renderActiveChat();
        else renderChatLists();
        announce("Chat deleted.");
        focusChatControl();
      });
      row.append(select, remove);
      return row;
    });
    list.replaceChildren(...rows);
  });
}

function focusChatControl(): void {
  const target = mobileChatPicker.getClientRects().length > 0
    ? mobileChatPicker.querySelector<HTMLElement>("summary")
    : document.querySelector<HTMLElement>('.sidebar .chat-select[aria-current="true"]');
  target?.focus({ preventScroll: true });
}

function renderActiveChat(): void {
  const chat = session.active;
  welcome.hidden = chat.exchanges.length !== 0;
  // Keep inactive rooms as small data records, not retained DOM subtrees.
  conversation.setAttribute("aria-live", "off");
  conversation.replaceChildren(...chat.exchanges.map(renderExchange));
  // Switching rooms should not announce their entire histories as new replies.
  window.requestAnimationFrame(() => {
    if (session.active === chat) conversation.setAttribute("aria-live", "polite");
  });
  conversation.setAttribute("aria-label", `Conversation: ${chat.title}`);
  input.value = chat.draft;
  renderChatLists();
  syncInput();
  workspace.scrollTop = chat.scrollTop;
}

function assistantMessage(): { message: HTMLElement; body: HTMLDivElement } {
  const message = document.createElement("div");
  message.className = "message assistant-message";
  const heading = document.createElement("div");
  heading.className = "assistant-heading";
  const mark = textElement("span", "assistant-mark", "÷");
  mark.setAttribute("aria-hidden", "true");
  heading.append(mark, textElement("span", "", "ChatGCD"), textElement("small", "", "Euclidean edition"));
  const body = document.createElement("div");
  body.className = "assistant-body";
  message.append(heading, body);
  return { message, body };
}

function resultMessage(a: bigint, b: bigint, result: bigint): HTMLElement {
  const { message, body } = assistantMessage();
  const resultText = result.toString();
  body.append(
    textElement("p", "result-label", "Greatest common divisor"),
    textElement("strong", "result-value", resultText),
  );

  // Keep the full normalized operands available without overwhelming large results.
  const equation = `gcd(${a.toString()}, ${b.toString()}) = ${resultText}`;
  if (equation.length > 180) {
    const details = document.createElement("details");
    details.className = "calculation-details";
    details.append(textElement("summary", "", "View the full calculation"), textElement("p", "result-equation", equation));
    body.append(details);
  } else {
    body.append(textElement("p", "result-equation", equation));
  }

  let explanation = "The largest positive integer that divides both numbers. Found with Euclid's algorithm.";
  if (a === 0n && b === 0n) {
    explanation = "By convention, gcd(0, 0) = 0. Every positive integer divides zero, so this pair has no greatest positive common divisor.";
  } else if (a === 0n || b === 0n) {
    explanation = "With one input equal to zero, the greatest common divisor is the absolute value of the other integer.";
  } else if (result === 1n) {
    explanation = "These integers are coprime: their only positive common divisor is 1.";
  }
  body.append(textElement("p", "result-explanation", explanation));

  const copy = textElement("button", "copy-result", "Copy result ↗");
  copy.type = "button";
  copy.setAttribute("aria-label", "Copy greatest common divisor to clipboard");
  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(resultText);
      copy.textContent = "Copied ✓";
      status.textContent = "Result copied to the clipboard.";
    } catch {
      copy.textContent = "Select the result above to copy";
      status.textContent = "Clipboard unavailable. Select the result text above and copy it manually.";
    }
  });
  body.append(copy);
  return message;
}

function errorMessage(explanation: string): HTMLElement {
  const { message, body } = assistantMessage();
  message.classList.add("error-message");
  body.append(textElement("p", "result-label", "Let's try that again"), textElement("p", "error-text", explanation));
  body.append(textElement("p", "result-explanation", "Use a, b — for example 48, 18 or -270, 192. Decimal digits and an optional + or - sign only; no thousands separators."));
  return message;
}

function renderReply(reply: Reply): HTMLElement {
  if (reply.kind === "result") return resultMessage(reply.a, reply.b, reply.value);
  if (reply.kind === "error") return errorMessage(reply.message);
  const thinking = assistantMessage();
  thinking.body.append(textElement("p", "thinking-text", "thinking...."));
  return thinking.message;
}

function renderExchange(entry: Exchange): HTMLElement {
  const exchange = document.createElement("section");
  exchange.className = "exchange";
  exchange.dataset.exchange = entry.id.toString();
  exchange.setAttribute("aria-label", "Calculation");
  const user = textElement("div", "message user-message", entry.echo);
  user.setAttribute("aria-label", "Your input");
  exchange.append(user, renderReply(entry.reply));
  return exchange;
}

function scrollToLatest(chatId: number, exchangeId: number): void {
  // Wait for reply and composer layout changes before measuring the bottom.
  window.requestAnimationFrame(() => {
    const chat = session.active;
    const latest = chat.exchanges[chat.exchanges.length - 1];
    if (chat.id !== chatId || latest?.id !== exchangeId) return;
    workspace.scrollTo({ top: workspace.scrollHeight, behavior: "auto" });
    chat.scrollTop = workspace.scrollTop;
  });
}

function calculate(): void {
  const raw = input.value;
  if (pendingReplies.has(session.active.id) || raw.length === 0) return;
  // Never interpret user input as HTML, and bound the displayed echo of rejected input.
  const echo = raw.length <= MAX_ECHO_LENGTH
    ? raw
    : `${raw.slice(0, MAX_ECHO_LENGTH)}… [message preview shortened]`;
  // Resolve before scheduling so rejected oversized input is never retained.
  let reply: Reply;
  try {
    const [a, b] = parseIntegerPair(raw);
    reply = { kind: "result", a, b, value: gcd(a, b) };
  } catch (error: unknown) {
    reply = {
      kind: "error",
      message: error instanceof InputError ? error.message : "The calculation could not be completed. Please try another pair of integers.",
    };
  }
  const entry: Exchange = { id: nextExchangeId++, echo, reply: { kind: "thinking" } };
  const chat = session.append(entry, echo);
  chat.draft = "";
  conversation.setAttribute("aria-label", `Conversation: ${chat.title}`);
  const exchange = renderExchange(entry);

  welcome.hidden = true;
  if (conversation.childElementCount >= MAX_EXCHANGES) conversation.firstElementChild?.remove();
  conversation.setAttribute("aria-live", "polite");
  conversation.append(exchange);
  // Sample integer microseconds; setTimeout accepts milliseconds.
  const delayMicroseconds = 500 + Math.floor(Math.random() * 1501);
  pendingReplies.set(chat.id, window.setTimeout(() => {
    pendingReplies.delete(chat.id);
    if (!session.chats.includes(chat)) return;
    entry.reply = reply;
    // A reply belongs to its original room even after switching rooms.
    if (session.active === chat) {
      conversation.querySelector(`[data-exchange="${entry.id}"] .assistant-message`)?.replaceWith(renderReply(reply));
      syncInput();
      scrollToLatest(chat.id, entry.id);
    }
  }, delayMicroseconds / 1000));
  input.value = "";
  announce("");
  renderChatLists();
  syncInput();
  input.focus({ preventScroll: true });
  scrollToLatest(chat.id, entry.id);
}

form.addEventListener("submit", (event: SubmitEvent) => {
  event.preventDefault();
  calculate();
});

input.addEventListener("input", syncInput);
input.addEventListener("keydown", (event: KeyboardEvent) => {
  // Let IME confirmation and Shift+Enter work without submitting the form.
  if (event.key === "Enter" && !event.shiftKey && !event.isComposing && event.keyCode !== 229) {
    event.preventDefault();
    if (!send.disabled) form.requestSubmit();
  }
});

exampleButtons.forEach((button) => {
  button.disabled = false;
  button.addEventListener("click", () => {
    if (pendingReplies.has(session.active.id)) return;
    input.value = button.dataset.example ?? "";
    calculate();
  });
});

newChatButtons.forEach((button) => {
  button.disabled = false;
  button.addEventListener("click", () => {
    if (!saveActiveChat()) return;
    if (session.create() === null) {
      announce(`This visit already has ${MAX_CHATS} chats. Delete a chat to start another.`, true);
      return;
    }
    mobileChatPicker.open = false;
    renderActiveChat();
    announce("New chat ready. Other chats are kept for this visit.");
    input.focus({ preventScroll: true });
    workspace.scrollTo({ top: 0, behavior: "auto" });
  });
});

initializeWelcome();
input.disabled = false;
announce("");
renderActiveChat();
initializeGuestMenu();
