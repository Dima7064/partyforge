const USERNAME_RE = /^[a-zA-Z0-9_-]{3,20}$/;

export function validateUsername(username: string): string | null {
  if (!username) return "Имя пользователя обязательно";
  if (!USERNAME_RE.test(username)) {
    return "Имя: 3–20 символов, только латиница, цифры, _ и -";
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Пароль обязателен";
  if (password.length < 8) return "Пароль минимум 8 символов";
  if (password.length > 72) return "Пароль не больше 72 символов";
  return null;
}

export function usernameToEmail(username: string): string {
  return `${username.toLowerCase()}@partyforge.local`;
}