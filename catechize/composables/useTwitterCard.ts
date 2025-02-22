export const useTwitterCard = () => {
  const updateTwitterCard = (options: {
    title: string
    description: string
    image?: string
    player?: {
      url: string
      width: number
      height: number
      audio?: string
    }
  }) => {
    const { title, description, image, player } = options

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
        }] : []),
        ...(player ? [
          {
            name: 'twitter:card',
            content: 'player'
          },
          {
            name: 'twitter:player',
            content: player.url
          },
          {
            name: 'twitter:player:width',
            content: player.width.toString()
          },
          {
            name: 'twitter:player:height',
            content: player.height.toString()
          },
          ...(player.audio ? [{
            name: 'twitter:player:stream',
            content: player.audio
          }] : [])
        ] : [
          {
            name: 'twitter:card',
            content: 'summary_large_image'
          }
        ])
      ]
    })
  }

  return {
    updateTwitterCard
  }
}
