export type ID = string

export type Category = {
  id: ID
  name: string
  color: string // hex or tailwind class
}

export type Task = {
  id: ID
  title: string
  date: string // ISO yyyy-mm-dd
  categoryId: ID
  description?: string
  customColor?: string
}

export type AppState = {
  categories: Category[]
  tasks: Task[]
}
