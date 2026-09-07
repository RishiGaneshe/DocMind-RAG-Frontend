import { ChatPanel } from '@/features/chat/components/ChatPanel'
import { useDocumentTitle } from '@/hooks'

export default function ChatPage() {
  useDocumentTitle('Chat')
  return <ChatPanel />
}
