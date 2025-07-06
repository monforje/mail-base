// src/renderer/src/services/UsersService.ts
import { HashTable } from "../data-structures/HashTable";
import { User } from "../types";
import { logger } from "./Logger";

export class UsersService {
  private hashTable: HashTable<User>;

  constructor() {
    this.hashTable = new HashTable<User>();
    logger.info("UsersService: Initialized hash table");
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
    distribution: ReturnType<HashTable<User>["getDistributionStats"]>;
  } {
    const stats = {
      size: this.getCount(),
      capacity: this.getCapacity(),
      loadFactor: this.getLoadFactor(),
      distribution: this.hashTable.getDistributionStats(),
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
      `HashTable Performance: Load Factor: ${stats.loadFactor.toFixed(
        3
      )}, Collisions: ${
        stats.collisionCount
      }, Avg Chain: ${stats.avgChainLength.toFixed(2)}`
    );
  }
}
