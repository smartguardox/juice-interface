import { Button, Modal } from 'antd'
import CurrencySymbol from 'components/shared/CurrencySymbol'
import Mod from 'components/shared/Mod'
import TooltipLabel from 'components/shared/TooltipLabel'
import { ThemeContext } from 'contexts/themeContext'
import { UserContext } from 'contexts/userContext'
import { BigNumber, constants } from 'ethers'
import useContractReader from 'hooks/ContractReader'
import { ContractName } from 'models/contract-name'
import { CurrencyOption } from 'models/currency-option'
import { FundingCycle } from 'models/funding-cycle'
import { PayoutMod } from 'models/mods'
import { useContext, useLayoutEffect, useMemo, useState } from 'react'
import { formatWad, fromPermyriad, fromWad } from 'utils/formatNumber'

import ProjectPayoutMods from '../shared/formItems/ProjectPayoutMods'

export default function PayoutModsList({
  mods,
  fundingCycle,
  projectId,
  isOwner,
}: {
  mods: PayoutMod[] | undefined
  fundingCycle:
    | Pick<FundingCycle, 'target' | 'currency' | 'configured'>
    | undefined
  projectId: BigNumber | undefined
  isOwner: boolean | undefined
}) {
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [editingMods, setEditingMods] = useState<PayoutMod[]>()
  const { transactor, contracts } = useContext(UserContext)

  const { editableMods, lockedMods } = useMemo(() => {
    const now = new Date().valueOf() / 1000

    return {
      editableMods:
        mods?.filter(m => !m.lockedUntil || m.lockedUntil < now) ?? [],
      lockedMods: mods?.filter(m => m.lockedUntil && m.lockedUntil > now) ?? [],
    }
  }, [mods])

  const {
    theme: { colors },
  } = useContext(ThemeContext)

  const adminFeePercent = useContractReader<BigNumber>({
    contract: ContractName.TerminalV1,
    functionName: 'fee',
  })

  useLayoutEffect(() => setEditingMods(editableMods), [editableMods])

  function setMods() {
    if (
      !transactor ||
      !contracts ||
      !projectId ||
      !fundingCycle ||
      !editingMods
    )
      return

    setLoading(true)

    transactor(
      contracts.ModStore,
      'setPayoutMods',
      [
        projectId.toHexString(),
        fundingCycle.configured.toHexString(),
        [...lockedMods, ...editingMods].map(m => ({
          preferUnstaked: false,
          percent: BigNumber.from(m.percent).toHexString(),
          lockedUntil: BigNumber.from(m.lockedUntil ?? 0).toHexString(),
          beneficiary: m.beneficiary || constants.AddressZero,
          projectId: m.projectId || BigNumber.from(0).toHexString(),
          allocator: constants.AddressZero,
        })),
      ],
      {
        onDone: () => setLoading(false),
        onConfirmed: () => {
          setModalVisible(false)
          setEditingMods(editableMods)
        },
      },
    )
  }

  // const modsTotal = mods?.reduce((acc, curr) => acc + curr.percent, 0)

  // console.log('modsTotal', modsTotal)

  if (!fundingCycle) return null

  return (
    <div>
      <TooltipLabel
        label={<h4 style={{ display: 'inline-block' }}>Spending</h4>}
        tip="Available funds are distributed according to any payouts below. The rest will go to the project owner."
      />
      {mods?.length ? (
        mods.map((mod, i) => (
          <div
            key={`${mod.beneficiary ?? mod.percent}-${i}`}
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              marginBottom: 5,
            }}
          >
            <Mod
              mod={mod}
              value={
                <span style={{ fontWeight: 400 }}>
                  {fromPermyriad(mod.percent)}%
                  {!fundingCycle.target.eq(constants.MaxUint256) && (
                    <>
                      {' '}
                      (
                      <CurrencySymbol
                        currency={
                          fundingCycle.currency.toNumber() as CurrencyOption
                        }
                      />
                      {formatWad(
                        fundingCycle.target
                          .mul(mod.percent ?? 0)
                          .div(10000)
                          .mul(BigNumber.from(200).sub(adminFeePercent ?? 0))
                          .div(200),
                      )}
                      )
                    </>
                  )}
                </span>
              }
            />
          </div>
        ))
      ) : (
        <div style={{ color: colors.text.secondary }}>
          100% to project owner
        </div>
      )}

      {fundingCycle && projectId?.gt(0) && isOwner ? (
        <div style={{ marginTop: 10 }}>
          <Button size="small" onClick={() => setModalVisible(true)}>
            Edit payouts
          </Button>
        </div>
      ) : null}

      {fundingCycle ? (
        <Modal
          visible={modalVisible}
          title="Edit payouts"
          onOk={() => setMods()}
          onCancel={() => {
            setEditingMods(mods)
            setModalVisible(false)
          }}
          confirmLoading={loading}
          width={720}
        >
          <div>
            <p>
              Payouts let you commit portions of every withdrawal to other
              Ethereum wallets or Juicebox projects. Use this to pay
              contributors, charities, other projects you depend on, or anyone
              else. Payouts will be distributed automatically whenever a
              withdrawal is made from your project.
            </p>
            <p>
              Payouts are optional. By default, all unallocated revenue will be
              withdrawable to the project owner's wallet.
            </p>
          </div>
          <ProjectPayoutMods
            mods={editingMods}
            lockedMods={lockedMods}
            onModsChanged={setEditingMods}
            target={fromWad(fundingCycle.target)}
            currency={fundingCycle.currency.toNumber() as CurrencyOption}
          />
        </Modal>
      ) : null}
    </div>
  )
}
