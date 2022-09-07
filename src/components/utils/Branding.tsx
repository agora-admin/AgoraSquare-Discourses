import { useRouter } from "next/router";
const Branding = () => {
    const route = useRouter();

    const handleClick = () => {
        if (route.pathname !== "/") {
            route.push("/");
        }
    }

    return (
        <div onClick={handleClick} className={`${route.pathname === '/' ? 'cursor-default' : 'cursor-pointer' }  flex gap-2 items-center`}>
            <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 6.75V11.85C22 13.12 21.58 14.19 20.83 14.93C20.09 15.68 19.02 16.1 17.75 16.1V17.91C17.75 18.59 16.99 19 16.43 18.62L15.46 17.98C15.55 17.67 15.59 17.33 15.59 16.97V12.9C15.59 10.86 14.23 9.5 12.19 9.5H5.4C5.26 9.5 5.13 9.51 5 9.52V6.75C5 4.2 6.7 2.5 9.25 2.5H17.75C20.3 2.5 22 4.2 22 6.75Z" stroke="url(#paint0_linear_524_2144)" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15.59 12.9V16.97C15.59 17.33 15.55 17.67 15.46 17.98C15.09 19.45 13.87 20.37 12.19 20.37H9.47L6.45 22.38C6.34876 22.4493 6.23046 22.4895 6.10796 22.4963C5.98547 22.503 5.86346 22.4761 5.75521 22.4184C5.64695 22.3606 5.5566 22.2743 5.49398 22.1688C5.43135 22.0633 5.39885 21.9427 5.4 21.82V20.37C4.38 20.37 3.53 20.03 2.94 19.44C2.34 18.84 2 17.99 2 16.97V12.9C2 11 3.18 9.69 5 9.52C5.13 9.51 5.26 9.5 5.4 9.5H12.19C14.23 9.5 15.59 10.86 15.59 12.9V12.9Z" stroke="url(#paint1_linear_524_2144)" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                    <linearGradient id="paint0_linear_524_2144" x1="5" y1="6.35549" x2="22.7242" y2="9.04466" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#84B9D1" />
                        <stop offset="1" stopColor="#D2B4FC" />
                    </linearGradient>
                    <linearGradient id="paint1_linear_524_2144" x1="2" y1="12.5808" x2="16.1687" y2="14.7314" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#84B9D1" />
                        <stop offset="1" stopColor="#D2B4FC" />
                    </linearGradient>
                </defs>
            </svg>

            <div className="flex flex-col">
                <h3 className="font-bold font-montserrat text-white text-[18px]">Discourses</h3>
                <p className="font-medium text-white text-[10px]">by <span className="text-gradient tracking-wider font-bold">AGORA SQUARE</span></p>
            </div>

        </div>
    );
}

export default Branding;