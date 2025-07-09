// src/renderer/src/services/UsersService.ts
import { HashTable } from "../data-structures/HashTable";
import { UsersArray, UserData } from "../data-structures/UsersArray";
import { User } from "../types";
import { logger } from "./Logger";

export class UsersService {
  private hashTable: HashTable<number>; // Ключ: телефон, Значение: индекс массива
  private usersArray: UsersArray; // Массив с данными (без телефона)

  constructor() {
    this.hashTable = new HashTable<number>(11); // Начинаем с простого числа
    this.usersArray = new UsersArray();
    logger.info("UsersService: Initialized hash table (phone -> index) and users array (data without phone)");
  }

  // Основные операции CRUD
  public addUser(user: User): void {
    // Извлекаем данные без телефона
    const userData: UserData = {
      fullName: user.fullName,
      address: user.address
    };
    
    // Добавляем данные в массив
    const index = this.usersArray.add(userData);
    // Сохраняем индекс в хеш-таблице с телефоном как ключом
    this.hashTable.put(user.phone, index);
    logger.info(`UsersService: Added user ${user.phone} (${user.fullName}) at index ${index}`);
  }

  public getUser(phone: string): User | null {
    // Получаем индекс из хеш-таблицы по телефону
    const index = this.hashTable.get(phone);
    if (index === null) {
      logger.debug(`UsersService: Get user ${phone} - not found in hash table`);
      return null;
    }
    
    // Получаем данные из массива по индексу
    const userData = this.usersArray.get(index);
    if (userData === null) {
      logger.error(`UsersService: Get user ${phone} - invalid index ${index} in array`);
      return null;
    }

    // Собираем полного пользователя с телефоном
    const user: User = {
      phone: phone,
      fullName: userData.fullName,
      address: userData.address
    };
    
    logger.debug(`UsersService: Get user ${phone} - found at index ${index}`);
    return user;
  }

  public getAllUsers(): User[] {
    const users: User[] = [];
    const allPhones = this.hashTable.keys();
    
    for (const phone of allPhones) {
      const user = this.getUser(phone);
      if (user) {
        users.push(user);
      }
    }
    
    logger.debug(`UsersService: Retrieved all users (${users.length} total)`);
    return users;
  }

  public removeUser(phone: string): boolean {
    // Получаем индекс удаляемого пользователя
    const index = this.hashTable.get(phone);
    if (index === null) {
      logger.warning(`UsersService: Remove user ${phone} - not found`);
      return false;
    }

    // Удаляем из хеш-таблицы
    const hashRemoved = this.hashTable.delete(phone);
    if (!hashRemoved) {
      logger.error(`UsersService: Failed to remove ${phone} from hash table`);
      return false;
    }

    // Удаляем из массива и получаем информацию о перемещении
    const moveInfo = this.usersArray.remove(index);
    
    if (moveInfo) {
      // Если элемент был перемещен, нужно найти телефон, который указывал на старый индекс
      // и обновить его на новый индекс
      const allPhones = this.hashTable.keys();
      for (const phone of allPhones) {
        const currentIndex = this.hashTable.get(phone);
        if (currentIndex === moveInfo.movedFromIndex) {
          this.hashTable.put(phone, moveInfo.newIndex);
          logger.debug(`UsersService: Updated index for phone ${phone} from ${moveInfo.movedFromIndex} to ${moveInfo.newIndex}`);
          break;
        }
      }
    }

    logger.info(`UsersService: Remove user ${phone} - success (was at index ${index})`);
    return true;
  }

  public hasUser(phone: string): boolean {
    const exists = this.hashTable.containsKey(phone);
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
    logger.info(`UsersService: Search by name "${namePart}" - ${results.length} results`);
    return results;
  }

  public searchByAddress(addressPart: string): User[] {
    const results = this.getAllUsers().filter((user) =>
      user.address.toLowerCase().includes(addressPart.toLowerCase())
    );
    logger.info(`UsersService: Search by address "${addressPart}" - ${results.length} results`);
    return results;
  }

  // Массовые операции
  public loadUsers(users: User[]): void {
    logger.info(`UsersService: Starting load of ${users.length} users`);
    this.clear();

    users.forEach((user, index) => {
      this.addUser(user);
      if ((index + 1) % 10 === 0 || index === users.length - 1) {
        logger.debug(`UsersService: Loaded ${index + 1}/${users.length} users`);
      }
    });

    logger.info(`UsersService: Load complete - ${this.getCount()} users in system`);
    this.logStatistics();
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

    logger.debug(`UsersService: Statistics - Size: ${stats.size}, Capacity: ${stats.capacity}, Load Factor: ${stats.loadFactor.toFixed(3)}`);
    return stats;
  }

  private logStatistics(): void {
    const stats = this.hashTable.getPerformanceStats();
    logger.debug(`HashTable Performance: Load Factor: ${stats.loadFactor.toFixed(3)}, ` +
      `Empty: ${stats.emptySlots}, Occupied: ${stats.occupiedSlots}, Deleted: ${stats.deletedSlots}`);
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
    const tableIndex = hashValue % this.getCapacity();

    return {
      originalKey: key,
      numericRepresentation: numericKey,
      squared,
      middleDigits,
      finalHash: hashValue,
      tableIndex,
    };
  }

  // Метод для доступа к внутренней структуре (для отображения)
  public getHashTableEntries(): Array<{
    index: number;
    key: string;
    value: User | null;
    status: "empty" | "occupied" | "deleted";
    hashValue?: number;
  }> {
    const capacity = this.hashTable.getCapacity();
    const table = (this.hashTable as any).table;
    const entries: Array<{
      index: number;
      key: string;
      value: User | null;
      status: "empty" | "occupied" | "deleted";
      hashValue?: number;
    }> = [];

    for (let i = 0; i < capacity; i++) {
      const entry = table[i];
      
      if (entry === null) {
        // Пустая ячейка
        entries.push({
          index: i,
          key: "",
          value: null,
          status: "empty",
        });
      } else if (entry.isDeleted) {
        // Удаленная запись - восстанавливаем пользователя для отображения
        const userData = this.usersArray.get(entry.value);
        const user: User | null = userData ? {
          phone: entry.key,
          fullName: userData.fullName,
          address: userData.address
        } : null;
        
        entries.push({
          index: i,
          key: entry.key,
          value: user,
          status: "deleted",
          hashValue: (this.hashTable as any).hash ? (this.hashTable as any).hash(entry.key) : 0,
        });
      } else {
        // Занятая ячейка - восстанавливаем пользователя
        const userData = this.usersArray.get(entry.value);
        const user: User | null = userData ? {
          phone: entry.key,
          fullName: userData.fullName,
          address: userData.address
        } : null;
        
        entries.push({
          index: i,
          key: entry.key,
          value: user,
          status: "occupied",
          hashValue: (this.hashTable as any).hash ? (this.hashTable as any).hash(entry.key) : 0,
        });
      }
    }

    return entries;
  }
}