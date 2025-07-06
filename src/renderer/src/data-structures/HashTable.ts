export interface HashNode<T> {
  key: string
  value: T
  next: HashNode<T> | null
}

export class HashTable<T> {
  private buckets: Array<HashNode<T> | null>
  private size: number
  private capacity: number

  constructor(initialCapacity: number = 16) {
    this.capacity = initialCapacity
    this.size = 0
    this.buckets = new Array(this.capacity).fill(null)
  }

  private hash(key: string): number {
    let hash = 0
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Преобразуем в 32-битное число
    }
    return Math.abs(hash) % this.capacity
  }

  private resize(): void {
    const oldBuckets = this.buckets
    this.capacity *= 2
    this.size = 0
    this.buckets = new Array(this.capacity).fill(null)

    for (const head of oldBuckets) {
      let current = head
      while (current) {
        this.set(current.key, current.value)
        current = current.next
      }
    }
  }

  set(key: string, value: T): void {
    if (this.size >= this.capacity * 0.75) {
      this.resize()
    }

    const index = this.hash(key)
    const newNode: HashNode<T> = {
      key,
      value,
      next: null
    }

    if (!this.buckets[index]) {
      this.buckets[index] = newNode
      this.size++
    } else {
      let current = this.buckets[index]!
      while (true) {
        if (current.key === key) {
          current.value = value
          return
        }
        if (!current.next) {
          current.next = newNode
          this.size++
          return
        }
        current = current.next
      }
    }
  }

  get(key: string): T | null {
    const index = this.hash(key)
    let current = this.buckets[index]

    while (current) {
      if (current.key === key) {
        return current.value
      }
      current = current.next
    }

    return null
  }

  delete(key: string): boolean {
    const index = this.hash(key)
    let current = this.buckets[index]

    if (!current) {
      return false
    }

    if (current.key === key) {
      this.buckets[index] = current.next
      this.size--
      return true
    }

    while (current.next) {
      if (current.next.key === key) {
        current.next = current.next.next
        this.size--
        return true
      }
      current = current.next
    }

    return false
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  clear(): void {
    this.buckets.fill(null)
    this.size = 0
  }

  getSize(): number {
    return this.size
  }

  getAllValues(): T[] {
    const values: T[] = []
    for (const head of this.buckets) {
      let current = head
      while (current) {
        values.push(current.value)
        current = current.next
      }
    }
    return values
  }

  getAllKeys(): string[] {
    const keys: string[] = []
    for (const head of this.buckets) {
      let current = head
      while (current) {
        keys.push(current.key)
        current = current.next
      }
    }
    return keys
  }
}