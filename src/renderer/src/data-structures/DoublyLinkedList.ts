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

  public append(data: T): void {
    const newNode = new ListNode(data);

    if (this.tail === null) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      this.tail.next = newNode;
      newNode.prev = this.tail;
      this.tail = newNode;
    }

    this.size++;
  }

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

  private removeNode(node: ListNode<T>): void {
    if (node.prev !== null) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next !== null) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }

    this.size--;
  }

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

  public toArray(): T[] {
    const result: T[] = [];
    let current = this.head;

    while (current !== null) {
      result.push(current.data);
      current = current.next;
    }

    return result;
  }

  public clear(): void {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }

  public isEmpty(): boolean {
    return this.size === 0;
  }

  public getFirst(): T | null {
    return this.head ? this.head.data : null;
  }

  public getLast(): T | null {
    return this.tail ? this.tail.data : null;
  }

  public *[Symbol.iterator](): IterableIterator<T> {
    let current = this.head;
    while (current !== null) {
      yield current.data;
      current = current.next;
    }
  }
}
