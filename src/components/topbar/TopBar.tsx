import { useContext, FC } from "react";
import AppContext from "../utils/AppContext";
import { ChainIcon } from "../utils/ChainTag";
import { RecordingIcon } from "../utils/SvgHub";
import UserInfo from "../dialogs/UserInfo";
import ConnectWalletButton from "../dialogs/ConnectWalletButton";
import Link from "next/link";
import {
	DiscourseStateEnum,
	fundingDone,
	getStateTS,
} from "../../helper/DataHelper";
import { ArrowCircleRight } from "iconsax-react";
import { useNetwork } from "wagmi";
import { useRouter } from "next/router";

interface TopBarProp {
	onDiscoursePage: boolean;
	discourseData?: any;
	handleFund?: () => Promise<void>;
}

const TopBar: FC<TopBarProp> = ({
	onDiscoursePage,
	discourseData,
	handleFund,
}) => {
	const router = useRouter();
	const { loggedIn, unstoppableLoggedIn } = useContext(AppContext);
	const { chain } = useNetwork();

	const handleSignUp = () => {
		if (!loggedIn) {
			router.push("/signup");
		}
	};

	const handleLogin = () => {
		window.open("https://agorasquare.com", "_blank");
	};

	return (
		<nav className="flex items-center justify-between relative w-full mobile:px-3 lg:px-0 mobile:min-h-[60px] py-0 sm:py-3 sm:max-w-5xl mobile:fixed mobile:inset-x-0 mobile:bottom-0 mobile:z-50 bg-black">
			{/* Left side part */}
			<div className="flex items-center gap-1 xs:gap-3">
				<Link href="/" passHref>
					<div className="flex flex-col cursor-pointer">
						<big className="text-white font-Lexend font-semibold text-xl -tracking-[0.07em]">
							discourses
						</big>
						<small className="text-[#D2B4FC] text-[10px]">
							by <span className="font-medium">AGORA SQUARE</span>
						</small>
					</div>
				</Link>

				{loggedIn && (
					<>
						<div className="h-8 w-[1px] bg-white/20" />

						<div className="bg-[#0A0A0A] rounded-full mobile:p-2 px-4 py-2 flex gap-2 items-center">
							<span className="mobile:hidden text-[#714FE0] text-[10px] font-Lexend font-semibold">
								on {chain?.name}
							</span>
							<ChainIcon chainId={chain?.id as number} size={18} />
						</div>
					</>
				)}
			</div>

			{/* Mobile View If on Discourse Page */}
			{onDiscoursePage && (
				<div className="sm:hidden">
					{/* Check Recording Button */}
					{getStateTS(discourseData) === DiscourseStateEnum.FINISHED && (
						<div className="bg-[#84B9D1] rounded-full p-2">
							<RecordingIcon size={23} />
						</div>
					)}

					{/* Funding Button */}
					{loggedIn && !fundingDone(discourseData) && (
						<div
							onClick={handleFund}
							className="flex items-center gap-2 bg-[#D2B4FC] rounded-2xl px-4 py-2 cursor-pointer">
							<span className="text-xs font-Lexend text-black font-medium">
								Fund
							</span>
							<ArrowCircleRight color="#7E6C97" variant="Bulk" />
						</div>
					)}
				</div>
			)}

			{/* Right side part */}
			{!loggedIn && (
				<div className="flex gap-4 items-center">
					<button
						onClick={handleSignUp}
						className="relative flex items-center gap-2 md:max-w-none bg-[#d2b4fc] rounded-xl px-6 py-3 transition-transform duration-300 hover:scale-105 ring-1 ring-gray-900/5">
						<span className="text-xs font-Lexend text-black font-medium">
							Sign up
						</span>
					</button>
					<button
						onClick={handleLogin}
						className="relative flex items-center gap-2 md:max-w-none bg-[#303030] rounded-xl px-6 py-3 transition-transform duration-300 hover:scale-105 ring-1 ring-gray-900/5">
						<span className="text-xs font-Lexend text-white font-medium">
							Login
						</span>
					</button>
				</div>
			)}
			{loggedIn || unstoppableLoggedIn ? (
				<div className={`${onDiscoursePage && "mobile:hidden"}`}>
					<UserInfo />
				</div>
			) : (
				<div className={`${onDiscoursePage && "mobile:hidden"}`}>
					<ConnectWalletButton />
				</div>
			)}
		</nav>
	);
};

export default TopBar;
