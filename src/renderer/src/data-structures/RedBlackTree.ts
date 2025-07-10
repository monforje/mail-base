// src/renderer/src/data-structures/RedBlackTree.ts
/**
 * Красно-черное дерево - стандартная реализация для курсовой работы
 * Основано на классическом алгоритме из учебников по структурам данных
 */

export enum Color {
  RED = 0,
  BLACK = 1,
}

export interface RBNode<T> {
  key: string;
  value: T;
  color: Color;
  left: RBNode<T>;
  right: RBNode<T>;
  parent: RBNode<T>;
}

export class RedBlackTree<T> {
  private root: RBNode<T>;
  private readonly NIL: RBNode<T>;
  private size: number;

  constructor() {
    // Создаем NIL узел (sentinel)
    this.NIL = {
      key: "",
      value: null as any,
      color: Color.BLACK,
      left: null as any,
      right: null as any,
      parent: null as any,
    };

    // Инициализируем циклические ссылки для NIL
    this.NIL.left = this.NIL;
    this.NIL.right = this.NIL;
    this.NIL.parent = this.NIL;

    this.root = this.NIL;
    this.size = 0;
  }

  /**
   * Левый поворот
   */
  private leftRotate(x: RBNode<T>): void {
    const y = x.right;
    x.right = y.left;

    if (y.left !== this.NIL) {
      y.left.parent = x;
    }

    y.parent = x.parent;

    if (x.parent === this.NIL) {
      this.root = y;
    } else if (x === x.parent.left) {
      x.parent.left = y;
    } else {
      x.parent.right = y;
    }

    y.left = x;
    x.parent = y;
  }

  /**
   * Правый поворот
   */
  private rightRotate(y: RBNode<T>): void {
    const x = y.left;
    y.left = x.right;

    if (x.right !== this.NIL) {
      x.right.parent = y;
    }

    x.parent = y.parent;

    if (y.parent === this.NIL) {
      this.root = x;
    } else if (y === y.parent.left) {
      y.parent.left = x;
    } else {
      y.parent.right = x;
    }

    x.right = y;
    y.parent = x;
  }

  /**
   * Вставка элемента
   */
  public insert(key: string, value: T): void {
    if (key === null || key === undefined) {
      throw new Error("Key cannot be null or undefined");
    }

    let parent = this.NIL;
    let current = this.root;

    // Обычная вставка как в BST
    while (current !== this.NIL) {
      parent = current;
      if (key < current.key) {
        current = current.left;
      } else if (key > current.key) {
        current = current.right;
      } else {
        // Ключ уже существует, обновляем значение
        current.value = value;
        return;
      }
    }

    // Создаем новый узел
    const newNode: RBNode<T> = {
      key,
      value,
      color: Color.RED, // Новый узел всегда красный
      left: this.NIL,
      right: this.NIL,
      parent,
    };

    if (parent === this.NIL) {
      this.root = newNode;
    } else if (key < parent.key) {
      parent.left = newNode;
    } else {
      parent.right = newNode;
    }

    this.size++;

    // Восстанавливаем свойства красно-черного дерева
    this.insertFixup(newNode);
  }

  /**
   * Восстановление свойств после вставки
   */
  private insertFixup(node: RBNode<T>): void {
    while (node.parent.color === Color.RED) {
      if (node.parent === node.parent.parent.left) {
        const uncle = node.parent.parent.right;

        if (uncle.color === Color.RED) {
          // Случай 1: дядя красный
          node.parent.color = Color.BLACK;
          uncle.color = Color.BLACK;
          node.parent.parent.color = Color.RED;
          node = node.parent.parent;
        } else {
          if (node === node.parent.right) {
            // Случай 2: дядя черный, node - правый потомок
            node = node.parent;
            this.leftRotate(node);
          }
          // Случай 3: дядя черный, node - левый потомок
          node.parent.color = Color.BLACK;
          node.parent.parent.color = Color.RED;
          this.rightRotate(node.parent.parent);
        }
      } else {
        // Симметричные случаи (родитель справа)
        const uncle = node.parent.parent.left;

        if (uncle.color === Color.RED) {
          node.parent.color = Color.BLACK;
          uncle.color = Color.BLACK;
          node.parent.parent.color = Color.RED;
          node = node.parent.parent;
        } else {
          if (node === node.parent.left) {
            node = node.parent;
            this.rightRotate(node);
          }
          node.parent.color = Color.BLACK;
          node.parent.parent.color = Color.RED;
          this.leftRotate(node.parent.parent);
        }
      }
    }

    this.root.color = Color.BLACK;
  }

