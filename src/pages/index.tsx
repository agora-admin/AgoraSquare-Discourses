import type { NextPage } from 'next'
import Head from 'next/head'
import DiscourseLongList from '../components/cards/DiscourseLongList'
import Layout from '../components/layout/Layout'
import { useEffect } from 'react'
import { useLazyQuery, useQuery } from '@apollo/client'
import { GET_DISCOURSES, GET_DISCOURSES_BY_CHAIN } from '../lib/queries'
import LoadingSpinner from '../components/utils/LoadingSpinner'
import TopBar from '../components/topbar/TopBar'
import BDecoration from '../components/utils/BDecoration'
import { supportedChainIds } from '../Constants'
import HeroCard from '../components/actions/HeroCard'

const Home: NextPage = () => {
	const { loading: dLoading, error: dError, data: dData } = useQuery(GET_DISCOURSES_BY_CHAIN, {
		variables: {
			chainId: supportedChainIds
		}
	});
	
	const [refetch] = useLazyQuery(GET_DISCOURSES);

	useEffect(() => {
		refetch();
	}, [])
	
	return (
		<div className="w-full h-screen overflow-x-clip">
			<Head>
				<title>Discourses by AGORA SQUARE</title>
				<meta name="description" content="Generated by create next app" />
				<link rel="icon" href="/discourse_logo_fav.svg" />
			</Head>
			<Layout >
				<BDecoration />
				<div className='w-full min-h-screen flex flex-col py-10 sm:px-0 gap-4 z-10'>
					{/* TopSection */}
					<TopBar showLogo={true} />

					{/* Body */}
					<HeroCard />
					
					{/* list */}
					<div className='relative w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 grid-flow-row items-center px-4 sm:px-10 md2:px-0 gap-4'>
						{
							dData && dData.getDiscoursesByChainID.length > 0 &&
							[].concat(dData.getDiscoursesByChainID)
							.filter((e:any) => !e.disable)
							.sort(
								(a: any, b: any) => +b.initTS - +a.initTS
							).map((data: any) => (
								<DiscourseLongList key={data.id} data={data} />
							))
						}

						{
							dData && dData.getDiscoursesByChainID.length == 0 &&
							<div className='absolute inset-0 top-10 w-full py-4 flex items-center justify-center mt-10'>
								<img className='w-36' src="/404_discourses.png" alt="" />
							</div>
						}
						{
							dLoading &&
							<div className='w-full absolute inset-0 top-10 py-4 flex items-center justify-center'>
								<LoadingSpinner strokeColor='#ffffff' />
							</div>
						}
						{
							dError &&
							<div className='absolute inset-0 top-10 w-full py-4 flex items-center justify-center'>
								<p className='text-white/30 text-sm'>Error gettting Discourses</p>
							</div>
						}
					</div>
				</div>
			</Layout>
		</div>
	)
}

export default Home
