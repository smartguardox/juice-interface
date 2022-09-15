import { BigNumber } from '@ethersproject/bignumber'
import { t } from '@lingui/macro'
import { V1ProjectContext } from 'contexts/v1/projectContext'
import { V1UserContext } from 'contexts/v1/userContext'
import { useWallet } from 'hooks/Wallet'
import { useContext } from 'react'

import { TransactorInstance } from 'hooks/Transactor'
import { tokenSymbolText } from 'utils/tokenSymbolText'

export function useTransferTokensTx(): TransactorInstance<{
  amount: BigNumber
  to: string
}> {
  const { transactor, contracts } = useContext(V1UserContext)
  const { userAddress } = useWallet()
  const { projectId, tokenSymbol } = useContext(V1ProjectContext)

  return ({ amount, to }, txOpts) => {
    if (!transactor || !projectId || !contracts?.Projects) {
      txOpts?.onDone?.()
      return Promise.resolve(false)
    }

    return transactor(
      contracts.TicketBooth,
      'transfer',
      [
        userAddress,
        BigNumber.from(projectId).toHexString(),
        amount.toHexString(),
        to,
      ],
      {
        ...txOpts,
        title: t`Transfer unclaimed ${tokenSymbolText({
          tokenSymbol,
          plural: true,
        })}`,
      },
    )
  }
}
