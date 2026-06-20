// Shared game prize definitions — games award one-time discount codes (stored on Redeem / Përdor).

export function scratchPrizeForUser(userId, today) {
  let hash = 0
  for (const ch of `${userId}-${today}`) hash = (hash * 31 + ch.charCodeAt(0)) % 9973
  const seed = hash % 4
  return [
    {
      type: 'code',
      discountPct: 0.25,
      providerSlug: 'aquaspa',
      label: '25% off Aqua Spa',
      subtitle: 'Jackpot day-pass deal!',
      disabledLabel: 'Come back tomorrow for a new card.',
    },
    {
      type: 'code',
      discountPct: 0.2,
      providerSlug: 'yogaflow',
      label: '20% off YogaFlow',
      subtitle: 'Nice win',
      disabledLabel: 'Come back tomorrow for a new card.',
    },
    {
      type: 'code',
      discountPct: 0.15,
      category: 'food',
      label: '15% off food partners',
      subtitle: 'Small win',
      disabledLabel: 'Come back tomorrow for a new card.',
    },
    {
      type: 'none',
      label: 'Try Again',
      subtitle: 'No luck this time',
      disabledLabel: 'Come back tomorrow for a new card.',
    },
  ][seed]
}

export function spinRewardFromWedge(w) {
  const map = {
    lek500: { discountPct: 0.2, label: '20% off any benefit' },
    disc20: { discountPct: 0.2, label: '20% off any benefit' },
    lek150: { discountPct: 0.1, label: '10% off any benefit' },
    spa: { discountPct: 0.3, providerSlug: 'aquaspa', label: '30% off Aqua Spa day-pass' },
    lek300: { discountPct: 0.15, label: '15% off any benefit' },
    tryagain: null,
    lek750: { discountPct: 0.25, label: '25% off any benefit' },
    disc15: { discountPct: 0.15, category: 'food', label: '15% off food & drink' },
    lek100: { discountPct: 0.1, label: '10% off any benefit' },
    gym: { discountPct: 0.2, providerSlug: 'fitlife', label: '20% off FitLife Gym' },
    lek200: { discountPct: 0.15, label: '15% off any benefit' },
    bonus: { discountPct: 0.3, label: '30% JACKPOT — any partner' },
  }
  return map[w.id] ?? null
}

export function guessReward(attemptsLeft) {
  if (attemptsLeft === 3) {
    return { discountPct: 0.25, providerSlug: 'lumeretreat', label: '25% off Lumë Retreat' }
  }
  if (attemptsLeft === 2) {
    return { discountPct: 0.2, providerSlug: 'cyclecity', label: '20% off CycleCity' }
  }
  return { discountPct: 0.15, providerSlug: 'kombi', label: '15% off Kombi Coffee' }
}

export const MEMORY_REWARD = {
  discountPct: 0.2,
  providerSlug: 'yogaflow',
  label: '20% off YogaFlow Studio',
}

export function rewardToClaim(prize, source) {
  if (!prize || prize.type === 'none') return null
  return {
    source,
    label: prize.label,
    providerSlug: prize.providerSlug || null,
    category: prize.category || null,
    discountPct: prize.discountPct,
  }
}