  /**
   * Поиск элемента
   */
  public search(key: string): T | null {
    if (key === null || key === undefined) {
      return null;
    }

    let current = this.root;

    while (current !== this.NIL) {
      if (key === current.key) {
        return current.value;
      } else if (key < current.key) {
        current = current.left;
      } else {
        current = current.right;
      }
    }

    return null;
  }

  /**
   * Проверка существования ключа
   */
  public contains(key: string): boolean {
    return this.search(key) !== null;
  }

  /**
   * Удаление элемента
   */
  public delete(key: string): boolean {
    const nodeToDelete = this.findNode(key);
    if (nodeToDelete === this.NIL) {
      return false;
    }

    this.deleteNode(nodeToDelete);
    this.size--;
    return true;
  }

  /**
   * Поиск узла
   */
  private findNode(key: string): RBNode<T> {
    let current = this.root;

    while (current !== this.NIL) {
      if (key === current.key) {
        return current;
      } else if (key < current.key) {
        current = current.left;
      } else {
        current = current.right;
      }
    }

    return this.NIL;
  }

  /**
   * Удаление узла
   */
  private deleteNode(z: RBNode<T>): void {
    let y = z;
    let yOriginalColor = y.color;
    let x: RBNode<T>;

    if (z.left === this.NIL) {
      x = z.right;
      this.transplant(z, z.right);
    } else if (z.right === this.NIL) {
      x = z.left;
      this.transplant(z, z.left);
    } else {
      y = this.minimum(z.right);
      yOriginalColor = y.color;
      x = y.right;

      if (y.parent === z) {
        x.parent = y;
      } else {
        this.transplant(y, y.right);
        y.right = z.right;
        y.right.parent = y;
      }

      this.transplant(z, y);
      y.left = z.left;
      y.left.parent = y;
      y.color = z.color;
    }

    if (yOriginalColor === Color.BLACK) {
      this.deleteFixup(x);
    }
  }

  /**
   * Пересадка поддерева
   */
  private transplant(u: RBNode<T>, v: RBNode<T>): void {
    if (u.parent === this.NIL) {
      this.root = v;
    } else if (u === u.parent.left) {
      u.parent.left = v;
    } else {
      u.parent.right = v;
    }
    v.parent = u.parent;
  }

  /**
   * Поиск минимального элемента
   */
  private minimum(node: RBNode<T>): RBNode<T> {
    while (node.left !== this.NIL) {
      node = node.left;
    }
    return node;
  }

  /**
   * Восстановление свойств после удаления
   */
  private deleteFixup(x: RBNode<T>): void {
    while (x !== this.root && x.color === Color.BLACK) {
      if (x === x.parent.left) {
        let w = x.parent.right;

        if (w.color === Color.RED) {
          w.color = Color.BLACK;
          x.parent.color = Color.RED;
          this.leftRotate(x.parent);
          w = x.parent.right;
        }

        if (w.left.color === Color.BLACK && w.right.color === Color.BLACK) {
          w.color = Color.RED;
          x = x.parent;
        } else {
          if (w.right.color === Color.BLACK) {
            w.left.color = Color.BLACK;
            w.color = Color.RED;
            this.rightRotate(w);
            w = x.parent.right;
          }

          w.color = x.parent.color;
          x.parent.color = Color.BLACK;
          w.right.color = Color.BLACK;
          this.leftRotate(x.parent);
          x = this.root;
        }
      } else {
        let w = x.parent.left;

        if (w.color === Color.RED) {
          w.color = Color.BLACK;
          x.parent.color = Color.RED;
          this.rightRotate(x.parent);
          w = x.parent.left;
        }

        if (w.right.color === Color.BLACK && w.left.color === Color.BLACK) {
          w.color = Color.RED;
          x = x.parent;
        } else {
          if (w.left.color === Color.BLACK) {
            w.right.color = Color.BLACK;
            w.color = Color.RED;
            this.leftRotate(w);
            w = x.parent.left;
          }

          w.color = x.parent.color;
          x.parent.color = Color.BLACK;
          w.left.color = Color.BLACK;
          this.rightRotate(x.parent);
          x = this.root;
        }
      }
    }

    x.color = Color.BLACK;
  }

