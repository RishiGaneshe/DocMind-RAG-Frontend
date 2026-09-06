import { Alert } from '@/components/ui'
import { LegalDoc, LegalSection } from '@/features/marketing/components'
import { useDocumentTitle } from '@/hooks'

/**
 * `/legal/privacy`.
 *
 * Written from what the code actually does — the tables that exist, the three
 * external services a request touches, and the retention behaviour we can point
 * at. The banner at the top says plainly that this is not a lawyer's document,
 * because shipping boilerplate that pretends otherwise is the worse option.
 */
export default function LegalPrivacyPage() {
  useDocumentTitle('Privacy')

  return (
    <LegalDoc
      title="Privacy"
      updated="2026-08-30"
      summary="What DocMind stores, where it goes when you ask a question, and how long it stays."
    >
      <Alert tone="warning" title="Not reviewed by a lawyer">
        This describes the system's real behaviour so you can make an informed decision about what to
        upload. It is not a substitute for a privacy policy drafted for your jurisdiction, and it
        should be replaced before this product is offered commercially.
      </Alert>

      <LegalSection id="collected" heading="What is collected">
        <p>Only what the product needs to work:</p>
        <ul className="ml-5 flex list-disc flex-col gap-1.5">
          <li>
            <strong className="font-medium text-fg">Your account</strong> — first and last name, email
            address, and a bcrypt hash of your password. The password itself is never stored and
            cannot be recovered from the hash.
          </li>
          <li>
            <strong className="font-medium text-fg">Your workspace</strong> — its name, its address
            slug, and an API key generated for it.
          </li>
          <li>
            <strong className="font-medium text-fg">Your documents</strong> — the PDF's filename, size
            and upload time, the text extracted from it, and the vector embeddings of that text.
          </li>
          <li>
            <strong className="font-medium text-fg">Sign-in activity</strong> — the time of your last
            sign-in, and refresh tokens until you sign out.
          </li>
        </ul>
        <p>
          There is no analytics script, no advertising pixel and no third-party session recorder on
          this site.
        </p>
      </LegalSection>

      <LegalSection id="processors" heading="Where your text goes when you ask a question">
        <p>
          A question travels through three external services. Each receives only the fragment it
          needs, never your library:
        </p>
        <ul className="ml-5 flex list-disc flex-col gap-1.5">
          <li>
            <strong className="font-medium text-fg">Voyage AI</strong> turns text into vectors — the
            passages when a document is indexed, and your question when you ask it.
          </li>
          <li>
            <strong className="font-medium text-fg">Pinecone</strong> stores those vectors and finds
            the closest ones. Your workspace has its own namespace inside the index.
          </li>
          <li>
            <strong className="font-medium text-fg">Groq</strong> writes the answer, receiving your
            question and the retrieved passages only.
          </li>
        </ul>
        <p>
          Those providers process the text under their own terms. If your documents are subject to a
          confidentiality obligation, check those terms before uploading.
        </p>
      </LegalSection>

      <LegalSection id="retention" heading="How long things are kept">
        <p>
          Documents and their vectors stay until the workspace is removed. Deleting a single document
          is not possible yet — the API has no route for it — so treat every upload as permanent for
          now, and email us if something needs to be removed.
        </p>
        <p>
          Chat threads are never stored. A conversation lives in the browser tab and is gone when you
          reload the page or sign out. Sign-in tokens are held in your browser's local or session
          storage depending on whether you asked to be kept signed in.
        </p>
      </LegalSection>

      <LegalSection id="isolation" heading="Separation between workspaces">
        <p>
          Every document, vector and query is scoped to a single workspace at the database and vector
          index level, not filtered in the interface. A signed-in user's token carries their
          workspace, and a request for another workspace's data is refused rather than filtered.
        </p>
      </LegalSection>

      <LegalSection id="rights" heading="Your data, on request">
        <p>
          There is no self-service export or account-deletion screen yet. Until there is, a request by
          email is the mechanism: we can return what is stored about you and remove it, including the
          vectors, which are keyed to your workspace.
        </p>
      </LegalSection>
    </LegalDoc>
  )
}
