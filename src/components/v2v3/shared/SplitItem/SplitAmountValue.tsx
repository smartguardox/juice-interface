import { DollarCircleOutlined } from '@ant-design/icons'
import { Trans } from '@lingui/macro'
import { Tooltip } from 'antd'
import { AmountInCurrency } from 'components/currency/AmountInCurrency'
import ETHToUSD from 'components/currency/ETHToUSD'
import { CurrencyName } from 'constants/currency'
import { V2V3ProjectContext } from 'contexts/v2v3/Project/V2V3ProjectContext'
import { V2V3CurrencyOption } from 'models/v2v3/currencyOption'
import { useContext } from 'react'
import { formatWad } from 'utils/format/formatNumber'
import { V2V3CurrencyName } from 'utils/v2v3/currency'
import { isJuiceboxProjectSplit } from 'utils/v2v3/distributions'
import { SPLITS_TOTAL_PERCENT, feeForAmount } from 'utils/v2v3/math'
import { SplitProps } from './SplitItem'

export function SplitAmountValue({
  props,
  hideTooltip,
}: {
  props: SplitProps
  hideTooltip?: boolean
}) {
  const { primaryETHTerminalFee } = useContext(V2V3ProjectContext)

  const splitValue = props.totalValue
    ? (props.totalValue * BigInt(props.split.percent)) / SPLITS_TOTAL_PERCENT
    : undefined

  const isJuiceboxProject = isJuiceboxProjectSplit(props.split)
  const hasFee = !isJuiceboxProject && !props.dontApplyFeeToAmount
  const feeAmount = hasFee
    ? feeForAmount(splitValue, primaryETHTerminalFee) ?? BigInt(0)
    : BigInt(0)
  const valueAfterFees = splitValue ? splitValue - feeAmount : 0

  const currencyName = V2V3CurrencyName(
    Number(props.currency) as V2V3CurrencyOption | undefined,
  )

  const createTooltipTitle = (
    curr: CurrencyName | undefined,
    amount: bigint | undefined,
  ) => {
    if (hideTooltip) return undefined
    if (curr === 'ETH' && amount && amount > 0n) {
      return <ETHToUSD ethAmount={amount} />
    }
    return undefined
  }

  return (
    <>
      <Tooltip
        title={
          !!splitValue &&
          !!feeAmount &&
          createTooltipTitle(currencyName, splitValue - feeAmount)
        }
      >
        {valueAfterFees ? (
          <>
            {currencyName ? (
              <AmountInCurrency
                amount={valueAfterFees}
                currency={currencyName}
                hideTooltip={hideTooltip}
              />
            ) : (
              // if no currency, assume its a token with 18 decimals (a wad)
              <>{formatWad(valueAfterFees, { precision: 2 })}</>
            )}
            {props.valueSuffix ? <span> {props.valueSuffix}</span> : null}
          </>
        ) : null}
      </Tooltip>

      {props.showFee && !isJuiceboxProject && (
        <Tooltip
          title={
            <Trans>
              <AmountInCurrency amount={feeAmount} currency={currencyName} />{' '}
              fee
            </Trans>
          }
          className="ml-1"
        >
          <DollarCircleOutlined />
        </Tooltip>
      )}
    </>
  )
}
