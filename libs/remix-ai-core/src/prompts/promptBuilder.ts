import { ChatHistory } from "./chat"

export const buildChatPrompt = (userPrompt) => {
  const history = []
  for (const [question, answer] of ChatHistory.getHistory()) {
    if (question.startsWith('sol-gpt')) {
      history.push({ role:'user', content:question.split('sol-gpt')[1] })
      history.push({ role:'assistant' , content: answer })
    }
    else if (question.startsWith('gpt')) {
      history.push({ role:'user', content:question.split('gpt')[1] })
      history.push({ role:'assistant' , content: answer })
    }
    else {
      history.push({ role:'user', content: question })
      history.push({ role:'assistant' , content: answer })
    }
  }
  history.push({ role: 'user', content: userPrompt })
  return history
}
