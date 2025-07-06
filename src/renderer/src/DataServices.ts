// src/renderer/src/DataServices.ts
import { HashTable } from "./data-structures/HashTable";
import { RedBlackTree } from "./data-structures/RedBlackTree";
import { User, Package } from "./types";

export class UsersService {
  private hashTable: HashTable<User>;

  constructor() {
    this.hashTable = new HashTable<User>();
  }

  /**
   * Добавление пользователя
   * Использует телефон как уникальный ключ
   */
  addUser(user: User): void {
    this.hashTable.put(user.phone, user);
  }

  /**
   * Получение пользователя по телефону
   */
  getUser(phone: string): User | null {
    return this.hashTable.get(phone);
  }

  /**
   * Получение всех пользователей
   */
  getAllUsers(): User[] {
    return this.hashTable.values();
  }

  /**
   * Удаление пользователя по телефону
   */
  removeUser(phone: string): boolean {
    return this.hashTable.delete(phone);
  }

  /**
   * Проверка наличия пользователя
   */
  hasUser(phone: string): boolean {
    return this.hashTable.containsKey(phone);
  }

  /**
   * Очистка всех пользователей
   */
  clear(): void {
    this.hashTable.clear();
  }

  /**
   * Получение количества пользователей
   */
  getCount(): number {
    return this.hashTable.getSize();
  }

  /**
   * Получение вместимости хеш-таблицы
   */
  getCapacity(): number {
    return this.hashTable.getCapacity();
  }

  /**
   * Получение коэффициента загрузки
   */
  getLoadFactor(): number {
    return this.hashTable.getLoadFactor();
  }

  /**
   * Получение статистики распределения
   */
  getStatistics(): {
    size: number;
    capacity: number;
    loadFactor: number;
    distribution: ReturnType<HashTable<User>["getDistributionStats"]>;
  } {
    return {
      size: this.getCount(),
      capacity: this.getCapacity(),
      loadFactor: this.getLoadFactor(),
      distribution: this.hashTable.getDistributionStats(),
    };
  }

  /**
   * Загрузка массива пользователей
   */
  loadUsers(users: User[]): void {
    console.log("UsersService: Loading users", users);
    this.clear();
    users.forEach((user) => {
      console.log("Adding user:", user);
      this.addUser(user);
    });
    console.log("UsersService: Load complete, count:", this.getCount());
  }

  /**
   * Поиск пользователей по части имени
   */
  searchByName(namePart: string): User[] {
    return this.getAllUsers().filter((user) =>
      user.fullName.toLowerCase().includes(namePart.toLowerCase())
    );
  }

  /**
   * Поиск пользователей по части адреса
   */
  searchByAddress(addressPart: string): User[] {
    return this.getAllUsers().filter((user) =>
      user.address.toLowerCase().includes(addressPart.toLowerCase())
    );
  }
}

export class PackagesService {
  private redBlackTree: RedBlackTree<Package>;
  private idCounter: number;

  constructor() {
    this.redBlackTree = new RedBlackTree<Package>();
    this.idCounter = 0;
  }

  /**
   * Генерация уникального ключа для посылки
   */
  private generateKey(pkg: Package): string {
    // Используем временную метку и счетчик для уникальности
    const timestamp = Date.now();
    return `${pkg.senderPhone}_${pkg.receiverPhone}_${
      pkg.date
    }_${timestamp}_${this.idCounter++}`;
  }

  /**
   * Добавление посылки
   */
  addPackage(pkg: Package): void {
    const key = this.generateKey(pkg);
    this.redBlackTree.insert(key, pkg);
  }

  /**
   * Получение всех посылок в отсортированном порядке
   */
  getAllPackages(): Package[] {
    return this.redBlackTree.values();
  }

  /**
   * Поиск посылки по ключу
   */
  getPackage(key: string): Package | null {
    return this.redBlackTree.search(key);
  }

  /**
   * Удаление посылки по критериям
   * Удаляет первую найденную посылку, соответствующую критериям
   */
  removePackage(
    senderPhone: string,
    receiverPhone: string,
    date: string
  ): boolean {
    const allKeys = this.redBlackTree.keys();
    for (const key of allKeys) {
      const pkg = this.redBlackTree.search(key);
      if (
        pkg &&
        pkg.senderPhone === senderPhone &&
        pkg.receiverPhone === receiverPhone &&
        pkg.date === date
      ) {
        return this.redBlackTree.delete(key);
      }
    }
    return false;
  }

  /**
   * Поиск посылок по отправителю
   */
  findPackagesBySender(senderPhone: string): Package[] {
    return this.getAllPackages().filter(
      (pkg) => pkg.senderPhone === senderPhone
    );
  }

