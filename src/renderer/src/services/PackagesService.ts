import { DoublyLinkedList } from "../data-structures/DoublyLinkedList";
import { PackagesArray, PackageData } from "../data-structures/PackagesArray";
import { RedBlackTree } from "../data-structures/RedBlackTree";
import { Package } from "../types";
import { logger } from "./Logger";
import { validateWeight, validateDate, validateUserExists } from "../utils";
import { usersService } from "../DataServices";

export class PackagesService {
  private redBlackTree: RedBlackTree<DoublyLinkedList<number>>;
  private packagesArray: PackagesArray;

  constructor() {
    this.redBlackTree = new RedBlackTree<DoublyLinkedList<number>>();
    this.packagesArray = new PackagesArray();
    logger.info(
      "PackagesService: Initialized red-black tree (sender phone -> list of indices) and packages array (data without senderPhone)"
    );
  }

  private generateKey(senderPhone: number): string {
    return senderPhone.toString();
  }

  private generatePackageKey(pkg: Package): string {
    return `${pkg.senderPhone}-${pkg.receiverPhone}-${pkg.weight}-${pkg.date}`;
  }

  private packageExists(pkg: Package): boolean {
    const key = this.generateKey(pkg.senderPhone);
    const indexList = this.redBlackTree.search(key);

    if (indexList === null) {
      return false;
    }

    for (const index of indexList) {
      const packageData = this.packagesArray.get(index);
      if (packageData) {
        const receiverPhone = parseInt(packageData.receiverPhone, 10);
        if (
          receiverPhone === pkg.receiverPhone &&
          packageData.weight === pkg.weight &&
          packageData.date === pkg.date
        ) {
          return true;
        }
      }
    }

    return false;
  }

