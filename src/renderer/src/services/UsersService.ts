// src/renderer/src/services/UsersService.ts
import { HashTable } from "../data-structures/HashTable";
import { UsersArray, UserData } from "../data-structures/UsersArray";
import { User } from "../types";
import { logger } from "./Logger";

export class UsersService {
  private hashTable: HashTable<number>; // Ключ: телефон (как строка), Значение: индекс массива
  private usersArray: UsersArray; // Массив с данными (без телефона)

  constructor() {
    this.hashTable = new HashTable<number>(11); // Начинаем с простого числа
    this.usersArray = new UsersArray();
    logger.info(
      "UsersService: Initialized hash table (phone -> index) and users array (data without phone)"
    );
  }

  // Основные операции CRUD
  public addUser(user: User): void {
    // ИСПРАВЛЕНО: Проверка на дубликат перед добавлением
    const phoneKey = user.phone.toString();
    if (this.hashTable.containsKey(phoneKey)) {
      logger.warning(
        `UsersService: User with phone ${user.phone} already exists, skipping add`
      );
      throw new Error(`User with phone ${user.phone} already exists`);
    }

    // Извлекаем данные без телефона
    const userData: UserData = {
      fullName: user.fullName,
      address: user.address,
    };

    // Добавляем данные в массив
    const index = this.usersArray.add(userData);
    // Сохраняем индекс в хеш-таблице с телефоном как ключом
    this.hashTable.put(phoneKey, index);
    logger.info(
      `UsersService: Added user ${user.phone} (${user.fullName}) at index ${index}`
    );
  }

  public getUser(phone: number): User | null {
    // Получаем индекс из хеш-таблицы по телефону
    const phoneKey = phone.toString();
    const index = this.hashTable.get(phoneKey);
    if (index === null) {
      logger.debug(`UsersService: Get user ${phone} - not found in hash table`);
      return null;
    }

    // Получаем данные из массива по индексу
    const userData = this.usersArray.get(index);
    if (userData === null) {
      logger.error(
        `UsersService: Get user ${phone} - invalid index ${index} in array`
      );
      return null;
    }

    // Собираем полного пользователя с телефоном
    const user: User = {
      phone: phone,
      fullName: userData.fullName,
      address: userData.address,
    };

    logger.debug(`UsersService: Get user ${phone} - found at index ${index}`);
    return user;
  }

  public getAllUsers(): User[] {
    const users: User[] = [];
    const allPhoneKeys = this.hashTable.keys();

    for (const phoneKey of allPhoneKeys) {
      const phone = parseInt(phoneKey, 10);
      const user = this.getUser(phone);
      if (user) {
        users.push(user);
      }
    }

    logger.debug(`UsersService: Retrieved all users (${users.length} total)`);
    return users;
  }

  public removeUser(phone: number): boolean {
    // Получаем индекс удаляемого пользователя
    const phoneKey = phone.toString();
    const index = this.hashTable.get(phoneKey);
    if (index === null) {
      logger.warning(`UsersService: Remove user ${phone} - not found`);
      return false;
    }

    // Удаляем из хеш-таблицы
    const hashRemoved = this.hashTable.delete(phoneKey);
    if (!hashRemoved) {
      logger.error(`UsersService: Failed to remove ${phone} from hash table`);
      return false;
    }

    // Удаляем из массива и получаем информацию о перемещении
    const moveInfo = this.usersArray.remove(index);

    if (moveInfo) {
      // Если элемент был перемещен, нужно найти телефон, который указывал на старый индекс
      // и обновить его на новый индекс
      const allPhoneKeys = this.hashTable.keys();
      for (const phoneKey of allPhoneKeys) {
        const currentIndex = this.hashTable.get(phoneKey);
        if (currentIndex === moveInfo.movedFromIndex) {
          this.hashTable.put(phoneKey, moveInfo.newIndex);
          logger.debug(
            `UsersService: Updated index for phone ${phoneKey} from ${moveInfo.movedFromIndex} to ${moveInfo.newIndex}`
          );
          break;
        }
      }
    }

    logger.info(
      `UsersService: Remove user ${phone} - success (was at index ${index})`
    );
    return true;
  }

  public hasUser(phone: number): boolean {
    const phoneKey = phone.toString();
    const exists = this.hashTable.containsKey(phoneKey);
    logger.debug(`UsersService: Check user ${phone} exists - ${exists}`);
    return exists;
  }

  public clear(): void {
    const countBefore = this.usersArray.size();
    this.hashTable.clear();
    this.usersArray.clear();
    logger.warning(`UsersService: Cleared all users (${countBefore} removed)`);
  }

  // Операции поиска
  public searchByName(namePart: string): User[] {
    const results = this.getAllUsers().filter((user) =>
      user.fullName.toLowerCase().includes(namePart.toLowerCase())
    );
    logger.info(
      `UsersService: Search by name "${namePart}" - ${results.length} results`
    );
    return results;
  }

  public searchByAddress(addressPart: string): User[] {
    const results = this.getAllUsers().filter((user) =>
      user.address.toLowerCase().includes(addressPart.toLowerCase())
    );
    logger.info(
      `UsersService: Search by address "${addressPart}" - ${results.length} results`
    );
    return results;
  }

