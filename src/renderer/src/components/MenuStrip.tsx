import React from 'react'
import { MenuStripProps, User, Package } from '../types'
import { detectFileType, validateFileContent } from '../utils'
import '../assets/MenuStrip.css'

const MenuStrip: React.FC<MenuStripProps> = ({
  onUsersLoad,
  onPackagesLoad,
  onUsersClear,
  onPackagesClear,
  onUsersSave,
  onPackagesSave,
  onAbout
}) => {
  const handleFileLoad = (event: React.ChangeEvent<HTMLInputElement>, expectedType: 'users' | 'packages') => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      
      // Определяем тип файла автоматически
      const detectedType = detectFileType(content)
      
      // Проверяем, соответствует ли тип ожидаемому
      if (detectedType === 'invalid') {
        alert('Неверный формат файла. Проверьте структуру данных.')
        return
      }
      
      if (detectedType !== expectedType) {
        const typeNames = {
          users: 'пользователей',
          packages: 'посылок'
        }
        alert(`Ошибка: вы пытаетесь загрузить файл ${typeNames[detectedType]} в раздел ${typeNames[expectedType]}. Пожалуйста, выберите правильный файл.`)
        return
      }
      
      // Валидируем содержимое файла
      const validation = validateFileContent(content, expectedType)
      
      if (!validation.isValid) {
        const errorMessage = `Ошибки в файле:\n${validation.errors.join('\n')}`
        alert(errorMessage)
        return
      }
      
      const lines = content.split('\n').filter(line => line.trim() !== '')
      
      if (expectedType === 'users') {
        const users: User[] = lines.map(line => {
          const [phone, fullName, address] = line.split('\t')
          return { phone, fullName, address }
        })
        onUsersLoad(users)
      } else {
        const packages: Package[] = lines.map(line => {
          const [senderPhone, receiverPhone, weight, date] = line.split('\t')
          return {
            senderPhone,
            receiverPhone,
            weight: parseFloat(weight),
            date
          }
        })
        onPackagesLoad(packages)
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  return (
    <div className="menu-strip">
      <div className="menu-bar">
        <div className="menu-item">
          <button className="menu-title">Файл</button>
          <div className="dropdown-menu">
            <label className="menu-button">
              Загрузить пользователей
              <input
                type="file"
                accept=".txt"
                onChange={(e) => handleFileLoad(e, 'users')}
                style={{ display: 'none' }}
              />
            </label>
            <label className="menu-button">
              Загрузить посылки
              <input
                type="file"
                accept=".txt"
                onChange={(e) => handleFileLoad(e, 'packages')}
                style={{ display: 'none' }}
              />
            </label>
            <button className="menu-button" onClick={onUsersClear}>
              Удалить пользователей
            </button>
            <button className="menu-button" onClick={onPackagesClear}>
              Удалить посылки
            </button>
            <button className="menu-button" onClick={onUsersSave}>
              Сохранить пользователей
            </button>
            <button className="menu-button" onClick={onPackagesSave}>
              Сохранить посылки
            </button>
          </div>
        </div>
        <div className="menu-item">
          <button className="menu-title" onClick={onAbout}>О программе</button>
        </div>
      </div>
    </div>
  )
}

export default MenuStrip