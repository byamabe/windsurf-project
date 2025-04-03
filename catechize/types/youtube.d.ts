declare global {
  interface Window {
    YT: typeof YT
    onYouTubeIframeAPIReady: () => void
  }
}

declare namespace YT {
  class Player {
    constructor(elementId: string | HTMLElement, options: PlayerOptions)
    
    playVideo(): void
    pauseVideo(): void
    seekTo(seconds: number, allowSeekAhead: boolean): void
    getCurrentTime(): number
    getDuration(): number
    getPlayerState(): PlayerState
    setVolume(volume: number): void
    getVolume(): number
    setPlaybackRate(rate: number): void
    getPlaybackRate(): number
    destroy(): void
  }

  interface PlayerOptions {
    height?: string | number
    width?: string | number
    videoId?: string
    playerVars?: PlayerVars
    events?: Events
  }

  interface PlayerVars {
    autoplay?: 0 | 1
    controls?: 0 | 1
    modestbranding?: 0 | 1
    rel?: 0 | 1
    showinfo?: 0 | 1
    playsinline?: 0 | 1
  }

  interface Events {
    onReady?: (event: OnReadyEvent) => void
    onStateChange?: (event: OnStateChangeEvent) => void
    onError?: (event: OnErrorEvent) => void
  }

  interface EventArgs {
    target: Player
  }

  interface OnReadyEvent extends EventArgs {}

  interface OnStateChangeEvent extends EventArgs {
    data: PlayerState
  }

  interface OnErrorEvent extends EventArgs {
    data: number
  }

  enum PlayerState {
    UNSTARTED = -1,
    ENDED = 0,
    PLAYING = 1,
    PAUSED = 2,
    BUFFERING = 3,
    CUED = 5
  }
}

export { YT };
