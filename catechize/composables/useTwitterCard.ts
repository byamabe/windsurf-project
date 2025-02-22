export const useTwitterCard = () => {
  const updateTwitterCard = (options: {
    title: string
    description: string
    image?: string
  }) => {
    const { title, description, image } = options

    useHead({
      meta: [
        {
          name: 'twitter:title',
          content: title
        },
        {
          name: 'twitter:description',
          content: description
        },
        ...(image ? [{
          name: 'twitter:image',
          content: image
        }] : [])
      ]
    })
  }

  return {
    updateTwitterCard
  }
}
