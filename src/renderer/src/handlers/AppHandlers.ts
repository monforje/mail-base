import { usersService, packagesService } from "../DataServices";
import { ServiceRegistry } from "../services/ServiceRegistry";
import { User, Package, ViewMode } from "../types";
import {
  detectFileType,
  validateFileContent,
  parseUserFromLine,
  parsePackageFromLine,
} from "../utils";

export class AppHandlers {
  private setUsers: (users: User[]) => void;
  private setPackages: (packages: Package[]) => void;
  private setIsAboutModalOpen: (isOpen: boolean) => void;
  private setViewMode: (mode: ViewMode) => void;

  constructor(
    setUsers: (users: User[]) => void,
    setPackages: (packages: Package[]) => void,
    setIsAboutModalOpen: (isOpen: boolean) => void,
    setViewMode: (mode: ViewMode) => void
  ) {
    this.setUsers = setUsers;
    this.setPackages = setPackages;
    this.setIsAboutModalOpen = setIsAboutModalOpen;
    this.setViewMode = setViewMode;
  }

  private hashTableSizeCallback:
    | ((
        userCount: number,
        onConfirm: (size: number) => void,
        onCancel: () => void
      ) => void)
    | null = null;

  public setHashTableSizeCallback(
    callback: (
      userCount: number,
      onConfirm: (size: number) => void,
      onCancel: () => void
    ) => void
  ) {
    this.hashTableSizeCallback = callback;
  }

  private askForHashTableSize(userCount: number): Promise<number | null> {
    return new Promise((resolve) => {
      if (this.hashTableSizeCallback) {
        this.hashTableSizeCallback(
          userCount,
          (size: number) => resolve(size),
          () => resolve(null)
        );
      } else {
        const choice = prompt(
          `Введите размер хеш-таблицы для ${userCount} пользователей:`
        );
        if (choice === null) {
          resolve(null);
        } else {
          const parsedSize = parseInt(choice, 10);
          resolve(isNaN(parsedSize) ? null : Math.max(11, parsedSize));
        }
      }
    });
  }

  handleUsersLoad = (loadedUsers: User[], customHashTableSize?: number) => {
    console.log("Загрузка пользователей:", loadedUsers);
    try {
      const existingCount = usersService.getCount();
      usersService.loadUsers(loadedUsers, customHashTableSize);
      const allUsers = usersService.getAllUsers();
      const newCount = usersService.getCount();
      const addedCount = newCount - existingCount;

      console.log("Пользователи в сервисе после загрузки:", allUsers);

      if (loadedUsers.length >= 500) {
        setTimeout(() => {
          this.setUsers(allUsers);
          console.log(
            "UI обновлен после загрузки большого объема пользователей"
          );
        }, 100);
      } else {
        this.setUsers(allUsers);
      }

      if (existingCount > 0) {
        alert(
          `Добавлено ${addedCount} новых пользователей к существующим ${existingCount}. Всего: ${newCount} пользователей.`
        );
      } else {
        alert(`Загружено ${newCount} пользователей.`);
      }
    } catch (error) {
      console.error("Ошибка при загрузке пользователей:", error);
      alert(`Ошибка при загрузке пользователей: ${error}`);
    }
  };

  handlePackagesLoad = (loadedPackages: Package[]) => {
    console.log("Загрузка посылок:", loadedPackages);
    try {
      const existingCount = packagesService.getCount();
      packagesService.loadPackages(loadedPackages);
      const allPackages = packagesService.getAllPackages();
      const newCount = packagesService.getCount();
      const addedCount = newCount - existingCount;

      console.log("Посылки в сервисе после загрузки:", allPackages);

      if (loadedPackages.length >= 500) {
        setTimeout(() => {
          this.setPackages(allPackages);
          console.log("UI обновлен после загрузки большого объема данных");
        }, 100);
      } else {
        this.setPackages(allPackages);
      }

      if (existingCount > 0) {
        alert(
          `Добавлено ${addedCount} новых посылок к существующим ${existingCount}. Всего: ${newCount} посылок.`
        );
      } else {
        alert(`Загружено ${newCount} посылок.`);
      }
    } catch (error) {
      console.error("Ошибка при загрузке посылок:", error);
      alert(`Ошибка при загрузке посылок: ${error}`);
    }
  };

  handleUsersClear = () => {
    if (usersService.getCount() === 0) {
      alert("Список пользователей уже пуст");
      return;
    }

    const userCount = usersService.getCount();
    const packageCount = packagesService.getCount();

    let message = `Вы уверены, что хотите удалить всех пользователей (${userCount} пользователей)?`;

    if (packageCount > 0) {
      message += `\n\nВнимание: В системе есть ${packageCount} посылок, связанных с пользователями. При удалении пользователей все посылки также будут удалены.`;
    }

    if (window.confirm(message)) {
      const serviceRegistry = ServiceRegistry.getInstance();
      serviceRegistry.clearAllData();

      // Обновляем состояние в UI
      this.setUsers([]);
      this.setPackages([]);
      console.log("Все данные очищены");
    }
  };

