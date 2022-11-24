import { t } from '@lingui/macro'
import { Space } from 'antd'
import { Tab } from 'components/Tab'
import { ProjectCategory } from 'models/project-visibility'
import Link from 'next/link'

const TAB_TYPE_NAMES: { [k in ProjectCategory]: string } = {
  all: t`All`,
  new: t`New`,
  holdings: t`My holdings`,
  myprojects: t`My projects`,
  trending: t`Trending`,
}

const TABS: ProjectCategory[] = [
  'all',
  'trending',
  'new',
  'holdings',
  'myprojects',
]

const ProjectTab = ({
  type,
  isSelected,
}: {
  type: ProjectCategory
  isSelected: boolean
}) => {
  return (
    <Link href={`/projects?tab=${type}`}>
      <a>
        <Tab name={TAB_TYPE_NAMES[type]} isSelected={isSelected} />
      </a>
    </Link>
  )
}

export default function ProjectsTabs({
  selectedTab,
}: {
  selectedTab: ProjectCategory
}) {
  return (
    <Space
      direction="horizontal"
      size="large"
      style={{ flexWrap: 'wrap', rowGap: '1rem' }}
    >
      {TABS.map(type => (
        <ProjectTab type={type} key={type} isSelected={type === selectedTab} />
      ))}
    </Space>
  )
}
