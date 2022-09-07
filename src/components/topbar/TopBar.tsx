import Branding from "../utils/Branding";
import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import WalletOptionsPopUp from "../dialogs/WalletOptions";
import AppContext from "../utils/AppContext";
import LogoutPop from "../dialogs/LogoutPop";

const TopBar = () => {

	const route = useRouter();
	const [clientLoaded, setClientLoaded] = useState(false);

	useEffect(() => {
		setClientLoaded(true);
	}, [])

	const { loggedIn, t_connected, t_handle, walletAddress } = useContext(AppContext);

	if (!clientLoaded) {
		return <></>
	}

	return (
		<nav className='flex items-center justify-between px-4 lg:px-0'>
			<button onClick={() => {
				if (route.pathname !== "/") {
					route.back()
				}
			}} className={`text-[#616162]  ${route.pathname === '/' ? 'opacity-0 cursor-default' : '' }  text-xs sm:text-sm text-left font-semibold w-[20%]`}>
				&larr; {route.pathname === '/' ? 'AGORA' : 'Back'}
			</button>
			{ !route.asPath.includes('create') && <Branding />}
			{loggedIn && 
			<LogoutPop />
			}

			{!loggedIn && <div className='cursor-default flex items-center justify-end gap-2 text-[#616162] text-sm font-semibold w-[20%]'>
				{/* <button onClick={handleConnectWallet} className='text-white font-bold sm:text-xs hover:text-gradient'>Connect Wallet</button> */}
				<WalletOptionsPopUp />
			</div>}
			{/* {!user.isLoggedIn && <div className='cursor-default flex sm:hidden items-center justify-end gap-2 text-[#616162] text-sm font-semibold w-[20%]'>
				<button onClick={handleConnectWallet} className='button-i'><Wallet1 size={20} /></button>
			</div>} */}
		</nav>
	);
}

export default TopBar;