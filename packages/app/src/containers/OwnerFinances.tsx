import { BigNumber } from '@ethersproject/bignumber'
import { Button, Col, Divider, Input, Row, Space } from 'antd'
import React, { useState } from 'react'
import Web3 from 'web3'

import BudgetDetail from '../components/BudgetDetail'
import BudgetsHistory from '../components/BudgetsHistory'
import { CardSection } from '../components/CardSection'
import useContractReader from '../hooks/ContractReader'
import { Budget } from '../models/budget'
import { Contracts } from '../models/contracts'
import { Transactor } from '../models/transactor'
import { addressExists } from '../utils/addressExists'
import { budgetsEq } from '../utils/budgetsEq'
import { erc20Contract } from '../utils/erc20Contract'
import ReconfigureBudget from './ReconfigureBudget'

export default function OwnerFinances({
  currentBudget,
  userAddress,
  contracts,
  transactor,
  owner,
  onNeedProvider,
  ticketAddress,
}: {
  currentBudget?: Budget
  userAddress?: string
  contracts?: Contracts
  transactor?: Transactor
  owner?: string
  ticketAddress?: string
  onNeedProvider: () => Promise<void>
}) {
  const [payerTickets, setPayerTickets] = useState<BigNumber>()
  const [ownerTickets, setOwnerTickets] = useState<BigNumber>()
  const [loadingPayOwner, setLoadingPayOwner] = useState<boolean>()
  const [payOwnerAmount, setPayOwnerAmount] = useState<number>(0)
  const [showReconfigureModal, setShowReconfigureModal] = useState<boolean>()

  const wantTokenSymbol = useContractReader<string>({
    contract: erc20Contract(currentBudget?.want),
    functionName: 'symbol',
  })

  const ticketSymbol = useContractReader<string>({
    contract: erc20Contract(ticketAddress),
    functionName: 'symbol',
  })

  const queuedBudget = useContractReader<Budget>({
    contract: contracts?.BudgetStore,
    functionName: 'getQueuedBudget',
    args: [owner],
    shouldUpdate: budgetsEq,
  })

  const isOwner = owner === userAddress

  function updatePayOwnerAmount(amount: number) {
    if (!currentBudget) return

    const ticketsRatio = (percentage: BigNumber) =>
      percentage &&
      currentBudget.weight
        .mul(percentage)
        .div(currentBudget.target)
        .div(100)

    setPayOwnerAmount(amount ?? 0)

    setOwnerTickets(ticketsRatio(currentBudget.o).mul(amount))
    setPayerTickets(
      ticketsRatio(BigNumber.from(100).sub(currentBudget.o ?? 0)).mul(amount),
    )
  }

  function payOwner() {
    if (!transactor || !contracts || !currentBudget) return onNeedProvider()

    setLoadingPayOwner(true)

    const eth = new Web3(Web3.givenProvider).eth

    const amount =
      payOwnerAmount !== undefined
        ? eth.abi.encodeParameter('uint256', payOwnerAmount)
        : undefined

    console.log('🧃 Calling Juicer.sustain(owner, amount, userAddress)', {
      owner: currentBudget.owner,
      amount,
      userAddress,
    })

    transactor(
      contracts.Juicer.payOwner(currentBudget.owner, amount, userAddress),
      () => {
        setPayOwnerAmount(0)
        setLoadingPayOwner(false)
      },
      () => {
        setLoadingPayOwner(false)
      },
    )
  }

  const spacing = 30

  return (
    <Space size={spacing} direction="vertical">
      <Row gutter={spacing}>
        <Col span={12}>
          {
            <CardSection header="Active Budget">
              {currentBudget ? (
                <BudgetDetail
                  budget={currentBudget}
                  userAddress={userAddress}
                  contracts={contracts}
                  transactor={transactor}
                  onNeedProvider={onNeedProvider}
                />
              ) : null}
              <Divider style={{ margin: 0 }} />
              <Space
                style={{
                  width: '100%',
                  justifyContent: 'flex-end',
                  padding: 25,
                }}
              >
                <Input
                  name="sustain"
                  placeholder="0"
                  suffix={wantTokenSymbol}
                  type="number"
                  onChange={e =>
                    updatePayOwnerAmount(parseFloat(e.target.value))
                  }
                />
                <Button
                  type="primary"
                  onClick={payOwner}
                  loading={loadingPayOwner}
                >
                  Pay owner
                </Button>
              </Space>
              {addressExists(ticketAddress) ? (
                <div>
                  <div>
                    {ownerTickets?.toString()} {ticketSymbol} reserved for owner
                  </div>
                  <div>
                    Receive {payerTickets?.toString()} {ticketSymbol}
                  </div>
                </div>
              ) : null}
            </CardSection>
          }
        </Col>

        <Col span={12}>
          <CardSection header="Next Budget">
            {queuedBudget ? (
              <BudgetDetail
                userAddress={userAddress}
                budget={queuedBudget}
                contracts={contracts}
                transactor={transactor}
                onNeedProvider={onNeedProvider}
              />
            ) : (
              <div style={{ padding: 25 }}>No upcoming budgets</div>
            )}
          </CardSection>
          {isOwner ? (
            <div style={{ marginTop: 40, textAlign: 'right' }}>
              <Button onClick={() => setShowReconfigureModal(true)}>
                Reconfigure budget
              </Button>
              <ReconfigureBudget
                transactor={transactor}
                contracts={contracts}
                currentValue={currentBudget}
                visible={showReconfigureModal}
                onCancel={() => setShowReconfigureModal(false)}
              />
            </div>
          ) : null}
        </Col>
      </Row>

      <Row gutter={spacing}>
        <Col span={12}>
          <CardSection header="Budget History">
            <BudgetsHistory
              startId={currentBudget?.previous}
              contracts={contracts}
              transactor={transactor}
              userAddress={userAddress}
              onNeedProvider={onNeedProvider}
            />
          </CardSection>
        </Col>
      </Row>
    </Space>
  )
}
