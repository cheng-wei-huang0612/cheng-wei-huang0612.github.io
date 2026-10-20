import { MAX_INPUT_LENGTH } from "./gcd.js";

export const MAX_CHATS = 20;
export const MAX_EXCHANGES = 40;
export const MAX_DRAFT_LENGTH = MAX_INPUT_LENGTH;

export interface Chat<T> {
  id: number;
  title: string;
  draft: string;
  scrollTop: number;
  exchanges: T[];
}

function chatTitle(value: string): string {
  const normalized = value.replace(/\s+/gu, " ").trim();
  return Array.from(normalized).slice(0, 48).join("") || "New chat";
}

export class ChatSession<T> {
  readonly chats: Chat<T>[];
  private activeId: number;
  private newId = 1;

  constructor() {
    const initial = this.makeChat();
    this.chats = [initial];
    this.activeId = initial.id;
  }

  get active(): Chat<T> {
    return this.chats.find((chat) => chat.id === this.activeId)!;
  }

  create(): Chat<T> | null {
    if (this.active.exchanges.length === 0 && this.active.draft.length === 0) {
      return this.active;
    }
    if (this.chats.length >= MAX_CHATS) return null;

    const chat = this.makeChat();
    this.chats.unshift(chat);
    this.activeId = chat.id;
    return chat;
  }

  select(id: number): boolean {
    if (!this.chats.some((chat) => chat.id === id)) return false;
    this.activeId = id;
    return true;
  }

  delete(id: number): boolean {
    const index = this.chats.findIndex((chat) => chat.id === id);
    if (index === -1) return false;

    this.chats.splice(index, 1);
    if (this.chats.length === 0) {
      const replacement = this.makeChat();
      this.chats.push(replacement);
      this.activeId = replacement.id;
    } else if (this.activeId === id) {
      this.activeId = (this.chats[index] ?? this.chats[0]).id;
    }
    return true;
  }

  append(exchange: T, title: string): Chat<T> {
    const chat = this.active;
    if (chat.exchanges.length === 0) chat.title = chatTitle(title);
    chat.exchanges.push(exchange);
    if (chat.exchanges.length > MAX_EXCHANGES) chat.exchanges.shift();
    return chat;
  }

  setDraft(value: string): boolean {
    if (value.length > MAX_DRAFT_LENGTH) return false;
    this.active.draft = value;
    return true;
  }

  private makeChat(): Chat<T> {
    return {
      id: this.newId++,
      title: "New chat",
      draft: "",
      scrollTop: 0,
      exchanges: [],
    };
  }
}
