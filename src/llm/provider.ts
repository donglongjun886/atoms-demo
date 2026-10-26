import type { Message } from '@/store/types'

export interface LLMContext {
  projectId: string
  messages: Message[]
}

export interface LLMProvider {
  reply(context: LLMContext): Promise<Message[]>
}
