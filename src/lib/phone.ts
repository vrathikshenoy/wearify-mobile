export function formatPhone(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length > 10) digits = digits.slice(2);
  return digits.slice(0, 10);
}

export function fullPhone(raw: string): string {
  return `+91${formatPhone(raw)}`;
}

export function isValidPhone(raw: string): boolean {
  return /^[6-9]\d{9}$/.test(formatPhone(raw));
}

export function isAdultDob(value: string): boolean {
  const dob = new Date(`${value}T00:00:00`);
  if (Number.isNaN(dob.getTime())) return false;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  if (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) age--;
  return age >= 13 && age <= 120;
}
