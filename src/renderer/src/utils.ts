import { User, Package } from "./types";

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^8\d{10}$/;
  return phoneRegex.test(phone.trim());
};

export const parsePhoneNumber = (phoneStr: string): number | null => {
  const trimmed = phoneStr.trim();
  if (!validatePhoneNumber(trimmed)) {
    return null;
  }
  return parseInt(trimmed, 10);
};

export const formatPhoneNumber = (phone: number): string => {
  return phone.toString();
};

export const validateWeight = (weight: string): boolean => {
  const weightNum = parseFloat(weight);
  return !isNaN(weightNum) && weightNum > 0 && weightNum <= 1000;
};

export const validateDate = (date: string): boolean => {
  const dateRegex =
    /^\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{4}$/i;
  if (!dateRegex.test(date.trim())) return false;
  
  const parts = date.trim().split(/\s+/);
  const day = parseInt(parts[0], 10);
  const month = parts[1].toLowerCase();
  const year = parseInt(parts[2], 10);
  
  if (day < 1 || day > 31) return false;
  if (year < 2020 || year > 2026) return false;
  
  // Проверка дней в месяце
  const daysInMonth: { [key: string]: number } = {
    jan: 31, feb: 29, mar: 31, apr: 30, may: 31, jun: 30,
    jul: 31, aug: 31, sep: 30, oct: 31, nov: 30, dec: 31
  };
  
  if (day > daysInMonth[month]) return false;
  
  return true;
};

export const validateUserLine = (line: string): boolean => {
  const parts = line.split("\t");
  if (parts.length !== 3) return false;

  const [phone, fullName, address] = parts;

  if (!validatePhoneNumber(phone)) return false;
  if (!validateFullName(fullName)) return false;
  if (!validateAddress(address)) return false;

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
): { isValid: boolean; errors: string[]; warnings: string[] } => {
  const lines = content.split("\n").filter((line) => line.trim() !== "");
  const errors: string[] = [];
  const warnings: string[] = [];

  if (lines.length === 0) {
    return { isValid: false, errors: ["Файл пустой"], warnings: [] };
  }

  // Проверка на дубликаты
  const seenLines = new Set<string>();
  const duplicates: number[] = [];

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const normalizedLine = line.trim().toLowerCase();
    
    if (seenLines.has(normalizedLine)) {
      duplicates.push(lineNumber);
    } else {
      seenLines.add(normalizedLine);
    }

    if (expectedType === "users") {
      if (!validateUserLine(line)) {
        const parts = line.split("\t");
        if (parts.length !== 3) {
          errors.push(
            `Строка ${lineNumber}: неверное количество полей (ожидается 3, получено ${parts.length})`
          );
        } else {
          const [phone, fullName, address] = parts;
          if (!validatePhoneNumber(phone)) {
            errors.push(
              `Строка ${lineNumber}: неверный формат телефона "${phone}" (ожидается 8XXXXXXXXXX)`
            );
          }
          if (!validateFullName(fullName)) {
            errors.push(
              `Строка ${lineNumber}: неверный формат ФИО "${fullName}" (ожидается три слова с заглавной буквы)`
            );
          }
          if (!validateAddress(address)) {
            errors.push(
              `Строка ${lineNumber}: неверный формат адреса "${address}" (ожидается: г. <город>, ул. <улица>, д. <номер>, кв. <номер>)`
            );
          }
        }
      }
    } else if (expectedType === "packages") {
      if (!validatePackageLine(line)) {
        const parts = line.split("\t");
        if (parts.length !== 4) {
          errors.push(
            `Строка ${lineNumber}: неверное количество полей (ожидается 4, получено ${parts.length})`
          );
        } else {
          const [senderPhone, receiverPhone, weight, date] = parts;
          if (!validatePhoneNumber(senderPhone)) {
            errors.push(
              `Строка ${lineNumber}: неверный формат телефона отправителя "${senderPhone}" (ожидается 8XXXXXXXXXX)`
            );
          }
          if (!validatePhoneNumber(receiverPhone)) {
            errors.push(
              `Строка ${lineNumber}: неверный формат телефона получателя "${receiverPhone}" (ожидается 8XXXXXXXXXX)`
            );
          }
          if (!validateWeight(weight)) {
            errors.push(
              `Строка ${lineNumber}: неверный формат веса "${weight}" (ожидается положительное число от 0.1 до 1000)`
            );
          }
          if (!validateDate(date)) {
            errors.push(
              `Строка ${lineNumber}: неверный формат даты "${date}" (ожидается "dd mmm yyyy", например "15 jan 2025")`
            );
          }
        }
      }
    }
  });

  // Добавляем предупреждения о дубликатах
  if (duplicates.length > 0) {
    warnings.push(
      `Найдены дубликаты в строках: ${duplicates.join(", ")}`
    );
  }

  // Проверка на минимальное количество записей
  if (lines.length < 1) {
    errors.push("Файл должен содержать хотя бы одну запись");
  }

  // Проверка на максимальное количество записей
  if (lines.length > 10000) {
    warnings.push("Файл содержит более 10,000 записей, загрузка может занять время");
  }

  return { isValid: errors.length === 0, errors, warnings };
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

