// src/renderer/src/data-structures/HashTable.ts
/**
 * Высокооптимизированная хеш-таблица с управлением памятью
 * Включает pool объектов, кэширование хешей, и оптимизации уровня C++
 */

export interface HashNode<T> {
  key: string;
  keyHash: number; // Кэшированный хеш ключа
  value: T;
  next: HashNode<T> | null;
}

// Пул объектов для переиспользования узлов (аналог управления памятью в C++)
class NodePool<T> {
  private pool: HashNode<T>[] = [];
  private maxPoolSize: number = 1000;

  acquire(key: string, keyHash: number, value: T): HashNode<T> {
    const node = this.pool.pop();
    if (node) {
      // Переиспользуем существующий узел
      node.key = key;
      node.keyHash = keyHash;
      node.value = value;
      node.next = null;
      return node;
    }

    // Создаем новый узел только если пул пуст
    return {
      key,
      keyHash,
      value,
      next: null,
    };
  }

  release(node: HashNode<T>): void {
    if (this.pool.length < this.maxPoolSize) {
      // Очищаем ссылки для GC
      node.key = "";
      node.value = null as any;
      node.next = null;
      this.pool.push(node);
    }
  }

  clear(): void {
    this.pool.length = 0;
  }

  getPoolSize(): number {
    return this.pool.length;
  }
}

export class HashTable<T> {
  private table: Array<HashNode<T> | null>;
  private size: number;
  private capacity: number;
  private readonly loadFactorThreshold: number = 0.75;
  private readonly nodePool: NodePool<T>;

  // Оптимизации для производительности
  private readonly hashSeed: number;
  private resizeInProgress: boolean = false;

  // Статистика для профилирования
  private collisionCount: number = 0;
  private resizeCount: number = 0;
  private maxProbeLength: number = 0;

  constructor(initialCapacity: number = 16) {
    this.capacity = this.getNextPowerOfTwo(Math.max(initialCapacity, 4));
    this.size = 0;
    this.table = new Array(this.capacity);
    this.table.fill(null);
    this.nodePool = new NodePool<T>();
    this.hashSeed = Math.floor(Math.random() * 0x7fffffff); // Случайный seed для защиты от атак
  }

  /**
   * Быстрое вычисление степени двойки с битовыми операциями
   */
  private getNextPowerOfTwo(n: number): number {
    if (n <= 1) return 1;

    // Используем битовые операции для максимальной скорости
    n--;
    n |= n >> 1;
    n |= n >> 2;
    n |= n >> 4;
    n |= n >> 8;
    n |= n >> 16;
    n++;

    return n;
  }

  /**
   * Высокопроизводительная хеш-функция с защитой от атак
   * Основана на FNV-1a с дополнительным seed
   */
  private fastHash(key: string): number {
    let hash = 0x811c9dc5 ^ this.hashSeed; // FNV offset basis с seed

    // Развернутый цикл для оптимизации
    for (let i = 0; i < key.length; i++) {
      hash ^= key.charCodeAt(i);
      hash = (hash * 0x01000193) >>> 0; // FNV prime, >>> для 32-bit
    }

    return hash;
  }

  /**
   * Быстрое получение индекса с битовой маской
   */
  private getIndex(hash: number): number {
    return hash & (this.capacity - 1);
  }

  /**
   * Оптимизированная вставка с кэшированием хеша
   */
  public put(key: string, value: T): void {
    if (key === null || key === undefined) {
      throw new Error("Key cannot be null or undefined");
    }

    // Проверяем необходимость расширения перед вставкой
    if (
      this.size >= this.capacity * this.loadFactorThreshold &&
      !this.resizeInProgress
    ) {
      this.resize();
    }

    const keyHash = this.fastHash(key);
    const index = this.getIndex(keyHash);
    let current = this.table[index];
    let probeLength = 0;

    // Поиск существующего ключа с оптимизацией
    while (current !== null) {
      probeLength++;

      // Сначала сравниваем хеши (быстрее), потом строки
      if (current.keyHash === keyHash && current.key === key) {
        current.value = value;
        return;
      }
      current = current.next;
    }

    // Вставка нового узла с использованием пула
    const newNode = this.nodePool.acquire(key, keyHash, value);
    newNode.next = this.table[index];
    this.table[index] = newNode;
    this.size++;

    // Обновляем статистику
    if (probeLength > 0) {
      this.collisionCount++;
    }
    this.maxProbeLength = Math.max(this.maxProbeLength, probeLength);
  }

  /**
   * Оптимизированный поиск
   */
  public get(key: string): T | null {
    if (key === null || key === undefined) {
      return null;
    }

    const keyHash = this.fastHash(key);
    const index = this.getIndex(keyHash);
    let current = this.table[index];

    while (current !== null) {
      // Быстрое сравнение по хешу перед сравнением строк
      if (current.keyHash === keyHash && current.key === key) {
        return current.value;
      }
      current = current.next;
    }

    return null;
  }

