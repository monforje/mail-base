import { HashTable } from "../data-structures/HashTable";
import { UsersArray, UserData } from "../data-structures/UsersArray";
import { User } from "../types";
import { logger } from "./Logger";
import { validateFullName, validateAddress, validateUniqueFullName } from "../utils";

export class UsersService {
  private hashTable: HashTable<number>;
  private usersArray: UsersArray;
  private onUserDeleteCallback: ((phone: number) => void) | null = null;

  constructor() {
    this.hashTable = new HashTable<number>(0);
    this.usersArray = new UsersArray();
    logger.info(
      "UsersService: Initialized with empty hash table (size 0) and users array"
    );
  }

  public setUserDeleteCallback(callback: (phone: number) => void): void {
    this.onUserDeleteCallback = callback;
    logger.debug("UsersService: Set user delete callback for cascade deletion");
  }

  public reinitializeHashTable(newSize: number): void {
    const currentUsers = this.getAllUsers();

    this.hashTable = new HashTable<number>(newSize);
    this.usersArray = new UsersArray();

    logger.info(`UsersService: Reinitialized hash table with size ${newSize}`);

    if (currentUsers.length > 0) {
      currentUsers.forEach((user) => {
        this.addUserInternal(user);
      });
      logger.info(
        `UsersService: Restored ${currentUsers.length} users to new hash table`
      );
    }
  }

  private ensureHashTableInitialized(): void {
    if (!this.hashTable.getIsInitialized()) {
      throw new Error(
        "Hash table is not initialized. Load users first to set the table size."
      );
    }
  }

  public addUser(user: User): void {
    this.ensureHashTableInitialized();

    const phoneKey = user.phone.toString();
    if (this.hashTable.containsKey(phoneKey)) {
      logger.warning(
        `UsersService: User with phone ${user.phone} already exists, skipping add`
      );
      throw new Error(`User with phone ${user.phone} already exists`);
    }
    if (!validateFullName(user.fullName)) {
      throw new Error("ФИО должно состоять из трёх слов, каждое с заглавной буквы (например: Иванов Иван Иванович)");
    }
    if (!validateUniqueFullName(user.fullName, this.getAllUsers())) {
      throw new Error("Пользователь с таким ФИО уже существует");
    }
    if (!validateAddress(user.address)) {
      throw new Error("Адрес должен быть в формате: г. <город>, ул. <улица>, д. <номер>, кв. <номер>");
    }

    const userData: UserData = {
      fullName: user.fullName,
      address: user.address,
    };

    const index = this.usersArray.add(userData);
    this.hashTable.put(phoneKey, index);
    logger.info(
      `UsersService: Added user ${user.phone} (${user.fullName}) at index ${index}`
    );
  }

  public getUser(phone: number): User | null {
    if (!this.hashTable.getIsInitialized()) {
      logger.debug(
        `UsersService: Get user ${phone} - hash table not initialized`
      );
      return null;
    }

    const phoneKey = phone.toString();
    const index = this.hashTable.get(phoneKey);
    if (index === null) {
      logger.debug(`UsersService: Get user ${phone} - not found in hash table`);
      return null;
    }

    const userData = this.usersArray.get(index);
    if (userData === null) {
      logger.error(
        `UsersService: Get user ${phone} - invalid index ${index} in array`
      );
      return null;
    }

    const user: User = {
      phone: phone,
      fullName: userData.fullName,
      address: userData.address,
    };

    logger.debug(`UsersService: Get user ${phone} - found at index ${index}`);
    return user;
  }

