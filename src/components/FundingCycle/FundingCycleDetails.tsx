import { WarningOutlined } from '@ant-design/icons'
import { parseEther } from '@ethersproject/units'
import { t, Trans } from '@lingui/macro'
import { Descriptions, Tooltip } from 'antd'
import CurrencySymbol from 'components/shared/CurrencySymbol'

import { ProjectContext } from 'contexts/projectContext'
import { ThemeContext } from 'contexts/themeContext'
import { CurrencyOption } from 'models/currency-option'
import { FundingCycle } from 'models/funding-cycle'
import { useContext } from 'react'
import { formatDate } from 'utils/formatDate'
import { formatWad, fromPerbicent, fromPermille } from 'utils/formatNumber'
import {
  decodeFundingCycleMetadata,
  getUnsafeFundingCycleProperties,
  hasFundingTarget,
  isRecurring,
} from 'utils/fundingCycle'
import { weightedRate } from 'utils/math'

import { getBallotStrategyByAddress } from 'constants/ballotStrategies/getBallotStrategiesByAddress'

import TooltipLabel from '../shared/TooltipLabel'

export default function FundingCycleDetails({
  fundingCycle,
}: {
  fundingCycle: FundingCycle | undefined
}) {
  const {
    theme: { colors },
  } = useContext(ThemeContext)

  const { tokenSymbol } = useContext(ProjectContext)

  if (!fundingCycle) return null

  const formattedStartTime = formatDate(fundingCycle.start.mul(1000))

  const secondsInDay = 24 * 60 * 60

  const formattedEndTime = formatDate(
    fundingCycle.start.add(fundingCycle.duration.mul(secondsInDay)).mul(1000),
  )

  const metadata = decodeFundingCycleMetadata(fundingCycle.metadata)
  const ballotStrategy = getBallotStrategyByAddress(fundingCycle.ballot)
  const unsafeFundingCycleProperties =
    getUnsafeFundingCycleProperties(fundingCycle)

  const WarningText = ({
    text,
    tooltipTitle,
    showWarning,
  }: {
    text: string
    tooltipTitle?: string
    showWarning?: boolean
  }) => {
    return showWarning ? (
      <Tooltip title={tooltipTitle}>
        <span style={{ fontWeight: 500 }}>{text} </span>
        <span style={{ color: colors.text.warn }}>
          <WarningOutlined />
        </span>
      </Tooltip>
    ) : (
      <span>{text}</span>
    )
  }

  return (
    <div>
      <Descriptions
        labelStyle={{ fontWeight: 600 }}
        size="small"
        column={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 1, xxl: 2 }}
      >
        {
          <Descriptions.Item label={t`Target`}>
            {hasFundingTarget(fundingCycle) ? (
              <>
                <CurrencySymbol
                  currency={fundingCycle.currency.toNumber() as CurrencyOption}
                />
                {formatWad(fundingCycle.target)}
              </>
            ) : (
              t`No target`
            )}
          </Descriptions.Item>
        }

        <Descriptions.Item label={t`Duration`}>
          {fundingCycle.duration.gt(0) ? (
            t`${fundingCycle.duration.toString()} days`
          ) : (
            <WarningText
              showWarning={true}
              text={t`Not set`}
              tooltipTitle={t`The project owner may reconfigure this funding cycle at any time, without notice.`}
            />
          )}
        </Descriptions.Item>

        {fundingCycle.duration.gt(0) && (
          <Descriptions.Item label={t`Start`}>
            {formattedStartTime}
          </Descriptions.Item>
        )}

        {fundingCycle.duration.gt(0) && (
          <Descriptions.Item label={t`End`}>
            {formattedEndTime}
          </Descriptions.Item>
        )}

        {isRecurring(fundingCycle) && (
          <Descriptions.Item
            label={
              <TooltipLabel
                label={t`Discount rate`}
                tip={t`The ratio of tokens rewarded per payment amount will decrease by this percentage with each new funding cycle. A higher discount rate will incentivize supporters to pay your project earlier than later.`}
              />
            }
          >
            {fromPermille(fundingCycle.discountRate)}%
          </Descriptions.Item>
        )}

        {isRecurring(fundingCycle) && (
          <Descriptions.Item
            span={2}
            label={
              <TooltipLabel
                label={t`Bonding curve rate`}
                tip={t`This rate determines the amount of overflow that each token can be redeemed for at any given time. On a lower bonding curve, redeeming a token increases the value of each remaining token, creating an incentive to hodl tokens longer than others. A bonding curve of 100% means all tokens will have equal value regardless of when they are redeemed.`}
              />
            }
          >
            {fromPerbicent(metadata?.bondingCurveRate)}%
          </Descriptions.Item>
        )}

        <Descriptions.Item
          label={
            <TooltipLabel
              label={t`Reserved ${tokenSymbol ?? 'tokens'}`}
              tip={t`Whenever someone pays your project, this percentage of tokens will be reserved and the rest will go to the payer. Reserve tokens are reserved for the project owner by default, but can also be allocated to other wallet addresses by the owner. Once tokens are reserved, anyone can "mint" them, which distributes them to their intended receivers.`}
            />
          }
        >
          <WarningText
            showWarning={unsafeFundingCycleProperties.metadataReservedRate}
            text={`${fromPerbicent(metadata?.reservedRate)}%`}
            tooltipTitle={
              metadata?.reservedRate === 200
                ? t`Contributors will not receive any tokens in exchange for paying this project.`
                : t`Contributors will receive a relatively small portion of tokens in exchange for paying this project.`
            }
          />
        </Descriptions.Item>

        <Descriptions.Item
          label={
            <TooltipLabel
              label={t`Issue rate`}
              tip={t`${
                tokenSymbol ?? 'Tokens'
              } received per ETH paid to the treasury. This can change over time according to the discount rate and reserved tokens amount of future funding cycles.`}
            />
          }
          span={2}
        >
          {formatWad(weightedRate(fundingCycle, parseEther('1'), 'payer'), {
            precision: 0,
          })}{' '}
          {metadata?.reservedRate
            ? t`(+${formatWad(
                weightedRate(fundingCycle, parseEther('1'), 'reserved'),
                {
                  precision: 0,
                },
              )} reserved)`
            : ''}{' '}
          <Trans>{tokenSymbol ?? 'tokens'}/ETH</Trans>
        </Descriptions.Item>

        {/* <Descriptions.Item
          span={2}
          label={
            <TooltipLabel
              label="Burn rate"
              tip={`The amount of ${
                tokenSymbol ? tokenSymbol + ' token' : 'token'
              } that must be burned in exchange for one ETH of overflow. This can change over time according to the bonding curve of future funding cycles.`}
            />
          }
        >
          {redeemRate && redeemRate?.gt(0)
            ? formattedNum(parseWad(1).div(redeemRate))
            : '--'}{' '}
          {tokenSymbol ?? 'tokens'}/ETH
        </Descriptions.Item> */}

        <Descriptions.Item
          span={2}
          label={
            <TooltipLabel
              label={t`Token minting`}
              tip={t`When token minting is allowed, the owner of this project has permission to mint any number of tokens to any address at their discretion. This has the effect of diluting all current token holders, without increasing the project's treasury balance. The project owner can reconfigure this along with all other properties of the funding cycle.`}
            />
          }
        >
          {metadata?.ticketPrintingIsAllowed ? (
            <WarningText
              showWarning={true}
              text={t`Allowed`}
              tooltipTitle={t`The project owner may mint any supply of tokens at any time, diluting the token share of all existing contributors.`}
            />
          ) : (
            t`Disabled`
          )}
        </Descriptions.Item>

        <Descriptions.Item
          span={2}
          label={<TooltipLabel label={t`Payments`} />}
        >
          {metadata?.payIsPaused ? t`Paused` : t`Enabled`}
        </Descriptions.Item>
      </Descriptions>

      <div>
        <span style={{ fontWeight: 600, color: colors.text.secondary }}>
          <TooltipLabel
            label={t`Reconfiguration strategy`}
            tip={t`Rules for determining how funding cycles can be reconfigured.`}
          />
          :
        </span>{' '}
        <WarningText
          showWarning={unsafeFundingCycleProperties.ballot}
          text={ballotStrategy.name}
          tooltipTitle={t`The upcoming funding cycle can be reconfigured by the project owner moments before a new cycle begins. This makes it possible to take advantage of contributors, for example by withdrawing all overflow.`}
        />
        <div style={{ color: colors.text.secondary }}>
          <div style={{ fontSize: '0.7rem' }}>
            <Trans>Address</Trans>: {ballotStrategy.address}
            <br />
            {ballotStrategy.description}
          </div>
        </div>
      </div>
    </div>
  )
}
