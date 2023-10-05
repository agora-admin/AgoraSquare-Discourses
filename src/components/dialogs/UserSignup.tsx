import React, { useContext } from "react";
import Image from "next/image";

import { Magic } from "magic-sdk";
import { OAuthExtension } from "@magic-ext/oauth";
import AppContext from "../utils/AppContext";

import { BsTwitter } from "react-icons/bs";
import logo from "../../../public/ag_logo_16.svg";

export const UserSignUp = () => {
	const { magic } = useContext(AppContext);

	const handleCreateAccount = async () => {
		await (magic.oauth as any).loginWithRedirect({
			provider: "google" /* 'google', 'facebook', 'apple', or 'github' */,
			redirectURI: `${window.location.origin}/magic-callback`,
			scope: ["user:email"] /* optional */,
		});
	};

	return (
		<div className="bg-black flex flex-row justify-center w-full">
			<div className="bg-black w-[1280px] h-screen relative">
				<div className="inline-flex flex-col items-center gap-[24px] absolute top-0 left-0">
					<div className="flex w-[1280px] items-center justify-around gap-[10px] px-[85px] py-[24px] relative flex-[0_0_auto]">
						<div className="inline-flex items-center gap-[12px] relative flex-[0_0_auto]">
							<div className="inline-flex items-center gap-[8px] relative flex-[0_0_auto]">
								<div className="inline-flex flex-col items-start gap-[5px] relative flex-[0_0_auto]">
									<div className="relative w-fit mt-[-1.00px] [font-family:'Lexend-SemiBold',Helvetica] font-semibold text-white text-[22px] text-center tracking-[-1.98px] leading-[17.6px] whitespace-nowrap">
										discourses
									</div>
									<p className="flex items-center justify-center w-fit text-[#d2b4fc] [font-family:'Montserrat-Regular',Helvetica] font-normal text-[10px] text-center leading-[10px] whitespace-nowrap">
										<span className="tracking-[1.30px] mr-0.5">by </span>
										<span className="[font-family:'Montserrat-Medium',Helvetica] font-bold tracking-[-0.40px]">
											AGORA
										</span>
										<span className="tracking-[1.30px]">&nbsp;</span>
										<span className="[font-family:'Montserrat-ExtraLight',Helvetica] font-extralight tracking-[-0.70px]">
											SQUARE
										</span>
									</p>
								</div>
							</div>
							<div className="border rounded-sm border-gray-600 h-8 items-center gap-[8px] justify-center" />
						</div>
					</div>
				</div>
				<div className="inline-flex items-center gap-[250px] p-[10px] absolute top-[318px] left-[334px] bg-black">
					<div className="inline-flex items-start gap-[10px] p-[10px] relative flex-[0_0_auto] bg-black">
						<Image
							className="relative w-[140.14px] h-[145.84px]"
							alt="Group"
							src={logo}
						/>
					</div>
					<div className="inline-flex flex-col items-start justify-center gap-[10px] p-[10px] relative flex-[0_0_auto] bg-[#7d8b92] rounded-[24px] overflow-hidden">
						<div className="relative w-fit mt-[-1.00px] [font-family:'Lexend-SemiBold',Helvetica] font-semibold text-white text-[22px] text-center tracking-[-1.98px] leading-[17.6px] whitespace-nowrap">
							sign-up
						</div>
						<Textbox
							className="!flex-[0_0_auto] !flex !w-[222px]"
							placeholder="email"
						/>
						<div className="relative w-fit [font-family:'Lexend-SemiBold',Helvetica] font-semibold text-white text-[22px] text-center tracking-[-1.98px] leading-[17.6px] whitespace-nowrap">
							password
						</div>
						<Textbox
							className="!flex-[0_0_auto] !flex !w-[222px]"
							placeholder="enter password"
						/>
						<Textbox
							className="!flex-[0_0_auto] !flex !w-[222px]"
							placeholder="re-enter password"
						/>
						<div className="flex flex-col gap-2 items-center w-full">
							<div className="flex w-full h-[54px] items-center justify-center gap-[10px] p-[10px] relative bg-[#d2b4fc] rounded-[16px] overflow-hidden border border-solid border-[#1e1e1e]">
								<button className="relative [font-family:'Lexend-Medium',Helvetica] font-medium text-black text-[12px] text-center tracking-[0] leading-[14.4px] whitespace-nowrap">
									<span className="flex gap-1 items-center justify-center">
										<BsTwitter className="text-blue-500" size={22} />
										connect twitter
									</span>
								</button>
							</div>
							<button
								onClick={handleCreateAccount}
								className="relative flex justify-center w-full items-center gap-2 md:max-w-none bg-[#d2b4fc] rounded-xl px-6 py-3 transition-transform duration-300 hover:scale-105 ring-1 ring-gray-900/5">
								<span className="text-xs font-Lexend text-black font-medium">
									create account
								</span>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default UserSignUp;

export const Textbox = ({ className, placeholder }) => {
	return (
		<div
			className={`inline-flex items-center gap-[24px] px-[16px] py-[20px] relative bg-[#141414] rounded-[16px] border-2 border-solid border-[#1e1e1e] ${className}`}>
			<input
				className="relative w-fit mt-[-2.00px] bg-[#141414] [font-family:'Montserrat-SemiBold',Helvetica] font-semibold text-[#7c8b91] text-[12px] tracking-[0] leading-[14.4px] whitespace-nowrap"
				placeholder={placeholder}
			/>
		</div>
	);
};
