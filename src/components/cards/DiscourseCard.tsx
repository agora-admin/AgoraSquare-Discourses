import { Sound, Warning2 } from "iconsax-react";
import { useRouter } from "next/router";
import { getChainName, getCurrencyName } from "../../Constants";
import {
	DiscourseStateEnum as DiscourseStateEnum,
	getStateTS,
} from "../../helper/DataHelper";
import { getFundTotal } from "../../helper/FundHelper";
import { getTime, diff_hours } from "../../helper/TimeHelper";
import { ChainIcon } from "../utils/ChainTag";
import {
	ClockIcon,
	IRLIcon,
	MessageRemoveIcon,
	VerifyIcon,
	VirtualIcon,
} from "../utils/SvgHub";

const DiscourseCard = ({ data }: { data: any }) => {
	const route = useRouter();

	const handleClick = () => {
		route.push(`/${data.id}`);
	};

	const getDiscourseState = () => {
		if (data.status.completed) {
			return (
				<small className="text-[#84B9D1] font-semibold text-sm">
					Completed
				</small>
			);
		} else if (data.status.terminated) {
			return (
				<small className="text-[#84B9D1] font-semibold text-sm">
					Terminated
				</small>
			);
		} else if (data.status.disputed) {
			return (
				<small className="text-[#84B9D1] font-semibold text-sm">Disputed</small>
			);
		} else {
			return (
				<small className="text-[#84B9D1] font-semibold text-sm xs:text-base">
					{diff_hours(getTime(data.endTS), new Date())}{" "}
					<span className="font-Lexend text-[#E5F7FF] text-[10px] xs:text-xs">
						hrs left
					</span>
				</small>
			);
		}
	};

	const getDiscourseStateTitle = (state: DiscourseStateEnum) => {
		switch (state) {
			case DiscourseStateEnum.SCHEDULED:
				return "Scheduled";
			case DiscourseStateEnum.SCHEDULING:
				return "Scheduling";
			case DiscourseStateEnum.FUNDING:
				return "Funding";
			case DiscourseStateEnum.FINISHED:
				return "Finished";
			case DiscourseStateEnum.TERMINATED:
				return "Terminated";
			case DiscourseStateEnum.DISPUTED:
				return "Disputed";
			case DiscourseStateEnum.ONGOING:
				return "On Going";
		}
	};

	const getDiscourseStateIcon = (state: DiscourseStateEnum) => {
		switch (state) {
			case DiscourseStateEnum.SCHEDULED:
			case DiscourseStateEnum.SCHEDULING:
			case DiscourseStateEnum.FUNDING:
				return <ClockIcon size={23} />;
			case DiscourseStateEnum.FINISHED:
				return <VerifyIcon size={23} />;
			case DiscourseStateEnum.TERMINATED:
				return <MessageRemoveIcon size={23} />;
			case DiscourseStateEnum.DISPUTED:
				return <Warning2 color="#FC8181" size={20} variant="Bold" />;
			case DiscourseStateEnum.ONGOING:
				return <Sound color="#12D8FA" size={20} variant="Bold" />;
		}
	};

	return (
		<div className="relative group w-full h-full bg-[#0A0A0A] rounded-xl p-4 flex flex-col gap-3 justify-center">
			<div className="absolute -z-20 group-hover:inset-1  bg-gradient-to-r from-red-500 to-violet-500 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-300 group-hover:duration-500"></div>
			{/* Top Section */}
			<div className="flex items-center justify-between">
				<div
					onClick={handleClick}
					className="bg-[#141414] rounded-2xl flex items-center p-3 cursor-pointer">
					<div className="relative flex items-center">
						<img
							className="scale-105 h-8 w-8 xs:w-10 xs:h-10 object-cover rounded-xl object-center"
							src={data.speakers[0]?.image_url!}
							alt="user profile image"
						/>
						<img
							className="relative top-0 right-3 scale-105 h-8 w-8 xs:w-10 xs:h-10 object-cover rounded-xl object-center"
							src={data.speakers[1]?.image_url!}
							alt="user profile image"
						/>
					</div>

					<div className="flex flex-col justify-center">
						<small className="font-Lexend text-[10px] xs:text-xs text-[#E5F7FF] font-medium max-w-[15ch] line-clamp-1">
							{data.speakers[0]?.name}
						</small>
						<small className="font-Lexend text-[10px] xs:text-xs text-[#E5F7FF] font-medium max-w-[15ch] line-clamp-1">
							{data.speakers[1]?.name}
						</small>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<div
						className="cursor-pointer"
						title={getDiscourseStateTitle(
							getStateTS(data) as DiscourseStateEnum
						)}>
						{getDiscourseStateIcon(getStateTS(data) as DiscourseStateEnum)}
					</div>
					<div className="h-4 w-[1px] bg-[#1E1E1E]" />
					<div className="cursor-pointer" title={getChainName(data.chainId)}>
						<ChainIcon chainId={data.chainId} size={20} />
					</div>
				</div>
			</div>

			{/* Body Section */}
			<div className="flex-1 mb-5 text-white font-Lexend font-medium text-xs">
				{data.title}
			</div>

			{/* Stats Section */}
			<div className="flex flex-col gap-2">
				{/* Divider */}
				<div className="w-full h-[1px] bg-[#1E1E1E]" />

				<div className="flex items-center justify-between">
					{/* Fund Column */}
					<small className="text-[#84B9D1] font-semibold text-sm xs:text-base">
						{getFundTotal(data.funds).toFixed(2)}{" "}
						<span className="font-Lexend text-[#E5F7FF] text-[10px] xs:text-xs">
							{getCurrencyName(data.chainId)}
						</span>
					</small>

					<div className="h-4 w-[1px] bg-[#1E1E1E]" />

					{/* Time Left Column */}
					{getDiscourseState()}

					<div className="h-4 w-[1px] bg-[#1E1E1E]" />

					{/* Type of discourse Column */}
					<div className="flex items-center gap-1">
						{data?.irl ? (
							<>
								<IRLIcon size={23} />
								<span className="font-Lexend font-medium text-xs text-[#FCB4BD]">
									IRL
								</span>
							</>
						) : (
							<>
								<VirtualIcon size={23} />
								<span className="font-Lexend font-medium text-xs text-[#FCB4F5]">
									VIRTUAL
								</span>
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default DiscourseCard;
