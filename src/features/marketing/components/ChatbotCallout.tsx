import { Bot, Sparkles, MessageSquare, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Container } from '@/components/ui'
import { FadeIn } from '@/components/motion'

export function ChatbotCallout() {
  const triggerChat = (query?: string) => {
    window.dispatchEvent(
      new CustomEvent('docmind:open-chat', {
        detail: { query },
      }),
    )
  }

  return (
    <section className="relative -mt-4 mb-12 sm:mb-16">
      <Container>
        <FadeIn delay={0.1}>
          <div className="relative overflow-hidden rounded-2xl border border-line bg-surface-glass p-6 shadow-xl backdrop-blur-xl sm:p-8">
            {/* Top ambient glow highlight */}
            <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-wash px-3 py-1 text-xs font-medium text-accent">
                  <Sparkles className="size-3.5 text-accent" />
                  <span>Interactive Site Assistant</span>
                </div>

                <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-fg">
                  Explore this website with our <span className="text-accent">Document-Grounded AI</span>
                </h2>

                <p className="text-sm leading-relaxed text-fg-secondary">
                  This chatbot is <strong>not a general-purpose web AI</strong>. It is strictly
                  grounded in this website's verified documentation, PDFs, and guides. Ask questions
                  to learn about the site, technical concepts, or policies with verified citations.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-fg-muted">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                    <span>Strictly grounded in uploaded PDFs</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                    <span>Zero hallucinated web search</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                    <span>Page-level source citations</span>
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => triggerChat()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-on-accent shadow-md shadow-accent/15 transition-all hover:bg-accent-hover hover:scale-[1.02] active:scale-95 cursor-pointer"
                >
                  <Bot className="size-4.5" />
                  <span>Ask the Chatbot</span>
                  <ArrowRight className="size-4" />
                </button>

                <div className="flex items-center gap-2 text-xs text-fg-muted justify-center">
                  <span>Or use the floating button at bottom right</span>
                </div>
              </div>
            </div>

            {/* Quick-try questions pills */}
            <div className="mt-6 pt-4 border-t border-line flex flex-wrap items-center gap-2">
              <span className="text-xs text-fg-muted font-medium">Try asking:</span>
              {[
                'What is Node.js and its architecture?',
                'What documents are in the knowledge base?',
                'What are the key features of DocMind?',
              ].map((query, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => triggerChat(query)}
                  className="group inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface-raised px-3 py-1.5 text-xs text-fg-secondary transition-all hover:border-accent/40 hover:bg-surface hover:text-fg active:scale-95 cursor-pointer"
                >
                  <MessageSquare className="size-3 text-accent transition-transform group-hover:scale-110" />
                  <span>"{query}"</span>
                </button>
              ))}
            </div>
          </div>
        </FadeIn>
      </Container>
    </section>
  )
}
