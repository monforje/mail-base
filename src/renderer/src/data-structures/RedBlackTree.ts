export enum Color {
  RED = 'RED',
  BLACK = 'BLACK'
}

export interface RBNode<T> {
  key: string
  value: T
  color: Color
  left: RBNode<T> | null
  right: RBNode<T> | null
  parent: RBNode<T> | null
}

export class RedBlackTree<T> {
  private root: RBNode<T> | null
  private size: number

  constructor() {
    this.root = null
    this.size = 0
  }

  private createNode(key: string, value: T): RBNode<T> {
    return {
      key,
      value,
      color: Color.RED,
      left: null,
      right: null,
      parent: null
    }
  }

  private rotateLeft(node: RBNode<T>): void {
    const rightChild = node.right!
    node.right = rightChild.left

    if (rightChild.left) {
      rightChild.left.parent = node
    }

    rightChild.parent = node.parent

    if (!node.parent) {
      this.root = rightChild
    } else if (node === node.parent.left) {
      node.parent.left = rightChild
    } else {
      node.parent.right = rightChild
    }

    rightChild.left = node
    node.parent = rightChild
  }

  private rotateRight(node: RBNode<T>): void {
    const leftChild = node.left!
    node.left = leftChild.right

    if (leftChild.right) {
      leftChild.right.parent = node
    }

    leftChild.parent = node.parent

    if (!node.parent) {
      this.root = leftChild
    } else if (node === node.parent.right) {
      node.parent.right = leftChild
    } else {
      node.parent.left = leftChild
    }

    leftChild.right = node
    node.parent = leftChild
  }

  private fixInsert(node: RBNode<T>): void {
    while (node.parent && node.parent.color === Color.RED) {
      if (node.parent === node.parent.parent?.left) {
        const uncle = node.parent.parent.right

        if (uncle && uncle.color === Color.RED) {
          node.parent.color = Color.BLACK
          uncle.color = Color.BLACK
          node.parent.parent.color = Color.RED
          node = node.parent.parent
        } else {
          if (node === node.parent.right) {
            node = node.parent
            this.rotateLeft(node)
          }
          node.parent!.color = Color.BLACK
          node.parent!.parent!.color = Color.RED
          this.rotateRight(node.parent!.parent!)
        }
      } else {
        const uncle = node.parent.parent?.left

        if (uncle && uncle.color === Color.RED) {
          node.parent.color = Color.BLACK
          uncle.color = Color.BLACK
          node.parent.parent!.color = Color.RED
          node = node.parent.parent!
        } else {
          if (node === node.parent.left) {
            node = node.parent
            this.rotateRight(node)
          }
          node.parent!.color = Color.BLACK
          node.parent!.parent!.color = Color.RED
          this.rotateLeft(node.parent!.parent!)
        }
      }
    }
    if (this.root) {
      this.root.color = Color.BLACK
    }
  }

  insert(key: string, value: T): void {
    const newNode = this.createNode(key, value)

    if (!this.root) {
      this.root = newNode
      this.root.color = Color.BLACK
      this.size++
      return
    }

    let current: RBNode<T> | null = this.root
    let parent: RBNode<T> | null = null

    while (current) {
      parent = current
      if (key < current.key) {
        current = current.left
      } else if (key > current.key) {
        current = current.right
      } else {
        // Ключ уже существует, обновляем значение
        current.value = value
        return
      }
    }

    newNode.parent = parent
    if (parent && key < parent.key) {
      parent.left = newNode
    } else if (parent) {
      parent.right = newNode
    }

    this.size++
    this.fixInsert(newNode)
  }

  search(key: string): T | null {
    let current: RBNode<T> | null = this.root

    while (current) {
      if (key === current.key) {
        return current.value
      } else if (key < current.key) {
        current = current.left
      } else {
        current = current.right
      }
    }

    return null
  }

  delete(key: string): boolean {
    const node = this.findNode(key)
    if (!node) {
      return false
    }

    this.deleteNode(node)
    this.size--
    return true
  }

  private findNode(key: string): RBNode<T> | null {
    let current: RBNode<T> | null = this.root

    while (current) {
      if (key === current.key) {
        return current
      } else if (key < current.key) {
        current = current.left
      } else {
        current = current.right
      }
    }

    return null
  }

  private deleteNode(node: RBNode<T>): void {
    // Упрощенная реализация удаления для базовой функциональности
    
    if (!node.left && !node.right) {
      // Лист
      if (node.parent) {
        if (node.parent.left === node) {
          node.parent.left = null
        } else {
          node.parent.right = null
        }
      } else {
        this.root = null
      }
    } else if (!node.left || !node.right) {
      // Один потомок
      const child = node.left || node.right
      if (node.parent) {
        if (node.parent.left === node) {
          node.parent.left = child
        } else {
          node.parent.right = child
        }
        if (child) {
          child.parent = node.parent
        }
      } else {
        this.root = child
        if (child) {
          child.parent = null
        }
      }
    } else {
      // Два потомка - заменяем на следующий по порядку
      const successor = this.findMin(node.right)
      if (successor) {
        node.key = successor.key
        node.value = successor.value
        this.deleteNode(successor)
        this.size++ // Компенсируем уменьшение size в рекурсивном вызове
      }
    }
  }

  private findMin(node: RBNode<T> | null): RBNode<T> | null {
    if (!node) return null
    
    while (node.left) {
      node = node.left
    }
    return node
  }

  has(key: string): boolean {
    return this.search(key) !== null
  }

  clear(): void {
    this.root = null
    this.size = 0
  }

  getSize(): number {
    return this.size
  }

  getAllValues(): T[] {
    const values: T[] = []
    this.inOrderTraversal(this.root, (node) => {
      values.push(node.value)
    })
    return values
  }

  getAllKeys(): string[] {
    const keys: string[] = []
    this.inOrderTraversal(this.root, (node) => {
      keys.push(node.key)
    })
    return keys
  }

  private inOrderTraversal(node: RBNode<T> | null, callback: (node: RBNode<T>) => void): void {
    if (node) {
      this.inOrderTraversal(node.left, callback)
      callback(node)
      this.inOrderTraversal(node.right, callback)
    }
  }
}