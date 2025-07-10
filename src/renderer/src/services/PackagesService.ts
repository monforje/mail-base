// src/renderer/src/services/PackagesService.ts
import { RedBlackTree } from "../data-structures/RedBlackTree";
import { PackagesArray, PackageData } from "../data-structures/PackagesArray";
import { Package } from "../types";
import { logger } from "./Logger";

export class PackagesService {
  private redBlackTree: RedBlackTree<number>; // Ключ: составной ключ, Значение: индекс массива
  private packagesArray: PackagesArray; // Массив с данными (без senderPhone)

  constructor() {
    this.redBlackTree = new RedBlackTree<number>();
    this.packagesArray = new PackagesArray();
    logger.info(
      "PackagesService: Initialized red-black tree (composite key -> index) and packages array (data without senderPhone)"
    );
  }

  // Генерация составного ключа с числовыми телефонами
  private generateKey(pkg: Package): string {
    return `${pkg.senderPhone.toString()}_${pkg.receiverPhone.toString()}_${
      pkg.date
    }`;
  }

  // Основные операции CRUD
  public addPackage(pkg: Package): void {
    // ИСПРАВЛЕНО: Проверка на дубликат перед добавлением
    const key = this.generateKey(pkg);
    if (this.redBlackTree.contains(key)) {
      logger.warning(
        `PackagesService: Package with key ${key} already exists, skipping add`
      );
      throw new Error(
        `Package with sender ${pkg.senderPhone}, receiver ${pkg.receiverPhone}, date ${pkg.date} already exists`
      );
    }

    // Извлекаем данные без senderPhone
    const packageData: PackageData = {
      receiverPhone: pkg.receiverPhone.toString(),
      weight: pkg.weight,
      date: pkg.date,
    };

    // Добавляем данные в массив
    const index = this.packagesArray.add(packageData);
    // Сохраняем индекс в дереве
    this.redBlackTree.insert(key, index);
    logger.info(
      `PackagesService: Added package ${pkg.senderPhone} -> ${pkg.receiverPhone} (${pkg.weight}kg, ${pkg.date}) at index ${index}`
    );
  }

  public getAllPackages(): Package[] {
    const packages: Package[] = [];
    const allKeys = this.redBlackTree.keys();

    for (const key of allKeys) {
      const index = this.redBlackTree.search(key);
      if (index !== null) {
        const packageData = this.packagesArray.get(index);
        if (packageData) {
          // Восстанавливаем senderPhone из ключа
          const keyParts = key.split("_");
          const senderPhone = parseInt(keyParts[0], 10);
          const receiverPhone = parseInt(packageData.receiverPhone, 10);

          const pkg: Package = {
            senderPhone: senderPhone,
            receiverPhone: receiverPhone,
            weight: packageData.weight,
            date: packageData.date,
          };
          packages.push(pkg);
        }
      }
    }

    logger.debug(
      `PackagesService: Retrieved all packages (${packages.length} total)`
    );
    return packages;
  }

  public getPackage(key: string): Package | null {
    // Получаем индекс из дерева
    const index = this.redBlackTree.search(key);
    if (index === null) {
      logger.debug(
        `PackagesService: Get package by key ${key} - not found in tree`
      );
      return null;
    }

    // Получаем данные из массива по индексу
    const packageData = this.packagesArray.get(index);
    if (packageData === null) {
      logger.error(
        `PackagesService: Get package by key ${key} - invalid index ${index} in array`
      );
      return null;
    }

    // Восстанавливаем senderPhone из ключа
    const keyParts = key.split("_");
    const senderPhone = parseInt(keyParts[0], 10);
    const receiverPhone = parseInt(packageData.receiverPhone, 10);

    const pkg: Package = {
      senderPhone: senderPhone,
      receiverPhone: receiverPhone,
      weight: packageData.weight,
      date: packageData.date,
    };

    logger.debug(
      `PackagesService: Get package by key ${key} - found at index ${index}`
    );
    return pkg;
  }

