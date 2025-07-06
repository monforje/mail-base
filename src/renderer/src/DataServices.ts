import { HashTable } from './data-structures/HashTable'
import { RedBlackTree } from './data-structures/RedBlackTree'
import { User, Package } from './types'

export class UsersService {
  private hashTable: HashTable<User>

  constructor() {
    this.hashTable = new HashTable<User>()
  }

  addUser(user: User): void {
    // Используем телефон как ключ
    this.hashTable.set(user.phone, user)
  }

  getUser(phone: string): User | null {
    return this.hashTable.get(phone)
  }

  getAllUsers(): User[] {
    return this.hashTable.getAllValues()
  }

  removeUser(phone: string): boolean {
    return this.hashTable.delete(phone)
  }

  hasUser(phone: string): boolean {
    return this.hashTable.has(phone)
  }

  clear(): void {
    this.hashTable.clear()
  }

  getCount(): number {
    return this.hashTable.getSize()
  }

  loadUsers(users: User[]): void {
    this.clear()
    users.forEach(user => this.addUser(user))
  }
}

export class PackagesService {
  private redBlackTree: RedBlackTree<Package>
  private idCounter: number

  constructor() {
    this.redBlackTree = new RedBlackTree<Package>()
    this.idCounter = 0
  }

  private generateKey(pkg: Package): string {
    // Генерируем уникальный ключ на основе данных посылки и счетчика
    return `${pkg.senderPhone}_${pkg.receiverPhone}_${pkg.date}_${this.idCounter++}`
  }

  addPackage(pkg: Package): void {
    const key = this.generateKey(pkg)
    this.redBlackTree.insert(key, pkg)
  }

  getAllPackages(): Package[] {
    return this.redBlackTree.getAllValues()
  }

  removePackage(senderPhone: string, receiverPhone: string, date: string): boolean {
    // Ищем пакет по критериям и удаляем первый найденный
    const allKeys = this.redBlackTree.getAllKeys()
    for (const key of allKeys) {
      const pkg = this.redBlackTree.search(key)
      if (pkg && pkg.senderPhone === senderPhone && 
          pkg.receiverPhone === receiverPhone && 
          pkg.date === date) {
        return this.redBlackTree.delete(key)
      }
    }
    return false
  }

  findPackagesBySender(senderPhone: string): Package[] {
    return this.getAllPackages().filter(pkg => pkg.senderPhone === senderPhone)
  }

  findPackagesByReceiver(receiverPhone: string): Package[] {
    return this.getAllPackages().filter(pkg => pkg.receiverPhone === receiverPhone)
  }

  findPackagesByDate(date: string): Package[] {
    return this.getAllPackages().filter(pkg => pkg.date === date)
  }

  clear(): void {
    this.redBlackTree.clear()
    this.idCounter = 0
  }

  getCount(): number {
    return this.redBlackTree.getSize()
  }

  loadPackages(packages: Package[]): void {
    this.clear()
    packages.forEach(pkg => this.addPackage(pkg))
  }
}

// Синглтон сервисы для использования во всем приложении
export const usersService = new UsersService()
export const packagesService = new PackagesService()