// usePackages.js
// Настройка и загрузка массива посылок в сервис

import { PackagesService } from "./src/services/PackagesService";

// Экземпляр сервиса
const service = new PackagesService();

// Попытка загрузить данные из глобальной переменной initialPackages
if (Array.isArray(window.initialPackages)) {
  // window.initialPackages должен быть массивом объектов { senderPhone, receiverPhone, weight, date }
  service.loadPackages(window.initialPackages);
} else {
  console.warn(
    "usePackages: Нет данных initialPackages. Убедитесь, что вы задали window.initialPackages до подключения скрипта."
  );
}

// Экспортируем сервис для дальнейшего использования
export default service;
