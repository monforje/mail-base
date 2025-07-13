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
    logger.info(
      `Начало формирования отчёта: ${packages.length} посылок, ${users.length} пользователей`
    );

    this.clear();

    const usersMap = new Map<number, User>();
    users.forEach((user) => {
      usersMap.set(user.phone, user);
    });

    let processedCount = 0;
    let skippedCount = 0;

    packages.forEach((pkg, index) => {
      const sender = usersMap.get(pkg.senderPhone);

      if (!sender) {
        skippedCount++;
        logger.warning(
          `Отправитель ${pkg.senderPhone} не найден среди пользователей, посылка пропущена`
        );
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
        logger.debug(
          `Обработано ${processedCount} из ${packages.length} посылок`
        );
      }
    });

    logger.info(
      `Формирование отчёта завершено — создано записей: ${processedCount}, пропущено: ${skippedCount}`
    );
  }

  public getReportsByDate(date: string): ReportData[] {
    const indexList = this.dateTree.search(date);
    const reports: ReportData[] = [];

    if (indexList === null) {
      logger.debug(`Отчёт: не найдено записей на дату ${date}`);
      return reports;
    }

    for (const index of indexList) {
      const reportData = this.reportsArray.get(index);
      if (reportData) {
        reports.push(reportData);
      }
    }

    logger.debug(`Найдено ${reports.length} записей на дату ${date}`);
    return reports;
  }

  public getReportsByDateRange(
    startDate: string,
    endDate: string
  ): ReportData[] {
    const allReports: ReportData[] = [];
    const allDates = this.dateTree.keys();

    for (const date of allDates) {
      if (date >= startDate && date <= endDate) {
        const reportsForDate = this.getReportsByDate(date);
        allReports.push(...reportsForDate);
      }
    }

    allReports.sort((a, b) => a.date.localeCompare(b.date));

    logger.info(
      `Найдено ${allReports.length} записей за период с ${startDate} по ${endDate}`
    );
    return allReports;
  }

  public getAllReports(): ReportData[] {
    const allReports = this.reportsArray.getAll();
    // Сортируем по дате
    allReports.sort((a, b) => a.date.localeCompare(b.date));

    logger.debug(`Получено всех записей: ${allReports.length}`);
    return allReports;
  }

  public getAvailableDates(): string[] {
    const dates = this.dateTree.keys().sort();
    logger.debug(`Доступные даты: ${dates.length} уникальных дат`);
    return dates;
  }

  public getDateRange(): { startDate: string; endDate: string } | null {
    const dates = this.getAvailableDates();
    if (dates.length === 0) {
      return null;
    }

    return {
      startDate: dates[0],
      endDate: dates[dates.length - 1],
    };
  }

  public exportToText(reports: ReportData[]): string {
    if (reports.length === 0) {
      return "Нет данных для экспорта";
    }

    const header =
      "Дата\tТелефон отправителя\tИмя отправителя\tАдрес отправителя\tТелефон получателя\tВес (кг)";
    const rows = reports.map(
      (report) =>
        `${report.date}\t${report.senderPhone}\t${report.senderName}\t${report.senderAddress}\t${report.receiverPhone}\t${report.weight}`
    );

    const content = [header, ...rows].join("\n");
    logger.info(`Экспортировано ${reports.length} записей в текстовый формат`);
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
    const totalWeight = allReports.reduce(
      (sum, report) => sum + report.weight,
      0
    );

    const stats = {
      totalReports: allReports.length,
      uniqueDates,
      dateRange: this.getDateRange(),
      averageReportsPerDate:
        uniqueDates > 0 ? allReports.length / uniqueDates : 0,
      totalWeight,
      averageWeight:
        allReports.length > 0 ? totalWeight / allReports.length : 0,
    };

    logger.debug(
      `Статистика: всего: ${stats.totalReports}, уникальных дат: ${
        stats.uniqueDates
      }, средний вес: ${stats.averageWeight.toFixed(2)}кг`
    );
    return stats;
  }

  public clear(): void {
    const countBefore = this.reportsArray.size();
    this.dateTree.clear();
    this.reportsArray.clear();
    logger.warning(`Все отчёты очищены (${countBefore} удалено)`);
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
    const theoreticalHeight =
      uniqueDates > 0 ? Math.ceil(Math.log2(uniqueDates + 1)) : 0;

    return {
      height,
      blackHeight: this.dateTree.getBlackHeight(),
      isValid: this.dateTree.isValid(),
      uniqueDates,
      efficiency: theoreticalHeight > 0 ? theoreticalHeight / height : 1,
    };
  }
}
