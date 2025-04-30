export function checkEmail(email: string): undefined | boolean {
  return email.split("@")[1]?.includes("."); // returns undefined or false
}

export function checkPassword(password: string): boolean {
  if (!password) return false;
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/; // at least 8 chars, one uppercase, one lowercase, one number
  const isValid = regex.test(password);
  return isValid;
}

export async function fetchPost(url: string, obj: { [key: string]: any }) {
  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify(obj),
    headers: { "content-type": "application/json" },
  });
  if (!res.ok) throw new Error();
  const resJson = await res.json();
  return resJson;
}

export async function fetchGet(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error();
  const resJson = await res.json();
  return resJson;
}
