// src/renderer/src/data-structures/HashTable.ts
/**
 * Упрощенная хеш-таблица для курсовой работы по ФСДИА
 * - Метод серединного квадрата для хеш-функции
 * - Линейный пробинг с шагом: h_i(k) = (h(k) + i * k) mod m
 */

export interface HashTableEntry<T> {
  key: string;
  value: T;
  isDeleted: boolean; // Для обработки удаленных элементов
}

export class HashTable<T> {
  private table: Array<HashTableEntry<T> | null>;
  private size: number;        // Количество элементов
  private capacity: number;    // Размер таблицы
  private readonly maxLoadFactor: number = 0.75;

  constructor(initialCapacity: number = 11) {
    // Используем простое число для лучшего распределения
    this.capacity = this.getNextPrime(initialCapacity);
    this.size = 0;
    this.table = new Array(this.capacity);
    this.table.fill(null);
  }

  /**
   * Метод серединного квадрата для хеш-функции
   * Возводим числовое представление ключа в квадрат и берем средние разряды
   */
  private hash(key: string): number {
    // Преобразуем строку в число
    let numericKey = 0;
    for (let i = 0; i < key.length; i++) {
      numericKey += key.charCodeAt(i) * (i + 1);
    }

    // Возводим в квадрат
    const squared = numericKey * numericKey;

    // Берем средние разряды (метод серединного квадрата)
    const squaredStr = squared.toString();
    const len = squaredStr.length;
    
    let middleDigits: string;
    if (len >= 6) {
      // Берем 4 средних разряда
      const start = Math.floor((len - 4) / 2);
      middleDigits = squaredStr.substring(start, start + 4);
    } else if (len >= 4) {
      // Берем 2 средних разряда
      const start = Math.floor((len - 2) / 2);
      middleDigits = squaredStr.substring(start, start + 2);
    } else {
      // Если число слишком маленькое, используем его целиком
      middleDigits = squaredStr;
    }

    const hashValue = parseInt(middleDigits, 10);
    return hashValue % this.capacity;
  }

  /**
   * Линейный пробинг с шагом
   * h_i(k) = (h(k) + i * k) mod m
   */
  private probe(key: string, step: number): number {
    const baseHash = this.hash(key);
    const numericKey = this.stringToNumber(key);
    return (baseHash + step * numericKey) % this.capacity;
  }

  /**
   * Преобразование строки в число для пробинга
   */
  private stringToNumber(key: string): number {
    let result = 0;
    for (let i = 0; i < key.length; i++) {
      result += key.charCodeAt(i);
    }
    return result;
  }

  /**
   * Вставка элемента
   */
  public put(key: string, value: T): void {
    if (key === null || key === undefined) {
      throw new Error("Key cannot be null or undefined");
    }

    // Проверяем коэффициент загрузки
    if (this.size >= this.capacity * this.maxLoadFactor) {
      this.resize();
    }

    let step = 0;
    let index = this.probe(key, step);

    while (step < this.capacity) {
      const entry = this.table[index];

      // Свободная ячейка или удаленная запись
      if (entry === null || entry.isDeleted) {
        this.table[index] = { key, value, isDeleted: false };
        this.size++;
        return;
      }

      // Обновление существующего ключа
      if (entry.key === key && !entry.isDeleted) {
        entry.value = value;
        return;
      }

      // Переходим к следующей позиции
      step++;
      index = this.probe(key, step);
    }

    throw new Error("Hash table is full");
  }

  /**
   * Поиск элемента
   */
  public get(key: string): T | null {
    if (key === null || key === undefined) {
      return null;
    }

    let step = 0;
    let index = this.probe(key, step);

    while (step < this.capacity) {
      const entry = this.table[index];

      // Пустая ячейка - элемент не найден
      if (entry === null) {
        return null;
      }

      // Найден нужный ключ
      if (entry.key === key && !entry.isDeleted) {
        return entry.value;
      }

      // Переходим к следующей позиции
      step++;
      index = this.probe(key, step);
    }

    return null;
  }

