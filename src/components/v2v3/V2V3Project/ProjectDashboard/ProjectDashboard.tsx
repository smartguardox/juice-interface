import { Footer } from 'components/Footer/Footer'
import { TransactionProvider } from 'contexts/Transaction/TransactionProvider'
import { Provider } from 'react-redux'
import { twMerge } from 'tailwind-merge'
import { BlockedProjectBanner } from './components/BlockedProjectBanner'
import { CoverPhoto } from './components/CoverPhoto/CoverPhoto'
import { FundingCycleCountdownProvider } from './components/FundingCycleCountdown/FundingCycleCountdownProvider'
import { PayRedeemCard } from './components/PayRedeemCard'
import { ProjectHeader } from './components/ProjectHeader/ProjectHeader'
import { ProjectHeaderCountdown } from './components/ProjectHeaderCountdown'
import { ProjectTabs } from './components/ProjectTabs/ProjectTabs'
import { ProjectUpdatesProvider } from './components/ProjectUpdatesProvider/ProjectUpdatesProvider'
import { ReduxProjectCartProvider } from './components/ReduxProjectCartProvider'
import { SuccessPayView } from './components/SuccessPayView/SuccessPayView'
import { useProjectPageQueries } from './hooks/useProjectPageQueries'
import store from './redux/store'

export const ProjectDashboard = () => {
  const { projectPayReceipt } = useProjectPageQueries()

  return (
    <Wrapper>
      <div className="flex w-full flex-col items-center pb-48">
        {projectPayReceipt !== undefined ? (
          <SuccessPayView />
        ) : (
          <>
            <div className="relative w-full">
              <CoverPhoto />
              <ProjectHeaderCountdown />
            </div>
            <div className="flex w-full justify-center md:px-6">
              <div className="flex w-full max-w-6xl flex-col">
                <ProjectHeader className="mt-12 px-4 md:mt-4 md:px-0" />
                <BlockedProjectBanner className="mt-10" />
                <div
                  className={twMerge(
                    'mx-auto w-full min-w-0 max-w-xl px-4 md:px-0',
                    '[@media(min-width:960px)]:flex [@media(min-width:960px)]:max-w-6xl [@media(min-width:960px)]:justify-between [@media(min-width:960px)]:gap-x-8',
                  )}
                >
                  <PayRedeemCard
                    className={twMerge(
                      'mt-10 flex-1',
                      '[@media(min-width:960px)]:order-last [@media(min-width:960px)]:min-w-[340px] [@media(min-width:960px)]:max-w-md',
                    )}
                  />
                  <ProjectTabs
                    className={twMerge(
                      'mt-10 w-full',
                      '[@media(min-width:960px)]:order-first [@media(min-width:960px)]:max-w-[596px]',
                    )}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </Wrapper>
  )
}

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Provider store={store}>
      <TransactionProvider>
        <FundingCycleCountdownProvider>
          <ReduxProjectCartProvider>
            <ProjectUpdatesProvider>{children}</ProjectUpdatesProvider>
          </ReduxProjectCartProvider>
        </FundingCycleCountdownProvider>
      </TransactionProvider>
    </Provider>
  )
}
