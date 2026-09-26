import '../styles/globals.css'
import type {AppProps} from 'next/app'
import { ApolloProvider } from '@apollo/client'
import { useApollo } from '../lib/apollo'
import { SessionProvider } from 'next-auth/react'
import { HMSRoomProvider } from '@100mslive/react-sdk';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { polygon, bsc } from 'wagmi/chains'
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { InjectedConnector } from 'wagmi/connectors/injected';
import SEOHome from '../components/utils/SEOHome'
import ContextWrapper from '../components/utils/ContextWrapper'
import { rpcUrl } from '../Constants'
import Script from 'next/script'

// Polygon Mumbai is deliberately absent. Polygon retired the network and Alchemy stopped serving
// `polygon-mumbai.g.alchemy.com`, so `alchemyProvider` derived a host that no longer resolves and
// the WebSocket it opened during `next build` failed with an unhandled ENOTFOUND, killing
// "Collecting page data". Mumbai was already excluded from `supportedChainIds` in `Constants.ts`,
// so the app could never switch to it anyway — this only stops configuring a chain that is gone.
const { provider, chains, webSocketProvider } = configureChains(
  [ polygon, bsc ],
  [
    alchemyProvider({ apiKey: 'Gqd71GlllOjZhCCq1FjqzKofdLig5Tww' }),
    jsonRpcProvider({
      rpc: (chain) => {
        return rpcUrl(chain.id)
      }
    }),
    publicProvider()
  ]
)

const connectors = () => {
  return [
    new WalletConnectConnector({
      chains,
      options: {
        qrcode: true,
      }
    }),
    new MetaMaskConnector({ chains }),
    new InjectedConnector({
      chains,
      options: {
        name: 'Injected',
        shimDisconnect: true,
      }
    })
  ]
}

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider
})

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const apolloClient = useApollo(pageProps.initialApolloState)
  return (
    <>
      <Script strategy="lazyOnload" async src="https://www.googletagmanager.com/gtag/js?id=G-GETMY8D13E"></Script>
      <Script id="google-analytics-script" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-GETMY8D13E');
        `}
      </Script>
      <WagmiConfig client={wagmiClient}>
        <ApolloProvider client={apolloClient}>
          <SessionProvider session={session}>
            <HMSRoomProvider>
              <SEOHome />
              <ContextWrapper>
                <Component {...pageProps} />
              </ContextWrapper>
            </HMSRoomProvider>
          </SessionProvider>
        </ApolloProvider>
      </WagmiConfig>
    </>
  )
}

export default MyApp
