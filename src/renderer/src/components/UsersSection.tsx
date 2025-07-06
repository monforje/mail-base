import React from 'react'
import UsersTable from './UsersTable'
import { User } from '../types'
import '../assets/UsersSection.css'

interface UsersSectionProps {
  users: User[]
}

const UsersSection: React.FC<UsersSectionProps> = ({ users }) => {
  return (
    <div className="table-section">
      <div className="section-header">Пользователи</div>
      <div className="table-container">
        <UsersTable users={users} />
      </div>
    </div>
  )
}

export default UsersSection