export interface HashTableEntry<T> {
  key: string;
  value: T;
  isDeleted: boolean;
  hashValue?: number;
}

export class HashTable<T> {
  private table: Array<HashTableEntry<T> | null>;
  private size: number;
  private capacity: number;
  private readonly maxLoadFactor: number = 0.75;
  private isInitialized: boolean;

  constructor(initialCapacity: number = 0) {
    if (initialCapacity === 0) {
      this.capacity = 0;
      this.size = 0;
      this.table = [];
      this.isInitialized = false;
    } else {
      this.capacity = this.getNextPrime(Math.max(11, initialCapacity));
      this.size = 0;
      this.table = new Array(this.capacity);
      this.table.fill(null);
      this.isInitialized = true;
    }
  }

  public initialize(capacity: number): void {
    if (capacity <= 0) {
      throw new Error("Capacity must be greater than 0");
    }

    this.capacity = this.getNextPrime(Math.max(11, capacity));
    this.size = 0;
    this.table = new Array(this.capacity);
    this.table.fill(null);
    this.isInitialized = true;
  }

  public reset(): void {
    this.capacity = 0;
    this.size = 0;
    this.table = [];
    this.isInitialized = false;
  }

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error(
        "Hash table is not initialized. Call initialize() first or load data."
      );
    }
  }

  private hash(key: string): number {
    this.ensureInitialized();

    const k = parseInt(key, 10);

    // Вычисляем k^2
    const kSquared = k * k;

    const kSquaredStr = kSquared.toString();
    const len = kSquaredStr.length;

    let r, s;

    if (len >= 6) {
      r = Math.floor(len / 2) - 2;
      s = Math.floor(len / 2) - 2;
    } else if (len >= 4) {
      r = Math.floor(len / 2) - 1;
      s = Math.floor(len / 2) - 1;
    } else {
      r = 0;
      s = 0;
    }

    const divisor1 = Math.pow(10, r);
    const divisor2 = Math.pow(10, s);
    const hashValue = Math.floor(kSquared / divisor1 / divisor2);

    return Math.abs(hashValue) % this.capacity;
  }

  private probe(key: string, step: number): number {
    const baseHash = this.hash(key);
    const numericKey = parseInt(key, 10);
    return (baseHash + step * numericKey) % this.capacity;
  }

  public put(key: string, value: T): void {
    if (key === null || key === undefined) {
      throw new Error("Key cannot be null or undefined");
    }

    this.ensureInitialized();

    if (this.size >= this.capacity * this.maxLoadFactor) {
      this.resize();
    }

    let step = 0;
    let firstTombstoneIndex = -1;
    let index = this.probe(key, step);

    while (step < this.capacity) {
      const entry = this.table[index];

      if (entry === null) {
        const insertIndex =
          firstTombstoneIndex !== -1 ? firstTombstoneIndex : index;
        const hashValue = this.hash(key);
        this.table[insertIndex] = { key, value, isDeleted: false, hashValue };
        this.size++;
        return;
      }

      if (entry.isDeleted) {
        if (firstTombstoneIndex === -1) {
          firstTombstoneIndex = index;
        }
      } else if (entry.key === key) {
        entry.value = value;
        entry.hashValue = this.hash(key);
        return;
      }

      step++;
      index = this.probe(key, step);
    }

    if (firstTombstoneIndex !== -1) {
      const hashValue = this.hash(key);
      this.table[firstTombstoneIndex] = {
        key,
        value,
        isDeleted: false,
        hashValue,
      };
      this.size++;
      return;
    }

    throw new Error("Hash table is full");
  }

  public get(key: string): T | null {
    if (key === null || key === undefined) {
      return null;
    }

    if (!this.isInitialized) {
      return null;
    }

    let step = 0;
    let index = this.probe(key, step);

    while (step < this.capacity) {
      const entry = this.table[index];

      if (entry === null) {
        return null;
      }

      if (entry.key === key && !entry.isDeleted) {
        return entry.value;
      }

      step++;
      index = this.probe(key, step);
    }

    return null;
  }

  public delete(key: string): boolean {
    if (key === null || key === undefined) {
      return false;
    }

    if (!this.isInitialized) {
      return false;
    }

    let step = 0;
    let index = this.probe(key, step);

    while (step < this.capacity) {
      const entry = this.table[index];

      if (entry === null) {
        return false;
      }

      if (entry.key === key && !entry.isDeleted) {
        entry.isDeleted = true;
        this.size--;
        return true;
      }

      step++;
      index = this.probe(key, step);
    }

    return false;
  }

  public containsKey(key: string): boolean {
    return this.get(key) !== null;
  }

  private resize(): void {
    const oldTable = this.table;
    const oldCapacity = this.capacity;

    this.capacity = this.getNextPrime(this.capacity * 2);
    this.size = 0;
    this.table = new Array(this.capacity);
    this.table.fill(null);

    for (let i = 0; i < oldCapacity; i++) {
      const entry = oldTable[i];
      if (entry !== null && !entry.isDeleted) {
        this.put(entry.key, entry.value);
      }
    }
  }

  public clear(): void {
    this.reset();
  }

  public keys(): string[] {
    if (!this.isInitialized) {
      return [];
    }

    const keys: string[] = [];
    for (let i = 0; i < this.capacity; i++) {
      const entry = this.table[i];
      if (entry !== null && !entry.isDeleted) {
        keys.push(entry.key);
      }
    }
    return keys;
  }

  public getPerformanceStats(): {
    size: number;
    capacity: number;
    loadFactor: number;
    emptySlots: number;
    deletedSlots: number;
    occupiedSlots: number;
  } {
    if (!this.isInitialized) {
      return {
        size: 0,
        capacity: 0,
        loadFactor: 0,
        emptySlots: 0,
        deletedSlots: 0,
        occupiedSlots: 0,
      };
    }

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
      loadFactor: this.capacity > 0 ? this.size / this.capacity : 0,
      emptySlots,
      deletedSlots,
      occupiedSlots,
    };
  }

  public getTableStructure(): Array<{
    index: number;
    key: string | null;
    hasValue: boolean;
    isDeleted: boolean;
    hashValue: number | null;
  }> {
    if (!this.isInitialized) {
      return [];
    }

    const structure: Array<{
      index: number;
      key: string | null;
      hasValue: boolean;
      isDeleted: boolean;
      hashValue: number | null;
    }> = [];

    for (let i = 0; i < this.capacity; i++) {
      const entry = this.table[i];
      if (entry === null) {
        structure.push({
          index: i,
          key: null,
          hasValue: false,
          isDeleted: false,
          hashValue: null,
        });
      } else {
        structure.push({
          index: i,
          key: entry.key,
          hasValue: true,
          isDeleted: entry.isDeleted,
          hashValue: entry.hashValue || this.hash(entry.key),
        });
      }
    }

    return structure;
  }

  private getNextPrime(n: number): number {
    let candidate = n;
    while (!this.isPrime(candidate)) {
      candidate++;
    }
    return candidate;
  }

  private isPrime(n: number): boolean {
    if (n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;

    for (let i = 3; i * i <= n; i += 2) {
      if (n % i === 0) return false;
    }
    return true;
  }

  public getSize(): number {
    return this.size;
  }

  public getCapacity(): number {
    return this.capacity;
  }

  public getLoadFactor(): number {
    return this.capacity > 0 ? this.size / this.capacity : 0;
  }

  public isEmpty(): boolean {
    return this.size === 0;
  }

  public getIsInitialized(): boolean {
    return this.isInitialized;
  }
}
