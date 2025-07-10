// src/renderer/src/DataServices.ts
/**
 * Legacy DataServices module
 * Теперь служит только для экспорта сервисов из нового архитектурного слоя
 * Все логика перенесена в отдельные сервисы в папку services/
 *
 * Обновлено для работы с новой архитектурой:
 * - Данные хранятся в массивах (UsersArray, PackagesArray)
 * - Структуры данных хранят только индексы
 * - Добавлен двойной двусвязный список для обработки коллизий
 */

// Импортируем новые сервисы
export { UsersService } from "./services/UsersService";
export { PackagesService } from "./services/PackagesService";
export { ServiceRegistry } from "./services/ServiceRegistry";

// Экспортируем синглтон экземпляры для обратной совместимости
export { usersService, packagesService } from "./services/ServiceRegistry";

// Экспортируем логгер для использования в других частях приложения
export { logger } from "./services/Logger";

// Экспортируем новые классы массивов и интерфейсы данных
export { UsersArray } from "./data-structures/UsersArray";
export type { UserData } from "./data-structures/UsersArray";
export { PackagesArray } from "./data-structures/PackagesArray";
export type { PackageData } from "./data-structures/PackagesArray";

// Экспортируем двойной двусвязный список
export { DoublyLinkedList, ListNode } from "./data-structures/DoublyLinkedList";

// Экспортируем структуры данных
export { HashTable } from "./data-structures/HashTable";
export { RedBlackTree } from "./data-structures/RedBlackTree";