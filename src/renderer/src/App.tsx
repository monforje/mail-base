import React, { useState } from 'react'
import MenuStrip from './components/MenuStrip'
import UsersSection from './components/UsersSection'
import PackagesSection from './components/PackagesSection'
import { User, Package } from './types'
import './assets/App.css'

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [packages, setPackages] = useState<Package[]>([])

  const handleUsersLoad = (loadedUsers: User[]) => {
    setUsers(loadedUsers)
  }

  const handlePackagesLoad = (loadedPackages: Package[]) => {
    setPackages(loadedPackages)
  }

  const handleUsersClear = () => {
    if (users.length === 0) {
      alert('Список пользователей уже пуст')
      return
    }
    if (window.confirm('Вы уверены, что хотите удалить всех пользователей?')) {
      setUsers([])
    }
  }

  const handlePackagesClear = () => {
    if (packages.length === 0) {
      alert('Список посылок уже пуст')
      return
    }
    if (window.confirm('Вы уверены, что хотите удалить все посылки?')) {
      setPackages([])
    }
  }

  const handleUsersSave = () => {
    if (users.length === 0) {
      alert('Нет данных для сохранения')
      return
    }
    
    const data = users.map(user => `${user.phone}\t${user.fullName}\t${user.address}`).join('\n')
    const blob = new Blob([data], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'users.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handlePackagesSave = () => {
    if (packages.length === 0) {
      alert('Нет данных для сохранения')
      return
    }
    
    const data = packages.map(pkg => `${pkg.senderPhone}\t${pkg.receiverPhone}\t${pkg.weight}\t${pkg.date}`).join('\n')
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

Загруженные данные:
- Пользователей: ${users.length}
- Посылок: ${packages.length}`)
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