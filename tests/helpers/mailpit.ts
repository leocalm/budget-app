import { e2eEnv } from '../setup/env';

export interface MailpitMessage {
  ID: string;
  From: { Address: string; Name: string };
  To: { Address: string; Name: string }[];
  Subject: string;
  Created: string;
  Size: number;
}

export interface MailpitSearchResult {
  messages: MailpitMessage[];
  count: number;
}

export interface MailpitFullMessage {
  ID: string;
  From: { Address: string; Name: string };
  To: { Address: string; Name: string }[];
  Subject: string;
  Text: string;
  HTML: string;
  Created: string;
}

export class MailpitClient {
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl ?? e2eEnv.mailpitApiUrl;
  }

  async waitForMessage(
    predicate: (msg: MailpitMessage) => boolean,
    options: { timeout?: number; pollInterval?: number } = {}
  ): Promise<MailpitFullMessage> {
    const { timeout = 15_000, pollInterval = 500 } = options;
    const deadline = Date.now() + timeout;

    while (Date.now() < deadline) {
      const result = await this.searchMessages(predicate);
      if (result) {
        return result;
      }
      await new Promise((r) => setTimeout(r, pollInterval));
    }

    throw new Error(`Mailpit: no message matched predicate within ${timeout}ms`);
  }

  async searchMessages(
    predicate: (msg: MailpitMessage) => boolean
  ): Promise<MailpitFullMessage | null> {
    const messages = await this.listMessages();
    const match = messages.find(predicate);
    if (!match) {
      return null;
    }
    return this.getMessage(match.ID);
  }

  async listMessages(): Promise<MailpitMessage[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/messages?limit=50`);
    if (!response.ok) {
      throw new Error(`Mailpit listMessages failed: ${response.status} ${await response.text()}`);
    }
    const data = (await response.json()) as MailpitSearchResult;
    return data.messages ?? [];
  }

  async getMessage(id: string): Promise<MailpitFullMessage> {
    const response = await fetch(`${this.baseUrl}/api/v1/message/${id}`);
    if (!response.ok) {
      throw new Error(`Mailpit getMessage failed: ${response.status} ${await response.text()}`);
    }
    return response.json() as Promise<MailpitFullMessage>;
  }

  async purge(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v1/messages`, { method: 'DELETE' });
    if (!response.ok && response.status !== 404) {
      throw new Error(`Mailpit purge failed: ${response.status} ${await response.text()}`);
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/messages?limit=1`, {
        signal: AbortSignal.timeout(3000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
