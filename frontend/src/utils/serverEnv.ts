function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export const serverEnv = {
  MONGO_URI: requiredEnv("MONGO_URI"),
  NEXTAUTH_SECRET: requiredEnv("NEXTAUTH_SECRET"),
  NEXTAUTH_URL: requiredEnv("NEXTAUTH_URL"),

  OTP_HMAC_SECRET: requiredEnv("OTP_HMAC_SECRET"),

  GOOGLE_ID: requiredEnv("GOOGLE_ID"),
  GOOGLE_SECRET: requiredEnv("GOOGLE_SECRET"),

  GMAIL_CLIENT_ID: requiredEnv("GMAIL_CLIENT_ID"),
  GMAIL_CLIENT_SECRET: requiredEnv("GMAIL_CLIENT_SECRET"),
  GMAIL_REFRESH_TOKEN: requiredEnv("GMAIL_REFRESH_TOKEN"),

  UPSTASH_REDIS_REST_URL: requiredEnv("UPSTASH_REDIS_REST_URL"),
  UPSTASH_REDIS_REST_TOKEN: requiredEnv("UPSTASH_REDIS_REST_TOKEN"),

  VAPID_SUBJECT: requiredEnv("VAPID_SUBJECT"),
  VAPID_PRIVATE_KEY: requiredEnv("VAPID_PRIVATE_KEY"),
};
