// src/renderer/src/services/UsersService.ts
import { HashTable } from "../data-structures/HashTable";
import { User } from "../types";
import { logger } from "./Logger";

export class UsersService {
  private hashTable: HashTable<User>;

  constructor() {
    this.hashTable = new HashTable<User>(11); // Начинаем с простого числа
    logger.info("UsersService: Initialized simple hash table with mid-square method");
  }

  // Основные операции CRUD
  public addUser(user: User): void {
    this.hashTable.put(user.phone, user);
    logger.info(`UsersService: Added user ${user.phone} (${user.fullName})`);
  }

  public getUser(phone: string): User | null {
    const user = this.hashTable.get(phone);
    logger.debug(
      `UsersService: Get user ${phone} - ${user ? "found" : "not found"}`
    );
    return user;
  }

  public getAllUsers(): User[] {
    const users = this.hashTable.values();
    logger.debug(`UsersService: Retrieved all users (${users.length} total)`);
    return users;
  }

  public removeUser(phone: string): boolean {
    const result = this.hashTable.delete(phone);
    logger.info(
      `UsersService: Remove user ${phone} - ${result ? "success" : "failed"}`
    );
    return result;
  }

  public hasUser(phone: string): boolean {
    const exists = this.hashTable.containsKey(phone);
    logger.debug(`UsersService: Check user ${phone} exists - ${exists}`);
    return exists;
  }

  public clear(): void {
    const countBefore = this.hashTable.getSize();
    this.hashTable.clear();
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

    logger.info(
      `UsersService: Load complete - ${this.getCount()} users in hash table`
    );
    this.logStatistics();
  }

  // Статистика и метрики
  public getCount(): number {
    return this.hashTable.getSize();
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
    distribution: ReturnType<HashTable<User>["getPerformanceStats"]>;
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
}