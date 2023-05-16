const Scheduler = () => {

    return (
        <>
            <div className="bg-card rounded-xl flex flex-col p-4 gap-2">
                {/* when no proposals are there */}
                { <>
                    <p className="text-[10px] text-[#c6c6c6]">
                        Has the discourse already been scheduled? <span className="tracking-wide font-semibold"></span>
                    </p>

                    <div className="flex items-center gap-2">
                        <button className="button-s w-max flex items-center gap-2">
                            <p className="text-xs text-[#c6c6c6] font-Lexend">Already Scheduled</p>
                        </button>

                        { <button className="button-s bg-gradient w-max">
                            <p className="text-xs text-[#212427] font-Lexend">Needs to be Scheduled</p>
                        </button>}
                    </div>
                </>}
            </div>

        </>
    );
}

export default Scheduler;