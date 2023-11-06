import React from "react";
import { BiWallet } from "react-icons/bi";
import { BsTwitter } from "react-icons/bs";
import { BsFillCaretDownFill } from "react-icons/bs";
import { ArrowNE, Polygon16 } from "../utils/SvgHub";

export const UserProfile = (): JSX.Element => {
	return (
		<div className="inline-flex flex-col items-center gap-[24px] relative">
			<div className="flex w-[1111px] items-center gap-[24px] relative flex-[0_0_auto]">
				<div className="relative w-[196px] h-[196px] bg-white rounded-[54px] overflow-hidden border border-solid border-fillstroke shadow-[0px_22px_58px_#6f5e7040]">
					<img
						className="absolute w-[196px] h-[196px] top-0 left-0 object-cover"
						alt="Image"
						src="image.png"
					/>
				</div>
				<div className="inline-flex flex-col items-start gap-[12px] p-[16px] relative flex-[0_0_auto] rounded-[24px] shadow-[0px_4px_4px_#00000040]">
					<div className="inline-flex flex-col items-start gap-[16px] relative flex-[0_0_auto]">
						<div className="relative w-fit mt-[-1.00px] [font-family:'Lexend-SemiBold',Helvetica] font-semibold text-textprimary text-[42px] text-center tracking-[-3.78px] leading-[33.6px] whitespace-nowrap">
							daniel figueroa
						</div>
						<div className="relative w-[256px] h-[24px]">
							<div className="inline-flex items-center gap-[12px] relative">
								<div className="inline-flex items-center gap-[4px] relative flex-[0_0_auto]">
									<BsTwitter className="!relative !w-[24px] !h-[24px]" />
									<div className="text-[#498cd6] relative w-fit [font-family:'Lexend-Medium',Helvetica] font-medium text-[12px] tracking-[0] leading-[14.4px] whitespace-nowrap">
										link twitter
									</div>
								</div>
								<img
									className="relative w-px h-[14px] object-cover"
									alt="Line"
									src="line-8.svg"
								/>
								<div className="inline-flex items-center gap-[4px] relative flex-[0_0_auto]">
									<BiWallet className="!relative !w-[24px] !h-[24px]" />
									<div className="text-unsaturatedb-blue relative w-fit [font-family:'Lexend-Medium',Helvetica] font-medium text-[12px] tracking-[0] leading-[14.4px] whitespace-nowrap">
										link wallet
									</div>
								</div>
							</div>
						</div>
						<p className="relative w-fit [font-family:'Montserrat-SemiBold',Helvetica] font-semibold text-textsecondary text-[14px] tracking-[0] leading-[16.8px] whitespace-nowrap">
							a fan of quality discourse
						</p>
					</div>
					<img
						className="self-stretch w-full h-px relative object-cover"
						alt="Line"
						src="line-12.svg"
					/>
					<div className="inline-flex items-center justify-center gap-[12px] relative flex-[0_0_auto]">
						<div className="inline-flex flex-col items-center gap-[12px] relative flex-[0_0_auto]">
							<div className="relative w-fit mt-[-1.00px] [font-family:'Lexend-SemiBold',Helvetica] font-semibold text-textprimary text-[24px] tracking-[-2.16px] leading-[19.2px] whitespace-nowrap">
								0
							</div>
							<div className="relative w-fit [font-family:'Lexend-SemiBold',Helvetica] font-semibold text-texttertiary text-[16px] tracking-[-1.44px] leading-[12.8px] whitespace-nowrap">
								discourse funded
							</div>
						</div>
						<img
							className="relative w-px h-[14px] object-cover"
							alt="Line"
							src="line-9.svg"
						/>
						<div className="inline-flex flex-col items-center gap-[12px] relative flex-[0_0_auto]">
							<div className="relative w-fit mt-[-1.00px] [font-family:'Lexend-SemiBold',Helvetica] font-semibold text-textprimary text-[24px] tracking-[-2.16px] leading-[19.2px] whitespace-nowrap">
								0
							</div>
							<div className="relative w-fit [font-family:'Lexend-SemiBold',Helvetica] font-semibold text-texttertiary text-[16px] tracking-[-1.44px] leading-[12.8px] whitespace-nowrap">
								nfts
							</div>
						</div>
						<img
							className="relative w-px h-[14px] object-cover"
							alt="Line"
							src="line-10.svg"
						/>
						<div className="inline-flex flex-col items-center gap-[12px] relative flex-[0_0_auto]">
							<div className="relative w-fit mt-[-1.00px] [font-family:'Lexend-SemiBold',Helvetica] font-semibold text-textprimary text-[24px] tracking-[-2.16px] leading-[19.2px] whitespace-nowrap">
								0
							</div>
							<div className="relative w-fit [font-family:'Lexend-SemiBold',Helvetica] font-semibold text-texttertiary text-[16px] tracking-[-1.44px] leading-[12.8px] whitespace-nowrap">
								discourse invitation
							</div>
						</div>
						<img
							className="relative w-px h-[14px] object-cover"
							alt="Line"
							src="line-11.svg"
						/>
					</div>
				</div>
				<img
					className="relative w-[101.5px] h-[22.09px]"
					alt="Arrow"
					src="arrow-1.svg"
				/>
			</div>
			<div className="flex w-[1111px] items-center gap-[10px] p-[10px] relative flex-[0_0_auto]">
				<div className="inline-flex items-center gap-[2px] relative flex-[0_0_auto]">
					<button className="!border-[unset] !flex-[0_0_auto] !border-b-[unset] ![border-bottom-style:unset] !text-texttertiary !w-fit">
						NFTs
					</button>
					<BsFillCaretDownFill className="!relative !w-[12px] !h-[12px]" />
				</div>
				<button className="!border-[#d2b4fc] !flex-[0_0_auto] !text-brandpurple !font-bold ![font-family:'Lexend-Bold',Helvetica] !w-fit">
					Recent Activities
				</button>
			</div>
			<div className="flex flex-col w-[1111px] items-start gap-[16px] p-[10px] relative flex-[0_0_auto]">
				<Activities className="!flex-[0_0_auto]" desktop />
			</div>
		</div>
	);
};

