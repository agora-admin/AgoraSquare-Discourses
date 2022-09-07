import Branding from "../utils/Branding";
import { FooterIcon } from "../utils/SvgHub";

const MeetLayout = ({ children }: { children: any }) => {
    return (
        <>
            <div className="flex-col min-h-screen justify-center hidden px-2 sm:flex bg-[#000000]">
                <div className="w-full top-0 mx-auto inset-x-0 fixed flex items-center justify-center py-10">
                    <Branding />
                </div>
                <div className="w-full flex justify-center t-all">
                    {children}
                </div>
            </div>
            <div className="flex-col min-h-screen justify-center flex px-2 sm:hidden bg-[#000000]">
                <div className="w-full top-0 mx-auto inset-x-0 fixed flex items-center justify-center py-10">
                    <Branding />
                </div>
                <div className="w-full flex justify-center t-all">
                    {children}
                </div>
            </div>
        </>
    );
};

export default MeetLayout;