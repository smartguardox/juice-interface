import { BigNumber } from '@ethersproject/bignumber'
import { t } from '@lingui/macro'
import { V1ProjectContext } from 'contexts/v1/projectContext'
import { V1UserContext } from 'contexts/v1/userContext'
import { useContext } from 'react'

import { TransactorInstance } from 'hooks/Transactor'
import { useV1ProjectTitle } from '../ProjectTitle'

export function useSetProjectUriTx(): TransactorInstance<{
  cid: string
}> {
  const { transactor, contracts } = useContext(V1UserContext)
  const { projectId } = useContext(V1ProjectContext)
  const projectTitle = useV1ProjectTitle()

  return ({ cid }, txOpts) => {
    if (!transactor || !projectId || !contracts?.TicketBooth) {
      txOpts?.onDone?.()
      return Promise.resolve(false)
    }

    return transactor(
      contracts.Projects,
      'setUri',
      [BigNumber.from(projectId).toHexString(), cid],
      {
        ...txOpts,
        title: t`Set URI for ${projectTitle}`,
      },
    )
  }
}