  /**
   * Удаление элемента (ленивое удаление)
   */
  public delete(key: string): boolean {
    if (key === null || key === undefined) {
      return false;
    }

    let step = 0;
    let index = this.probe(key, step);

    while (step < this.capacity) {
      const entry = this.table[index];

      // Пустая ячейка - элемент не найден
      if (entry === null) {
        return false;
      }

      // Найден нужный ключ
      if (entry.key === key && !entry.isDeleted) {
        entry.isDeleted = true;
        this.size--;
        return true;
      }

      // Переходим к следующей позиции
      step++;
      index = this.probe(key, step);
    }

    return false;
  }

  /**
   * Проверка наличия ключа
   */
  public containsKey(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Расширение таблицы
   */
  private resize(): void {
    const oldTable = this.table;
    const oldCapacity = this.capacity;

    this.capacity = this.getNextPrime(this.capacity * 2);
    this.size = 0;
    this.table = new Array(this.capacity);
    this.table.fill(null);

    // Перехеширование
    for (let i = 0; i < oldCapacity; i++) {
      const entry = oldTable[i];
      if (entry !== null && !entry.isDeleted) {
        this.put(entry.key, entry.value);
      }
    }
  }

  /**
   * Очистка таблицы
   */
  public clear(): void {
    this.table.fill(null);
    this.size = 0;
  }

  /**
   * Получение всех ключей
   */
  public keys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < this.capacity; i++) {
      const entry = this.table[i];
      if (entry !== null && !entry.isDeleted) {
        keys.push(entry.key);
      }
    }
    return keys;
  }

  /**
   * Получение всех значений
   */
  public values(): T[] {
    const values: T[] = [];
    for (let i = 0; i < this.capacity; i++) {
      const entry = this.table[i];
      if (entry !== null && !entry.isDeleted) {
        values.push(entry.value);
      }
    }
    return values;
  }

  /**
   * Получение статистики таблицы
   */
  public getPerformanceStats(): {
    size: number;
    capacity: number;
    loadFactor: number;
    emptySlots: number;
    deletedSlots: number;
    occupiedSlots: number;
  } {
    let emptySlots = 0;
    let deletedSlots = 0;
    let occupiedSlots = 0;

    for (let i = 0; i < this.capacity; i++) {
      const entry = this.table[i];
      if (entry === null) {
        emptySlots++;
      } else if (entry.isDeleted) {
        deletedSlots++;
      } else {
        occupiedSlots++;
      }
    }

    return {
      size: this.size,
      capacity: this.capacity,
      loadFactor: this.size / this.capacity,
      emptySlots,
      deletedSlots,
      occupiedSlots,
    };
  }

  /**
   * Найти следующее простое число
   */
  private getNextPrime(n: number): number {
    let candidate = n;
    while (!this.isPrime(candidate)) {
      candidate++;
    }
    return candidate;
  }

  /**
   * Проверка на простое число
   */
  private isPrime(n: number): boolean {
    if (n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;

    for (let i = 3; i * i <= n; i += 2) {
      if (n % i === 0) return false;
    }
    return true;
  }

  /**
   * Итератор для обхода элементов
   */
  public *entries(): IterableIterator<[string, T]> {
    for (let i = 0; i < this.capacity; i++) {
      const entry = this.table[i];
      if (entry !== null && !entry.isDeleted) {
        yield [entry.key, entry.value];
      }
    }
  }

  // Геттеры
  public getSize(): number {
    return this.size;
  }

  public getCapacity(): number {
    return this.capacity;
  }

  public getLoadFactor(): number {
    return this.size / this.capacity;
  }

  public isEmpty(): boolean {
    return this.size === 0;
  }

  // Синонимы для совместимости
  public set(key: string, value: T): void {
    this.put(key, value);
  }

  public has(key: string): boolean {
    return this.containsKey(key);
  }

  public getAllKeys(): string[] {
    return this.keys();
  }

  public getAllValues(): T[] {
    return this.values();
  }

  public getDistributionStats() {
    return this.getPerformanceStats();
  }
}