  public removePackage(
    senderPhone: number,
    receiverPhone: number,
    date: string
  ): boolean {
    // Генерируем ключ для поиска
    const key = `${senderPhone.toString()}_${receiverPhone.toString()}_${date}`;
    const index = this.redBlackTree.search(key);

    if (index === null) {
      logger.warning(
        `PackagesService: Remove package ${senderPhone} -> ${receiverPhone} (${date}) - not found`
      );
      return false;
    }

    // Удаляем из дерева
    const treeRemoved = this.redBlackTree.delete(key);
    if (!treeRemoved) {
      logger.error(`PackagesService: Failed to remove package from tree`);
      return false;
    }

    // Удаляем из массива и получаем информацию о перемещении
    const moveInfo = this.packagesArray.remove(index);

    if (moveInfo) {
      // Если элемент был перемещен, нужно найти ключ, который указывал на старый индекс
      // и обновить его на новый индекс
      const allKeys = this.redBlackTree.keys();
      for (const searchKey of allKeys) {
        const currentIndex = this.redBlackTree.search(searchKey);
        if (currentIndex === moveInfo.movedFromIndex) {
          this.redBlackTree.delete(searchKey);
          this.redBlackTree.insert(searchKey, moveInfo.newIndex);
          logger.debug(
            `PackagesService: Updated index for key ${searchKey} from ${moveInfo.movedFromIndex} to ${moveInfo.newIndex}`
          );
          break;
        }
      }
    }

    logger.info(
      `PackagesService: Remove package ${senderPhone} -> ${receiverPhone} (${date}) - success (was at index ${index})`
    );
    return true;
  }

  public clear(): void {
    const countBefore = this.packagesArray.size();
    this.redBlackTree.clear();
    this.packagesArray.clear();
    logger.warning(
      `PackagesService: Cleared all packages (${countBefore} removed)`
    );
  }

  // Операции поиска
  public findPackagesBySender(senderPhone: number): Package[] {
    const results = this.getAllPackages().filter(
      (pkg) => pkg.senderPhone === senderPhone
    );
    logger.info(
      `PackagesService: Search by sender ${senderPhone} - ${results.length} results`
    );
    return results;
  }

  public findPackagesByReceiver(receiverPhone: number): Package[] {
    const results = this.getAllPackages().filter(
      (pkg) => pkg.receiverPhone === receiverPhone
    );
    logger.info(
      `PackagesService: Search by receiver ${receiverPhone} - ${results.length} results`
    );
    return results;
  }

  public findPackagesByDate(date: string): Package[] {
    const results = this.getAllPackages().filter((pkg) => pkg.date === date);
    logger.info(
      `PackagesService: Search by date ${date} - ${results.length} results`
    );
    return results;
  }

  public findPackagesByWeightRange(
    minWeight: number,
    maxWeight: number
  ): Package[] {
    const results = this.getAllPackages().filter(
      (pkg) => pkg.weight >= minWeight && pkg.weight <= maxWeight
    );
    logger.info(
      `PackagesService: Search by weight range ${minWeight}-${maxWeight}kg - ${results.length} results`
    );
    return results;
  }

  public findPackagesByDateRange(
    startDate: string,
    endDate: string
  ): Package[] {
    const results = this.getAllPackages().filter((pkg) => {
      return pkg.date >= startDate && pkg.date <= endDate;
    });
    logger.info(
      `PackagesService: Search by date range ${startDate} to ${endDate} - ${results.length} results`
    );
    return results;
  }

  // ИСПРАВЛЕНО: Массовые операции с проверкой дубликатов
  public loadPackages(packages: Package[]): void {
    logger.info(
      `PackagesService: Starting load of ${packages.length} packages`
    );
    this.clear();

    const duplicates: string[] = [];
    const loaded: string[] = [];

    packages.forEach((pkg, index) => {
      const key = this.generateKey(pkg);

      // ИСПРАВЛЕНО: Проверка на дубликаты в загружаемых данных
      if (this.redBlackTree.contains(key)) {
        duplicates.push(
          `${pkg.senderPhone}->${pkg.receiverPhone}(${pkg.date})`
        );
        logger.warning(
          `PackagesService: Duplicate package ${key} skipped (line ${
            index + 1
          })`
        );
      } else {
        try {
          this.addPackageInternal(pkg); // Используем внутренний метод без дополнительной проверки
          loaded.push(key);
          if (loaded.length % 10 === 0 || index === packages.length - 1) {
            logger.debug(
              `PackagesService: Loaded ${loaded.length}/${packages.length} packages`
            );
          }
        } catch (error) {
          logger.error(
            `PackagesService: Failed to load package ${key}: ${error}`
          );
        }
      }
    });

    // ИСПРАВЛЕНО: Отчет о дубликатах как требуется по ТЗ
    if (duplicates.length > 0) {
      logger.warning(
        `PackagesService: Found ${
          duplicates.length
        } duplicate packages: ${duplicates.join(", ")}`
      );
    }

    logger.info(
      `PackagesService: Load complete - ${loaded.length} packages loaded, ${duplicates.length} duplicates skipped`
    );
    this.logTreeStatistics();
  }