  public removeAllPackagesBySender(senderPhone: number): number {
    const key = this.generateKey(senderPhone);
    const indexList = this.redBlackTree.search(key);

    if (indexList === null) {
      logger.debug(
        `PackagesService: Cascade delete - no packages found for sender ${senderPhone}`
      );
      return 0;
    }

    const indicesToRemove = indexList.toArray();
    const removedCount = indicesToRemove.length;

    logger.info(
      `PackagesService: Starting cascade deletion for sender ${senderPhone} - ${removedCount} packages to remove`
    );

    this.redBlackTree.delete(key);

    indicesToRemove.sort((a, b) => b - a);

    for (const targetIndex of indicesToRemove) {
      const moveInfo = this.packagesArray.remove(targetIndex);

      if (moveInfo) {
        const allKeys = this.redBlackTree.keys();
        for (const searchKey of allKeys) {
          const list = this.redBlackTree.search(searchKey);
          if (list !== null) {
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

  public removeAllPackagesByReceiver(receiverPhone: number): number {
    const allKeys = this.redBlackTree.keys();
    const indicesToRemove: number[] = [];

    // Собираем все индексы посылок для данного получателя
    for (const key of allKeys) {
      const indexList = this.redBlackTree.search(key);
      if (indexList !== null) {
        for (const index of indexList) {
          const packageData = this.packagesArray.get(index);
          if (packageData && parseInt(packageData.receiverPhone, 10) === receiverPhone) {
            indicesToRemove.push(index);
          }
        }
      }
    }

    if (indicesToRemove.length === 0) {
      logger.debug(
        `PackagesService: Cascade delete - no packages found for receiver ${receiverPhone}`
      );
      return 0;
    }

    logger.info(
      `PackagesService: Starting cascade deletion for receiver ${receiverPhone} - ${indicesToRemove.length} packages to remove`
    );

    // Удаляем посылки в обратном порядке индексов
    indicesToRemove.sort((a, b) => b - a);

    for (const targetIndex of indicesToRemove) {
      const moveInfo = this.packagesArray.remove(targetIndex);

      if (moveInfo) {
        // Обновляем индексы в дереве
        for (const searchKey of allKeys) {
          const list = this.redBlackTree.search(searchKey);
          if (list !== null) {
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

    // Удаляем пустые списки из дерева
    for (const key of allKeys) {
      const list = this.redBlackTree.search(key);
      if (list !== null && list.isEmpty()) {
        this.redBlackTree.delete(key);
        logger.debug(
          `PackagesService: Cascade delete - removed empty list for key ${key}`
        );
      }
    }

    logger.info(
      `PackagesService: Cascade deletion completed for receiver ${receiverPhone} - ${indicesToRemove.length} packages removed`
    );
    return indicesToRemove.length;
  }

  public getArrayIndexForPackage(pkg: Package): number | null {
    const key = this.generateKey(pkg.senderPhone);
    const list = this.redBlackTree.search(key);
    if (!list) return null;

    for (const idx of list) {
      const data = this.packagesArray.get(idx);
      if (
        data &&
        parseInt(data.receiverPhone, 10) === pkg.receiverPhone &&
        data.date === pkg.date &&
        data.weight === pkg.weight
      ) {
        return idx;
      }
    }
    return null;
  }

  public addPackage(pkg: Package): void {
    if (this.packageExists(pkg)) {
      const packageKey = this.generatePackageKey(pkg);
      logger.warning(
        `PackagesService: Package ${packageKey} already exists, skipping add`
      );
      throw new Error(
        `Package from ${pkg.senderPhone} to ${pkg.receiverPhone} (${pkg.weight}kg, ${pkg.date}) already exists`
      );
    }
    if (
      !validateUserExists(String(pkg.senderPhone), usersService.getAllUsers())
    ) {
      throw new Error("Отправитель должен существовать среди пользователей");
    }
    if (
      !validateUserExists(String(pkg.receiverPhone), usersService.getAllUsers())
    ) {
      throw new Error("Получатель должен существовать среди пользователей");
    }
    if (!validateWeight(String(pkg.weight))) {
      throw new Error(
        "Вес должен быть положительным числом с точкой (например, 3.5)"
      );
    }
    if (!validateDate(pkg.date)) {
      throw new Error(
        'Дата должна быть в формате "dd mon yyyy", например "15 jan 2025"'
      );
    }

    const key = this.generateKey(pkg.senderPhone);

    const packageData: PackageData = {
      receiverPhone: pkg.receiverPhone.toString(),
      weight: pkg.weight,
      date: pkg.date,
    };

    const index = this.packagesArray.add(packageData);

    let indexList = this.redBlackTree.search(key);

    if (indexList === null) {
      indexList = new DoublyLinkedList<number>();
      this.redBlackTree.insert(key, indexList);
    }

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

  public getCount(): number {
    return this.packagesArray.size();
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

    indexList.remove(targetIndex);

    if (indexList.isEmpty()) {
      this.redBlackTree.delete(key);
    }

    const moveInfo = this.packagesArray.remove(targetIndex);

    if (moveInfo) {
      const allKeys = this.redBlackTree.keys();
      for (const searchKey of allKeys) {
        const list = this.redBlackTree.search(searchKey);
        if (list !== null) {
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

  public loadPackages(packages: Package[]): void {
    logger.info(`Загрузка посылок: начало загрузки ${packages.length} посылок`);
    this.clear();

    const loaded: string[] = [];
    const duplicates: string[] = [];

    packages.forEach((pkg, index) => {
      try {
        if (this.packageExists(pkg)) {
          const packageKey = this.generatePackageKey(pkg);
          duplicates.push(packageKey);
          logger.warning(
            `Дубликат посылки ${packageKey} пропущен (строка ${index + 1})`
          );
        } else {
          this.addPackage(pkg);
          const packageKey = this.generatePackageKey(pkg);
          loaded.push(packageKey);
          if (loaded.length % 10 === 0 || index === packages.length - 1) {
            logger.debug(
              `Загружено ${loaded.length} из ${packages.length} посылок`
            );
          }
        }
      } catch (error) {
        logger.error(`Ошибка загрузки посылки: ${error}`);
      }
    });

    if (duplicates.length > 0) {
      logger.warning(
        `Найдено ${duplicates.length} дубликатов посылок: ${duplicates
          .slice(0, 5)
          .join(", ")}${
          duplicates.length > 5 ? ` и еще ${duplicates.length - 5}...` : ""
        }`
      );
    }

    logger.info(
      `Загрузка завершена — загружено ${loaded.length} посылок, пропущено дубликатов: ${duplicates.length}`
    );
    this.logTreeStatistics();
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
    const totalPackages = this.getAllPackages().length;
    const uniqueSenders = this.redBlackTree.getSize();
    const height = this.redBlackTree.getHeight();
    const theoreticalHeight =
      uniqueSenders > 0 ? Math.ceil(Math.log2(uniqueSenders + 1)) : 0;

    const stats = {
      size: totalPackages,
      height,
      blackHeight: this.redBlackTree.getBlackHeight(),
      isValid: this.redBlackTree.isValid(),
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
      `Красно-черное дерево: высота: ${stats.height}, черная высота: ${
        stats.blackHeight
      }, эффективность: ${stats.efficiency.toFixed(3)}, валидно: ${
        stats.isValid
      }, уникальных отправителей: ${stats.uniqueSenders}`
    );
  }

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

  public findPackagesBySender(senderPhone: number): Package[] {
    return this.getPackagesBySender(senderPhone);
  }
}

export const packagesService = new PackagesService();
