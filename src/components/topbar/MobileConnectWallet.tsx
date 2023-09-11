import { FC, Dispatch, SetStateAction } from "react";
import { v4 as uuid } from "uuid";
import { Connector } from "wagmi";
import { UnstoppableIcon } from "../utils/SvgHub";

interface Prop {
	connectors: Connector[];
	handleConnectWallet: (connector: Connector) => Promise<void>;
	handleUnstoppableLogin: () => void;
	getIcon: (connector: Connector) => JSX.Element;
	isOpenMobileConnectMenu: boolean;
	setIsOpenMobileConnectMenu: Dispatch<SetStateAction<boolean>>;
}

const MobileConnectWallet: FC<Prop> = ({
	connectors,
	getIcon,
	handleConnectWallet,
	isOpenMobileConnectMenu,
	setIsOpenMobileConnectMenu,
	handleUnstoppableLogin,
}) => {
	return (
		<>
			<div
				className={`sm:hidden flex flex-col gap-3 items-center px-2 py-4 bg-[#0A0A0A] fixed bottom-0 left-0 -z-50 w-full min-h-[200px] rounded-t-[30px] transition-all duration-500 opacity-0 translate-y-[100%] ${
					isOpenMobileConnectMenu && "!opacity-100 !z-50 !translate-y-0"
				}`}>
				{/* Divider */}
				<div className="w-[25%] h-[5px] max-w-[80px] bg-[#1E1E1E] rounded-lg" />

				<small className="text-[#E5F7FFE5] font-Lexend font-medium text-sm mt-3">
					continue with
				</small>

				{/* Connectors list */}
				<ul className="flex flex-col items-center gap-3 w-full">
					{connectors.map((c) => (
						<button
							key={uuid()}
							onClick={() => handleConnectWallet(c)}
							className="flex items-center justify-center gap-2 bg-black border-2 border-[#1E1E1E] rounded-full w-full p-2 max-w-[400px]">
							{getIcon(c)}
							<p className="text-xs xs:text-sm font-Lexend text-[#E5F7FF]">
								{c.id === "injected" ? "Injected" : c.name}
							</p>
						</button>
					))}
					<button
						onClick={handleUnstoppableLogin}
						className="flex items-center justify-center gap-2 bg-black border-2 border-[#1E1E1E] rounded-full w-full p-2 max-w-[400px]">
						<UnstoppableIcon />
						<p className="text-xs xs:text-sm font-Lexend text-[#E5F7FF]">
							Unstoppable
						</p>
					</button>
				</ul>
			</div>

			{/* Overlay */}
			<div
				onClick={() => {
					setIsOpenMobileConnectMenu(false);
				}}
				className={`sm:hidden fixed inset-0 backdrop-blur-sm -z-40 ${
					!isOpenMobileConnectMenu && "hidden"
				}`}></div>
		</>
	);
};

export default MobileConnectWallet;
