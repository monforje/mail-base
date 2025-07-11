// src/renderer/src/services/PackagesService.ts
import { RedBlackTree } from "../data-structures/RedBlackTree";
import { DoublyLinkedList } from "../data-structures/DoublyLinkedList";
import { PackagesArray, PackageData } from "../data-structures/PackagesArray";
import { Package } from "../types";
import { logger } from "./Logger";

export class PackagesService {
  private redBlackTree: RedBlackTree<DoublyLinkedList<number>>; // Ключ: номер телефона отправителя, Значение: список индексов
  private packagesArray: PackagesArray; // Массив с данными (без senderPhone)

  constructor() {
    this.redBlackTree = new RedBlackTree<DoublyLinkedList<number>>();
    this.packagesArray = new PackagesArray();
    logger.info(
      "PackagesService: Initialized red-black tree (sender phone -> list of indices) and packages array (data without senderPhone)"
    );
  }

  // Генерация ключа - номер телефона отправителя
  private generateKey(senderPhone: number): string {
    return senderPhone.toString();
  }

  // ДОБАВЛЕНО: Метод для каскадного удаления всех посылок отправителя
  public removeAllPackagesBySender(senderPhone: number): number {
    const key = this.generateKey(senderPhone);
    const indexList = this.redBlackTree.search(key);

    if (indexList === null) {
      logger.debug(
        `PackagesService: Cascade delete - no packages found for sender ${senderPhone}`
      );
      return 0;
    }

    // Получаем все индексы для удаления
    const indicesToRemove = indexList.toArray();
    const removedCount = indicesToRemove.length;

    logger.info(
      `PackagesService: Starting cascade deletion for sender ${senderPhone} - ${removedCount} packages to remove`
    );

    // Удаляем ключ из дерева (это удалит весь список)
    this.redBlackTree.delete(key);

    // Сортируем индексы по убыванию для корректного удаления из массива
    indicesToRemove.sort((a, b) => b - a);

    // Удаляем элементы из массива и обновляем индексы в других списках
    for (const targetIndex of indicesToRemove) {
      const moveInfo = this.packagesArray.remove(targetIndex);

      if (moveInfo) {
        // Обновляем все списки, которые содержат перемещенный индекс
        const allKeys = this.redBlackTree.keys();
        for (const searchKey of allKeys) {
          const list = this.redBlackTree.search(searchKey);
          if (list !== null) {
            // Заменяем старый индекс на новый во всех списках
            if (list.remove(moveInfo.movedFromIndex)) {
              list.append(moveInfo.newIndex);
              logger.debug(
                `PackagesService: Cascade delete - updated index in list for key ${searchKey} from ${moveInfo.movedFromIndex} to ${moveInfo.newIndex}`
              );
            }
          }
        }
      }
    }

    logger.info(
      `PackagesService: Cascade deletion completed for sender ${senderPhone} - ${removedCount} packages removed`
    );
    return removedCount;
  }

  // Основные операции CRUD
  public addPackage(pkg: Package): void {
    const key = this.generateKey(pkg.senderPhone);

    // Извлекаем данные без senderPhone
    const packageData: PackageData = {
      receiverPhone: pkg.receiverPhone.toString(),
      weight: pkg.weight,
      date: pkg.date,
    };

    // Добавляем данные в массив
    const index = this.packagesArray.add(packageData);

    // Ищем список для данного отправителя
    let indexList = this.redBlackTree.search(key);

    if (indexList === null) {
      // Создаем новый список для нового отправителя
      indexList = new DoublyLinkedList<number>();
      this.redBlackTree.insert(key, indexList);
    }

    // Добавляем индекс в список
    indexList.append(index);

    logger.info(
      `PackagesService: Added package ${pkg.senderPhone} -> ${pkg.receiverPhone} (${pkg.weight}kg, ${pkg.date}) at index ${index}`
    );
  }

