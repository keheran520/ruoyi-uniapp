import { getMobileMessageSummary } from '@/api/mobile/messageCenter'

const MESSAGE_TAB_INDEX = 2
const MAX_BADGE_COUNT = 99

function normalizeBadgeText(count: number) {
  if (count > MAX_BADGE_COUNT) {
    return `${MAX_BADGE_COUNT}+`
  }
  return String(count)
}

export function setMessageTabBadge(count = 0) {
  const total = Number(count || 0)
  if (total > 0) {
    uni.setTabBarBadge({
      index: MESSAGE_TAB_INDEX,
      text: normalizeBadgeText(total)
    })
    return
  }

  uni.removeTabBarBadge({
    index: MESSAGE_TAB_INDEX
  })
}

export async function refreshMessageTabBadge() {
  try {
    const res = await getMobileMessageSummary()
    const total = Number(res.data?.unreadTotal || 0)
    setMessageTabBadge(total)
    return total
  } catch (error) {
    console.error('refresh message tab badge failed', error)
    return 0
  }
}
