import React, { useState } from 'react'
import MenuStrip from './components/MenuStrip'
import UsersSection from './components/UsersSection'
import PackagesSection from './components/PackagesSection'
import { User, Package } from './types'
import { usersService, packagesService } from './DataServices'
import './assets/App.css'

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [packages, setPackages] = useState<Package[]>([])

  const handleUsersLoad = (loadedUsers: User[]) => {
    usersService.loadUsers(loadedUsers)
    setUsers(usersService.getAllUsers())
  }

  const handlePackagesLoad = (loadedPackages: Package[]) => {
    packagesService.loadPackages(loadedPackages)
    setPackages(packagesService.getAllPackages())
  }

  const handleUsersClear = () => {
    if (usersService.getCount() === 0) {
      alert('Список пользователей уже пуст')
      return
    }
    if (window.confirm('Вы уверены, что хотите удалить всех пользователей?')) {
      usersService.clear()
      setUsers([])
    }
  }

  const handlePackagesClear = () => {
    if (packagesService.getCount() === 0) {
      alert('Список посылок уже пуст')
      return
    }
    if (window.confirm('Вы уверены, что хотите удалить все посылки?')) {
      packagesService.clear()
      setPackages([])
    }
  }

  const handleUsersSave = () => {
    const currentUsers = usersService.getAllUsers()
    if (currentUsers.length === 0) {
      alert('Нет данных для сохранения')
      return
    }
    
    const data = currentUsers.map(user => `${user.phone}\t${user.fullName}\t${user.address}`).join('\n')
    const blob = new Blob([data], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'users.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handlePackagesSave = () => {
    const currentPackages = packagesService.getAllPackages()
    if (currentPackages.length === 0) {
      alert('Нет данных для сохранения')
      return
    }
    
    const data = currentPackages.map(pkg => `${pkg.senderPhone}\t${pkg.receiverPhone}\t${pkg.weight}\t${pkg.date}`).join('\n')
    const blob = new Blob([data], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'packages.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleAbout = () => {
    alert(`Mail Base v1.0.0
Программа для управления пользователями и посылками

Поддерживаемые форматы:
- Телефон: 8XXXXXXXXXX (например: 89001234567)
- Дата: dd mmm yyyy (например: 15 jan 2025)

Структуры данных:
- Пользователи: Хеш-таблица
- Посылки: Красно-черное дерево

Загруженные данные:
- Пользователей: ${usersService.getCount()}
- Посылок: ${packagesService.getCount()}`)
  }

  return (
    <div className="app">
      <MenuStrip
        onUsersLoad={handleUsersLoad}
        onPackagesLoad={handlePackagesLoad}
        onUsersClear={handleUsersClear}
        onPackagesClear={handlePackagesClear}
        onUsersSave={handleUsersSave}
        onPackagesSave={handlePackagesSave}
        onAbout={handleAbout}
      />
      <div className="content-area">
        <UsersSection users={users} />
        <PackagesSection packages={packages} />
      </div>
    </div>
  )
}

export default App