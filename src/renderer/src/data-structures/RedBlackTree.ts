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
    this.NIL = {
      key: "",
      value: null as any,
      color: Color.BLACK,
      left: null as any,
      right: null as any,
      parent: null as any,
    };

    this.NIL.left = this.NIL;
    this.NIL.right = this.NIL;
    this.NIL.parent = this.NIL;

    this.root = this.NIL;
    this.size = 0;
  }

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

  public insert(key: string, value: T): void {
    if (key === null || key === undefined) {
      throw new Error("Key cannot be null or undefined");
    }

    let parent = this.NIL;
    let current = this.root;

    while (current !== this.NIL) {
      parent = current;
      if (key < current.key) {
        current = current.left;
      } else if (key > current.key) {
        current = current.right;
      } else {
        current.value = value;
        return;
      }
    }

    const newNode: RBNode<T> = {
      key,
      value,
      color: Color.RED,
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

    this.insertFixup(newNode);
  }

  private insertFixup(node: RBNode<T>): void {
    while (node.parent.color === Color.RED) {
      if (node.parent === node.parent.parent.left) {
        const uncle = node.parent.parent.right;

        if (uncle.color === Color.RED) {
          node.parent.color = Color.BLACK;
          uncle.color = Color.BLACK;
          node.parent.parent.color = Color.RED;
          node = node.parent.parent;
        } else {
          if (node === node.parent.right) {
            node = node.parent;
            this.leftRotate(node);
          }
          node.parent.color = Color.BLACK;
          node.parent.parent.color = Color.RED;
          this.rightRotate(node.parent.parent);
        }
      } else {
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

  public contains(key: string): boolean {
    return this.search(key) !== null;
  }

  public delete(key: string): boolean {
    const nodeToDelete = this.findNode(key);
    if (nodeToDelete === this.NIL) {
      return false;
    }

    this.deleteNode(nodeToDelete);
    this.size--;
    return true;
  }

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

  private minimum(node: RBNode<T>): RBNode<T> {
    while (node.left !== this.NIL) {
      node = node.left;
    }
    return node;
  }

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

  public values(): T[] {
    return this.inOrder();
  }

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

  public clear(): void {
    this.root = this.NIL;
    this.size = 0;
  }

  public getSize(): number {
    return this.size;
  }

  public isEmpty(): boolean {
    return this.size === 0;
  }

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

  public getBlackHeight(): number {
    if (this.root === this.NIL) return 0;

    let blackHeight = 0;
    let current = this.root;

    while (current !== this.NIL) {
      if (current.color === Color.BLACK) {
        blackHeight++;
      }
      current = current.left;
    }

    return blackHeight;
  }

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

    if (leftResult.blackHeight !== rightResult.blackHeight) {
      return { isValid: false, blackHeight: 0 };
    }

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

  public getAllKeys(): string[] {
    return this.keys();
  }

  public getAllValues(): T[] {
    return this.values();
  }
}