  /**
   * Симметричный обход (In-Order)
   */
  public inOrder(): T[] {
    const result: T[] = [];
    this.inOrderHelper(this.root, result);
    return result;
  }

  private inOrderHelper(node: RBNode<T>, result: T[]): void {
    if (node !== this.NIL) {
      this.inOrderHelper(node.left, result);
      result.push(node.value);
      this.inOrderHelper(node.right, result);
    }
  }

  /**
   * Получение всех значений (используем симметричный обход)
   */
  public values(): T[] {
    return this.inOrder();
  }

  /**
   * Получение всех ключей
   */
  public keys(): string[] {
    const result: string[] = [];
    this.keysHelper(this.root, result);
    return result;
  }

  private keysHelper(node: RBNode<T>, result: string[]): void {
    if (node !== this.NIL) {
      this.keysHelper(node.left, result);
      result.push(node.key);
      this.keysHelper(node.right, result);
    }
  }

  /**
   * Очистка дерева
   */
  public clear(): void {
    this.root = this.NIL;
    this.size = 0;
  }

  /**
   * Получение размера дерева
   */
  public getSize(): number {
    return this.size;
  }

  /**
   * Проверка на пустоту
   */
  public isEmpty(): boolean {
    return this.size === 0;
  }

  /**
   * Получение высоты дерева
   */
  public getHeight(): number {
    return this.calculateHeight(this.root);
  }

  private calculateHeight(node: RBNode<T>): number {
    if (node === this.NIL) {
      return 0;
    }
    return (
      1 +
      Math.max(
        this.calculateHeight(node.left),
        this.calculateHeight(node.right)
      )
    );
  }

  /**
   * Вычисление черной высоты
   */
  public getBlackHeight(): number {
    if (this.root === this.NIL) return 0;

    let blackHeight = 0;
    let current = this.root;

    // Идем по левому краю до листа
    while (current !== this.NIL) {
      if (current.color === Color.BLACK) {
        blackHeight++;
      }
      current = current.left;
    }

    return blackHeight;
  }

  /**
   * Получение минимального значения
   */
  public getMin(): T | null {
    if (this.root === this.NIL) return null;
    return this.minimum(this.root).value;
  }

  /**
   * Получение максимального значения
   */
  public getMax(): T | null {
    if (this.root === this.NIL) return null;

    let current = this.root;
    while (current.right !== this.NIL) {
      current = current.right;
    }
    return current.value;
  }

  /**
   * Проверка корректности дерева
   */
  public isValid(): boolean {
    if (this.root === this.NIL) return true;
    if (this.root.color !== Color.BLACK) return false;

    return this.validateSubtree(this.root).isValid;
  }

  private validateSubtree(node: RBNode<T>): {
    isValid: boolean;
    blackHeight: number;
  } {
    if (node === this.NIL) {
      return { isValid: true, blackHeight: 0 };
    }

    const leftResult = this.validateSubtree(node.left);
    if (!leftResult.isValid) return { isValid: false, blackHeight: 0 };

    const rightResult = this.validateSubtree(node.right);
    if (!rightResult.isValid) return { isValid: false, blackHeight: 0 };

    // Проверка одинаковой черной высоты
    if (leftResult.blackHeight !== rightResult.blackHeight) {
      return { isValid: false, blackHeight: 0 };
    }

    // Проверка красных узлов
    if (node.color === Color.RED) {
      if (node.left.color === Color.RED || node.right.color === Color.RED) {
        return { isValid: false, blackHeight: 0 };
      }
    }

    const blackIncrement = node.color === Color.BLACK ? 1 : 0;
    return {
      isValid: true,
      blackHeight: leftResult.blackHeight + blackIncrement,
    };
  }

  /**
   * Итератор для обхода элементов
   */
  public *entries(): IterableIterator<[string, T]> {
    yield* this.inOrderEntries(this.root);
  }

  private *inOrderEntries(node: RBNode<T>): IterableIterator<[string, T]> {
    if (node !== this.NIL) {
      yield* this.inOrderEntries(node.left);
      yield [node.key, node.value];
      yield* this.inOrderEntries(node.right);
    }
  }

  // Синонимы для совместимости с интерфейсом
  public has(key: string): boolean {
    return this.contains(key);
  }

  public getAllKeys(): string[] {
    return this.keys();
  }

  public getAllValues(): T[] {
    return this.values();
  }
}
