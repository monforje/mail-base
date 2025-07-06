// src/renderer/src/services/ServiceRegistry.ts
import { UsersService } from "./UsersService";
import { PackagesService } from "./PackagesService";
import { logger } from "./Logger";

/**
 * Центральный реестр сервисов приложения
 * Реализует паттерн Service Locator для управления зависимостями
 */
export class ServiceRegistry {
  private static instance: ServiceRegistry;
  private usersService: UsersService;
  private packagesService: PackagesService;

  private constructor() {
    logger.info("ServiceRegistry: Initializing application services");

    this.usersService = new UsersService();
    this.packagesService = new PackagesService();

    logger.info("ServiceRegistry: All services initialized successfully");
  }

  public static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry();
    }
    return ServiceRegistry.instance;
  }

  public getUsersService(): UsersService {
    return this.usersService;
  }

  public getPackagesService(): PackagesService {
    return this.packagesService;
  }

  /**
   * Перезапуск всех сервисов (для тестирования)
   */
  public resetServices(): void {
    logger.warning("ServiceRegistry: Resetting all services");

    this.usersService.clear();
    this.packagesService.clear();

    logger.info("ServiceRegistry: Services reset complete");
  }

  /**
   * Получение общей статистики приложения
   */
  public getApplicationStatistics(): {
    users: { count: number; loadFactor: number };
    packages: { count: number; height: number; isValid: boolean };
  } {
    const userStats = this.usersService.getStatistics();
    const packageStats = this.packagesService.getTreeStatistics();

    const stats = {
      users: {
        count: userStats.size,
        loadFactor: userStats.loadFactor,
      },
      packages: {
        count: packageStats.size,
        height: packageStats.height,
        isValid: packageStats.isValid,
      },
    };

    logger.debug(
      `Application Statistics: Users: ${stats.users.count}, Packages: ${stats.packages.count}`
    );
    return stats;
  }
}

// Экспортируем синглтон сервисы для обратной совместимости
const serviceRegistry = ServiceRegistry.getInstance();
export const usersService = serviceRegistry.getUsersService();
export const packagesService = serviceRegistry.getPackagesService();
