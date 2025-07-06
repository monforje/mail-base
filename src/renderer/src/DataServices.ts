// src/renderer/src/DataServices.ts
/**
 * Legacy DataServices module
 * Теперь служит только для экспорта сервисов из нового архитектурного слоя
 * Все логика перенесена в отдельные сервисы в папку services/
 */

// Импортируем новые сервисы
export { UsersService } from "./services/UsersService";
export { PackagesService } from "./services/PackagesService";
export { ServiceRegistry } from "./services/ServiceRegistry";

// Экспортируем синглтон экземпляры для обратной совместимости
export { usersService, packagesService } from "./services/ServiceRegistry";

// Экспортируем логгер для использования в других частях приложения
export { logger } from "./services/Logger";
