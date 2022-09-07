import { Popover } from "@headlessui/react";
import { ArrowRight2, BoxSearch, PathTool, Profile2User } from "iconsax-react";
import { getCurrencyName } from "../../../Constants";
import { getFundTotal } from "../../../helper/FundHelper";
import { shortAddress } from "../../../helper/StringHelper";
import { getAgo, getAgoT } from "../../../helper/TimeHelper";

const DiscoursePop = ({ data }: { data: any }) => {
    return (
        <Popover className="relative">
            {({ open }) => (
                <>
                    <Popover.Button className={`t-all text-white ${open ? 'bg-[#212427]' : ''} hover:bg-white/10 rounded-xl font-Lexend text-sm px-4 py-2 flex items-center gap-2`}>Discourse <ArrowRight2 className={` transform t-all ${open ? 'rotate-90 ' : ' rotate-0 '}`} size='16' color="#c6c6c6" /></Popover.Button>
                    <Popover.Panel className="absolute z-20 bg-card bg-[#141515] p-4 rounded-xl backdrop-blur-lg max-w-sm w-[80vw] sm:w-[400px]">
                        <div className="flex flex-col gap-2 flex-[0.6]">
                            <h3 className="text-white font-semibold text-xl">{data.title}</h3>
                            <div className="flex gap-2 items-center">
                                {/* <button className="button-i hover:bg-[#1DA1F2]/30">
                                    <BoxSearch size="16" color="#1DA1F2" />
                                </button>
                                <div className="h-1/2 rounded-xl w-[2px] bg-[#212427]" /> */}
                                <PathTool size="16" color="#6a6a6a" />
                                <div className='flex items-center gap-2 text-[#616162] text-sm font-semibold'>
                                    {/* <div className='bg-gradient-g w-4 h-4 rounded-xl' /> */}
                                    <p className='text-white/60 text-xs'>{shortAddress(data.prop_starter)}</p>
                                </div>
                                <p className="text-white/40 text-[10px] ">{getAgoT(data.iniTS)}</p>

                            </div>
                            <p className=" w-full text-white/60 text-xs leading-4 tracking-wide">{data.description}</p>
                            <div className="bg-card flex flex-col gap-1 py-2 px-4 rounded-xl mt-2">
                                {/* <h4 className="text-sm text-white/40">Topics :</h4> */}
                                <ul className="list-inside">
                                    {
                                        data.topics.map((item: string, index: number) => (
                                            <li className="text-white/40 text-xs font-Lexend list-disc" key={index}>{item}</li>
                                        ))
                                    }
                                </ul>
                            </div>

                            <div className="flex items-center w-full gap-8 mt-2">
                                <div className="flex flex-col">
                                    <p className=" w-full text-white/60 text-xs font-Lexend leading-5 tracking-wide">Total Stake:</p>
                                    <h3 className="text-gradient text-lg font-bold tracking-wider">{getFundTotal(data.funds)} {getCurrencyName(data.chainId)}</h3>
                                </div>

                                <div className="w-[2px] h-1/2 bg-[#212427]"></div>

                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <Profile2User size="14" color="#797979" />
                                        <p className="font-medium text-sm font-Lexend text-[#797979]">Speakers</p>
                                    </div>

                                    <div className='flex items-center gap-1 '>
                                        {/* avatar */}
                                        <div className='flex items-center w-12 h-6 relative'>
                                            <div className='flex items-center w-6 h-6 rounded-lg ring-[3px] ring-[#141515] overflow-clip'>
                                                {/* TODO: add twitter fetch avatar */}
                                                <img className="scale-105 w-6 h-6 rounded-lg object-cover object-center" src={`https://avatar.tobi.sh/${data.speakers[0].name}`} alt="" />
                                            </div>
                                            <div className='flex items-center absolute left-[35%] w-6 h-6 rounded-lg ring-[3px] ring-[#141515] overflow-clip'>
                                                <img className="scale-105 w-6 h-6 rounded-lg object-cover object-center" src={`https://avatar.tobi.sh/${data.speakers[1].name}`} alt="" />
                                            </div>
                                        </div>
                                        <div className='flex flex-col'>
                                            <a href="#" className='hover:text-white/60 text-white/30 text-[10px] font-Lexend uppercase tracking-wide font-medium'>{data.speakers[0].name}</a>
                                            <a href="#" className='hover:text-white/60 text-white/30 text-[10px] font-Lexend uppercase tracking-wide font-medium'>{data.speakers[1].name}</a>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </Popover.Panel>
                </>
            )}
        </Popover>
    );
}

export default DiscoursePop;