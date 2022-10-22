import { SettingOutlined } from '@ant-design/icons'
import { t, Trans } from '@lingui/macro'
import { Form, Space } from 'antd'
import { useWatch } from 'antd/lib/form/Form'
import Callout from 'components/Callout'
import { useModal } from 'hooks/Modal'
import { useContext } from 'react'
import { stopPropagation } from 'react-stop-propagation'
import { useSetCreateFurthestPageReached } from 'redux/hooks/EditingCreateFurthestPageReached'
import { CreateBadge } from '../../CreateBadge'
import { Icons } from '../../Icons'
import { Selection } from '../../Selection'
import { Wizard } from '../../Wizard'
import { PageContext } from '../../Wizard/contexts/PageContext'
import { CustomTokenSettings, DefaultSettingsModal } from './components'
import { useProjectTokensForm } from './hooks/ProjectTokenForm'

export const ProjectTokenPage: React.FC = () => {
  useSetCreateFurthestPageReached('projectToken')
  const { goToNextPage } = useContext(PageContext)
  const { form, initialValues } = useProjectTokensForm()

  const modal = useModal()

  const selection = useWatch('selection', form)
  const isNextEnabled = !!selection

  return (
    <>
      <Form
        form={form}
        initialValues={initialValues}
        name="projectToken"
        colon={false}
        layout="vertical"
        onFinish={goToNextPage}
        scrollToFirstError
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Form.Item noStyle name="selection">
            <Selection defocusOnSelect style={{ width: '100%' }}>
              <Selection.Card
                name="default"
                title={
                  <span>
                    <Trans> Default Token Settings</Trans>{' '}
                    <CreateBadge.Default />
                  </span>
                }
                icon={<Icons.Tokens />}
                description={
                  <Trans>
                    Recommended for new users.{' '}
                    <a onClick={stopPropagation(modal.open)}>View details</a>.
                  </Trans>
                }
              />
              <Selection.Card
                name="custom"
                title={t`Custom Token Settings`}
                icon={<SettingOutlined />}
                description={
                  <Trans>
                    Set custom rules & parameters for your project tokens.
                  </Trans>
                }
              >
                <CustomTokenSettings />
              </Selection.Card>
            </Selection>
          </Form.Item>
          <Callout>
            <Trans>
              Project tokens are not ERC-20 tokens by default. Once you deploy
              your project, you can issue an ERC-20 for your holders to claim.
              This is optional.
            </Trans>
          </Callout>
          <Wizard.Page.ButtonControl isNextEnabled={isNextEnabled} />
        </Space>
      </Form>
      <DefaultSettingsModal
        open={modal.visible}
        onOk={modal.close}
        onCancel={modal.close}
      />
    </>
  )
}