export function validateUserExists(
  phoneStr: string,
  users: User[]
): boolean {
  const phone = parsePhoneNumber(phoneStr);
  if (phone === null) return false;
  return users.some((user) => user.phone === phone);
}

export function validateUniquePhone(
  phoneStr: string,
  users: User[]
): boolean {
  const phone = parsePhoneNumber(phoneStr);
  if (phone === null) return false;
  return !users.some((user) => user.phone === phone);
}

export function validateUniqueFullName(
  fullName: string,
  users: User[]
): boolean {
  return !users.some((user) => user.fullName === fullName.trim());
}

// Дополнительные функции валидации
export const validateFileEncoding = (content: string): boolean => {
  // Проверка на наличие недопустимых символов
  const invalidChars = /[^\x00-\x7F\u0400-\u04FF\u0020-\u007E\u00A0-\u00FF]/;
  return !invalidChars.test(content);
};

export const validateFileSize = (content: string): boolean => {
  // Максимальный размер файла 10MB
  const maxSize = 10 * 1024 * 1024; // 10MB в байтах
  return content.length <= maxSize;
};

export const sanitizeLine = (line: string): string => {
  // Удаление лишних пробелов и нормализация
  return line.trim().replace(/\s+/g, ' ');
};

export const parseUserFromLine = (line: string, lineNumber: number): { user: User | null; error: string | null } => {
  const parts = line.split("\t");
  
  if (parts.length !== 3) {
    return { 
      user: null, 
      error: `Строка ${lineNumber}: неверное количество полей (ожидается 3, получено ${parts.length})` 
    };
  }

  const [phoneStr, fullName, address] = parts;
  const phone = parsePhoneNumber(phoneStr);

  if (phone === null) {
    return { 
      user: null, 
      error: `Строка ${lineNumber}: неверный формат телефона "${phoneStr}"` 
    };
  }

  if (!validateFullName(fullName)) {
    return { 
      user: null, 
      error: `Строка ${lineNumber}: неверный формат ФИО "${fullName}"` 
    };
  }

  if (!validateAddress(address)) {
    return { 
      user: null, 
      error: `Строка ${lineNumber}: неверный формат адреса "${address}"` 
    };
  }

  return {
    user: { phone, fullName: fullName.trim(), address: address.trim() },
    error: null
  };
};

export const parsePackageFromLine = (line: string, lineNumber: number): { package: Package | null; error: string | null } => {
  const parts = line.split("\t");
  
  if (parts.length !== 4) {
    return { 
      package: null, 
      error: `Строка ${lineNumber}: неверное количество полей (ожидается 4, получено ${parts.length})` 
    };
  }

  const [senderPhoneStr, receiverPhoneStr, weightStr, date] = parts;
  const senderPhone = parsePhoneNumber(senderPhoneStr);
  const receiverPhone = parsePhoneNumber(receiverPhoneStr);
  const weight = parseFloat(weightStr);

  if (senderPhone === null) {
    return { 
      package: null, 
      error: `Строка ${lineNumber}: неверный формат телефона отправителя "${senderPhoneStr}"` 
    };
  }

  if (receiverPhone === null) {
    return { 
      package: null, 
      error: `Строка ${lineNumber}: неверный формат телефона получателя "${receiverPhoneStr}"` 
    };
  }

  if (!validateWeight(weightStr)) {
    return { 
      package: null, 
      error: `Строка ${lineNumber}: неверный формат веса "${weightStr}"` 
    };
  }

  if (!validateDate(date)) {
    return { 
      package: null, 
      error: `Строка ${lineNumber}: неверный формат даты "${date}"` 
    };
  }

  return {
    package: { 
      senderPhone, 
      receiverPhone, 
      weight, 
      date: date.trim() 
    },
    error: null
  };
};
