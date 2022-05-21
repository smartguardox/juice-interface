import { BigNumber } from '@ethersproject/bignumber'
import { Split } from 'models/v2/splits'

import {
  formatSplitPercent,
  preciseFormatSplitPercent,
  splitPercentFrom,
} from './math'

/**
 * Gets distribution amount from percent of the distribution limit and then applies
 * the protocol fee
 * @param percent {float} - value as a percentage.
 * @param distributionLimit string (hexString)
 * @param feePercentage string (hexString)
 * @returns {number} distribution amount
 */
export function getDistributionAmountFromPercentAfterFee({
  percent,
  distributionLimit,
  feePercentage,
}: {
  percent: number
  distributionLimit: string
  feePercentage: string
}) {
  const amountBeforeFee = amountFromPercent({
    percent,
    amount: distributionLimit,
  })

  if (!amountBeforeFee) return

  return parseFloat(
    (
      amountBeforeFee -
      (amountBeforeFee * parseFloat(feePercentage)) / 100
    ).toFixed(4),
  )
}

/**
 * Gets amount from percent of a bigger amount (rounded to 4dp)
 * @param percent {float} - value as a percentage.
 * @param amount string (hexString)
 * @returns {number} distribution amount
 */
export function amountFromPercent({
  percent,
  amount,
}: {
  percent: number
  amount: string
}) {
  return (percent / 100) * parseFloat(amount)
}

/**
 * Gets split percent from split amount and the distribution limit
 * @param percent {float} - value as a percentage.
 * @param distributionLimit number
 * @returns {number} percent as an actual percentage of distribution limit (/100)
 */
export function getDistributionPercentFromAmount({
  amount, // Distribution amount before fee
  distributionLimit,
}: {
  amount: number
  distributionLimit: number
}) {
  // return parseFloat(((amount / distributionLimit) * 100).toFixed(9))
  return splitPercentFrom((amount / distributionLimit) * 100).toNumber()
}

/**
 * Calculates sum of all split percentages
 * @param splits {Split[]} - list of splits
 * @returns {number} sum of all split percentanges
 */
export function getTotalSplitsPercentage(splits: Split[]) {
  return splits.reduce(
    (acc, curr) =>
      acc + parseFloat(formatSplitPercent(BigNumber.from(curr.percent))),
    0,
  )
}

/**
 * Calculates sum of all split amounts based on current distribution limit
 * @param splits {Split[]} - list of splits
 * @returns {number} sum of all split amounts
 */
export function sumOfPayoutSplitAmounts({
  splits,
  distributionLimit,
}: {
  splits: Split[]
  distributionLimit: number
}) {
  return (distributionLimit * getTotalSplitsPercentage(splits)) / 100
}

/**
 * Adjusts exist split percents to stay the same amount when distribution limit is changes
 * @param splits {Split[]} - list of current splits to have their percents adjusted
 * @param oldDistributionLimit {string} - string of the old distribution limit number (e.g. '1')
 * @param newDistributionLimit {string} - string of the new distribution limit number
 * @returns {Split[]} splits with their percents adjusted
 */
export function adjustedSplitPercents({
  splits,
  oldDistributionLimit,
  newDistributionLimit,
}: {
  splits: Split[]
  oldDistributionLimit: string
  newDistributionLimit: string
}) {
  let adjustedSplits: Split[] = []
  splits.forEach((split: Split) => {
    const currentAmount = amountFromPercent({
      percent: parseFloat(formatSplitPercent(BigNumber.from(split.percent))),
      amount: oldDistributionLimit,
    })

    const newPercent = getDistributionPercentFromAmount({
      amount: currentAmount,
      distributionLimit: parseFloat(newDistributionLimit),
    })
    const adjustedSplit = {
      beneficiary: split.beneficiary,
      percent: newPercent,
      preferClaimed: split.preferClaimed,
      lockedUntil: split.lockedUntil,
      projectId: split.projectId,
      allocator: split.allocator,
    } as Split
    adjustedSplits?.push(adjustedSplit)
  })
  return adjustedSplits
}

/**
 * Derives the new distribution limit when a split amount is altered or added
 * @param editingSplitPercent {number} - percent of the split being edited (0 if adding a split)
 * @param newDistributionLimit {string} - string of the new distribution limit number (e.g. '1')
 * @returns {number} newDistributionLimit
 */
export function getNewDistributionLimit({
  editingSplitPercent,
  newSplitAmount,
  currentDistributionLimit,
}: {
  editingSplitPercent: number // percent per billion
  newSplitAmount: number
  currentDistributionLimit: string
}) {
  const previousSplitAmount = amountFromPercent({
    percent: preciseFormatSplitPercent(editingSplitPercent),
    amount: currentDistributionLimit,
  }) // will be 0 when adding split but an actual amount when reconfiging or deleting

  const newDistributionLimit =
    parseFloat(currentDistributionLimit) - previousSplitAmount + newSplitAmount

  return parseFloat(newDistributionLimit.toFixed(4)) // round to 4dp
}
