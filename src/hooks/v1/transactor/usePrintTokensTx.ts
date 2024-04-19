import { t } from '@lingui/macro'
import { V1ProjectContext } from 'contexts/v1/Project/V1ProjectContext'
import { V1UserContext } from 'contexts/v1/User/V1UserContext'
import { Contract } from 'ethers'
import { V1CurrencyOption } from 'models/v1/currencyOption'
import { useContext } from 'react'

import { ProjectMetadataContext } from 'contexts/shared/ProjectMetadataContext'
import { TransactorInstance } from 'hooks/useTransactor'
import { toHexString } from 'utils/bigNumbers'
import { tokenSymbolText } from 'utils/tokenSymbolText'

export function usePrintTokensTx(): TransactorInstance<{
  value: bigint
  currency: V1CurrencyOption
  beneficiary: string
  memo: string
  preferUnstaked: boolean
}> {
  const { transactor, contracts } = useContext(V1UserContext)
  const { terminal, tokenSymbol } = useContext(V1ProjectContext)
  const { projectId } = useContext(ProjectMetadataContext)

  return ({ value, currency, beneficiary, memo, preferUnstaked }, txOpts) => {
    if (!transactor || !contracts || !projectId || !terminal?.version) {
      txOpts?.onDone?.()
      return Promise.resolve(false)
    }

    let terminalContract: Contract
    let functionName: string
    let args: unknown[]

    switch (terminal.version) {
      case '1':
        terminalContract = contracts.TerminalV1
        functionName = 'printPreminedTickets'
        args = [
          toHexString(BigInt(projectId)),
          toHexString(value),
          toHexString(BigInt(currency)),
          beneficiary,
          memo ?? '',
          preferUnstaked,
        ]
        break
      case '1.1':
        terminalContract = contracts.TerminalV1_1
        functionName = 'printTickets'
        args = [
          toHexString(BigInt(projectId)),
          toHexString(value),
          beneficiary,
          memo ?? '',
          preferUnstaked,
        ]
    }

    return transactor(terminalContract, functionName, args, {
      ...txOpts,
      title: t`Mint ${tokenSymbolText({
        tokenSymbol,
        plural: true,
      })}`,
    })
  }
}
