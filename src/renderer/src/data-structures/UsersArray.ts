// src/renderer/src/data-structures/UsersArray.ts
// Данные пользователя без ключа (телефона)
export interface UserData {
  fullName: string;
  address: string;
}

export class UsersArray {
  private data: UserData[];

  constructor() {
    this.data = [];
  }

  /**
   * Добавляет данные пользователя в массив (без телефона)
   * @param userData Данные пользователя для добавления
   * @returns Индекс добавленных данных
   */
  public add(userData: UserData): number {
    const index = this.data.length;
    this.data.push(userData);
    return index;
  }

  /**
   * Получает данные пользователя по индексу
   * @param index Индекс данных пользователя
   * @returns Данные пользователя или null если индекс неверный
   */
  public get(index: number): UserData | null {
    if (index >= 0 && index < this.data.length) {
      return this.data[index];
    }
    return null;
  }

  /**
   * Обновляет данные пользователя по индексу
   * @param index Индекс данных пользователя
   * @param userData Новые данные пользователя
   * @returns true если обновление успешно
   */
  public update(index: number, userData: UserData): boolean {
    if (index >= 0 && index < this.data.length) {
      this.data[index] = userData;
      return true;
    }
    return false;
  }

  /**
   * Удаляет данные пользователя по индексу и возвращает информацию о перемещении
   * @param index Индекс удаляемых данных пользователя
   * @returns Объект с информацией о перемещении или null если удаление невозможно
   */
  public remove(
    index: number
  ): { movedFromIndex: number; newIndex: number } | null {
    if (index < 0 || index >= this.data.length) {
      return null;
    }

    const lastIndex = this.data.length - 1;

    if (index === lastIndex) {
      // Удаляем последний элемент - просто убираем его
      this.data.pop();
      return null;
    } else {
      // Перемещаем последний элемент на место удаляемого
      this.data[index] = this.data[lastIndex];
      this.data.pop();

      return {
        movedFromIndex: lastIndex,
        newIndex: index,
      };
    }
  }

  /**
   * Получает все данные пользователей
   * @returns Копия массива всех данных пользователей
   */
  public getAll(): UserData[] {
    return [...this.data];
  }

  /**
   * Очищает массив
   */
  public clear(): void {
    this.data = [];
  }

  /**
   * Получает размер массива
   * @returns Количество элементов в массиве
   */
  public size(): number {
    return this.data.length;
  }

  /**
   * Проверяет валидность индекса
   * @param index Индекс для проверки
   * @returns true если индекс валидный
   */
  public isValidIndex(index: number): boolean {
    return index >= 0 && index < this.data.length;
  }
}
