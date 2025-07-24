import { ChatHistory } from "./chat"

export const buildChatPrompt = (userPrompt) => {
  const history = []
  for (const [question, answer] of ChatHistory.getHistory()) {
    history.push({ role:'user', content: question })
    history.push({ role:'assistant' , content: answer })
  }
  history.push({ role: 'user', content: userPrompt })
  return history
}
