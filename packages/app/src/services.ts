import Notify from 'bnc-notify'
import Onboard from 'bnc-onboard'

const networkId = 4
// TODO(odd-amphora): Replace with our API key.
const rpcUrl = 'https://rinkeby.infura.io/v3/cea9deb6467748b0b81b920b005c10c1'
const dappId = process.env.REACT_APP_BLOCKNATIVE_API_KEY;

export function initOnboard(subscriptions) {
  return Onboard({
    dappId,
    hideBranding: true,
    networkId,
    // darkMode: true,
    subscriptions,
    walletSelect: {
      wallets: [
        { walletName: 'metamask' },
        {
          walletName: 'trezor',
          appUrl: 'https://reactdemo.blocknative.com',
          email: 'aaron@blocknative.com',
          rpcUrl
        },
        {
          walletName: 'ledger',
          rpcUrl
        },
        {
          walletName: 'walletConnect',
          infuraKey: 'cea9deb6467748b0b81b920b005c10c1'
        },
        { walletName: 'cobovault', appName: 'React Demo', rpcUrl },
        { walletName: 'keystone', appName: 'React Demo', rpcUrl },
        { walletName: 'keepkey', rpcUrl },
        {
          walletName: 'lattice',
          appName: 'Onboard Demo',
          rpcUrl
        },
        { walletName: 'coinbase' },
        { walletName: 'status' },
        { walletName: 'walletLink', rpcUrl },
        {
          walletName: 'portis',
          apiKey: 'b2b7586f-2b1e-4c30-a7fb-c2d1533b153b'
        },
        { walletName: 'fortmatic', apiKey: 'pk_test_886ADCAB855632AA' },
        { walletName: 'torus' },
        { walletName: 'trust', rpcUrl },
        { walletName: 'opera' },
        { walletName: 'operaTouch' },
        { walletName: 'imToken', rpcUrl },
        { walletName: 'meetone' },
        { walletName: 'mykey', rpcUrl },
        { walletName: 'wallet.io', rpcUrl },
        { walletName: 'huobiwallet', rpcUrl },
        { walletName: 'alphawallet', rpcUrl },
        { walletName: 'hyperpay' },
        { walletName: 'atoken' },
        { walletName: 'liquality' },
        { walletName: 'frame' },
        { walletName: 'tokenpocket', rpcUrl },
        { walletName: 'authereum', disableNotifications: true },
        { walletName: 'ownbit' },
        { walletName: 'gnosis' },
        { walletName: 'dcent' },
        { walletName: 'bitpie' },
        { walletName: 'xdefi' },
        { walletName: 'binance' },
        { walletName: 'tp' },
      ]
    },
    walletCheck: [
      { checkName: 'derivationPath' },
      { checkName: 'connect' },
      { checkName: 'accounts' },
      { checkName: 'network' },
      { checkName: 'balance', minimumBalance: '100000' }
    ]
  })
}

export function initNotify() {
  return Notify({
    dappId,
    networkId,
    onerror: error => console.log(`Notify error: ${error.message}`)
  })
}