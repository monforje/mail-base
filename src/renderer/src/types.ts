export interface User {
  phone: string
  fullName: string
  address: string
}

export interface Package {
  senderPhone: string
  receiverPhone: string
  weight: number
  date: string
}

export interface MenuStripProps {
  onUsersLoad: (users: User[]) => void
  onPackagesLoad: (packages: Package[]) => void
  onUsersClear: () => void
  onPackagesClear: () => void
  onUsersSave: () => void
  onPackagesSave: () => void
  onAbout: () => void
}

export interface UsersTableProps {
  users: User[]
}

export interface PackagesTableProps {
  packages: Package[]
}