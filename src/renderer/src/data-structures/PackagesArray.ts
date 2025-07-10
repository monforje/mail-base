// src/renderer/src/data-structures/PackagesArray.ts
// Данные посылки без ключа
export interface PackageData {
  receiverPhone: string;
  weight: number;
  date: string;
}

export class PackagesArray {
  private data: PackageData[];

  constructor() {
    this.data = [];
  }

  /**
   * Добавляет данные посылки в массив (без senderPhone)
   * @param packageData Данные посылки для добавления
   * @returns Индекс добавленных данных
   */
  public add(packageData: PackageData): number {
    const index = this.data.length;
    this.data.push(packageData);
    return index;
  }

  /**
   * Получает данные посылки по индексу
   * @param index Индекс данных посылки
   * @returns Данные посылки или null если индекс неверный
   */
  public get(index: number): PackageData | null {
    if (index >= 0 && index < this.data.length) {
      return this.data[index];
    }
    return null;
  }

  /**
   * Обновляет данные посылки по индексу
   * @param index Индекс данных посылки
   * @param packageData Новые данные посылки
   * @returns true если обновление успешно
   */
  public update(index: number, packageData: PackageData): boolean {
    if (index >= 0 && index < this.data.length) {
      this.data[index] = packageData;
      return true;
    }
    return false;
  }

  /**
   * Удаляет данные посылки по индексу и возвращает информацию о перемещении
   * @param index Индекс удаляемых данных посылки
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
   * Получает все данные посылок
   * @returns Копия массива всех данных посылок
   */
  public getAll(): PackageData[] {
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
