// src/renderer/src/data-structures/DoublyLinkedList.ts
/**
 * Двойной двусвязный список для курсовой работы
 * Классическая реализация как в учебниках по структурам данных
 */

export class ListNode<T> {
  public data: T;
  public next: ListNode<T> | null;
  public prev: ListNode<T> | null;

  constructor(data: T) {
    this.data = data;
    this.next = null;
    this.prev = null;
  }
}

export class DoublyLinkedList<T> {
  private head: ListNode<T> | null;
  private tail: ListNode<T> | null;
  private size: number;

  constructor() {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }

  /**
   * Добавление элемента в конец списка
   */
  public append(data: T): void {
    const newNode = new ListNode(data);

    if (this.tail === null) {
      // Список пустой
      this.head = newNode;
      this.tail = newNode;
    } else {
      // Добавляем в конец
      this.tail.next = newNode;
      newNode.prev = this.tail;
      this.tail = newNode;
    }

    this.size++;
  }

  /**
   * Добавление элемента в начало списка
   */
  public prepend(data: T): void {
    const newNode = new ListNode(data);

    if (this.head === null) {
      // Список пустой
      this.head = newNode;
      this.tail = newNode;
    } else {
      // Добавляем в начало
      newNode.next = this.head;
      this.head.prev = newNode;
      this.head = newNode;
    }

    this.size++;
  }

  /**
   * Удаление элемента по значению (первое вхождение)
   */
  public remove(data: T): boolean {
    let current = this.head;

    while (current !== null) {
      if (current.data === data) {
        this.removeNode(current);
        return true;
      }
      current = current.next;
    }

    return false;
  }

  /**
   * Удаление узла
   */
  private removeNode(node: ListNode<T>): void {
    if (node.prev !== null) {
      node.prev.next = node.next;
    } else {
      // Удаляем головной узел
      this.head = node.next;
    }

    if (node.next !== null) {
      node.next.prev = node.prev;
    } else {
      // Удаляем хвостовой узел
      this.tail = node.prev;
    }

    this.size--;
  }

  /**
   * Поиск элемента
   */
  public find(data: T): ListNode<T> | null {
    let current = this.head;

    while (current !== null) {
      if (current.data === data) {
        return current;
      }
      current = current.next;
    }

    return null;
  }

  /**
   * Получение элемента по индексу
   */
  public get(index: number): T | null {
    if (index < 0 || index >= this.size) {
      return null;
    }

    let current = this.head;
    for (let i = 0; i < index; i++) {
      current = current!.next;
    }

    return current!.data;
  }

  /**
   * Преобразование в массив
   */
  public toArray(): T[] {
    const result: T[] = [];
    let current = this.head;

    while (current !== null) {
      result.push(current.data);
      current = current.next;
    }

    return result;
  }

  /**
   * Очистка списка
   */
  public clear(): void {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }

  /**
   * Проверка на пустоту
   */
  public isEmpty(): boolean {
    return this.size === 0;
  }

  /**
   * Получение размера
   */
  public getSize(): number {
    return this.size;
  }

  /**
   * Получение первого элемента
   */
  public getFirst(): T | null {
    return this.head ? this.head.data : null;
  }

  /**
   * Получение последнего элемента
   */
  public getLast(): T | null {
    return this.tail ? this.tail.data : null;
  }

  /**
   * Итератор для обхода списка
   */
  public *[Symbol.iterator](): IterableIterator<T> {
    let current = this.head;
    while (current !== null) {
      yield current.data;
      current = current.next;
    }
  }

  /**
   * Обратный итератор
   */
  public *reverseIterator(): IterableIterator<T> {
    let current = this.tail;
    while (current !== null) {
      yield current.data;
      current = current.prev;
    }
  }
}