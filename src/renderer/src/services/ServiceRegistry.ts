import { logger } from "./Logger";
import { PackagesService } from "./PackagesService";
import { UsersService } from "./UsersService";

export class ServiceRegistry {
  private static instance: ServiceRegistry;
  private usersService: UsersService;
  private packagesService: PackagesService;

  private constructor() {
    logger.info("ServiceRegistry: Initializing application services");

    this.usersService = new UsersService();
    this.packagesService = new PackagesService();

    this.setupCascadeDelete();

    logger.info("ServiceRegistry: All services initialized successfully");
  }

  private setupCascadeDelete(): void {
    this.usersService.setUserDeleteCallback((userPhone: number) => {
      const removedCount =
        this.packagesService.removeAllPackagesBySender(userPhone);
      if (removedCount > 0) {
        logger.info(
          `ServiceRegistry: Cascade delete - removed ${removedCount} packages for user ${userPhone}`
        );
      }
    });

    logger.info(
      "ServiceRegistry: Cascade deletion configured - user deletion will remove related packages"
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
    logger.warning("ServiceRegistry: Resetting all services");

    this.usersService.clear();
    this.packagesService.clear();

    this.setupCascadeDelete();

    logger.info("ServiceRegistry: Services reset complete");
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
      `Application Statistics: Users: ${stats.users.count}, Packages: ${stats.packages.count}`
    );
    return stats;
  }
}

const serviceRegistry = ServiceRegistry.getInstance();
export const usersService = serviceRegistry.getUsersService();
export const packagesService = serviceRegistry.getPackagesService();
