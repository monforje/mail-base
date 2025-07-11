// src/renderer/public/packagesIntegration.js
// Этот файл должен быть размещен в папке public вашего renderer

(function () {
  "use strict";

  console.log("Загружен packagesIntegration.js");

  // Функция для безопасного добавления элементов в дерево
  function safeInsertPackages(packages) {
    if (!packages || !Array.isArray(packages)) {
      console.warn("Нет пакетов для вставки");
      return;
    }

    if (typeof currentAlg === "undefined" || !currentAlg) {
      console.warn("Алгоритм дерева не готов");
      return false;
    }

    console.log(`Начинаем вставку ${packages.length} посылок`);

    try {
      // Очищаем дерево
      if (typeof currentAlg.clearCallback === "function") {
        currentAlg.clearCallback();
      }

      // Группируем посылки по отправителям для оптимизации
      const senderGroups = new Map();
      packages.forEach((pkg) => {
        const senderKey = pkg.senderPhone.toString();
        if (!senderGroups.has(senderKey)) {
          senderGroups.set(senderKey, []);
        }
        senderGroups.get(senderKey).push(pkg);
      });

      console.log(`Найдено ${senderGroups.size} уникальных отправителей`);

      // Вставляем по одному ключу на отправителя
      let insertedCount = 0;
      for (const [senderKey, senderPackages] of senderGroups) {
        try {
          console.log(
            `Вставляем ключ: ${senderKey} (${senderPackages.length} посылок)`
          );

          const commands = currentAlg.insertElement(senderKey);
          if (commands && commands.length > 0) {
            currentAlg.animationManager.StartNewAnimation(commands);
            currentAlg.animationManager.skipForward();
            currentAlg.animationManager.clearHistory();
            insertedCount++;
          }
        } catch (error) {
          console.error(`Ошибка при вставке ключа ${senderKey}:`, error);
        }
      }

      console.log(`Успешно вставлено ${insertedCount} ключей в дерево`);
      return true;
    } catch (error) {
      console.error("Ошибка при вставке посылок:", error);
      return false;
    }
  }

  // Функция для обработки сообщений от родительского окна
  function handleMessage(event) {
    if (!event.data || typeof event.data !== "object") {
      return;
    }

    switch (event.data.type) {
      case "LOAD_PACKAGES":
        console.log("Получена команда загрузки посылок");
        const packages = event.data.packages || [];

        // Пытаемся вставить сразу, если дерево готово
        if (safeInsertPackages(packages)) {
          console.log("Посылки успешно загружены");
        } else {
          // Если не получилось, сохраняем данные и попробуем позже
          window.pendingPackages = packages;
          console.log("Посылки сохранены для отложенной загрузки");
        }
        break;

      case "CLEAR_TREE":
        console.log("Получена команда очистки дерева");
        if (
          typeof currentAlg !== "undefined" &&
          currentAlg &&
          typeof currentAlg.clearCallback === "function"
        ) {
          currentAlg.clearCallback();
        }
        break;

      default:
        console.log("Неизвестный тип сообщения:", event.data.type);
    }
  }

  // Подписываемся на сообщения
  window.addEventListener("message", handleMessage, false);

  // Функция для проверки готовности дерева и загрузки отложенных данных
  function checkAndLoadPending() {
    if (
      window.pendingPackages &&
      typeof currentAlg !== "undefined" &&
      currentAlg
    ) {
      console.log("Дерево готово, загружаем отложенные посылки");
      if (safeInsertPackages(window.pendingPackages)) {
        delete window.pendingPackages;
      }
    }
  }

  // Перехватываем инициализацию дерева
  function interceptInit() {
    if (typeof window.init === "function") {
      const originalInit = window.init;

      window.init = function () {
        console.log("Перехвачена инициализация дерева");

        // Вызываем оригинальную инициализацию
        originalInit.apply(this, arguments);

        // Проверяем отложенные данные через небольшую задержку
        setTimeout(checkAndLoadPending, 200);
      };

      console.log("Инициализация дерева перехвачена");
    } else {
      // Если init еще не готов, проверяем позже
      setTimeout(interceptInit, 100);
    }
  }

  // Начинаем перехват после загрузки DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", interceptInit);
  } else {
    interceptInit();
  }

  // Экспортируем функции для отладки
  window.debugTreeIntegration = {
    safeInsertPackages,
    checkAndLoadPending,
    handleMessage,
  };

  console.log("packagesIntegration.js готов к работе");
})();
