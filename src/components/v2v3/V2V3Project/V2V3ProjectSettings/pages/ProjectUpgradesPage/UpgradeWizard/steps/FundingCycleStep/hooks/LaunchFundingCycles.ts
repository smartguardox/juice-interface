import { EditingFundingCycleConfig } from 'components/v2v3/V2V3Project/V2V3ProjectSettings/pages/ReconfigureFundingCycleSettingsPage/hooks/editingFundingCycleConfig'
import { ProjectMetadataContext } from 'contexts/projectMetadataContext'
import { revalidateProject } from 'lib/api/nextjs'
import { PV2 } from 'models/pv'
import { useCallback, useContext, useState } from 'react'
import { emitErrorNotification } from 'utils/notifications'
import { useLaunchStandardFundingCycles } from './LaunchStandardFundingCycle'

export const useLaunchFundingCycles = ({
  editingFundingCycleConfig,
}: {
  editingFundingCycleConfig: EditingFundingCycleConfig
}) => {
  const { projectId, pv } = useContext(ProjectMetadataContext)

  const [launchFundingCycleTxLoading, setLaunchFundingCycleTxLoading] =
    useState<boolean>(false)
  const launchStandardFundingCycles = useLaunchStandardFundingCycles(
    editingFundingCycleConfig,
  )

  const launchFundingCycle = useCallback(async () => {
    setLaunchFundingCycleTxLoading(true)

    const callbacks = {
      onDone() {
        console.info(
          'Reconfigure transaction executed. Awaiting confirmation...',
        )
      },
      onConfirmed() {
        setLaunchFundingCycleTxLoading(false)

        if (projectId) {
          revalidateProject({
            pv: pv as PV2,
            projectId: String(projectId),
          })
        }
      },
    }

    const txSuccessful = await launchStandardFundingCycles(callbacks)

    if (!txSuccessful) {
      setLaunchFundingCycleTxLoading(false)
      emitErrorNotification('Failed to launch funding cycles.')
    }
  }, [launchStandardFundingCycles, projectId, pv])

  return {
    launchFundingCycleLoading: launchFundingCycleTxLoading,
    launchFundingCycle,
  }
}