  /**
   * Поиск посылок по получателю
   */
  findPackagesByReceiver(receiverPhone: string): Package[] {
    return this.getAllPackages().filter(
      (pkg) => pkg.receiverPhone === receiverPhone
    );
  }

  /**
   * Поиск посылок по дате
   */
  findPackagesByDate(date: string): Package[] {
    return this.getAllPackages().filter((pkg) => pkg.date === date);
  }

  /**
   * Поиск посылок по диапазону весов
   */
  findPackagesByWeightRange(minWeight: number, maxWeight: number): Package[] {
    return this.getAllPackages().filter(
      (pkg) => pkg.weight >= minWeight && pkg.weight <= maxWeight
    );
  }

  /**
   * Получение статистики по весу посылок
   */
  getWeightStatistics(): {
    total: number;
    average: number;
    min: number;
    max: number;
    sum: number;
  } {
    const packages = this.getAllPackages();
    if (packages.length === 0) {
      return { total: 0, average: 0, min: 0, max: 0, sum: 0 };
    }

    const weights = packages.map((pkg) => pkg.weight);
    const sum = weights.reduce((acc, weight) => acc + weight, 0);

    return {
      total: packages.length,
      average: sum / packages.length,
      min: Math.min(...weights),
      max: Math.max(...weights),
      sum,
    };
  }

  /**
   * Группировка посылок по дате
   */
  getPackagesByDate(): Map<string, Package[]> {
    const packages = this.getAllPackages();
    const dateMap = new Map<string, Package[]>();

    packages.forEach((pkg) => {
      if (!dateMap.has(pkg.date)) {
        dateMap.set(pkg.date, []);
      }
      dateMap.get(pkg.date)!.push(pkg);
    });

    return dateMap;
  }

  /**
   * Очистка всех посылок
   */
  clear(): void {
    this.redBlackTree.clear();
    this.idCounter = 0;
  }

  /**
   * Получение количества посылок
   */
  getCount(): number {
    return this.redBlackTree.getSize();
  }

  /**
   * Получение высоты дерева
   */
  getHeight(): number {
    return this.redBlackTree.getHeight();
  }

  /**
   * Получение черной высоты дерева
   */
  getBlackHeight(): number {
    return this.redBlackTree.getBlackHeight();
  }

  /**
   * Проверка валидности дерева
   */
  isTreeValid(): boolean {
    return this.redBlackTree.isValid();
  }

  /**
   * Получение статистики дерева
   */
  getTreeStatistics(): {
    size: number;
    height: number;
    blackHeight: number;
    isValid: boolean;
    efficiency: number;
  } {
    const size = this.getCount();
    const height = this.getHeight();
    const theoreticalHeight = size > 0 ? Math.ceil(Math.log2(size + 1)) : 0;

    return {
      size,
      height,
      blackHeight: this.getBlackHeight(),
      isValid: this.isTreeValid(),
      efficiency: theoreticalHeight > 0 ? theoreticalHeight / height : 1,
    };
  }

  /**
   * Загрузка массива посылок
   */
  loadPackages(packages: Package[]): void {
    console.log("PackagesService: Loading packages", packages);
    this.clear();
    packages.forEach((pkg) => {
      console.log("Adding package:", pkg);
      this.addPackage(pkg);
    });
    console.log("PackagesService: Load complete, count:", this.getCount());
  }

  /**
   * Получение посылок в диапазоне дат
   */
  findPackagesByDateRange(startDate: string, endDate: string): Package[] {
    return this.getAllPackages().filter((pkg) => {
      // Простое сравнение строк для дат в формате "dd mmm yyyy"
      return pkg.date >= startDate && pkg.date <= endDate;
    });
  }

  /**
   * Получение топ отправителей по количеству посылок
   */
  getTopSenders(
    limit: number = 10
  ): Array<{ phone: string; count: number; totalWeight: number }> {
    const senderStats = new Map<
      string,
      { count: number; totalWeight: number }
    >();

    this.getAllPackages().forEach((pkg) => {
      const current = senderStats.get(pkg.senderPhone) || {
        count: 0,
        totalWeight: 0,
      };
      current.count++;
      current.totalWeight += pkg.weight;
      senderStats.set(pkg.senderPhone, current);
    });

    return Array.from(senderStats.entries())
      .map(([phone, stats]) => ({ phone, ...stats }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
}

// Синглтон сервисы для использования во всем приложении
export const usersService = new UsersService();
export const packagesService = new PackagesService();
