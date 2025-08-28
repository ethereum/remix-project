import { ChatHistory } from "./chat"

export const buildChatPrompt = () => {
  const history = []
  for (const [question, answer] of ChatHistory.getHistory()) {
    history.push({ role:'user', content: question })
    history.push({ role:'assistant' , content: answer })
  }
  return history
}
