// src/renderer/src/handlers/AppHandlers.ts
import { User, Package, ViewMode } from "../types";
import { usersService, packagesService } from "../DataServices";
import {
  detectFileType,
  validateFileContent,
  parsePhoneNumber,
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

  handleUsersLoad = (loadedUsers: User[]) => {
    console.log("Loading users:", loadedUsers);
    try {
      usersService.loadUsers(loadedUsers);
      const allUsers = usersService.getAllUsers();
      console.log("Users in service after load:", allUsers);
      this.setUsers(allUsers);
    } catch (error) {
      console.error("Error loading users:", error);
      alert(`Ошибка при загрузке пользователей: ${error}`);
    }
  };

  handlePackagesLoad = (loadedPackages: Package[]) => {
    console.log("Loading packages:", loadedPackages);
    try {
      packagesService.loadPackages(loadedPackages);
      const allPackages = packagesService.getAllPackages();
      console.log("Packages in service after load:", allPackages);
      this.setPackages(allPackages);
    } catch (error) {
      console.error("Error loading packages:", error);
      alert(`Ошибка при загрузке посылок: ${error}`);
    }
  };

  handleUsersClear = () => {
    if (usersService.getCount() === 0) {
      alert("Список пользователей уже пуст");
      return;
    }
    if (window.confirm("Вы уверены, что хотите удалить всех пользователей?")) {
      usersService.clear();
      this.setUsers([]);
      console.log("Users cleared");
    }
  };

  handlePackagesClear = () => {
    if (packagesService.getCount() === 0) {
      alert("Список посылок уже пуст");
      return;
    }
    if (window.confirm("Вы уверены, что хотите удалить все посылки?")) {
      packagesService.clear();
      this.setPackages([]);
      console.log("Packages cleared");
    }
  };

  handleUsersSave = () => {
    const currentUsers = usersService.getAllUsers();
    if (currentUsers.length === 0) {
      alert("Нет данных для сохранения");
      return;
    }

    // ИСПРАВЛЕНО: Форматирование числовых телефонов для сохранения
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
    console.log("Users saved to file");
  };

  handlePackagesSave = () => {
    const currentPackages = packagesService.getAllPackages();
    if (currentPackages.length === 0) {
      alert("Нет данных для сохранения");
      return;
    }

    // ИСПРАВЛЕНО: Форматирование числовых телефонов для сохранения
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
    console.log("Packages saved to file");
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

      // Определяем тип файла автоматически
      const detectedType = detectFileType(content);

      // Проверяем, соответствует ли тип ожидаемому
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

      // Валидируем содержимое файла
      const validation = validateFileContent(content, expectedType);

      if (!validation.isValid) {
        const errorMessage = `Ошибки в файле:\n${validation.errors.join("\n")}`;
        alert(errorMessage);
        return;
      }

      const lines = content.split("\n").filter((line) => line.trim() !== "");

      if (expectedType === "users") {
        // ИСПРАВЛЕНО: Парсинг строковых телефонов в числа
        const users: User[] = [];
        const parseErrors: string[] = [];

        lines.forEach((line, index) => {
          const [phoneStr, fullName, address] = line.split("\t");
          const phone = parsePhoneNumber(phoneStr);

          if (phone === null) {
            parseErrors.push(
              `Строка ${index + 1}: неверный формат телефона ${phoneStr}`
            );
          } else {
            users.push({ phone, fullName, address });
          }
        });

        if (parseErrors.length > 0) {
          alert(`Ошибки парсинга телефонов:\n${parseErrors.join("\n")}`);
          return;
        }

        this.handleUsersLoad(users);
      } else {
        // ИСПРАВЛЕНО: Парсинг строковых телефонов в числа для посылок
        const packages: Package[] = [];
        const parseErrors: string[] = [];

        lines.forEach((line, index) => {
          const [senderPhoneStr, receiverPhoneStr, weightStr, date] =
            line.split("\t");
          const senderPhone = parsePhoneNumber(senderPhoneStr);
          const receiverPhone = parsePhoneNumber(receiverPhoneStr);
          const weight = parseFloat(weightStr);

          if (senderPhone === null) {
            parseErrors.push(
              `Строка ${
                index + 1
              }: неверный формат телефона отправителя ${senderPhoneStr}`
            );
          }
          if (receiverPhone === null) {
            parseErrors.push(
              `Строка ${
                index + 1
              }: неверный формат телефона получателя ${receiverPhoneStr}`
            );
          }
          if (isNaN(weight)) {
            parseErrors.push(
              `Строка ${index + 1}: неверный формат веса ${weightStr}`
            );
          }

          if (
            senderPhone !== null &&
            receiverPhone !== null &&
            !isNaN(weight)
          ) {
            packages.push({
              senderPhone,
              receiverPhone,
              weight,
              date,
            });
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
