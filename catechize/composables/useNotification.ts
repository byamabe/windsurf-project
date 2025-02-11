import { ref } from 'vue'

interface Notification {
  id: string
  title: string
  description: string
  type: 'success' | 'error' | 'info' | 'warning'
  timeout?: number
}

const notifications = ref<Notification[]>([])

export function useNotification() {
  const add = ({ title, description, type = 'info', timeout = 5000 }: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substring(2)
    const notification = {
      id,
      title,
      description,
      type,
      timeout
    }
    
    notifications.value.push(notification)
    
    if (timeout) {
      setTimeout(() => {
        remove(id)
      }, timeout)
    }
  }

  const remove = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }

  return {
    notifications,
    add,
    remove
  }
}
