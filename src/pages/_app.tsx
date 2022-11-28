import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ApolloProvider } from '@apollo/client'
import { useApollo } from '../lib/apollo'
import { SessionProvider } from 'next-auth/react'
import { HMSRoomProvider } from '@100mslive/react-sdk';
import { chain, configureChains, createClient, WagmiConfig } from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { infuraProvider } from 'wagmi/providers/infura';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { InjectedConnector } from 'wagmi/connectors/injected';
import SEOHome from '../components/utils/SEOHome'
import ContextWrapper from '../components/utils/ContextWrapper'
import { rpcUrl } from '../Constants'
import Script from 'next/script'

const { provider, chains } = configureChains(
  [ chain.polygonMumbai,chain.polygon ],
  [
    alchemyProvider({ alchemyId: 'Gqd71GlllOjZhCCq1FjqzKofdLig5Tww' }),
    infuraProvider({ infuraId: 'a4d6ff8d0a7c4b93a9a4ac41adc048c8' }),
    jsonRpcProvider({
      rpc: (chain) => {
        return rpcUrl(chain.id)
      }
    })
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
    new MetaMaskConnector({
      chains,
      options: {
        shimDisconnect: true
      }
    }),
    new InjectedConnector({
      chains,
    })
  ]
}

const wagmiClient = createClient({
  autoConnect: true,
  provider,
  connectors
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
