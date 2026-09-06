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

/**
 * `/` — the landing page (§10).
 *
 * The page is only an outline: each section owns its own copy and layout. Read
 * top to bottom, the argument is one thing said once — an answer you cannot check
 * is not an answer — approached from a different angle each time.
 */
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