  // ИСПРАВЛЕНО: Массовые операции с проверкой дубликатов
  public loadUsers(users: User[]): void {
    logger.info(`UsersService: Starting load of ${users.length} users`);
    this.clear();

    const duplicates: number[] = [];
    const loaded: number[] = [];

    users.forEach((user, index) => {
      const phoneKey = user.phone.toString();

      // ИСПРАВЛЕНО: Проверка на дубликаты в загружаемых данных
      if (this.hashTable.containsKey(phoneKey)) {
        duplicates.push(user.phone);
        logger.warning(
          `UsersService: Duplicate phone ${user.phone} skipped (line ${
            index + 1
          })`
        );
      } else {
        try {
          this.addUserInternal(user); // Используем внутренний метод без дополнительной проверки
          loaded.push(user.phone);
          if (loaded.length % 10 === 0 || index === users.length - 1) {
            logger.debug(
              `UsersService: Loaded ${loaded.length}/${users.length} users`
            );
          }
        } catch (error) {
          logger.error(
            `UsersService: Failed to load user ${user.phone}: ${error}`
          );
        }
      }
    });

    // ИСПРАВЛЕНО: Отчет о дубликатах как требуется по ТЗ
    if (duplicates.length > 0) {
      logger.warning(
        `UsersService: Found ${
          duplicates.length
        } duplicate phone numbers: ${duplicates.join(", ")}`
      );
    }

    logger.info(
      `UsersService: Load complete - ${loaded.length} users loaded, ${duplicates.length} duplicates skipped`
    );
    this.logStatistics();
  }

  /**
   * Внутренний метод добавления без проверки дубликатов
   * Используется при массовой загрузке после проверки
   */
  private addUserInternal(user: User): void {
    const userData: UserData = {
      fullName: user.fullName,
      address: user.address,
    };

    const index = this.usersArray.add(userData);
    const phoneKey = user.phone.toString();
    this.hashTable.put(phoneKey, index);
    logger.debug(
      `UsersService: Internal add user ${user.phone} at index ${index}`
    );
  }

  // Статистика и метрики
  public getCount(): number {
    return this.usersArray.size();
  }

  public getCapacity(): number {
    return this.hashTable.getCapacity();
  }

  public getLoadFactor(): number {
    return this.hashTable.getLoadFactor();
  }

  public getStatistics(): {
    size: number;
    capacity: number;
    loadFactor: number;
    distribution: ReturnType<HashTable<number>["getPerformanceStats"]>;
  } {
    const stats = {
      size: this.getCount(),
      capacity: this.getCapacity(),
      loadFactor: this.getLoadFactor(),
      distribution: this.hashTable.getPerformanceStats(),
    };

    logger.debug(
      `UsersService: Statistics - Size: ${stats.size}, Capacity: ${
        stats.capacity
      }, Load Factor: ${stats.loadFactor.toFixed(3)}`
    );
    return stats;
  }

  private logStatistics(): void {
    const stats = this.hashTable.getPerformanceStats();
    logger.debug(
      `HashTable Performance: Load Factor: ${stats.loadFactor.toFixed(3)}, ` +
        `Empty: ${stats.emptySlots}, Occupied: ${stats.occupiedSlots}, Deleted: ${stats.deletedSlots}`
    );
  }

  // Метод для демонстрации работы хеш-функции
  public demonstrateHashing(key: string): {
    originalKey: string;
    numericRepresentation: number;
    squared: number;
    middleDigits: string;
    finalHash: number;
    tableIndex: number;
  } {
    // Дублируем логику хеш-функции для демонстрации
    let numericKey = 0;
    for (let i = 0; i < key.length; i++) {
      numericKey += key.charCodeAt(i) * (i + 1);
    }

    const squared = numericKey * numericKey;
    const squaredStr = squared.toString();
    const len = squaredStr.length;

    let middleDigits: string;
    if (len >= 6) {
      const start = Math.floor((len - 4) / 2);
      middleDigits = squaredStr.substring(start, start + 4);
    } else if (len >= 4) {
      const start = Math.floor((len - 2) / 2);
      middleDigits = squaredStr.substring(start, start + 2);
    } else {
      middleDigits = squaredStr;
    }

    const hashValue = parseInt(middleDigits, 10);
    const tableIndex = Math.abs(hashValue) % this.getCapacity();

    return {
      originalKey: key,
      numericRepresentation: numericKey,
      squared,
      middleDigits,
      finalHash: hashValue,
      tableIndex,
    };
  }

  // ИСПРАВЛЕНО: Метод для доступа к внутренней структуре через публичный интерфейс
  public getHashTableEntries(): Array<{
    index: number;
    key: string;
    value: User | null;
    status: "empty" | "occupied" | "deleted";
    hashValue?: number;
  }> {
    // ИСПРАВЛЕНО: Используем публичный метод вместо прямого доступа к приватному полю
    const tableStructure = this.hashTable.getTableStructure();
    const entries: Array<{
      index: number;
      key: string;
      value: User | null;
      status: "empty" | "occupied" | "deleted";
      hashValue?: number;
    }> = [];

    for (const struct of tableStructure) {
      if (!struct.hasValue) {
        // Пустая ячейка
        entries.push({
          index: struct.index,
          key: "",
          value: null,
          status: "empty",
        });
      } else if (struct.isDeleted) {
        // Удаленная запись - пытаемся восстановить для отображения
        entries.push({
          index: struct.index,
          key: struct.key || "",
          value: null, // Не показываем данные удаленного пользователя
          status: "deleted",
          hashValue: struct.hashValue || 0,
        });
      } else {
        // Занятая ячейка - восстанавливаем пользователя
        const phone = struct.key ? parseInt(struct.key, 10) : 0;
        const user = this.getUser(phone);

        entries.push({
          index: struct.index,
          key: struct.key || "",
          value: user,
          status: "occupied",
          hashValue: struct.hashValue || 0,
        });
      }
    }

    return entries;
  }
}