  handlePackagesClear = () => {
    if (packagesService.getCount() === 0) {
      alert("Список посылок уже пуст");
      return;
    }

    const packageCount = packagesService.getCount();
    const userCount = usersService.getCount();

    let message = `Вы уверены, что хотите удалить все посылки (${packageCount} посылок)?`;

    if (userCount > 0) {
      message += `\n\nПримечание: В системе есть ${userCount} пользователей. Посылки будут удалены, но пользователи останутся.`;
    }

    if (window.confirm(message)) {
      packagesService.clear();
      this.setPackages([]);
      console.log("Посылки очищены");
    }
  };

  handleUsersSave = () => {
    const currentUsers = usersService.getAllUsers();
    if (currentUsers.length === 0) {
      alert("Нет данных для сохранения");
      return;
    }

    const data = currentUsers
      .map(
        (user) => `${user.phone.toString()}\t${user.fullName}\t${user.address}`
      )
      .join("\n");
    const blob = new Blob([data], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.txt";
    a.click();
    URL.revokeObjectURL(url);
    console.log("Пользователи сохранены в файл");
  };

  handlePackagesSave = () => {
    const currentPackages = packagesService.getAllPackages();
    if (currentPackages.length === 0) {
      alert("Нет данных для сохранения");
      return;
    }

    const data = currentPackages
      .map(
        (pkg) =>
          `${pkg.senderPhone.toString()}\t${pkg.receiverPhone.toString()}\t${
            pkg.weight
          }\t${pkg.date}`
      )
      .join("\n");
    const blob = new Blob([data], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "packages.txt";
    a.click();
    URL.revokeObjectURL(url);
    console.log("Посылки сохранены в файл");
  };

  handleFileLoad = (
    event: React.ChangeEvent<HTMLInputElement>,
    expectedType: "users" | "packages"
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;

      const detectedType = detectFileType(content);

      if (detectedType === "invalid") {
        alert("Неверный формат файла. Проверьте структуру данных.");
        return;
      }

      if (detectedType !== expectedType) {
        const typeNames = {
          users: "пользователей",
          packages: "посылок",
        };
        alert(
          `Ошибка: вы пытаетесь загрузить файл ${typeNames[detectedType]} в раздел ${typeNames[expectedType]}. Пожалуйста, выберите правильный файл.`
        );
        return;
      }

      const validation = validateFileContent(content, expectedType);

      if (!validation.isValid) {
        let errorMessage = `Ошибки в файле:\n${validation.errors.join("\n")}`;
        if (validation.warnings.length > 0) {
          errorMessage += `\n\nПредупреждения:\n${validation.warnings.join(
            "\n"
          )}`;
        }
        alert(errorMessage);
        return;
      }

      // Показываем предупреждения, если есть
      if (validation.warnings.length > 0) {
        const warningMessage = `Предупреждения:\n${validation.warnings.join(
          "\n"
        )}`;
        if (!confirm(`${warningMessage}\n\nПродолжить загрузку?`)) {
          return;
        }
      }

      const lines = content.split("\n").filter((line) => line.trim() !== "");

      if (expectedType === "users") {
        const users: User[] = [];
        const parseErrors: string[] = [];

        lines.forEach((line, index) => {
          const result = parseUserFromLine(line, index + 1);
          if (result.error) {
            parseErrors.push(result.error);
          } else if (result.user) {
            users.push(result.user);
          }
        });

        if (parseErrors.length > 0) {
          alert(`Ошибки парсинга телефонов:\n${parseErrors.join("\n")}`);
          return;
        }

        this.askForHashTableSize(users.length)
          .then((hashTableSize) => {
            if (hashTableSize === null) {
              console.log("Пользователь отменил выбор размера хеш-таблицы");
              return;
            }

            console.log(
              `Выбран размер хеш-таблицы: ${hashTableSize} для ${users.length} пользователей`
            );
            this.handleUsersLoad(users, hashTableSize);
          })
          .catch((error) => {
            console.error("Ошибка при выборе размера хеш-таблицы:", error);
            alert(
              "Ошибка при выборе размера хеш-таблицы. Используется размер по умолчанию."
            );
            this.handleUsersLoad(users);
          });
      } else {
        const packages: Package[] = [];
        const parseErrors: string[] = [];

        lines.forEach((line, index) => {
          const result = parsePackageFromLine(line, index + 1);
          if (result.error) {
            parseErrors.push(result.error);
          } else if (result.package) {
            packages.push(result.package);
          }
        });

        if (parseErrors.length > 0) {
          alert(`Ошибки парсинга данных:\n${parseErrors.join("\n")}`);
          return;
        }

        this.handlePackagesLoad(packages);
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  handleAbout = () => {
    this.setIsAboutModalOpen(true);
  };

  handleCloseAbout = () => {
    this.setIsAboutModalOpen(false);
  };

  handleViewModeChange = (mode: ViewMode) => {
    this.setViewMode(mode);
    console.log("View mode changed to:", mode);
  };
}
