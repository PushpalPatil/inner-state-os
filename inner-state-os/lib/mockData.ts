export const mockEmotionResult = {
  emotion: "scattered", intensity: 3, confidence: 0.8,
  pace: "medium", note: "speaking at medium pace with occasional hesitation",
  shouldIntervene: false
}

export const mockSessionSummary = {
  arc: "Tired → Scattered → Settling",
  dominantEmotion: "scattered",
  averageIntensity: 2.8,
  explanation: "Your voice was low energy throughout. Starting with lighter tasks will help you build momentum.",
  recommendedTasks: [
    { id: "1", rank: 1, title: "Reply to Sarah's Slack message", description: "She asked about the auth feature timeline", intensity: 1, type: "communication", source: "slack", reason: "Easy win to get moving without burning energy." },
    { id: "2", rank: 2, title: "Review PR #47 — loading states", description: "Quick UI changes", intensity: 2, type: "review", source: "jira", reason: "Low stakes, clear scope — good for easing in." },
    { id: "3", rank: 3, title: "Respond to PM's question in Jira", description: "Context question on AUTH-142", intensity: 2, type: "communication", source: "jira", reason: "Quick answer, no deep thinking needed." },
    { id: "4", rank: 4, title: "Write unit tests for login flow", description: "Cover happy path and error states", intensity: 4, type: "deep-work", source: "jira", reason: "Save this — needs more focus than you have right now." },
    { id: "5", rank: 5, title: "Implement account lock after failed attempts", description: "AUTH-142 core feature", intensity: 5, type: "deep-work", source: "jira", reason: "Your hardest task. Come back when you're more resourced." }
  ]
}

export const mockIntervention = {
  message: "Your pace shifted when you mentioned the account lock decision.",
  question: "Is there something about that decision that doesn't sit right with you?"
}
