export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^8\d{10}$/;
  return phoneRegex.test(phone.trim());
};

export const parsePhoneNumber = (phoneStr: string): number | null => {
  if (!validatePhoneNumber(phoneStr)) {
    return null;
  }
  const phoneNum = parseInt(phoneStr.trim(), 10);
  return isNaN(phoneNum) ? null : phoneNum;
};

export const formatPhoneNumber = (phone: number): string => {
  return phone.toString();
};

export const validateWeight = (weight: string): boolean => {
  const weightNum = parseFloat(weight);
  return !isNaN(weightNum) && weightNum > 0;
};

export const validateDate = (date: string): boolean => {
  const dateRegex =
    /^\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{4}$/i;
  return dateRegex.test(date.trim());
};

export const validateUserLine = (line: string): boolean => {
  const parts = line.split("\t");
  if (parts.length !== 3) return false;

  const [phone, fullName, address] = parts;

  if (!validatePhoneNumber(phone)) return false;

  if (!fullName.trim()) return false;

  if (!address.trim()) return false;

  return true;
};

export const validatePackageLine = (line: string): boolean => {
  const parts = line.split("\t");
  if (parts.length !== 4) return false;

  const [senderPhone, receiverPhone, weight, date] = parts;

  if (!validatePhoneNumber(senderPhone)) return false;
  if (!validatePhoneNumber(receiverPhone)) return false;

  if (!validateWeight(weight)) return false;

  if (!validateDate(date)) return false;

  return true;
};

export const detectFileType = (
  content: string
): "users" | "packages" | "invalid" => {
  const lines = content.split("\n").filter((line) => line.trim() !== "");

  if (lines.length === 0) return "invalid";

  const firstLine = lines[0];
  const parts = firstLine.split("\t");

  if (parts.length === 3) {
    if (validateUserLine(firstLine)) {
      return "users";
    }
  } else if (parts.length === 4) {
    if (validatePackageLine(firstLine)) {
      return "packages";
    }
  }

  return "invalid";
};

export const validateFileContent = (
  content: string,
  expectedType: "users" | "packages"
): { isValid: boolean; errors: string[] } => {
  const lines = content.split("\n").filter((line) => line.trim() !== "");
  const errors: string[] = [];

  if (lines.length === 0) {
    return { isValid: false, errors: ["Файл пустой"] };
  }

  lines.forEach((line, index) => {
    const lineNumber = index + 1;

    if (expectedType === "users") {
      if (!validateUserLine(line)) {
        const parts = line.split("\t");
        if (parts.length !== 3) {
          errors.push(
            `Строка ${lineNumber}: неверное количество полей (ожидается 3)`
          );
        } else {
          const [phone, fullName, address] = parts;
          if (!validatePhoneNumber(phone)) {
            errors.push(
              `Строка ${lineNumber}: неверный формат телефона (ожидается 8XXXXXXXXXX)`
            );
          }
          if (!fullName.trim()) {
            errors.push(`Строка ${lineNumber}: пустое поле ФИО`);
          }
          if (!address.trim()) {
            errors.push(`Строка ${lineNumber}: пустое поле адреса`);
          }
        }
      }
    } else if (expectedType === "packages") {
      if (!validatePackageLine(line)) {
        const parts = line.split("\t");
        if (parts.length !== 4) {
          errors.push(
            `Строка ${lineNumber}: неверное количество полей (ожидается 4)`
          );
        } else {
          const [senderPhone, receiverPhone, weight, date] = parts;
          if (!validatePhoneNumber(senderPhone)) {
            errors.push(
              `Строка ${lineNumber}: неверный формат телефона отправителя (ожидается 8XXXXXXXXXX)`
            );
          }
          if (!validatePhoneNumber(receiverPhone)) {
            errors.push(
              `Строка ${lineNumber}: неверный формат телефона получателя (ожидается 8XXXXXXXXXX)`
            );
          }
          if (!validateWeight(weight)) {
            errors.push(
              `Строка ${lineNumber}: неверный формат веса (ожидается положительное число)`
            );
          }
          if (!validateDate(date)) {
            errors.push(
              `Строка ${lineNumber}: неверный формат даты (ожидается "dd mmm yyyy", например "15 jan 2025")`
            );
          }
        }
      }
    }
  });

  return { isValid: errors.length === 0, errors };
};

export function validateFullName(fullName: string): boolean {
  // Три слова, каждое с заглавной буквы, только буквы
  const parts = fullName.trim().split(/\s+/);
  if (parts.length !== 3) return false;
  return parts.every((word) => /^[А-ЯЁ][а-яё]+$/.test(word));
}

export function validateAddress(address: string): boolean {
  // г. <город>, ул. <улица>, д. <номер>, кв. <номер>
  const regex =
    /^г\.\s?[А-ЯЁа-яё\- ]+,\s?ул\.\s?[А-ЯЁа-яё\- ]+,\s?д\.\s?\d+,\s?кв\.\s?\d+$/;
  return regex.test(address.trim());
}

export function validateUniqueFullName(
  fullName: string,
  users: { fullName: string }[]
): boolean {
  return !users.some((u) => u.fullName.trim() === fullName.trim());
}

export function validateUniquePhone(
  phone: string | number,
  users: { phone: string | number }[]
): boolean {
  return !users.some((u) => String(u.phone) === String(phone));
}

export function validateUserExists(
  phone: string | number,
  users: { phone: string | number }[]
): boolean {
  return users.some((u) => String(u.phone) === String(phone));
}
