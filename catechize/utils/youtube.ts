let youtubeApiPromise: Promise<void> | null = null

export function loadYouTubeApi(): Promise<void> {
  if (youtubeApiPromise) return youtubeApiPromise

  youtubeApiPromise = new Promise((resolve) => {
    // Create script element
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'

    // Add to page
    const firstScriptTag = document.getElementsByTagName('script')[0]
    if (!firstScriptTag || !firstScriptTag.parentNode) {
      document.head.appendChild(tag)
    } else {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
    }

    // Setup callback
    window.onYouTubeIframeAPIReady = () => {
      resolve()
    }
  })

  return youtubeApiPromise
}

export function getYouTubeVideoId(url: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match?.[2] || ''
}