  public getAllUsers(): User[] {
    if (!this.hashTable.getIsInitialized()) {
      logger.debug(`UsersService: Get all users - hash table not initialized`);
      return [];
    }

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
    if (!this.hashTable.getIsInitialized()) {
      logger.warning(
        `UsersService: Remove user ${phone} - hash table not initialized`
      );
      return false;
    }

    const phoneKey = phone.toString();
    const index = this.hashTable.get(phoneKey);
    if (index === null) {
      logger.warning(`UsersService: Remove user ${phone} - not found`);
      return false;
    }

    if (this.onUserDeleteCallback) {
      logger.info(`UsersService: Executing cascade deletion for user ${phone}`);
      try {
        this.onUserDeleteCallback(phone);
        logger.info(
          `UsersService: Cascade deletion completed for user ${phone}`
        );
      } catch (error) {
        logger.error(
          `UsersService: Cascade deletion failed for user ${phone}: ${error}`
        );
      }
    }

    const hashRemoved = this.hashTable.delete(phoneKey);
    if (!hashRemoved) {
      logger.error(`UsersService: Failed to remove ${phone} from hash table`);
      return false;
    }

    const moveInfo = this.usersArray.remove(index);

    if (moveInfo) {
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
    if (!this.hashTable.getIsInitialized()) {
      return false;
    }

    const phoneKey = phone.toString();
    const exists = this.hashTable.containsKey(phoneKey);
    logger.debug(`UsersService: Check user ${phone} exists - ${exists}`);
    return exists;
  }

  public clear(): void {
    const countBefore = this.usersArray.size();

    this.hashTable.clear();
    this.usersArray.clear();

    logger.warning(
      `UsersService: Cleared all users (${countBefore} removed) - hash table reset to size 0`
    );
  }

  public searchByName(namePart: string): User[] {
    const results = this.getAllUsers().filter((user) =>
      user.fullName.toLowerCase().includes(namePart.toLowerCase())
    );
    logger.info(
      `UsersService: Search by name "${namePart}" - ${results.length} results`
    );
    return results;
  }

  public loadUsers(users: User[], customHashTableSize?: number): void {
    logger.info(`Загрузка пользователей: начало загрузки ${users.length} пользователей`);

    if (customHashTableSize && customHashTableSize > 0) {
      logger.info(
        `Создание хеш-таблицы с пользовательским размером: ${customHashTableSize}`
      );
      this.hashTable = new HashTable<number>(customHashTableSize);
    } else {
      const optimalSize = Math.max(11, Math.ceil(users.length / 0.75));
      logger.info(
        `Создание хеш-таблицы с оптимальным размером: ${optimalSize}`
      );
      this.hashTable = new HashTable<number>(optimalSize);
    }

    this.usersArray = new UsersArray();

    const duplicates: number[] = [];
    const loaded: number[] = [];

    users.forEach((user, index) => {
      const phoneKey = user.phone.toString();

      if (this.hashTable.containsKey(phoneKey)) {
        duplicates.push(user.phone);
        logger.warning(
          `Дубликат телефона ${user.phone} пропущен (строка ${
            index + 1
          })`
        );
      } else {
        try {
          this.addUserInternal(user);
          loaded.push(user.phone);
          if (loaded.length % 10 === 0 || index === users.length - 1) {
            logger.debug(
              `Загружено ${loaded.length} из ${users.length} пользователей`
            );
          }
        } catch (error) {
          logger.error(
            `Ошибка загрузки пользователя ${user.phone}: ${error}`
          );
        }
      }
    });

    if (duplicates.length > 0) {
      logger.warning(
        `Найдено ${
          duplicates.length
        } дубликатов номеров: ${duplicates.join(", ")}`
      );
    }

    const finalStats = this.getStatistics();
    logger.info(
      `Загрузка завершена — загружено ${loaded.length} пользователей, пропущено дубликатов: ${duplicates.length}`
    );
    logger.info(
      `Итоговая хеш-таблица — размер: ${
        finalStats.capacity
      }, коэффициент загрузки: ${finalStats.loadFactor.toFixed(3)}`
    );

    this.logStatistics();
  }

  public getArrayIndexByPhone(phone: string): number | null {
    const idx = this.hashTable.get(phone);
    return typeof idx === "number" ? idx : null;
  }

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

  public getCount(): number {
    return this.usersArray.size();
  }

  public isInitialized(): boolean {
    return this.hashTable.getIsInitialized();
  }

  public getStatistics(): {
    size: number;
    capacity: number;
    loadFactor: number;
    distribution: ReturnType<HashTable<number>["getPerformanceStats"]>;
  } {
    const stats = {
      size: this.getCount(),
      capacity: this.hashTable.getCapacity(),
      loadFactor: this.hashTable.getLoadFactor(),
      distribution: this.hashTable.getPerformanceStats(),
    };

    logger.debug(
      `Хеш-таблица: коэффициент загрузки: ${stats.loadFactor.toFixed(3)}, ` +
        `пустых: ${stats.distribution.emptySlots}, занятых: ${stats.distribution.occupiedSlots}, удалённых: ${stats.distribution.deletedSlots}`
    );
    return stats;
  }

  private logStatistics(): void {
    const stats = this.hashTable.getPerformanceStats();
    logger.debug(
      `Хеш-таблица: коэффициент загрузки: ${stats.loadFactor.toFixed(3)}, ` +
        `пустых: ${stats.emptySlots}, занятых: ${stats.occupiedSlots}, удалённых: ${stats.deletedSlots}`
    );
  }

  public getHashTableEntries(): Array<{
    index: number;
    key: string;
    value: User | null;
    status: "empty" | "occupied" | "deleted";
    hashValue?: number;
  }> {
    if (!this.hashTable.getIsInitialized()) {
      return [];
    }

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
        entries.push({
          index: struct.index,
          key: "",
          value: null,
          status: "empty",
        });
      } else if (struct.isDeleted) {
        entries.push({
          index: struct.index,
          key: struct.key || "",
          value: null,
          status: "deleted",
          hashValue: struct.hashValue || 0,
        });
      } else {
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
