export const PASSWORD_REQUIREMENTS =
  "Use 12–200 characters, with uppercase and lowercase letters, a number, and a symbol.";

export function getPasswordValidationError(password: string): string | null {
  if (password.length < 12 || password.length > 200) return "Password must be 12–200 characters long.";
  if (/\s/.test(password)) return "Password cannot contain spaces.";
  if (!/[a-z]/.test(password)) return "Password must include a lowercase letter.";
  if (!/[A-Z]/.test(password)) return "Password must include an uppercase letter.";
  if (!/\d/.test(password)) return "Password must include a number.";
  if (!/[^A-Za-z0-9]/.test(password)) return "Password must include a symbol.";
  return null;
}

export function isValidPassword(password: string) {
  return getPasswordValidationError(password) === null;
}
