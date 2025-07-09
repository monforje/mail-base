// src/renderer/src/services/PackagesService.ts
import { RedBlackTree } from "../data-structures/RedBlackTree";
import { Package } from "../types";
import { logger } from "./Logger";

export class PackagesService {
  private redBlackTree: RedBlackTree<Package>;
  private idCounter: number;

  constructor() {
    this.redBlackTree = new RedBlackTree<Package>();
    this.idCounter = 0;
    logger.info("PackagesService: Initialized red-black tree");
  }

  // Генерация ключей
  private generateKey(pkg: Package): string {
    const timestamp = Date.now();
    return `${pkg.senderPhone}_${pkg.receiverPhone}_${
      pkg.date
    }_${timestamp}_${this.idCounter++}`;
  }

  // Основные операции CRUD
  public addPackage(pkg: Package): void {
    const key = this.generateKey(pkg);
    this.redBlackTree.insert(key, pkg);
    logger.info(
      `PackagesService: Added package ${pkg.senderPhone} -> ${pkg.receiverPhone} (${pkg.weight}kg, ${pkg.date})`
    );
  }

  public getAllPackages(): Package[] {
    const packages = this.redBlackTree.values();
    logger.debug(
      `PackagesService: Retrieved all packages (${packages.length} total)`
    );
    return packages;
  }

  public getPackage(key: string): Package | null {
    const pkg = this.redBlackTree.search(key);
    logger.debug(
      `PackagesService: Get package by key ${key} - ${
        pkg ? "found" : "not found"
      }`
    );
    return pkg;
  }

  public removePackage(
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
        const result = this.redBlackTree.delete(key);
        logger.info(
          `PackagesService: Remove package ${senderPhone} -> ${receiverPhone} (${date}) - ${
            result ? "success" : "failed"
          }`
        );
        return result;
      }
    }
    logger.warning(
      `PackagesService: Remove package ${senderPhone} -> ${receiverPhone} (${date}) - not found`
    );
    return false;
  }

  public clear(): void {
    const countBefore = this.redBlackTree.getSize();
    this.redBlackTree.clear();
    this.idCounter = 0;
    logger.warning(
      `PackagesService: Cleared all packages (${countBefore} removed)`
    );
  }

  // Операции поиска
  public findPackagesBySender(senderPhone: string): Package[] {
    const results = this.getAllPackages().filter(
      (pkg) => pkg.senderPhone === senderPhone
    );
    logger.info(
      `PackagesService: Search by sender ${senderPhone} - ${results.length} results`
    );
    return results;
  }

  public findPackagesByReceiver(receiverPhone: string): Package[] {
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

    packages.forEach((pkg, index) => {
      this.addPackage(pkg);
      if ((index + 1) % 10 === 0 || index === packages.length - 1) {
        logger.debug(
          `PackagesService: Loaded ${index + 1}/${packages.length} packages`
        );
      }
    });

    logger.info(
      `PackagesService: Load complete - ${this.getCount()} packages in red-black tree`
    );
    this.logTreeStatistics();
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
    return this.redBlackTree.getSize();
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