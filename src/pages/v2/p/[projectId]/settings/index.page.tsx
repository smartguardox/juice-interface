import { AppWrapper } from 'components/common'
import { DesmosScript } from 'components/common/Head/scripts/DesmosScript'
import { V2V3ProjectSettings } from 'components/v2v3/V2V3Project/V2V3ProjectSettings'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { TransactionProvider } from 'providers/TransactionProvider'
import { V2V3ProjectPageProvider } from 'providers/v2v3/V2V3ProjectPageProvider'

export default function V2V3ProjectSettingsPage() {
  const router = useRouter()

  const { projectId: rawProjectId } = router.query
  if (!rawProjectId) return null

  const projectId = parseInt(rawProjectId as string)

  return (
    <>
      <Head>
        {/* Not working for some reason */}
        <DesmosScript />
      </Head>
      <AppWrapper>
        <V2V3ProjectPageProvider projectId={projectId}>
          <TransactionProvider>
            <V2V3ProjectSettings />
          </TransactionProvider>
        </V2V3ProjectPageProvider>
      </AppWrapper>
    </>
  )
}
