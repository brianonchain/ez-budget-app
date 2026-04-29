declare module "web-push" {
  export type WebPushSubscription = unknown;

  export interface SendResult {
    statusCode?: number;
    body?: unknown;
    headers?: Record<string, string>;
  }

  export interface RequestOptions {
    TTL?: number;
    vapidDetails?: {
      subject: string;
      publicKey: string;
      privateKey: string;
    };
    headers?: Record<string, string>;
    topic?: string;
    urgency?: "very-low" | "low" | "normal" | "high";
    contentEncoding?: "aes128gcm" | "aesgcm";
  }

  export interface WebPush {
    sendNotification(subscription: WebPushSubscription, payload?: string | Buffer, options?: RequestOptions): Promise<SendResult>;
    setVapidDetails(subject: string, publicKey: string, privateKey: string): void;
  }

  const webpush: WebPush;
  export default webpush;
}