  /**
   * Оптимизированное удаление с возвратом узлов в пул
   */
  public delete(key: string): boolean {
    if (key === null || key === undefined) {
      return false;
    }

    const keyHash = this.fastHash(key);
    const index = this.getIndex(keyHash);
    let current = this.table[index];
    let prev: HashNode<T> | null = null;

    while (current !== null) {
      if (current.keyHash === keyHash && current.key === key) {
        if (prev === null) {
          this.table[index] = current.next;
        } else {
          prev.next = current.next;
        }

        // Возвращаем узел в пул для переиспользования
        this.nodePool.release(current);
        this.size--;
        return true;
      }
      prev = current;
      current = current.next;
    }

    return false;
  }

  /**
   * Быстрая проверка наличия ключа (без возврата значения)
   */
  public containsKey(key: string): boolean {
    if (key === null || key === undefined) {
      return false;
    }

    const keyHash = this.fastHash(key);
    const index = this.getIndex(keyHash);
    let current = this.table[index];

    while (current !== null) {
      if (current.keyHash === keyHash && current.key === key) {
        return true;
      }
      current = current.next;
    }

    return false;
  }

  /**
   * Оптимизированное расширение с минимизацией аллокаций
   */
  private resize(): void {
    if (this.resizeInProgress) return;

    this.resizeInProgress = true;
    this.resizeCount++;

    const oldTable = this.table;
    const oldCapacity = this.capacity;

    this.capacity *= 2;
    this.size = 0;
    this.table = new Array(this.capacity);
    this.table.fill(null);

    // Перехеширование с переиспользованием узлов
    for (let i = 0; i < oldCapacity; i++) {
      let current = oldTable[i];
      while (current !== null) {
        const next = current.next;

        // Перевычисляем индекс для новой таблицы
        const newIndex = this.getIndex(current.keyHash);
        current.next = this.table[newIndex];
        this.table[newIndex] = current;
        this.size++;

        current = next;
      }
    }

    this.resizeInProgress = false;
  }

  /**
   * Быстрая очистка с возвратом всех узлов в пул
   */
  public clear(): void {
    for (let i = 0; i < this.capacity; i++) {
      let current = this.table[i];
      while (current !== null) {
        const next = current.next;
        this.nodePool.release(current);
        current = next;
      }
      this.table[i] = null;
    }
    this.size = 0;
    this.collisionCount = 0;
    this.maxProbeLength = 0;
  }

  /**
   * Принудительная очистка пула (аналог explicit deallocation в C++)
   */
  public deallocate(): void {
    this.clear();
    this.nodePool.clear();
  }

  /**
   * Оптимизированное получение всех ключей
   */
  public keys(): string[] {
    const keys: string[] = new Array(this.size);
    let index = 0;

    for (let i = 0; i < this.capacity; i++) {
      let current = this.table[i];
      while (current !== null) {
        keys[index++] = current.key;
        current = current.next;
      }
    }

    return keys;
  }

  /**
   * Оптимизированное получение всех значений
   */
  public values(): T[] {
    const values: T[] = new Array(this.size);
    let index = 0;

    for (let i = 0; i < this.capacity; i++) {
      let current = this.table[i];
      while (current !== null) {
        values[index++] = current.value;
        current = current.next;
      }
    }

    return values;
  }

  /**
   * Расширенная статистика производительности
   */
  public getPerformanceStats(): {
    size: number;
    capacity: number;
    loadFactor: number;
    collisionCount: number;
    collisionRate: number;
    resizeCount: number;
    maxProbeLength: number;
    memoryEfficiency: number;
    poolSize: number;
    avgChainLength: number;
    emptyBuckets: number;
  } {
    let totalChainLength = 0;
    let emptyBuckets = 0;
    let maxChainLength = 0;

    for (let i = 0; i < this.capacity; i++) {
      let chainLength = 0;
      let current = this.table[i];

      if (current === null) {
        emptyBuckets++;
      } else {
        while (current !== null) {
          chainLength++;
          current = current.next;
        }
        totalChainLength += chainLength;
        maxChainLength = Math.max(maxChainLength, chainLength);
      }
    }

    const usedBuckets = this.capacity - emptyBuckets;

    return {
      size: this.size,
      capacity: this.capacity,
      loadFactor: this.size / this.capacity,
      collisionCount: this.collisionCount,
      collisionRate: this.size > 0 ? this.collisionCount / this.size : 0,
      resizeCount: this.resizeCount,
      maxProbeLength: this.maxProbeLength,
      memoryEfficiency: usedBuckets / this.capacity,
      poolSize: this.nodePool.getPoolSize(),
      avgChainLength: usedBuckets > 0 ? totalChainLength / usedBuckets : 0,
      emptyBuckets,
    };
  }

  /**
   * Предварительное выделение памяти (аналог reserve в C++)
   */
  public reserve(expectedSize: number): void {
    const neededCapacity = Math.ceil(expectedSize / this.loadFactorThreshold);
    if (neededCapacity > this.capacity) {
      this.capacity = this.getNextPowerOfTwo(neededCapacity);
      this.resize();
    }
  }

  /**
   * Высокопроизводительный итератор с минимальными аллокациями
   */
  public *entries(): IterableIterator<[string, T]> {
    for (let i = 0; i < this.capacity; i++) {
      let current = this.table[i];
      while (current !== null) {
        yield [current.key, current.value];
        current = current.next;
      }
    }
  }

  // Геттеры для совместимости
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

  // Синонимы
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
