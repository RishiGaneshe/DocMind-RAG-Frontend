import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { getPublicConfig } from '@/lib/api'
import { CHAT_PUBLIC_KEY } from '@/lib/constants'
import { ChatWidget } from './ChatWidget'

export function PublicChatWidget() {
  const apiKey = CHAT_PUBLIC_KEY

  const { data, isSuccess, isError, error } = useQuery({
    queryKey: ['public-widget', 'config', apiKey],
    queryFn: ({ signal }) => getPublicConfig(apiKey, signal),
    enabled: Boolean(apiKey),
    retry: false, // fail fast: an invalid/mis-scoped key should not be retried
    staleTime: 5 * 60_000,
  })

  useEffect(() => {
    if (isError) {
      // Integrator-facing only. The visitor cannot fix this and should not read it.
      console.warn('[chat] widget config failed:', (error as Error)?.message)
    }
  }, [isError, error])

  // Live Mode: key is set and config loaded successfully
  if (apiKey && isSuccess) {
    if (data.widget.enabled === false) return null // owner disabled the widget
    const widgetConfig = {
      ...data.widget,
      suggestions:
        data.widget.suggestions && data.widget.suggestions.length > 0
          ? data.widget.suggestions
          : [
              'What is Node.js and its architecture?',
              'What documents are in this knowledge base?',
              'What are the key features of DocMind?',
            ],
    }

    return (
      <ChatWidget
        mode="live"
        apiKey={apiKey}
        config={widgetConfig}
        limits={data.limits}
        workspaceName={data.workspace.name}
      />
    )
  }

  // Key is set but config fetch failed — fail closed and quietly
  if (apiKey && isError) {
    if (import.meta.env.DEV) {
      return (
        <ChatWidget
          mode="live"
          apiKey={apiKey}
          config={{
            title: 'Config Error (DEV)',
            greeting: `Failed to load widget config: ${(error as Error)?.message || 'Unknown error'}. Check your backend server and API key.`,
            accentColor: '#ef4444',
            sourceMode: 'hidden',
          }}
        />
      )
    }
    return null
  }

  // Key is set but config is still loading — show nothing yet
  if (apiKey) {
    return null
  }

  // No key configured — render in preview/demo mode directly.
  // No popup, no key entry. The chatbot just works with simulated responses.
  return (
    <ChatWidget
      mode="preview"
      config={{
        title: 'DocMind AI',
        greeting:
          'Hello! I am grounded in your workspace documents. Ask me anything!',
        suggestions: [
          'What are the key features?',
          'How does pricing work?',
          'How do I get started?',
        ],
        accentColor: '#4E77B8',
        sourceMode: 'labels',
      }}
    />
  )
}
