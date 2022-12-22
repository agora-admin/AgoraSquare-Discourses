import { ArrowCircleRight } from "iconsax-react"
import Link from "next/link"
import { TwitterIcon2 } from "../utils/SvgHub"


const AreYouSpeakerCard = () => {
  return (
    <div className="mobile:fixed mobile:bottom-[60px] mobile:inset-x-0 mobile:max-h-[220px] flex flex-col sm:flex-row items-center mobile:gap-4 sm:justify-between py-6 px-6 bg-[#141414] sm:border-[1.2px] sm:border-[#E5F7FF] rounded-t-[30px] sm:rounded-3xl">
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
                <div className="mobile:hidden">
                    <TwitterIcon2 size={40}/>
                </div>

                <div className="sm:hidden">
                    <TwitterIcon2 size={50}/>
                </div>

                <div className="flex flex-col gap-1">
                    <h4 className="text-[#84B9D1] mobile:text-center font-bold text-[13px] sm:text-sm">Are You A Speaker?</h4>
                    <small className="text-[11px] sm:text-xs text-[#E5F7FFE5] max-w-md mobile:text-center font-semibold">connect your wallet with twitter account and get speakers privileges for the discourse you&apos;re invited to.</small>
                </div>
            </div>
            
            <Link href="/link" passHref>
                <button className="flex items-center gap-2 bg-[#84B9D1] max-h-[48px] rounded-2xl p-3 cursor-pointer">
                    <span className="text-black text-xs font-Lexend font-medium">link twitter</span>
                    <ArrowCircleRight color="#4F6F7D" variant="Bulk" fill="#000"/>
                </button>
            </Link>
        </div>
  )
}

export default AreYouSpeakerCard