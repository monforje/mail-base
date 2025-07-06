// src/renderer/src/handlers/AppHandlers.ts
import { User, Package } from "../types";
import { usersService, packagesService } from "../DataServices";
import { detectFileType, validateFileContent } from "../utils";

export class AppHandlers {
  private setUsers: (users: User[]) => void;
  private setPackages: (packages: Package[]) => void;
  private setIsAboutModalOpen: (isOpen: boolean) => void;

  constructor(
    setUsers: (users: User[]) => void,
    setPackages: (packages: Package[]) => void,
    setIsAboutModalOpen: (isOpen: boolean) => void
  ) {
    this.setUsers = setUsers;
    this.setPackages = setPackages;
    this.setIsAboutModalOpen = setIsAboutModalOpen;
  }

  handleUsersLoad = (loadedUsers: User[]) => {
    console.log("Loading users:", loadedUsers);
    usersService.loadUsers(loadedUsers);
    const allUsers = usersService.getAllUsers();
    console.log("Users in service after load:", allUsers);
    this.setUsers(allUsers);
  };

  handlePackagesLoad = (loadedPackages: Package[]) => {
    console.log("Loading packages:", loadedPackages);
    packagesService.loadPackages(loadedPackages);
    const allPackages = packagesService.getAllPackages();
    console.log("Packages in service after load:", allPackages);
    this.setPackages(allPackages);
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

    const data = currentUsers
      .map((user) => `${user.phone}\t${user.fullName}\t${user.address}`)
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

    const data = currentPackages
      .map(
        (pkg) =>
          `${pkg.senderPhone}\t${pkg.receiverPhone}\t${pkg.weight}\t${pkg.date}`
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
        const users: User[] = lines.map((line) => {
          const [phone, fullName, address] = line.split("\t");
          return { phone, fullName, address };
        });
        this.handleUsersLoad(users);
      } else {
        const packages: Package[] = lines.map((line) => {
          const [senderPhone, receiverPhone, weight, date] = line.split("\t");
          return {
            senderPhone,
            receiverPhone,
            weight: parseFloat(weight),
            date,
          };
        });
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
}
