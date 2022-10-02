import Branding from "../utils/Branding";
import { useContext } from "react";
import { useRouter } from "next/router";
import WalletOptionsPopUp from "../dialogs/WalletOptions";
import AppContext from "../utils/AppContext";
import LogoutPop from "../dialogs/LogoutPop";

const TopBar = ({showLogo}:{showLogo: boolean}) => {
	const route = useRouter();
	const { loggedIn } = useContext(AppContext);

	return (
		<nav className='flex items-center justify-between px-4 lg:px-0'>
			<button onClick={() => {
				if (route.pathname !== "/") {
					route.back()
				}
			}} className={`text-[#616162]  ${route.pathname === '/' ? 'opacity-0 cursor-default' : '' }  text-xs sm:text-sm text-left font-semibold w-[20%]`}>
				&larr; {route.pathname === '/' ? 'AGORA' : 'Back'}
			</button>
			{ showLogo && <Branding /> }
			{ loggedIn && <LogoutPop /> }

			{!loggedIn && <div className='cursor-default flex items-center justify-end gap-2 text-[#616162] text-sm font-semibold w-[20%]'>
				<WalletOptionsPopUp />
			</div>}
		</nav>
	);
}

export default TopBar;