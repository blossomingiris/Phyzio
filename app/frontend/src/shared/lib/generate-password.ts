const PASSWORD_LOWER = "abcdefghijkmnpqrstuvwxyz";
const PASSWORD_UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const PASSWORD_DIGITS = "23456789";

export function generatePassword(length = 14): string {
  const all = PASSWORD_LOWER + PASSWORD_UPPER + PASSWORD_DIGITS;
  const pick = (chars: string) =>
    chars[Math.floor(Math.random() * chars.length)]!;

  const chars = [
    pick(PASSWORD_LOWER),
    pick(PASSWORD_UPPER),
    pick(PASSWORD_DIGITS),
  ];
  while (chars.length < length) chars.push(pick(all));

  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j]!, chars[i]!];
  }

  return chars.join("");
}
