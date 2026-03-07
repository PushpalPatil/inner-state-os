export const mockTasks = [
  { id: "1", title: "Reply to Sarah's Slack message", description: "She asked about the auth feature timeline", intensity: 1, type: "communication", source: "slack" },
  { id: "2", title: "Review PR #47 — loading states", description: "Quick UI changes, low-stakes review", intensity: 2, type: "review", source: "jira" },
  { id: "3", title: "Respond to PM's question in Jira", description: "Context question on AUTH-142 acceptance criteria", intensity: 2, type: "communication", source: "jira" },
  { id: "4", title: "Write unit tests for login flow", description: "Cover happy path and all error states", intensity: 4, type: "deep-work", source: "jira" },
  { id: "5", title: "Implement account lock after failed attempts", description: "AUTH-142 core feature — complex logic", intensity: 5, type: "deep-work", source: "jira" }
]