  /**
   * Внутренний метод добавления без проверки дубликатов
   * Используется при массовой загрузке после проверки
   */
  private addPackageInternal(pkg: Package): void {
    const packageData: PackageData = {
      receiverPhone: pkg.receiverPhone.toString(),
      weight: pkg.weight,
      date: pkg.date,
    };

    const index = this.packagesArray.add(packageData);
    const key = this.generateKey(pkg);
    this.redBlackTree.insert(key, index);
    logger.debug(
      `PackagesService: Internal add package ${key} at index ${index}`
    );
  }

  // Аналитика и статистика
  public getWeightStatistics(): {
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

    const stats = {
      total: packages.length,
      average: sum / packages.length,
      min: Math.min(...weights),
      max: Math.max(...weights),
      sum,
    };

    logger.debug(
      `PackagesService: Weight statistics - Total: ${
        stats.total
      }, Avg: ${stats.average.toFixed(2)}kg, Min: ${stats.min}kg, Max: ${
        stats.max
      }kg`
    );
    return stats;
  }

  public getPackagesByDate(): Map<string, Package[]> {
    const packages = this.getAllPackages();
    const dateMap = new Map<string, Package[]>();

    packages.forEach((pkg) => {
      if (!dateMap.has(pkg.date)) {
        dateMap.set(pkg.date, []);
      }
      dateMap.get(pkg.date)!.push(pkg);
    });

    logger.debug(
      `PackagesService: Grouped by date - ${dateMap.size} unique dates`
    );
    return dateMap;
  }

  public getTopSenders(
    limit: number = 10
  ): Array<{ phone: number; count: number; totalWeight: number }> {
    const senderStats = new Map<
      number,
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

    const results = Array.from(senderStats.entries())
      .map(([phone, stats]) => ({ phone, ...stats }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    logger.info(
      `PackagesService: Top ${limit} senders calculated - ${results.length} results`
    );
    return results;
  }

  // Метрики дерева
  public getCount(): number {
    return this.packagesArray.size();
  }

  public getHeight(): number {
    return this.redBlackTree.getHeight();
  }

  public getBlackHeight(): number {
    return this.redBlackTree.getBlackHeight();
  }

  public isTreeValid(): boolean {
    const isValid = this.redBlackTree.isValid();
    logger.debug(
      `PackagesService: Tree validation - ${isValid ? "valid" : "invalid"}`
    );
    return isValid;
  }

  public getTreeStatistics(): {
    size: number;
    height: number;
    blackHeight: number;
    isValid: boolean;
    efficiency: number;
  } {
    const size = this.getCount();
    const height = this.getHeight();
    const theoreticalHeight = size > 0 ? Math.ceil(Math.log2(size + 1)) : 0;

    const stats = {
      size,
      height,
      blackHeight: this.getBlackHeight(),
      isValid: this.isTreeValid(),
      efficiency: theoreticalHeight > 0 ? theoreticalHeight / height : 1,
    };

    logger.debug(
      `PackagesService: Tree statistics - Size: ${stats.size}, Height: ${
        stats.height
      }, Black Height: ${
        stats.blackHeight
      }, Efficiency: ${stats.efficiency.toFixed(3)}`
    );
    return stats;
  }

  private logTreeStatistics(): void {
    const stats = this.getTreeStatistics();
    logger.debug(
      `RedBlackTree Performance: Height: ${stats.height}, Black Height: ${
        stats.blackHeight
      }, Efficiency: ${stats.efficiency.toFixed(3)}, Valid: ${stats.isValid}`
    );
  }
}
