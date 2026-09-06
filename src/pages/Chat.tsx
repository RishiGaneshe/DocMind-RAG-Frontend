import { ChatPanel } from '@/features/chat/components/ChatPanel'
import { useDocumentTitle } from '@/hooks'

/**
 * `/app` — the index route of the signed-in shell.
 *
 * Chat is the index rather than a dashboard because asking a question is the
 * product. Everything else exists to make an answer possible.
 */
export default function ChatPage() {
  useDocumentTitle('Chat')
  return <ChatPanel />
}
