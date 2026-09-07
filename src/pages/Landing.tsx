import {
  Capabilities,
  Faq,
  FinalCta,
  Hero,
  HowItWorks,
  Isolation,
  UnderTheHood,
  Verifiable,
} from '@/features/marketing/components'
import { useDocumentTitle } from '@/hooks'

export default function LandingPage() {
  useDocumentTitle('Ask your documents anything')

  return (
    <>
      <Hero />
      <HowItWorks />
      <Capabilities />
      <Verifiable />
      <Isolation />
      <UnderTheHood />
      <Faq />
      <FinalCta />
    </>
  )
}
