import { logger } from "./Logger";
import { PackagesService } from "./PackagesService";
import { UsersService } from "./UsersService";

export class ServiceRegistry {
  private static instance: ServiceRegistry;
  private usersService: UsersService;
  private packagesService: PackagesService;

  private constructor() {
    logger.info("Инициализация сервисов приложения");

    this.usersService = new UsersService();
    this.packagesService = new PackagesService();

    this.setupCascadeDelete();

    logger.info("Все сервисы успешно инициализированы");
  }

  private setupCascadeDelete(): void {
    this.usersService.setUserDeleteCallback((userPhone: number) => {
      // Удаляем посылки, где пользователь является отправителем
      const removedBySender = this.packagesService.removeAllPackagesBySender(userPhone);
      
      // Удаляем посылки, где пользователь является получателем
      const removedByReceiver = this.packagesService.removeAllPackagesByReceiver(userPhone);
      
      const totalRemoved = removedBySender + removedByReceiver;
      
      if (totalRemoved > 0) {
        logger.info(
          `Каскадное удаление: удалено ${totalRemoved} посылок для пользователя ${userPhone} (отправитель: ${removedBySender}, получатель: ${removedByReceiver})`
        );
      }
    });

    logger.info(
      "Каскадное удаление настроено — удаление пользователя приведёт к удалению связанных посылок (как отправитель и получатель)"
    );
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

  public resetServices(): void {
    logger.warning("Сброс всех сервисов");

    this.usersService.clear();
    this.packagesService.clear();

    this.setupCascadeDelete();

    logger.info("Сервисы успешно сброшены");
  }

  public clearAllData(): void {
    logger.warning("Полная очистка всех данных");

    // Сначала очищаем посылки
    this.packagesService.clear();
    
    // Затем очищаем пользователей
    this.usersService.clear();

    logger.info("Все данные успешно очищены");
  }

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
      `Статистика приложения: пользователей: ${stats.users.count}, посылок: ${stats.packages.count}`
    );
    return stats;
  }
}

const serviceRegistry = ServiceRegistry.getInstance();
export const usersService = serviceRegistry.getUsersService();
export const packagesService = serviceRegistry.getPackagesService();
