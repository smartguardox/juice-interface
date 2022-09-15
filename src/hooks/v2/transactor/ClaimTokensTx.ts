import { BigNumber } from '@ethersproject/bignumber'
import { V2ProjectContext } from 'contexts/v2/projectContext'
import { V2UserContext } from 'contexts/v2/userContext'
import { onCatch, TransactorInstance } from 'hooks/Transactor'
import { useWallet } from 'hooks/Wallet'
import { useContext } from 'react'
import invariant from 'tiny-invariant'

export function useClaimTokensTx(): TransactorInstance<{
  claimAmount: BigNumber
}> {
  const { transactor, contracts, version } = useContext(V2UserContext)
  const { userAddress } = useWallet()
  const { projectId } = useContext(V2ProjectContext)

  return ({ claimAmount }, txOpts) => {
    try {
      invariant(
        transactor && userAddress && projectId && contracts?.JBTokenStore,
      )
      return transactor(
        contracts?.JBTokenStore,
        'claimFor',
        [userAddress, projectId, claimAmount.toHexString()],
        txOpts,
      )
    } catch {
      const missingParam = !transactor
        ? 'transactor'
        : !userAddress
        ? 'userAddress'
        : !projectId
        ? 'projectId'
        : !contracts?.JBTokenStore
        ? 'contracts.JBTokenStore'
        : undefined

      return onCatch({
        txOpts,
        missingParam,
        functionName: 'claimFor',
        version,
      })
    }
  }
}