  public getAllPackages(): Package[] {
    const packages: Package[] = [];
    const allKeys = this.redBlackTree.keys();

    for (const key of allKeys) {
      const senderPhone = parseInt(key, 10);
      const indexList = this.redBlackTree.search(key);

      if (indexList !== null) {
        for (const index of indexList) {
          const packageData = this.packagesArray.get(index);
          if (packageData) {
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
    }

    logger.debug(
      `PackagesService: Retrieved all packages (${packages.length} total)`
    );
    return packages;
  }

  public getPackagesBySender(senderPhone: number): Package[] {
    const key = this.generateKey(senderPhone);
    const indexList = this.redBlackTree.search(key);
    const packages: Package[] = [];

    if (indexList === null) {
      logger.debug(
        `PackagesService: Get packages by sender ${senderPhone} - not found in tree`
      );
      return packages;
    }

    for (const index of indexList) {
      const packageData = this.packagesArray.get(index);
      if (packageData) {
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

    logger.debug(
      `PackagesService: Get packages by sender ${senderPhone} - found ${packages.length} packages`
    );
    return packages;
  }

  public removePackage(
    senderPhone: number,
    receiverPhone: number,
    date: string
  ): boolean {
    const key = this.generateKey(senderPhone);
    const indexList = this.redBlackTree.search(key);

    if (indexList === null) {
      logger.warning(
        `PackagesService: Remove package ${senderPhone} -> ${receiverPhone} (${date}) - sender not found`
      );
      return false;
    }

    // Ищем нужную посылку в списке индексов
    let targetIndex = -1;
    for (const index of indexList) {
      const packageData = this.packagesArray.get(index);
      if (
        packageData &&
        parseInt(packageData.receiverPhone, 10) === receiverPhone &&
        packageData.date === date
      ) {
        targetIndex = index;
        break;
      }
    }

    if (targetIndex === -1) {
      logger.warning(
        `PackagesService: Remove package ${senderPhone} -> ${receiverPhone} (${date}) - package not found`
      );
      return false;
    }

    // Удаляем индекс из списка
    indexList.remove(targetIndex);

    // Если список стал пустым, удаляем ключ из дерева
    if (indexList.isEmpty()) {
      this.redBlackTree.delete(key);
    }

    // Удаляем из массива и получаем информацию о перемещении
    const moveInfo = this.packagesArray.remove(targetIndex);

    if (moveInfo) {
      // Обновляем все списки, которые содержат перемещенный индекс
      const allKeys = this.redBlackTree.keys();
      for (const searchKey of allKeys) {
        const list = this.redBlackTree.search(searchKey);
        if (list !== null) {
          // Заменяем старый индекс на новый во всех списках
          if (list.remove(moveInfo.movedFromIndex)) {
            list.append(moveInfo.newIndex);
            logger.debug(
              `PackagesService: Updated index in list for key ${searchKey} from ${moveInfo.movedFromIndex} to ${moveInfo.newIndex}`
            );
          }
        }
      }
    }

    logger.info(
      `PackagesService: Remove package ${senderPhone} -> ${receiverPhone} (${date}) - success (was at index ${targetIndex})`
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
    const results = this.getPackagesBySender(senderPhone);
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

  // Массовые операции
  public loadPackages(packages: Package[]): void {
    logger.info(
      `PackagesService: Starting load of ${packages.length} packages`
    );
    this.clear();

    const loaded: string[] = [];

    packages.forEach((pkg, index) => {
      try {
        this.addPackageInternal(pkg);
        loaded.push(`${pkg.senderPhone}->${pkg.receiverPhone}(${pkg.date})`);
        if (loaded.length % 10 === 0 || index === packages.length - 1) {
          logger.debug(
            `PackagesService: Loaded ${loaded.length}/${packages.length} packages`
          );
        }
      } catch (error) {
        logger.error(`PackagesService: Failed to load package: ${error}`);
      }
    });

    logger.info(
      `PackagesService: Load complete - ${loaded.length} packages loaded`
    );
    this.logTreeStatistics();
  }

  /**
   * Внутренний метод добавления
   */
  private addPackageInternal(pkg: Package): void {
    const packageData: PackageData = {
      receiverPhone: pkg.receiverPhone.toString(),
      weight: pkg.weight,
      date: pkg.date,
    };

    const index = this.packagesArray.add(packageData);
    const key = this.generateKey(pkg.senderPhone);

    let indexList = this.redBlackTree.search(key);
    if (indexList === null) {
      indexList = new DoublyLinkedList<number>();
      this.redBlackTree.insert(key, indexList);
    }

    indexList.append(index);
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

    // Проходим по всем ключам в дереве
    const allKeys = this.redBlackTree.keys();
    for (const key of allKeys) {
      const senderPhone = parseInt(key, 10);
      const indexList = this.redBlackTree.search(key);

      if (indexList !== null) {
        let count = 0;
        let totalWeight = 0;

        for (const index of indexList) {
          const packageData = this.packagesArray.get(index);
          if (packageData) {
            count++;
            totalWeight += packageData.weight;
          }
        }

        senderStats.set(senderPhone, { count, totalWeight });
      }
    }

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
    uniqueSenders: number;
    averagePackagesPerSender: number;
  } {
    const totalPackages = this.getCount();
    const uniqueSenders = this.redBlackTree.getSize();
    const height = this.getHeight();
    const theoreticalHeight =
      uniqueSenders > 0 ? Math.ceil(Math.log2(uniqueSenders + 1)) : 0;

    const stats = {
      size: totalPackages,
      height,
      blackHeight: this.getBlackHeight(),
      isValid: this.isTreeValid(),
      efficiency: theoreticalHeight > 0 ? theoreticalHeight / height : 1,
      uniqueSenders,
      averagePackagesPerSender:
        uniqueSenders > 0 ? totalPackages / uniqueSenders : 0,
    };

    logger.debug(
      `PackagesService: Tree statistics - Total packages: ${
        stats.size
      }, Unique senders: ${stats.uniqueSenders}, Height: ${
        stats.height
      }, Efficiency: ${stats.efficiency.toFixed(3)}`
    );
    return stats;
  }

  private logTreeStatistics(): void {
    const stats = this.getTreeStatistics();
    logger.debug(
      `RedBlackTree Performance: Height: ${stats.height}, Black Height: ${
        stats.blackHeight
      }, Efficiency: ${stats.efficiency.toFixed(3)}, Valid: ${
        stats.isValid
      }, Unique Senders: ${stats.uniqueSenders}`
    );
  }

  // Метод для получения структуры дерева (для отладки)
  public getTreeStructure(): Array<{
    senderPhone: number;
    packageCount: number;
    indices: number[];
  }> {
    const structure: Array<{
      senderPhone: number;
      packageCount: number;
      indices: number[];
    }> = [];

    const allKeys = this.redBlackTree.keys();
    for (const key of allKeys) {
      const senderPhone = parseInt(key, 10);
      const indexList = this.redBlackTree.search(key);

      if (indexList !== null) {
        const indices = indexList.toArray();
        structure.push({
          senderPhone,
          packageCount: indices.length,
          indices,
        });
      }
    }

    return structure;
  }
}
