interface Toast {
  id: number
  title: string
  description: string
  color: 'green' | 'red' | 'blue' | 'yellow'
}

export const useToast = () => {
  const toasts = useState<Toast[]>('toasts', () => [])
  let id = 0

  const add = (toast: Omit<Toast, 'id'>) => {
    const newToast = { ...toast, id: id++ }
    toasts.value.push(newToast)
    setTimeout(() => {
      remove(newToast.id)
    }, 5000)
  }

  const remove = (id: number) => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return {
    toasts,
    add,
    remove
  }
}
