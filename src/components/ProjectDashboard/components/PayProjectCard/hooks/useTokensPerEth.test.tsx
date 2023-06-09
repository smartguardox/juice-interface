/**
 * @jest-environment jsdom
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { renderHook } from '@testing-library/react-hooks'
import { useProjectContext } from 'components/ProjectDashboard/hooks'
import { V2V3CurrencyProvider } from 'contexts/v2v3/V2V3CurrencyProvider'
import { BigNumber } from 'ethers'
import { useCurrencyConverter } from 'hooks/useCurrencyConverter'
import useWeiConverter from 'hooks/useWeiConverter'
import { formattedNum } from 'utils/format/formatNumber'
import { tokenSymbolText } from 'utils/tokenSymbolText'
import { weightAmountPermyriad } from 'utils/v2v3/math'
import { useTokensPerEth } from './useTokensPerEth'

jest.mock('components/ProjectDashboard/hooks')

jest.mock('hooks/useCurrencyConverter')

jest.mock('hooks/useWeiConverter')

jest.mock('utils/v2v3/math', () => ({
  formatIssuanceRate: jest.fn(),
  weightAmountPermyriad: jest.fn(),
}))

jest.mock('utils/format/formatNumber', () => ({
  formattedNum: jest.fn(),
}))

jest.mock('utils/tokenSymbolText', () => ({
  tokenSymbolText: jest.fn(),
}))

const wrapper = ({ children }: { children: React.ReactNode }) => {
  return <V2V3CurrencyProvider>{children}</V2V3CurrencyProvider>
}

describe('useTokensPerEth', () => {
  const mockUseProjectContext = {
    fundingCycle: { weight: BigNumber.from(1000000000000000) },
    fundingCycleMetadata: { reservedRate: BigNumber.from('1') },
    tokenSymbol: 'mockTokenSymbol',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useProjectContext as jest.Mock).mockReturnValue(mockUseProjectContext)
    ;(useWeiConverter as jest.Mock).mockReturnValue(BigNumber.from('100000000'))
    ;(weightAmountPermyriad as jest.Mock).mockReturnValue(BigNumber.from('100'))
    ;(formattedNum as jest.Mock).mockReturnValue('100')
    ;(tokenSymbolText as jest.Mock).mockReturnValue('mockTokenSymbol')
    ;(useCurrencyConverter as jest.Mock).mockReturnValue({
      usdToWei: jest.fn().mockReturnValue(BigNumber.from('1000000')),
    })
  })

  it('returns expected data for valid eth amount', () => {
    const { result } = renderHook(
      () => useTokensPerEth({ amount: '1', currency: 'eth' }),
      { wrapper },
    )

    expect(result.current).toHaveProperty('receivedTickets')
    expect(result.current).toHaveProperty('receivedTokenSymbolText')
    expect(result.current).toHaveProperty('currencyText')
  })

  it('returns expected data for valid usd amount', () => {
    const { result } = renderHook(
      () => useTokensPerEth({ amount: '1', currency: 'usd' }),
      { wrapper },
    )

    expect(result.current).toEqual({
      receivedTickets: '100',
      receivedTokenSymbolText: 'mockTokenSymbol',
      currencyText: 'USD',
    })
  })

  it('returns default when wei is 0', () => {
    ;(useWeiConverter as jest.Mock).mockReturnValue(BigNumber.from('0'))
    const { result } = renderHook(
      () => useTokensPerEth({ amount: 'not a number', currency: 'usd' }),
      { wrapper },
    )

    expect(result.current).toEqual({
      receivedTickets: '100',
      receivedTokenSymbolText: 'mockTokenSymbol',
      currencyText: 'USD',
    })
  })
})
