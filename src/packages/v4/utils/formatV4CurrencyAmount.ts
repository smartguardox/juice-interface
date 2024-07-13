import {
  CURRENCY_METADATA,
  PRECISION_ETH,
  PRECISION_USD,
} from 'constants/currency'
import { formatAmount, formatAmountWithScale } from '../../../utils/format/formatAmount'
import { V4CurrencyOption } from '../models/v4CurrencyOption'
import { V4_CURRENCY_ETH, V4CurrencyName } from './currency'

/**
 * Format the input amount with the currency.
 *
 * For example, if using `V4_CURRENCY_USD` with an amount of 550.1 the format
 * will be `"$550.1 USD"`.
 * @returns
 */
export const formatCurrencyAmount = ({
  amount,
  currency = V4_CURRENCY_ETH,
  withScale = false,
}: {
  amount: number | string | undefined
  currency: V4CurrencyOption | undefined
  withScale?: boolean
}) => {
  const currencyName = V4CurrencyName(currency)
  if (!currencyName) return

  const currencyMetadata = CURRENCY_METADATA[currencyName]
  let formattedAmount
  if (withScale) {
    formattedAmount = amount !== undefined ? formatAmountWithScale(amount) : '0'
  } else {
    formattedAmount =
      amount !== undefined
        ? formatAmount(amount, {
            maximumFractionDigits:
              currency === V4_CURRENCY_ETH ? PRECISION_ETH : PRECISION_USD,
          })
        : '0'
  }
  return `${currencyMetadata.symbol}${formattedAmount}`
}
