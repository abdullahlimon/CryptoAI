export type AIProvider = "groq" | "gemini" | "ollama";

export type AIMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AICompleteOpts = {
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  /** preferred provider; router falls back automatically. */
  prefer?: AIProvider;
};

export type AICompleteResult = {
  content: string;
  provider: AIProvider;
  model: string;
  tokensIn?: number;
  tokensOut?: number;
};
