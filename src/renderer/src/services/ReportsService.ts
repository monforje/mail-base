import { DoublyLinkedList } from "../data-structures/DoublyLinkedList";
import { RedBlackTree } from "../data-structures/RedBlackTree";
import { ReportsArray, ReportData } from "../data-structures/ReportsArray";
import { User, Package } from "../types";
import { logger } from "./Logger";

export class ReportsService {
  private dateTree: RedBlackTree<DoublyLinkedList<number>>;
  private reportsArray: ReportsArray;

  constructor() {
    this.dateTree = new RedBlackTree<DoublyLinkedList<number>>();
    this.reportsArray = new ReportsArray();
    logger.info(
      "ReportsService: Initialized red-black tree (date -> list of indices) and reports array"
    );
  }

  public generateReport(users: User[], packages: Package[]): void {
    logger.info(`ReportsService: Starting report generation with ${packages.length} packages and ${users.length} users`);
    
    this.clear();

    // Создаем мапу пользователей для быстрого поиска
    const usersMap = new Map<number, User>();
    users.forEach(user => {
      usersMap.set(user.phone, user);
    });

    let processedCount = 0;
    let skippedCount = 0;

    packages.forEach((pkg, index) => {
      const sender = usersMap.get(pkg.senderPhone);
      
      if (!sender) {
        skippedCount++;
        logger.warning(`ReportsService: Sender ${pkg.senderPhone} not found in users, skipping package`);
        return;
      }

      const reportData: ReportData = {
        date: pkg.date,
        senderPhone: pkg.senderPhone.toString(),
        senderName: sender.fullName,
        senderAddress: sender.address,
        receiverPhone: pkg.receiverPhone.toString(),
        weight: pkg.weight,
      };

      const arrayIndex = this.reportsArray.add(reportData);
      
      let indexList = this.dateTree.search(pkg.date);
      if (indexList === null) {
        indexList = new DoublyLinkedList<number>();
        this.dateTree.insert(pkg.date, indexList);
      }
      
      indexList.append(arrayIndex);
      processedCount++;

      if (processedCount % 50 === 0 || index === packages.length - 1) {
        logger.debug(`ReportsService: Processed ${processedCount}/${packages.length} packages`);
      }
    });

    logger.info(`ReportsService: Report generation completed - ${processedCount} records created, ${skippedCount} skipped`);
    this.logStatistics();
  }

  public getReportsByDate(date: string): ReportData[] {
    const indexList = this.dateTree.search(date);
    const reports: ReportData[] = [];

    if (indexList === null) {
      logger.debug(`ReportsService: No reports found for date ${date}`);
      return reports;
    }

    for (const index of indexList) {
      const reportData = this.reportsArray.get(index);
      if (reportData) {
        reports.push(reportData);
      }
    }

    logger.debug(`ReportsService: Found ${reports.length} reports for date ${date}`);
    return reports;
  }

  public getReportsByDateRange(startDate: string, endDate: string): ReportData[] {
    const allReports: ReportData[] = [];
    const allDates = this.dateTree.keys();

    for (const date of allDates) {
      if (date >= startDate && date <= endDate) {
        const reportsForDate = this.getReportsByDate(date);
        allReports.push(...reportsForDate);
      }
    }

    // Сортируем по дате
    allReports.sort((a, b) => a.date.localeCompare(b.date));

    logger.info(`ReportsService: Found ${allReports.length} reports for date range ${startDate} to ${endDate}`);
    return allReports;
  }

  public getAllReports(): ReportData[] {
    const allReports = this.reportsArray.getAll();
    // Сортируем по дате
    allReports.sort((a, b) => a.date.localeCompare(b.date));
    
    logger.debug(`ReportsService: Retrieved all reports (${allReports.length} total)`);
    return allReports;
  }

  public getAvailableDates(): string[] {
    const dates = this.dateTree.keys().sort();
    logger.debug(`ReportsService: Available dates: ${dates.length} unique dates`);
    return dates;
  }

  public getDateRange(): { startDate: string; endDate: string } | null {
    const dates = this.getAvailableDates();
    if (dates.length === 0) {
      return null;
    }

    return {
      startDate: dates[0],
      endDate: dates[dates.length - 1]
    };
  }

  public exportToText(reports: ReportData[]): string {
    if (reports.length === 0) {
      return "Нет данных для экспорта";
    }

    const header = "Дата\tТелефон отправителя\tИмя отправителя\tАдрес отправителя\tТелефон получателя\tВес (кг)";
    const rows = reports.map(report => 
      `${report.date}\t${report.senderPhone}\t${report.senderName}\t${report.senderAddress}\t${report.receiverPhone}\t${report.weight}`
    );

    const content = [header, ...rows].join("\n");
    logger.info(`ReportsService: Exported ${reports.length} reports to text format`);
    return content;
  }

  public getStatistics(): {
    totalReports: number;
    uniqueDates: number;
    dateRange: { startDate: string; endDate: string } | null;
    averageReportsPerDate: number;
    totalWeight: number;
    averageWeight: number;
  } {
    const allReports = this.getAllReports();
    const uniqueDates = this.getAvailableDates().length;
    const totalWeight = allReports.reduce((sum, report) => sum + report.weight, 0);

    const stats = {
      totalReports: allReports.length,
      uniqueDates,
      dateRange: this.getDateRange(),
      averageReportsPerDate: uniqueDates > 0 ? allReports.length / uniqueDates : 0,
      totalWeight,
      averageWeight: allReports.length > 0 ? totalWeight / allReports.length : 0,
    };

    logger.debug(`ReportsService: Statistics - Total: ${stats.totalReports}, Unique dates: ${stats.uniqueDates}, Avg weight: ${stats.averageWeight.toFixed(2)}kg`);
    return stats;
  }

  public clear(): void {
    const countBefore = this.reportsArray.size();
    this.dateTree.clear();
    this.reportsArray.clear();
    logger.warning(`ReportsService: Cleared all reports (${countBefore} removed)`);
  }

  public isEmpty(): boolean {
    return this.reportsArray.size() === 0;
  }

  public getTreeHeight(): number {
    return this.dateTree.getHeight();
  }

  public getTreeStatistics(): {
    height: number;
    blackHeight: number;
    isValid: boolean;
    uniqueDates: number;
    efficiency: number;
  } {
    const uniqueDates = this.dateTree.getSize();
    const height = this.getTreeHeight();
    const theoreticalHeight = uniqueDates > 0 ? Math.ceil(Math.log2(uniqueDates + 1)) : 0;

    return {
      height,
      blackHeight: this.dateTree.getBlackHeight(),
      isValid: this.dateTree.isValid(),
      uniqueDates,
      efficiency: theoreticalHeight > 0 ? theoreticalHeight / height : 1,
    };
  }

  private logStatistics(): void {
    const stats = this.getStatistics();
    const treeStats = this.getTreeStatistics();
    
    logger.debug(
      `ReportsService Statistics: Total reports: ${stats.totalReports}, ` +
      `Unique dates: ${stats.uniqueDates}, Tree height: ${treeStats.height}, ` +
      `Tree efficiency: ${treeStats.efficiency.toFixed(3)}, Valid: ${treeStats.isValid}`
    );
  }
}