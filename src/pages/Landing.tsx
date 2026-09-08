import {
  Capabilities,
  ChatbotCallout,
  Faq,
  FinalCta,
  Hero,
  HowItWorks,
  Isolation,
  UnderTheHood,
  Verifiable,
} from '@/features/marketing/components'
import { PublicChatWidget } from '@/components/widget/PublicChatWidget'
import { useDocumentTitle } from '@/hooks'

export default function LandingPage() {
  useDocumentTitle('Ask your documents anything')

  return (
    <>
      <Hero />
      <ChatbotCallout />
      <HowItWorks />
      <Capabilities />
      <Verifiable />
      <Isolation />
      <UnderTheHood />
      <Faq />
      <FinalCta />
      <PublicChatWidget />
    </>
  )
}
