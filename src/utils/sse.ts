import config from '@/config'
import { getToken } from '@/utils/auth'
import { refreshMessageTabBadge } from '@/utils/messageBadge'

let eventSource: EventSource | null = null
let started = false

function buildSseUrl() {
  const token = getToken()
  if (!token) return ''
  return `${config.baseUrl}/resource/sse?Authorization=Bearer ${token}&clientid=${config.clientID}`
}

export function initMessageSse() {
  // #ifdef H5
  if (started || typeof window === 'undefined' || typeof EventSource === 'undefined') return
  const url = buildSseUrl()
  if (!url) return

  started = true
  eventSource = new EventSource(url)

  eventSource.onmessage = (event) => {
    if (!event?.data) return
    let payload: Record<string, any> = {}
    try {
      payload = JSON.parse(event.data)
    } catch (error) {
      payload = { message: event.data }
    }

    uni.$emit('message-center-refresh', payload)
    refreshMessageTabBadge()
    uni.showToast({
      title: String(payload.messageTitle || payload.message || 'new').slice(0, 12),
      icon: 'none'
    })
  }

  eventSource.onerror = () => {
    closeMessageSse()
    started = false
  }
  // #endif
}

export function closeMessageSse() {
  // #ifdef H5
  if (eventSource) {
    eventSource.close()
    eventSource = null
  }
  // #endif
}
