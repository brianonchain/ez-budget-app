function requiredPublicEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export const publicEnv = {
  NEXT_PUBLIC_BASE_URL: requiredPublicEnv("NEXT_PUBLIC_BASE_URL"),
};