export default UserProfile;

interface Props {
	desktop: boolean;
	className: any;
}

const Activities = ({ desktop, className }: Props): JSX.Element => {
	return (
		<div
			className={`border border-solid border-[#1e1e1e] flex rounded-[20px] bg-[#090909] relative ${
				!desktop ? "w-[330px]" : "w-[1091px]"
			} ${!desktop ? "flex-col" : ""} ${
				!desktop ? "items-start" : "items-center"
			} ${!desktop ? "gap-[12px]" : ""} ${!desktop ? "p-[12px]" : "p-[24px]"} ${
				desktop ? "justify-between" : ""
			} ${className}`}>
			<div
				className={`items-center gap-[12px] flex-[0_0_auto] relative ${
					!desktop ? "w-full" : ""
				} ${!desktop ? "flex" : "inline-flex"} ${
					!desktop ? "self-stretch" : ""
				}`}>
				{/* <Icons className="!relative !w-[32px] !h-[32px]" color="#E6F7FF" /> */}
				<p
					className={`[font-family:'Montserrat-SemiBold',Helvetica] tracking-[0] text-[14px] text-[#e5f7ffe6] font-semibold leading-[16.8px] relative ${
						desktop ? "w-fit" : ""
					} ${!desktop ? "mt-[-1.00px]" : ""} ${!desktop ? "flex-1" : ""} ${
						desktop ? "whitespace-nowrap" : ""
					}`}>
					invited to participate as speaker for rinkeby test#1
				</p>
			</div>
			<div
				className={`items-center gap-[8px] flex-[0_0_auto] relative ${
					!desktop ? "w-full" : ""
				} ${!desktop ? "flex" : "inline-flex"} ${
					!desktop ? "self-stretch" : ""
				} ${!desktop ? "justify-end" : ""}`}>
				<Polygon16 />
				<img
					className="w-px object-cover h-[10px] relative"
					alt="Line"
					src={!desktop ? "image.svg" : "line-10.svg"}
				/>
				<div className="inline-flex items-center gap-[4px] flex-[0_0_auto] relative">
					<div className="[font-family:'Montserrat-Medium',Helvetica] w-fit tracking-[0] text-[10px] text-[#7c8b91] font-medium leading-[12.0px] whitespace-nowrap relative">
						apr 22, 2022
					</div>
					<ArrowNE color="#7D8B92" />
				</div>
			</div>
		</div>
	);
};
