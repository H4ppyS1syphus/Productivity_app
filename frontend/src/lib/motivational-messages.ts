/**
 * Anime-themed motivational messages
 */

export const STREAK_MESSAGES = {
  0: [
    "Your journey begins now! がんばって！ (Ganbatte!)",
    "Every great adventure starts with a single step!",
    "Ready to become the protagonist of your story?",
  ],
  1: [
    "First step complete! すごい！ (Sugoi!)",
    "The hardest part is starting. You did it!",
    "Level 1 cleared! Keep going!",
  ],
  3: [
    "3-day streak! Your determination is showing! 🔥",
    "You're building momentum! Keep pushing!",
    "The power of habit awakens!",
  ],
  7: [
    "ONE WEEK STREAK! やった！ (Yatta!)",
    "Bronze tier unlocked! You're unstoppable! 🥉",
    "A full week of dedication! Incredible!",
  ],
  14: [
    "TWO WEEKS! Your willpower is incredible! 💪",
    "You're proving yourself every day!",
    "The habit is becoming part of you!",
  ],
  30: [
    "🥈 SILVER TIER UNLOCKED! 30 DAYS!",
    "A FULL MONTH! Your dedication is inspiring!",
    "You've transcended! さすが！ (Sasuga!)",
  ],
  60: [
    "60 DAYS! You're in elite territory now! ✨",
    "Your consistency is legendary!",
    "Nothing can stop you now!",
  ],
  90: [
    "🥇 GOLD TIER ACHIEVED! 90 DAYS!",
    "You've reached enlightenment! 最高！ (Saikō!)",
    "LEGENDARY STATUS UNLOCKED! 👑",
  ],
  180: [
    "💎 PLATINUM TIER! HALF A YEAR!",
    "Your dedication defies belief!",
    "You are the master now! 師匠！ (Shishō!)",
  ],
  365: [
    "🌟 ULTIMATE ACHIEVEMENT! ONE YEAR!",
    "You've completed the ultimate quest!",
    "神レベル! (Kami level!) - GOD TIER!",
  ],
}

export const COMPLETION_MESSAGES = [
  "Task crushed! Nice work! ✨",
  "Another one bites the dust! すごい！",
  "Victory! You're unstoppable! 🔥",
  "Mission complete! Level up! 📈",
  "You did it! かっこいい！ (Kakkoii!)",
  "Nailed it! Keep the momentum! 💪",
  "Success! Your power grows! ⚡",
  "Amazing work! 素晴らしい！ (Subarashii!)",
]

export const POMODORO_MESSAGES = {
  start: [
    "Focus mode activated! Let's do this! 🎯",
    "Time to enter the zone! 集中！ (Shūchū!)",
    "Your power level is rising! 💫",
  ],
  break: [
    "Great work! Time to recharge! ☕",
    "Rest well, warrior! You earned it! 🌸",
    "Recovery time! お疲れ様！ (Otsukaresama!)",
  ],
  complete: [
    "Pomodoro complete! Incredible focus! 🔥",
    "Session conquered! Your discipline is admirable! 💪",
    "Perfect! Another victory! やった！ (Yatta!)",
  ],
}

export const GYM_MESSAGES = {
  pr: [
    "🎉 NEW PERSONAL RECORD! LEGENDARY!",
    "PR SMASHED! You're getting stronger! 💪",
    "POWER LEVEL INCREASED! Keep crushing it!",
  ],
  progress: [
    "Gains detected! Nice work! 📈",
    "Getting stronger every day! 強い！ (Tsuyoi!)",
    "The grind pays off! Keep pushing! 🔥",
  ],
  milestone: [
    "🏆 MILESTONE ACHIEVED! INCREDIBLE!",
    "You've reached new heights! すごい！",
    "Elite level unlocked! 最強！ (Saikyō!)",
  ],
}

export function getStreakMessage(streak: number): string {
  // Find the closest milestone
  const milestones = Object.keys(STREAK_MESSAGES).map(Number).sort((a, b) => b - a)
  const milestone = milestones.find(m => streak >= m) || 0

  const messages = STREAK_MESSAGES[milestone as keyof typeof STREAK_MESSAGES]
  return messages[Math.floor(Math.random() * messages.length)]
}

export function getRandomMessage(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)]
}
