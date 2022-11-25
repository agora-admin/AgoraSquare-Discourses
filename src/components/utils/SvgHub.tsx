interface SVGProp{
    size?: number,
    color?: string
}

export const ArrowNE = ({ color = "#ffffff",size=10 }:SVGProp) => (
    <svg width={size} height={size} viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.50433 6.07159L7.50433 2.49481L3.92755 2.49481M2.49566 7.50349L7.45425 2.5449" stroke={color} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

export const Aurora16 = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.98829 13H5.90344C3.31886 13 2.25691 11.0404 3.55311 8.64728L4.59944 6.72108L5.64576 4.79487C6.94196 2.40171 9.05804 2.40171 10.3542 4.79487L11.4006 6.72108L12.4469 8.64728C13.7431 11.0404 12.6811 13 10.0966 13H7.98829Z" stroke="#78D64B" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>

)

export const Polygon16 = ({size=16}:SVGProp) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.2533 7.632L11.2533 5.89867C11.1769 5.85605 11.0909 5.83367 11.0033 5.83367C10.9158 5.83367 10.8298 5.85605 10.7533 5.89867L7.75335 7.632C7.75335 7.632 7.75335 7.63867 7.74668 7.63867L5.00001 9.22533L2.50001 7.77867V4.88533L5.00001 3.43867L7.50001 4.88533V5.64533C7.50001 5.91867 7.72668 6.14533 8.00001 6.14533C8.27335 6.14533 8.50001 5.91867 8.50001 5.64533V4.59867C8.50001 4.41867 8.40668 4.252 8.24668 4.16533L5.24668 2.432C5.17025 2.38938 5.08419 2.36701 4.99668 2.36701C4.90917 2.36701 4.82311 2.38938 4.74668 2.432L1.74668 4.16533C1.59335 4.252 1.49335 4.41867 1.49335 4.59867V8.06533C1.49335 8.24533 1.58668 8.412 1.74668 8.49867L4.74668 10.232C4.82668 10.2787 4.91335 10.2987 5.00001 10.2987C5.08668 10.2987 5.17335 10.2787 5.25335 10.232L8.25335 8.49867C8.25335 8.49867 8.25335 8.492 8.26001 8.492L11.0067 6.90533L13.5067 8.352V11.2387L11.0067 12.6853L8.50668 11.2387V10.4253C8.50668 10.152 8.28001 9.92533 8.00668 9.92533C7.73335 9.92533 7.50668 10.152 7.50668 10.4253V11.5253C7.50668 11.7053 7.60001 11.872 7.76001 11.9587L10.76 13.692C10.84 13.7387 10.9267 13.7587 11.0133 13.7587C11.1 13.7587 11.1867 13.7387 11.2667 13.692L14.2667 11.9587C14.42 11.872 14.52 11.7053 14.52 11.5253V8.05867C14.5119 7.97168 14.4836 7.88778 14.4373 7.8137C14.391 7.73961 14.328 7.67739 14.2533 7.632Z" fill="#714FE0"/>
        <path opacity="0.4" d="M3 5.56667V7.10667C3 7.34667 3.12667 7.56667 3.33333 7.68667L4.66667 8.45333C4.87333 8.57333 5.12667 8.57333 5.33333 8.45333L6.66667 7.68667C6.87333 7.56667 7 7.34667 7 7.10667V5.56667C7 5.32667 6.87333 5.10667 6.66667 4.98667L5.33333 4.22C5.23214 4.16103 5.11712 4.12996 5 4.12996C4.88288 4.12996 4.76786 4.16103 4.66667 4.22L3.33333 4.98667C3.12667 5.10667 3 5.32667 3 5.56667ZM9 9.03333V10.5733C9 10.8133 9.12667 11.0333 9.33333 11.1533L10.6667 11.92C10.8733 12.04 11.1267 12.04 11.3333 11.92L12.6667 11.1533C12.8733 11.0333 13 10.8133 13 10.5733V9.03333C13 8.79333 12.8733 8.57333 12.6667 8.45333L11.3333 7.68667C11.2321 7.62769 11.1171 7.59662 11 7.59662C10.8829 7.59662 10.7679 7.62769 10.6667 7.68667L9.33333 8.45333C9.12667 8.57333 9 8.79333 9 9.03333Z" fill="#714FE0"/>
    </svg>
)

export const Ethereum16 = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7.7753 1.49105V4.89909M6.77102 1.97698L4.34782 4.99628C3.79709 5.68307 3.99146 6.56423 4.77544 6.95298L7.19217 8.16459C7.50965 8.32009 8.02798 8.32009 8.34546 8.16459L10.7622 6.95298C11.5462 6.55776 11.7405 5.67659 11.1898 4.99628L8.77309 1.97698C8.22884 1.28371 7.32175 1.28371 6.77102 1.97698V1.97698Z" stroke="#716B94" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
<path d="M5.05409 6.93938L7.77534 4.89844L10.4966 6.93938M5.68257 9.34963L6.72572 9.81613C7.05717 9.96348 7.41586 10.0396 7.77858 10.0396C8.14131 10.0396 8.5 9.96348 8.83145 9.81613L9.87459 9.34963C10.8076 8.93496 11.6693 10.0623 11.0214 10.8528L8.77962 13.5935C8.22889 14.2673 7.32828 14.2673 6.77107 13.5935L4.53576 10.8528C3.88137 10.0623 4.74309 8.93496 5.68257 9.34963Z" stroke="#716B94" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
</svg>

)

export const FundDiscourseIcon = () => {
    return (
        <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.5 11.4002C8.5 12.1702 9.1 12.8002 9.83 12.8002H11.33C11.97 12.8002 12.49 12.2502 12.49 11.5802C12.49 10.8502 12.17 10.5902 11.7 10.4202L9.3 9.58016C8.82 9.41016 8.5 9.15016 8.5 8.42016C8.5 7.75016 9.02 7.20016 9.66 7.20016H11.16C11.9 7.21016 12.5 7.83016 12.5 8.60016M10.5 12.8502V13.5902M10.5 6.41016V7.19016" stroke="url(#paint0_linear_600_2469)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13.48 19.88C14.38 21.15 15.85 21.98 17.53 21.98C20.26 21.98 22.48 19.76 22.48 17.03C22.48 15.37 21.66 13.9 20.41 13M10.49 17.98C12.6091 17.98 14.6414 17.1382 16.1398 15.6398C17.6382 14.1414 18.48 12.1091 18.48 9.99C18.48 7.87092 17.6382 5.83863 16.1398 4.34022C14.6414 2.8418 12.6091 2 10.49 2C8.37092 2 6.33863 2.8418 4.84022 4.34022C3.3418 5.83863 2.5 7.87092 2.5 9.99C2.5 12.1091 3.3418 14.1414 4.84022 15.6398C6.33863 17.1382 8.37092 17.98 10.49 17.98V17.98Z" stroke="url(#paint1_linear_600_2469)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
                <linearGradient id="paint0_linear_600_2469" x1="8.5" y1="8.11208" x2="12.7387" y2="8.45487" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#84B9D1" />
                    <stop offset="1" stopColor="#D2B4FC" />
                </linearGradient>
                <linearGradient id="paint1_linear_600_2469" x1="2.5" y1="6.736" x2="23.3709" y2="9.76574" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#84B9D1" />
                    <stop offset="1" stopColor="#D2B4FC" />
                </linearGradient>
            </defs>
        </svg>

    )
}

export const DiscourseIcon = () => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 6.25V11.35C22 12.62 21.58 13.69 20.83 14.43C20.09 15.18 19.02 15.6 17.75 15.6V17.41C17.75 18.09 16.99 18.5 16.43 18.12L15.46 17.48C15.55 17.17 15.59 16.83 15.59 16.47V12.4C15.59 10.36 14.23 9 12.19 9H5.4C5.26 9 5.13 9.01 5 9.02V6.25C5 3.7 6.7 2 9.25 2H17.75C20.3 2 22 3.7 22 6.25Z" stroke="url(#paint0_linear_602_2472)" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M15.59 12.4V16.47C15.59 16.83 15.55 17.17 15.46 17.48C15.09 18.95 13.87 19.87 12.19 19.87H9.47L6.45 21.88C6.34876 21.9493 6.23046 21.9895 6.10796 21.9963C5.98547 22.003 5.86346 21.9761 5.75521 21.9184C5.64695 21.8606 5.5566 21.7743 5.49398 21.6688C5.43135 21.5633 5.39885 21.4427 5.4 21.32V19.87C4.38 19.87 3.53 19.53 2.94 18.94C2.34 18.34 2 17.49 2 16.47V12.4C2 10.5 3.18 9.19 5 9.02C5.13 9.01 5.26 9 5.4 9H12.19C14.23 9 15.59 10.36 15.59 12.4V12.4Z" stroke="url(#paint1_linear_602_2472)" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
                <linearGradient id="paint0_linear_602_2472" x1="5" y1="5.85549" x2="22.7242" y2="8.54466" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#84B9D1" />
                    <stop offset="1" stopColor="#D2B4FC" />
                </linearGradient>
                <linearGradient id="paint1_linear_602_2472" x1="2" y1="12.0808" x2="16.1687" y2="14.2314" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#84B9D1" />
                    <stop offset="1" stopColor="#D2B4FC" />
                </linearGradient>
            </defs>
        </svg>

    )
}

export const CloseIcon = () => {
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.66699 13.3327L13.3337 6.66602M13.3337 13.3327L6.66699 6.66602" stroke="#C6C6C6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

export const FooterIcon = () => {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M13.0944 2.21883H3.0455L3.71618 0H12.4246L13.0944 2.21883ZM15.9999 3.29642H0.141085L1.1984 5.51525H14.9426L15.9999 3.29642ZM5.07607 12.8518L5.72834 6.59375H2.91059L2.25919 12.8518H5.07607ZM10.9284 12.8518H13.7418L13.0904 6.59375H10.2753L10.9284 12.8518ZM16 15.9998H0L1.06696 13.9292H14.9339L16 15.9998ZM6.26333 12.8518H9.74037L9.16086 6.59375H6.84283L6.26333 12.8518Z" fill="url(#paint0_linear_526_1569)" />
            <defs>
                <linearGradient id="paint0_linear_526_1569" x1="-4.40306e-08" y1="3.79256" x2="16.7134" y2="6.2188" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#84B9D1" />
                    <stop offset="1" stopColor="#D2B4FC" />
                </linearGradient>
            </defs>
        </svg>

    )
}

export const TwitterIcon = ({color,width,height}:{color? : string,width?: number, height?: number}) => {
    return (
        <svg width={width ? width : 24} height={height ? height : 24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.1623 5.65593C21.3989 5.99362 20.5893 6.2154 19.7603 6.31393C20.634 5.79136 21.288 4.96894 21.6003 3.99993C20.7803 4.48793 19.8813 4.82993 18.9443 5.01493C18.3149 4.34151 17.4807 3.89489 16.5713 3.74451C15.6618 3.59413 14.7282 3.74842 13.9156 4.18338C13.1029 4.61834 12.4567 5.30961 12.0774 6.14972C11.6981 6.98983 11.607 7.93171 11.8183 8.82893C10.1554 8.74558 8.52863 8.31345 7.04358 7.56059C5.55854 6.80773 4.24842 5.75097 3.1983 4.45893C2.82659 5.09738 2.63125 5.82315 2.6323 6.56193C2.6323 8.01193 3.3703 9.29293 4.4923 10.0429C3.82831 10.022 3.17893 9.84271 2.5983 9.51993V9.57193C2.5985 10.5376 2.93267 11.4735 3.54414 12.221C4.15562 12.9684 5.00678 13.4814 5.9533 13.6729C5.33691 13.84 4.6906 13.8646 4.0633 13.7449C4.33016 14.5762 4.8503 15.3031 5.55089 15.824C6.25147 16.3449 7.09742 16.6337 7.9703 16.6499C7.10278 17.3313 6.10947 17.8349 5.04718 18.1321C3.98488 18.4293 2.87442 18.5142 1.7793 18.3819C3.69099 19.6114 5.91639 20.264 8.1893 20.2619C15.8823 20.2619 20.0893 13.8889 20.0893 8.36193C20.0893 8.18193 20.0843 7.99993 20.0763 7.82193C20.8952 7.23009 21.6019 6.49695 22.1633 5.65693L22.1623 5.65593Z" fill={color ? color : "#1DA1F2"} />
        </svg>
    )
}

export const AgoraBtnIcon = () => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M18.3682 4.77354H5.80712L6.64548 2H17.531L18.3682 4.77354ZM22 6.12053H2.17645L3.49809 8.89407H20.6784L22 6.12053ZM8.34521 18.0647L9.16055 10.2422H5.63836L4.82411 18.0647H8.34521ZM15.6603 18.0647H19.177L18.3627 10.2422H14.8438L15.6603 18.0647ZM22 22H2L3.3337 19.4117H20.6674L22 22ZM9.82903 18.0647H14.1753L13.451 10.2422H10.5534L9.82903 18.0647Z" fill="black" />
        </svg>


    )
}

export const Twitter_x10 = ({color}:{color? : string}) => {
    return (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.23511 2.35688C8.917 2.49759 8.57967 2.58999 8.23427 2.63105C8.59833 2.41331 8.87082 2.07064 9.00094 1.66688C8.65927 1.87021 8.28469 2.01271 7.89427 2.0898C7.63202 1.8092 7.28442 1.62311 6.9055 1.56046C6.52658 1.4978 6.13758 1.56208 5.79897 1.74332C5.46035 1.92455 5.1911 2.21258 5.03307 2.56263C4.87504 2.91267 4.83708 3.30512 4.9251 3.67896C4.23223 3.64424 3.55441 3.46418 2.93564 3.15049C2.31687 2.8368 1.77099 2.39648 1.33344 1.85813C1.17856 2.12415 1.09717 2.42656 1.0976 2.73438C1.0976 3.33855 1.4051 3.8723 1.8726 4.1848C1.59594 4.17609 1.32537 4.10137 1.08344 3.96688V3.98855C1.08352 4.39092 1.22276 4.78089 1.47754 5.09232C1.73232 5.40376 2.08697 5.6175 2.48135 5.6973C2.22453 5.7669 1.95523 5.77715 1.69385 5.7273C1.80505 6.07364 2.02177 6.37655 2.31368 6.59359C2.60559 6.81064 2.95807 6.93096 3.32177 6.93771C2.9603 7.2216 2.54643 7.43146 2.1038 7.55529C1.66118 7.67911 1.19849 7.71449 0.742188 7.65938C1.53873 8.17164 2.46598 8.4436 3.41302 8.44271C6.61844 8.44271 8.37136 5.7873 8.37136 3.48438C8.37136 3.40938 8.36927 3.33355 8.36594 3.25938C8.70713 3.01278 9.0016 2.70731 9.23552 2.3573L9.23511 2.35688Z" fill={color ? color : "#1DA1F2"} />
        </svg>

    )
}

export const Twitter_x16 = ({color}:{color? : string}) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.9995 5.04466C12.5875 5.22396 12.1506 5.34172 11.7032 5.39403C12.1748 5.11657 12.5277 4.67989 12.6962 4.16537C12.2537 4.42448 11.7685 4.60608 11.2629 4.7043C10.9233 4.34674 10.4731 4.1096 9.98231 4.02975C9.49156 3.94991 8.98775 4.03183 8.5492 4.26278C8.11065 4.49373 7.76193 4.86077 7.55726 5.30685C7.35259 5.75292 7.30344 6.25303 7.41744 6.72942C6.52007 6.68517 5.6422 6.45572 4.84081 6.05597C4.03943 5.65623 3.33244 5.09512 2.76575 4.40909C2.56516 4.74808 2.45975 5.13345 2.46031 5.52571C2.46031 6.29562 2.85857 6.97579 3.46404 7.37402C3.10572 7.36292 2.7553 7.26771 2.44196 7.09632V7.12393C2.44207 7.63669 2.6224 8.13363 2.95238 8.5305C3.28236 8.92737 3.74167 9.19975 4.25245 9.30144C3.91983 9.39013 3.57105 9.4032 3.23254 9.33967C3.37655 9.78103 3.65723 10.167 4.0353 10.4436C4.41336 10.7202 4.86987 10.8735 5.3409 10.8821C4.87276 11.2439 4.33673 11.5113 3.76348 11.6691C3.19022 11.8269 2.59097 11.872 2 11.8018C3.03163 12.4546 4.23254 12.8011 5.45909 12.8C9.61053 12.8 11.8808 9.41613 11.8808 6.48146C11.8808 6.38589 11.8781 6.28925 11.8738 6.19474C12.3157 5.88049 12.697 5.49121 13 5.04519L12.9995 5.04466Z" fill={color ? color : "#1DA1F2"}/>
    </svg>
)

export const ParticipateIcon = () => {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 1.5V6M9 6L10.5 4.5M9 6L7.5 4.5" stroke="url(#paint0_linear_672_2549)" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3.75 8.9993V5.9993C3.75 4.4918 3.75 3.2468 6 3.0293M14.25 8.9993V5.9993C14.25 4.4918 14.25 3.2468 12 3.0293M5.25 8.9993C2.25 8.9993 2.25 10.3418 2.25 11.9993V12.7493C2.25 14.8193 2.25 16.4993 6 16.4993H12C15 16.4993 15.75 14.8193 15.75 12.7493V11.9993C15.75 10.3418 15.75 8.9993 12.75 8.9993C12 8.9993 11.79 9.1568 11.4 9.4493L10.635 10.2593C10.4247 10.483 10.1708 10.6613 9.88894 10.7832C9.60711 10.905 9.3033 10.9679 8.99625 10.9679C8.6892 10.9679 8.38539 10.905 8.10356 10.7832C7.82172 10.6613 7.56782 10.483 7.3575 10.2593L6.6 9.4493C6.21 9.1568 6 8.9993 5.25 8.9993Z" stroke="url(#paint1_linear_672_2549)" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
                <linearGradient id="paint0_linear_672_2549" x1="7.5" y1="2.56667" x2="10.6701" y2="2.87346" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#84B9D1" />
                    <stop offset="1" stopColor="#D2B4FC" />
                </linearGradient>
                <linearGradient id="paint1_linear_672_2549" x1="2.25" y1="6.22219" x2="16.3507" y2="8.27368" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#84B9D1" />
                    <stop offset="1" stopColor="#D2B4FC" />
                </linearGradient>
            </defs>
        </svg>

    )
}

export const RightArrowGradient = () => {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.8225 4.44727L15.375 8.99977L10.8225 13.5523M2.625 8.99977H15.2475" stroke="url(#paint0_linear_672_2559)" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
                <linearGradient id="paint0_linear_672_2559" x1="2.625" y1="6.60549" x2="15.6845" y2="9.26023" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#84B9D1" />
                    <stop offset="1" stopColor="#D2B4FC" />
                </linearGradient>
            </defs>
        </svg>

    )
}

export const ParticipatedIcon = () => {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.98242 11.0254L8.10742 12.1504L11.1074 9.15039" stroke="url(#paint0_linear_689_2682)" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7.5 4.5H10.5C12 4.5 12 3.75 12 3C12 1.5 11.25 1.5 10.5 1.5H7.5C6.75 1.5 6 1.5 6 3C6 4.5 6.75 4.5 7.5 4.5Z" stroke="url(#paint1_linear_689_2682)" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 3.01562C14.4975 3.15063 15.75 4.07312 15.75 7.50063V12.0006C15.75 15.0006 15 16.5006 11.25 16.5006H6.75C3 16.5006 2.25 15.0006 2.25 12.0006V7.50063C2.25 4.08063 3.5025 3.15063 6 3.01562" stroke="url(#paint2_linear_689_2682)" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
                <linearGradient id="paint0_linear_689_2682" x1="6.98242" y1="9.8615" x2="11.2136" y2="10.7061" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#84B9D1" />
                    <stop offset="1" stopColor="#D2B4FC" />
                </linearGradient>
                <linearGradient id="paint1_linear_689_2682" x1="6" y1="2.21111" x2="11.9021" y2="3.92468" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#84B9D1" />
                    <stop offset="1" stopColor="#D2B4FC" />
                </linearGradient>
                <linearGradient id="paint2_linear_689_2682" x1="2.25" y1="6.21207" x2="16.3513" y2="8.26138" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#84B9D1" />
                    <stop offset="1" stopColor="#D2B4FC" />
                </linearGradient>
            </defs>
        </svg>

    )
}

export const SpeakerConfirmationIcon = () => {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.8298 14.2875L11.9698 15.4275L14.2498 13.1475M8.99229 16.3575C7.62728 16.3575 6.26979 16.0125 5.23479 15.3225C3.41979 14.1075 3.41979 12.1275 5.23479 10.92C7.29729 9.54 10.6798 9.54 12.7423 10.92M9.11979 8.1525C9.04479 8.145 8.95479 8.145 8.87229 8.1525C8.01144 8.12327 7.19577 7.76013 6.59801 7.13997C6.00025 6.51981 5.66734 5.69134 5.66979 4.83C5.6686 4.393 5.75368 3.96006 5.92014 3.556C6.0866 3.15194 6.33117 2.7847 6.63983 2.47535C6.94849 2.16599 7.31517 1.92059 7.71885 1.75322C8.12253 1.58585 8.55528 1.4998 8.99229 1.5C10.8298 1.5 12.3223 2.9925 12.3223 4.83C12.3223 6.63 10.8973 8.0925 9.11979 8.1525Z" stroke="#212221" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

export const SlotCalendarIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 1.5V3.75V1.5ZM12 1.5V3.75V1.5ZM2.625 6.8175H15.375H2.625ZM15.75 6.375V12.75C15.75 15 14.625 16.5 12 16.5H6C3.375 16.5 2.25 15 2.25 12.75V6.375C2.25 4.125 3.375 2.625 6 2.625H12C14.625 2.625 15.75 4.125 15.75 6.375Z" stroke="url(#paint0_linear_822_3021)" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.22046 12.5254H6.22796M8.99621 10.2754H9.00371H8.99621ZM6.22046 10.2754H6.22796H6.22046Z" stroke="url(#paint1_linear_822_3021)" strokeLinecap="round" strokeLinejoin="round" />
        <defs>
            <linearGradient id="paint0_linear_822_3021" x1="2.25" y1="5.05556" x2="16.4075" y2="6.90522" gradientUnits="userSpaceOnUse">
                <stop stopColor="#84B9D1" />
                <stop offset="1" stopColor="#D2B4FC" />
            </linearGradient>
            <linearGradient id="paint1_linear_822_3021" x1="6.22046" y1="10.8087" x2="9.09634" y2="11.3251" gradientUnits="userSpaceOnUse">
                <stop stopColor="#84B9D1" />
                <stop offset="1" stopColor="#D2B4FC" />
            </linearGradient>
        </defs>
    </svg>

)

export const SlotItemIcon = ({ active }: { active?: boolean | false }) => {
    if (!active) {
        return (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.8333 11.734H2.16667M5.33333 1.33398V3.33398V1.33398ZM10.6667 1.33398V3.33398V1.33398ZM10.6667 2.33398C12.8867 2.45398 14 3.30065 14 6.43398V10.554C14 13.3007 13.3333 14.674 10 14.674H6C2.66667 14.674 2 13.3007 2 10.554V6.43398C2 3.30065 3.11333 2.46065 5.33333 2.33398H10.6667Z" stroke="#797979" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7.99992 5.5C7.17992 5.5 6.48658 5.94667 6.48658 6.81333C6.48658 7.22667 6.67992 7.54 6.97325 7.74C6.56659 7.98 6.33325 8.36667 6.33325 8.82C6.33325 9.64667 6.96659 10.16 7.99992 10.16C9.02659 10.16 9.66659 9.64667 9.66659 8.82C9.66659 8.36667 9.43325 7.97333 9.01992 7.74C9.31992 7.53333 9.50659 7.22667 9.50659 6.81333C9.50659 5.94667 8.81992 5.5 7.99992 5.5V5.5ZM7.99992 7.39333C7.65325 7.39333 7.39992 7.18667 7.39992 6.86C7.39992 6.52667 7.65325 6.33333 7.99992 6.33333C8.34659 6.33333 8.59992 6.52667 8.59992 6.86C8.59992 7.18667 8.34659 7.39333 7.99992 7.39333ZM7.99992 9.33333C7.55992 9.33333 7.23992 9.11333 7.23992 8.71333C7.23992 8.31333 7.55992 8.1 7.99992 8.1C8.43992 8.1 8.75992 8.32 8.75992 8.71333C8.75992 9.11333 8.43992 9.33333 7.99992 9.33333Z" fill="#797979" />
            </svg>

        )
    }
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.8333 11.734H2.16667M5.33333 1.33398V3.33398V1.33398ZM10.6667 1.33398V3.33398V1.33398ZM10.6667 2.33398C12.8867 2.45398 14 3.30065 14 6.43398V10.554C14 13.3007 13.3333 14.674 10 14.674H6C2.66667 14.674 2 13.3007 2 10.554V6.43398C2 3.30065 3.11333 2.46065 5.33333 2.33398H10.6667Z" stroke="url(#paint0_linear_903_4127)" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7.99992 5.5C7.17992 5.5 6.48658 5.94667 6.48658 6.81333C6.48658 7.22667 6.67992 7.54 6.97325 7.74C6.56659 7.98 6.33325 8.36667 6.33325 8.82C6.33325 9.64667 6.96659 10.16 7.99992 10.16C9.02659 10.16 9.66659 9.64667 9.66659 8.82C9.66659 8.36667 9.43325 7.97333 9.01992 7.74C9.31992 7.53333 9.50659 7.22667 9.50659 6.81333C9.50659 5.94667 8.81992 5.5 7.99992 5.5V5.5ZM7.99992 7.39333C7.65325 7.39333 7.39992 7.18667 7.39992 6.86C7.39992 6.52667 7.65325 6.33333 7.99992 6.33333C8.34659 6.33333 8.59992 6.52667 8.59992 6.86C8.59992 7.18667 8.34659 7.39333 7.99992 7.39333ZM7.99992 9.33333C7.55992 9.33333 7.23992 9.11333 7.23992 8.71333C7.23992 8.31333 7.55992 8.1 7.99992 8.1C8.43992 8.1 8.75992 8.32 8.75992 8.71333C8.75992 9.11333 8.43992 9.33333 7.99992 9.33333Z" fill="url(#paint1_linear_903_4127)" />
            <defs>
                <linearGradient id="paint0_linear_903_4127" x1="2" y1="4.49606" x2="14.5846" y2="6.13941" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#84B9D1" />
                    <stop offset="1" stopColor="#D2B4FC" />
                </linearGradient>
                <linearGradient id="paint1_linear_903_4127" x1="6.33325" y1="6.60459" x2="9.85066" y2="6.96983" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#84B9D1" />
                    <stop offset="1" stopColor="#D2B4FC" />
                </linearGradient>
            </defs>
        </svg>

    )
}

export const SpeakerOneCIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.00016 1.33203C4.32016 1.33203 1.3335 4.3187 1.3335 7.9987C1.3335 11.6787 4.32016 14.6654 8.00016 14.6654C11.6802 14.6654 14.6668 11.6787 14.6668 7.9987C14.6668 4.3187 11.6802 1.33203 8.00016 1.33203ZM4.50016 9.42536C4.50016 9.6987 4.2735 9.92536 4.00016 9.92536C3.72683 9.92536 3.50016 9.6987 3.50016 9.42536V6.57203C3.50016 6.2987 3.72683 6.07203 4.00016 6.07203C4.2735 6.07203 4.50016 6.2987 4.50016 6.57203V9.42536ZM6.50016 10.3787C6.50016 10.652 6.2735 10.8787 6.00016 10.8787C5.72683 10.8787 5.50016 10.652 5.50016 10.3787V5.6187C5.50016 5.34536 5.72683 5.1187 6.00016 5.1187C6.2735 5.1187 6.50016 5.34536 6.50016 5.6187V10.3787ZM8.50016 11.332C8.50016 11.6054 8.2735 11.832 8.00016 11.832C7.72683 11.832 7.50016 11.6054 7.50016 11.332V4.66536C7.50016 4.39203 7.72683 4.16536 8.00016 4.16536C8.2735 4.16536 8.50016 4.39203 8.50016 4.66536V11.332ZM10.5002 10.3787C10.5002 10.652 10.2735 10.8787 10.0002 10.8787C9.72683 10.8787 9.50016 10.652 9.50016 10.3787V5.6187C9.50016 5.34536 9.72683 5.1187 10.0002 5.1187C10.2735 5.1187 10.5002 5.34536 10.5002 5.6187V10.3787ZM12.5002 9.42536C12.5002 9.6987 12.2735 9.92536 12.0002 9.92536C11.7268 9.92536 11.5002 9.6987 11.5002 9.42536V6.57203C11.5002 6.2987 11.7268 6.07203 12.0002 6.07203C12.2735 6.07203 12.5002 6.2987 12.5002 6.57203V9.42536Z" fill="#D2B4FC" />
    </svg>

)
export const SpeakerTwoCIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.00016 1.33203C4.32016 1.33203 1.3335 4.3187 1.3335 7.9987C1.3335 11.6787 4.32016 14.6654 8.00016 14.6654C11.6802 14.6654 14.6668 11.6787 14.6668 7.9987C14.6668 4.3187 11.6802 1.33203 8.00016 1.33203ZM4.50016 9.42536C4.50016 9.6987 4.2735 9.92536 4.00016 9.92536C3.72683 9.92536 3.50016 9.6987 3.50016 9.42536V6.57203C3.50016 6.2987 3.72683 6.07203 4.00016 6.07203C4.2735 6.07203 4.50016 6.2987 4.50016 6.57203V9.42536ZM6.50016 10.3787C6.50016 10.652 6.2735 10.8787 6.00016 10.8787C5.72683 10.8787 5.50016 10.652 5.50016 10.3787V5.6187C5.50016 5.34536 5.72683 5.1187 6.00016 5.1187C6.2735 5.1187 6.50016 5.34536 6.50016 5.6187V10.3787ZM8.50016 11.332C8.50016 11.6054 8.2735 11.832 8.00016 11.832C7.72683 11.832 7.50016 11.6054 7.50016 11.332V4.66536C7.50016 4.39203 7.72683 4.16536 8.00016 4.16536C8.2735 4.16536 8.50016 4.39203 8.50016 4.66536V11.332ZM10.5002 10.3787C10.5002 10.652 10.2735 10.8787 10.0002 10.8787C9.72683 10.8787 9.50016 10.652 9.50016 10.3787V5.6187C9.50016 5.34536 9.72683 5.1187 10.0002 5.1187C10.2735 5.1187 10.5002 5.34536 10.5002 5.6187V10.3787ZM12.5002 9.42536C12.5002 9.6987 12.2735 9.92536 12.0002 9.92536C11.7268 9.92536 11.5002 9.6987 11.5002 9.42536V6.57203C11.5002 6.2987 11.7268 6.07203 12.0002 6.07203C12.2735 6.07203 12.5002 6.2987 12.5002 6.57203V9.42536Z" fill="#84B9D1" />
    </svg>

)

export const HappeningIconGreen = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15.75 6.1875V11.8125M2.25 6.1875V11.8125V6.1875ZM5.625 4.3125V13.6875V4.3125ZM9 2.4375V15.5625V2.4375ZM12.375 4.3125V13.6875V4.3125Z" stroke="url(#paint0_linear_1045_5263)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <defs>
            <linearGradient id="paint0_linear_1045_5263" x1="2.25" y1="9" x2="15.75" y2="9" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FBED96" />
                <stop offset="1" stopColor="#ABECD6" />
            </linearGradient>
        </defs>
    </svg>

)

export const ArrowGRightIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.8225 4.44727L15.375 8.99977L10.8225 13.5523M2.625 8.99977H15.2475" stroke="url(#paint0_linear_818_3337)" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
        <defs>
            <linearGradient id="paint0_linear_818_3337" x1="2.625" y1="8.99977" x2="15.375" y2="8.99977" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FBED96" />
                <stop offset="1" stopColor="#ABECD6" />
            </linearGradient>
        </defs>
    </svg>

)
export const ArrowRightIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.8225 4.44727L15.375 8.99977L10.8225 13.5523M2.625 8.99977H15.2475" stroke="#212427" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
        <defs>
            <linearGradient id="paint0_linear_818_3337" x1="2.625" y1="8.99977" x2="15.375" y2="8.99977" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FBED96" />
                <stop offset="1" stopColor="#ABECD6" />
            </linearGradient>
        </defs>
    </svg>

)

export const CalendarDoneIcon = () => (
    <svg width="33" height="32" viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.1667 2.66602V6.66602V2.66602ZM21.8333 2.66602V6.66602V2.66602ZM5.16666 12.1193H27.8333H5.16666ZM29.8333 25.3327C29.8333 26.3327 29.5533 27.2793 29.06 28.0793C28.59 28.8693 27.9223 29.5233 27.1227 29.9769C26.3231 30.4304 25.4192 30.6679 24.5 30.666C23.1533 30.666 21.9267 30.1727 20.9933 29.3327C20.58 28.986 20.22 28.5593 19.94 28.0793C19.4325 27.2532 19.1647 26.3022 19.1667 25.3327C19.1667 22.386 21.5533 19.9993 24.5 19.9993C26.1 19.9993 27.5267 20.706 28.5 21.8127C29.3575 22.785 29.8315 24.0363 29.8333 25.3327Z" stroke="url(#paint0_linear_1063_5547)" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22.42 25.334L23.74 26.654L26.58 24.0273" stroke="url(#paint1_linear_1063_5547)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M28.5 11.3327V21.8127C27.5267 20.706 26.1 19.9993 24.5 19.9993C21.5533 19.9993 19.1667 22.386 19.1667 25.3327C19.1667 26.3327 19.4467 27.2793 19.94 28.0793C20.22 28.5593 20.58 28.986 20.9933 29.3327H11.1667C6.5 29.3327 4.5 26.666 4.5 22.666V11.3327C4.5 7.33268 6.5 4.66602 11.1667 4.66602H21.8333C26.5 4.66602 28.5 7.33268 28.5 11.3327Z" stroke="url(#paint2_linear_1063_5547)" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.5587 22.2676H11.572M16.4933 18.2676H16.5067H16.4933ZM11.5587 18.2676H11.572H11.5587Z" stroke="url(#paint3_linear_1063_5547)" strokeWidth="2.66667" strokeLinecap="round" strokeLinejoin="round" />
        <defs>
            <linearGradient id="paint0_linear_1063_5547" x1="5.16666" y1="9.30306" x2="31.0528" y2="12.6135" gradientUnits="userSpaceOnUse">
                <stop stopColor="#84B9D1" />
                <stop offset="1" stopColor="#D2B4FC" />
            </linearGradient>
            <linearGradient id="paint1_linear_1063_5547" x1="22.42" y1="24.65" x2="26.6343" y2="25.6189" gradientUnits="userSpaceOnUse">
                <stop stopColor="#84B9D1" />
                <stop offset="1" stopColor="#D2B4FC" />
            </linearGradient>
            <linearGradient id="paint2_linear_1063_5547" x1="4.5" y1="10.5129" x2="29.5978" y2="14.0578" gradientUnits="userSpaceOnUse">
                <stop stopColor="#84B9D1" />
                <stop offset="1" stopColor="#D2B4FC" />
            </linearGradient>
            <linearGradient id="paint3_linear_1063_5547" x1="11.5587" y1="19.2157" x2="16.6714" y2="20.1338" gradientUnits="userSpaceOnUse">
                <stop stopColor="#84B9D1" />
                <stop offset="1" stopColor="#D2B4FC" />
            </linearGradient>
        </defs>
    </svg>

)

export const WalletConnectIcon = ({size=24}:SVGProp) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.5 12.25C20.5 7.69365 16.8063 4 12.25 4C7.69365 4 4 7.69365 4 12.25C4 16.8063 7.69365 20.5 12.25 20.5C16.8063 20.5 20.5 16.8063 20.5 12.25Z" fill="url(#paint0_radial_2_503)" />
        <path d="M9.45308 9.9468C10.9978 8.4344 13.5023 8.4344 15.047 9.9468L15.2329 10.1288C15.3101 10.2044 15.3101 10.327 15.2329 10.4027L14.5969 11.0253C14.5583 11.0631 14.4957 11.0631 14.4571 11.0253L14.2013 10.7748C13.1236 9.71975 11.3764 9.71975 10.2988 10.7748L10.0248 11.0431C9.98621 11.0809 9.9236 11.0809 9.88498 11.0431L9.24902 10.4204C9.17179 10.3448 9.17179 10.2222 9.24902 10.1466L9.45308 9.9468ZM16.3622 11.2345L16.9282 11.7887C17.0054 11.8643 17.0054 11.9869 16.9282 12.0625L14.3761 14.5613C14.2988 14.637 14.1736 14.637 14.0964 14.5613C14.0964 14.5613 14.0964 14.5613 14.0964 14.5613L12.285 12.7879C12.2657 12.769 12.2344 12.769 12.2151 12.7879C12.2151 12.7879 12.2151 12.7879 12.2151 12.7879L10.4038 14.5613C10.3265 14.637 10.2013 14.637 10.1241 14.5613C10.1241 14.5613 10.1241 14.5613 10.1241 14.5613L7.57184 12.0625C7.49461 11.9869 7.49461 11.8643 7.57184 11.7887L8.13785 11.2345C8.21508 11.1589 8.34031 11.1589 8.41754 11.2345L10.2289 13.008C10.2482 13.0269 10.2795 13.0269 10.2989 13.008C10.2989 13.008 10.2989 13.008 10.2989 13.008L12.1102 11.2345C12.1874 11.1589 12.3126 11.1589 12.3898 11.2345C12.3898 11.2345 12.3898 11.2345 12.3898 11.2345L14.2012 13.008C14.2205 13.0269 14.2518 13.0269 14.2712 13.008L16.0825 11.2345C16.1597 11.1589 16.285 11.1589 16.3622 11.2345Z" fill="white" />
        <defs>
            <radialGradient id="paint0_radial_2_503" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(4 12.25) scale(16.5)">
                <stop stopColor="#5D9DF6" />
                <stop offset="1" stopColor="#006FFF" />
            </radialGradient>
        </defs>
    </svg>
)

export const WrongChainIcon = () => (
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
)

export const MetamaskIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.1345 4L13.2981 9.07148L14.5693 6.08269L20.1345 4Z" fill="#E17726" stroke="#E17726" strokeWidth="0.13524" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4.36554 4L11.141 9.11882L9.93065 6.08269L4.36554 4Z" fill="#E27625" stroke="#E27625" strokeWidth="0.13524" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17.6732 15.7591L15.8542 18.545L19.7491 19.6202L20.8648 15.82L17.6732 15.7591Z" fill="#E27625" stroke="#E27625" strokeWidth="0.13524" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3.64203 15.82L4.75099 19.6202L8.63913 18.545L6.82692 15.7591L3.64203 15.82Z" fill="#E27625" stroke="#E27625" strokeWidth="0.13524" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.42951 11.0528L7.3476 12.6892L11.2019 12.865L11.0734 8.70636L8.42951 11.0528Z" fill="#E27625" stroke="#E27625" strokeWidth="0.13524" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16.0706 11.0527L13.3861 8.659L13.2982 12.8649L17.1525 12.6891L16.0706 11.0527Z" fill="#E27625" stroke="#E27625" strokeWidth="0.13524" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.6391 18.545L10.972 17.4158L8.96367 15.847L8.6391 18.545Z" fill="#E27625" stroke="#E27625" strokeWidth="0.13524" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.528 17.4158L15.8541 18.545L15.5363 15.847L13.528 17.4158Z" fill="#E27625" stroke="#E27625" strokeWidth="0.13524" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15.8541 18.545L13.528 17.4158L13.7174 18.9305L13.6971 19.5728L15.8541 18.545Z" fill="#D5BFB2" stroke="#D5BFB2" strokeWidth="0.13524" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.6391 18.545L10.8029 19.5728L10.7894 18.9305L10.972 17.4158L8.6391 18.545Z" fill="#D5BFB2" stroke="#D5BFB2" strokeWidth="0.13524" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10.8435 14.8462L8.90961 14.2782L10.2755 13.6494L10.8435 14.8462Z" fill="#233447" stroke="#233447" strokeWidth="0.13524" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.6565 14.8462L14.2245 13.6494L15.5972 14.2782L13.6565 14.8462Z" fill="#233447" stroke="#233447" strokeWidth="0.13524" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.63911 18.545L8.97721 15.7591L6.8269 15.82L8.63911 18.545Z" fill="#CC6228" stroke="#CC6228" strokeWidth="0.13524" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15.5228 15.7591L15.8542 18.545L17.6731 15.82L15.5228 15.7591Z" fill="#CC6228" stroke="#CC6228" strokeWidth="0.13524" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17.1524 12.6891L13.2981 12.865L13.6565 14.8462L14.2245 13.6494L15.5972 14.2782L17.1524 12.6891Z" fill="#CC6228" stroke="#CC6228" strokeWidth="0.13524" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.90961 14.2782L10.2755 13.6494L10.8435 14.8462L11.2019 12.865L7.3476 12.6891L8.90961 14.2782Z" fill="#CC6228" stroke="#CC6228" strokeWidth="0.13524" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7.34753 12.6891L8.96365 15.847L8.90955 14.2782L7.34753 12.6891Z" fill="#E27525" stroke="#E27525" strokeWidth="0.13524" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15.5972 14.2782L15.5363 15.847L17.1524 12.6891L15.5972 14.2782Z" fill="#E27525" stroke="#E27525" strokeWidth="0.13524" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.2019 12.8649L10.8435 14.8462L11.2966 17.1858L11.398 14.1024L11.2019 12.8649Z" fill="#E27525" stroke="#E27525" strokeWidth="0.13524" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.2981 12.8649L13.1088 14.0956L13.2034 17.1858L13.6565 14.8462L13.2981 12.8649Z" fill="#E27525" stroke="#E27525" strokeWidth="0.13524" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.6565 14.8462L13.2034 17.1858L13.528 17.4158L15.5363 15.847L15.5972 14.2782L13.6565 14.8462Z" fill="#F5841F" stroke="#F5841F" strokeWidth="0.13524" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.90961 14.2782L8.9637 15.847L10.972 17.4158L11.2966 17.1858L10.8435 14.8462L8.90961 14.2782Z" fill="#F5841F" stroke="#F5841F" strokeWidth="0.13524" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.6971 19.5729L13.7173 18.9305L13.5415 18.7817H10.9585L10.7894 18.9305L10.8029 19.5729L8.6391 18.545L9.39644 19.1671L10.9314 20.2288H13.5618L15.1036 19.1671L15.8541 18.545L13.6971 19.5729Z" fill="#C0AC9D" stroke="#C0AC9D" strokeWidth="0.13524" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.528 17.4158L13.2035 17.1859H11.2966L10.972 17.4158L10.7894 18.9304L10.9585 18.7817H13.5416L13.7174 18.9304L13.528 17.4158Z" fill="#161616" stroke="#161616" strokeWidth="0.13524" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20.4252 9.40282L21 6.60336L20.1345 4L13.528 8.90243L16.0705 11.0527L19.6611 12.1009L20.4523 11.1745L20.1074 10.9243L20.6551 10.4239L20.2359 10.0993L20.7836 9.68006L20.4252 9.40282Z" fill="#763E1A" stroke="#763E1A" strokeWidth="0.13524" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3.5 6.60336L4.08153 9.40282L3.70962 9.68006L4.2641 10.0993L3.84486 10.4239L4.39258 10.9243L4.04772 11.1745L4.83887 12.1009L8.42948 11.0527L10.972 8.90243L4.36553 4L3.5 6.60336Z" fill="#763E1A" stroke="#763E1A" strokeWidth="0.13524" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M19.6611 12.1008L16.0705 11.0527L17.1524 12.6891L15.5363 15.847L17.6731 15.8199H20.8648L19.6611 12.1008Z" fill="#F5841F" stroke="#F5841F" strokeWidth="0.13524" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.42951 11.0527L4.8389 12.1008L3.64203 15.8199H6.82692L8.96371 15.847L7.34759 12.6891L8.42951 11.0527Z" fill="#F5841F" stroke="#F5841F" strokeWidth="0.13524" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.2981 12.865L13.528 8.90245L14.5694 6.0827H9.93066L10.972 8.90245L11.2019 12.865L11.2898 14.1092L11.2966 17.1859H13.2035L13.2102 14.1092L13.2981 12.865Z" fill="#F5841F" stroke="#F5841F" strokeWidth="0.13524" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

export const NullWalletIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19.5952 12.357H17.5714C16.681 12.357 15.9524 13.0979 15.9524 14.0033C15.9524 14.9088 16.681 15.6496 17.5714 15.6496H19.5952C19.8219 15.6496 20 15.4685 20 15.238V12.7686C20 12.5381 19.8219 12.357 19.5952 12.357ZM6.2381 14.4149C5.26667 14.4149 4.40048 14.8512 3.80952 15.5344C3.28891 16.1346 3.00113 16.9071 3 17.7074C3 18.3248 3.17 18.9092 3.46952 19.4031C3.75491 19.8908 4.16028 20.2945 4.64573 20.5745C5.13118 20.8545 5.67998 21.0012 6.2381 21C7.05571 21 7.80048 20.6954 8.36714 20.1769C8.6181 19.9628 8.83667 19.6994 9.00667 19.4031C9.30619 18.9092 9.47619 18.3248 9.47619 17.7074C9.47619 15.8883 8.02714 14.4149 6.2381 14.4149ZM7.53333 19.008C7.4119 19.1315 7.2581 19.1891 7.10429 19.1891C6.95048 19.1891 6.79667 19.1315 6.67524 19.008L6.24619 18.5717L5.80095 19.0245C5.67952 19.1479 5.52571 19.2056 5.3719 19.2056C5.2181 19.2056 5.06429 19.1479 4.94286 19.0245C4.82994 18.9083 4.76662 18.7515 4.76662 18.5882C4.76662 18.4249 4.82994 18.2681 4.94286 18.1519L5.3881 17.6992L4.95905 17.2629C4.84614 17.1468 4.78281 16.99 4.78281 16.8267C4.78281 16.6634 4.84614 16.5066 4.95905 16.3904C5.19381 16.1517 5.58238 16.1517 5.81714 16.3904L6.24619 16.8267L6.65095 16.4151C6.88571 16.1764 7.27429 16.1764 7.50905 16.4151C7.74381 16.6538 7.74381 17.0489 7.50905 17.2876L7.10429 17.6992L7.53333 18.1355C7.7681 18.3742 7.7681 18.7611 7.53333 19.008V19.008ZM15.5719 6.51277C15.8148 6.75148 15.6124 7.12189 15.2724 7.12189L8.56952 7.11366C8.18095 7.11366 7.98667 6.63624 8.2619 6.35638L9.67857 4.90765C10.2542 4.32628 11.0327 4 11.844 4C12.6554 4 13.4338 4.32628 14.0095 4.90765L15.5395 6.47985L15.5719 6.51277V6.51277Z" fill="#BBBBBB" />
        <path d="M19.981 17.328C19.4876 18.976 18.0642 20 16.1232 20H10.8663C10.5509 20 10.3487 19.656 10.4781 19.368C10.7207 18.808 10.8744 18.176 10.8744 17.6C10.8744 15.176 8.87679 13.2 6.42626 13.2C5.81161 13.2 5.21313 13.328 4.66318 13.568C4.36394 13.696 4 13.496 4 13.176V12C4 9.824 5.32636 8.304 7.38868 8.048C7.59087 8.016 7.80923 8 8.03568 8H16.1232C16.3335 8 16.5357 8.008 16.7298 8.04C18.3635 8.224 19.5443 9.208 19.981 10.672C20.0619 10.936 19.8678 11.2 19.5928 11.2H17.7407C15.9857 11.2 14.5947 12.784 14.9748 14.584C15.2417 15.896 16.471 16.8 17.8216 16.8H19.5928C19.8758 16.8 20.0619 17.072 19.981 17.328V17.328Z" fill="#BBBBBB" />
    </svg>
)

export const InviteMessageIcon = ({color,width,height}:{color? : string,width?: number, height?: number}) => (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 10.5V15.5C22 19 20 20.5 17 20.5H7C4 20.5 2 19 2 15.5V8.5C2 5 4 3.5 7 3.5H14" stroke={color} strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 9L10.13 11.5C11.16 12.32 12.85 12.32 13.88 11.5L15.06 10.56M19.5 8C20.163 8 20.7989 7.73661 21.2678 7.26777C21.7366 6.79893 22 6.16304 22 5.5C22 4.83696 21.7366 4.20107 21.2678 3.73223C20.7989 3.26339 20.163 3 19.5 3C18.837 3 18.2011 3.26339 17.7322 3.73223C17.2634 4.20107 17 4.83696 17 5.5C17 6.16304 17.2634 6.79893 17.7322 7.26777C18.2011 7.73661 18.837 8 19.5 8Z" stroke={color} strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
)

// ---------------------------v1.1 Start-----------------------------------

export const WalletIcon = ({size=16}:SVGProp) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M29.3333 14.6267V17.3733C29.3333 18.1067 28.7467 18.7067 28 18.7333H25.3867C23.9467 18.7333 22.6267 17.68 22.5067 16.24C22.4267 15.4 22.7467 14.6133 23.3067 14.0667C23.8 13.56 24.48 13.2667 25.2267 13.2667H28C28.7467 13.2933 29.3333 13.8933 29.3333 14.6267Z" fill="#E6F7FF"/>
        <path opacity="0.4" d="M23.3067 14.0667C22.7467 14.6133 22.4267 15.4 22.5067 16.24C22.6267 17.68 23.9467 18.7333 25.3867 18.7333H28V20.6667C28 24.6667 25.3334 27.3333 21.3334 27.3333H9.33335C5.33335 27.3333 2.66669 24.6667 2.66669 20.6667V11.3333C2.66669 7.70667 4.85335 5.17333 8.25335 4.74667C8.60002 4.69333 8.96002 4.66667 9.33335 4.66667H21.3334C21.68 4.66667 22.0134 4.68 22.3334 4.73333C25.7734 5.13333 28 7.68 28 11.3333V13.2667H25.2267C24.48 13.2667 23.8 13.56 23.3067 14.0667Z" fill="#E6F7FF"/>
        <path d="M17.3333 13H9.33331C8.78665 13 8.33331 12.5467 8.33331 12C8.33331 11.4533 8.78665 11 9.33331 11H17.3333C17.88 11 18.3333 11.4533 18.3333 12C18.3333 12.5467 17.88 13 17.3333 13Z" fill="#E6F7FF"/>
    </svg>
)

export const MenuIcon = ({size=16}:SVGProp) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path opacity="0.4" d="M16 29.3333C23.364 29.3333 29.3333 23.364 29.3333 16C29.3333 8.636 23.364 2.66667 16 2.66667C8.63596 2.66667 2.66663 8.636 2.66663 16C2.66663 23.364 8.63596 29.3333 16 29.3333Z" fill="#E6F7FF"/>
        <path d="M16 17.3333C15.2534 17.3333 14.6667 16.7333 14.6667 16C14.6667 15.2667 15.2667 14.6667 16 14.6667C16.7334 14.6667 17.3334 15.2667 17.3334 16C17.3334 16.7333 16.7467 17.3333 16 17.3333ZM21.3334 17.3333C20.5867 17.3333 20 16.7333 20 16C20 15.2667 20.6 14.6667 21.3334 14.6667C22.0667 14.6667 22.6667 15.2667 22.6667 16C22.6667 16.7333 22.08 17.3333 21.3334 17.3333ZM10.6667 17.3333C9.92004 17.3333 9.33337 16.7333 9.33337 16C9.33337 15.2667 9.93337 14.6667 10.6667 14.6667C11.4 14.6667 12 15.2667 12 16C12 16.7333 11.4134 17.3333 10.6667 17.3333Z" fill="#E6F7FF"/>
    </svg>
)

export const ClockIcon = ({size=16}:SVGProp) => (
    <svg width={size} height={size-1} viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path opacity="0.4" d="M12.5 22C18.023 22 22.5 17.523 22.5 12C22.5 6.477 18.023 2 12.5 2C6.977 2 2.5 6.477 2.5 12C2.5 17.523 6.977 22 12.5 22Z" fill="#FCD7B4   "/>
        <path d="M16.21 15.932C16.0752 15.9344 15.9427 15.8961 15.83 15.822L12.73 13.972C11.96 13.512 11.39 12.502 11.39 11.612V7.51202C11.39 7.10202 11.73 6.76202 12.4 6.76202C12.55 6.76202 12.89 7.10202 12.89 7.51202V11.612C12.89 11.972 13.19 12.502 13.5 12.682L16.6 14.532C16.96 14.742 17.07 15.202 16.86 15.562C16.792 15.6739 16.6967 15.7665 16.583 15.8312C16.4692 15.896 16.3409 15.9307 16.21 15.932Z" fill="#FCD7B4"/>
    </svg>
)

export const VerifyIcon = ({size=16}:SVGProp) => (
    <svg width={size} height={size-1} viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path opacity="0.4" d="M11.25 2.45001C11.94 1.86001 13.07 1.86001 13.77 2.45001L15.35 3.81001C15.65 4.07001 16.21 4.28001 16.61 4.28001H18.31C19.37 4.28001 20.24 5.15001 20.24 6.21001V7.91001C20.24 8.30001 20.45 8.87001 20.71 9.17001L22.07 10.75C22.66 11.44 22.66 12.57 22.07 13.27L20.71 14.85C20.45 15.15 20.24 15.71 20.24 16.11V17.81C20.24 18.87 19.37 19.74 18.31 19.74H16.61C16.22 19.74 15.65 19.95 15.35 20.21L13.77 21.57C13.08 22.16 11.95 22.16 11.25 21.57L9.67 20.21C9.37 19.95 8.81 19.74 8.41 19.74H6.68C5.62 19.74 4.75 18.87 4.75 17.81V16.1C4.75 15.71 4.54 15.15 4.29 14.85L2.94 13.26C2.36 12.57 2.36 11.45 2.94 10.76L4.29 9.17001C4.54 8.87001 4.75 8.31001 4.75 7.92001V6.20001C4.75 5.14001 5.62 4.27001 6.68 4.27001H8.41C8.8 4.27001 9.37 4.06001 9.67 3.80001L11.25 2.45001Z" fill="#BEB4FC"/>
        <path d="M11.29 15.171C11.0912 15.1708 10.9005 15.0917 10.76 14.951L8.34002 12.531C8.20054 12.3899 8.12231 12.1994 8.12231 12.001C8.12231 11.8026 8.20054 11.6121 8.34002 11.471C8.63002 11.181 9.11002 11.181 9.40002 11.471L11.29 13.361L15.59 9.06101C15.88 8.77101 16.36 8.77101 16.65 9.06101C16.94 9.35101 16.94 9.83101 16.65 10.121L11.82 14.951C11.6795 15.0917 11.4889 15.1708 11.29 15.171Z" fill="#BEB4FC"/>
    </svg>
)

export const MessageRemoveIcon = ({size=16}:SVGProp) => (   
    <svg width={size} height={size-1} viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path opacity="0.4" d="M22.5 7.42999V13.43C22.5 14.93 22 16.18 21.12 17.06C20.25 17.93 19 18.43 17.5 18.43V20.56C17.5 21.36 16.61 21.84 15.95 21.4L11.5 18.43H9.38C9.46 18.13 9.5 17.82 9.5 17.5C9.5 16.48 9.11 15.54 8.47 14.83C8.09807 14.4098 7.64074 14.0738 7.12857 13.8444C6.61639 13.615 6.06118 13.4976 5.5 13.5C4.38 13.5 3.36 13.96 2.63 14.71C2.54 14.31 2.5 13.88 2.5 13.43V7.42999C2.5 4.42999 4.5 2.42999 7.5 2.42999H17.5C20.5 2.42999 22.5 4.42999 22.5 7.42999Z" fill="#FCB4B4"/>
        <path d="M16 11.25H9C8.59 11.25 8.25 10.91 8.25 10.5C8.25 10.09 8.59 9.75 9 9.75H16C16.41 9.75 16.75 10.09 16.75 10.5C16.75 10.91 16.41 11.25 16 11.25ZM8.47 14.83C8.09807 14.4098 7.64074 14.0738 7.12857 13.8444C6.61639 13.615 6.06118 13.4976 5.5 13.5C3.29 13.5 1.5 15.29 1.5 17.5C1.5 18.25 1.71 18.96 2.08 19.56C2.28 19.9 2.54 20.21 2.84 20.47C3.54 21.11 4.47 21.5 5.5 21.5C6.96 21.5 8.23 20.72 8.92 19.56C9.29 18.96 9.5 18.25 9.5 17.5C9.5 16.48 9.11 15.54 8.47 14.83ZM7.1 19.08C6.95 19.23 6.76 19.3 6.57 19.3C6.38 19.3 6.19 19.23 6.04 19.08L5.51 18.55L4.96 19.1C4.81 19.25 4.62 19.32 4.43 19.32C4.24 19.32 4.05 19.25 3.9 19.1C3.76052 18.9589 3.6823 18.7684 3.6823 18.57C3.6823 18.3716 3.76052 18.1811 3.9 18.04L4.45 17.49L3.92 16.96C3.78052 16.8189 3.7023 16.6284 3.7023 16.43C3.7023 16.2316 3.78052 16.0411 3.92 15.9C4.21 15.61 4.69 15.61 4.98 15.9L5.51 16.43L6.01 15.93C6.3 15.64 6.78 15.64 7.07 15.93C7.36 16.22 7.36 16.7 7.07 16.99L6.57 17.49L7.1 18.02C7.39 18.31 7.39 18.78 7.1 19.08Z" fill="#FCB4B4"/>
    </svg>
)

export const IRLIcon = ({size=16}:SVGProp) => (
    <svg width={size} height={size-1} viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path opacity="0.6" d="M18.29 10.472V12.002H2.5V10.472C2.5 8.15202 4.39 6.26202 6.71 6.26202H14.08C16.4 6.26202 18.29 8.15202 18.29 10.472Z" fill="#FCB4BD"/>
        <path opacity="0.4" d="M18.29 12V17.79C18.29 20.11 16.4 22 14.08 22H6.71C4.39 22 2.5 20.11 2.5 17.79V12H18.29Z" fill="#FCB4BD"/>
        <path d="M6 5.12097C5.59 5.12097 5.25 4.78097 5.25 4.37097V2.62097C5.25 2.21097 5.59 1.87097 6 1.87097C6.41 1.87097 6.75 2.21097 6.75 2.62097V4.37097C6.75 4.79097 6.41 5.12097 6 5.12097ZM10 5.12097C9.59 5.12097 9.25 4.78097 9.25 4.37097V2.62097C9.25 2.21097 9.59 1.87097 10 1.87097C10.41 1.87097 10.75 2.21097 10.75 2.62097V4.37097C10.75 4.79097 10.41 5.12097 10 5.12097ZM14 5.12097C13.59 5.12097 13.25 4.78097 13.25 4.37097V2.62097C13.25 2.21097 13.59 1.87097 14 1.87097C14.41 1.87097 14.75 2.21097 14.75 2.62097V4.37097C14.75 4.79097 14.41 5.12097 14 5.12097ZM22.15 14.322C22.15 16.472 20.41 18.212 18.26 18.212V10.422C20.4 10.422 22.15 12.172 22.15 14.322Z" fill="#FCB4BD"/>
    </svg>
)

export const VirtualIcon = ({size=16}:SVGProp) => (
    <svg width={size} height={size-1} viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path opacity="0.4" d="M19.59 12.588C19.43 12.588 19.27 12.538 19.13 12.428C15.1 9.31801 9.88999 9.31801 5.85999 12.428C5.52999 12.678 5.05999 12.618 4.80999 12.298C4.55999 11.968 4.61999 11.498 4.93999 11.248C9.52999 7.69801 15.46 7.69801 20.04 11.248C20.37 11.498 20.43 11.968 20.17 12.298C20.04 12.488 19.82 12.588 19.59 12.588Z" fill="#FCB4F5"/>
        <path d="M22.5 9.10801C22.34 9.10801 22.18 9.05801 22.04 8.94801C16.24 4.46801 8.75003 4.46801 2.96003 8.94801C2.63003 9.19801 2.16003 9.13801 1.91003 8.81801C1.66003 8.48801 1.72003 8.01801 2.04003 7.76801C8.39003 2.85801 16.6 2.85801 22.96 7.76801C23.29 8.01801 23.35 8.48801 23.09 8.81801C22.95 9.00801 22.72 9.10801 22.5 9.10801ZM17.71 16.241C17.55 16.241 17.39 16.191 17.25 16.081C14.37 13.851 10.64 13.851 7.75003 16.081C7.42003 16.331 6.95003 16.271 6.70003 15.951C6.45003 15.621 6.51003 15.151 6.83003 14.901C10.27 12.241 14.72 12.241 18.16 14.901C18.49 15.151 18.55 15.621 18.29 15.951C18.2228 16.0413 18.1353 16.1146 18.0345 16.165C17.9338 16.2154 17.8227 16.2414 17.71 16.241Z" fill="#FCB4F5"/>
        <path opacity="0.4" d="M15.1 19.9C14.94 19.9 14.78 19.85 14.64 19.74C13.34 18.73 11.65 18.73 10.35 19.74C10.02 19.99 9.54998 19.93 9.29998 19.61C9.04998 19.28 9.10998 18.81 9.42998 18.56C11.29 17.12 13.69 17.12 15.55 18.56C15.88 18.81 15.94 19.28 15.68 19.61C15.6127 19.7003 15.5252 19.7736 15.4245 19.824C15.3237 19.8743 15.2126 19.9004 15.1 19.9Z" fill="white"/>
    </svg>
)

export const EditIcon = ({size=16}:SVGProp) => (
    <svg width={size} height={size-1} viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.2111 11.35L19.2011 13.25L13.1211 7.17L15.0111 4.16C15.8911 2.77 17.6611 2.71 18.9511 4L22.3611 7.41C23.5811 8.64 23.5011 10.53 22.2111 11.35Z" fill="#E6F7FF"/>
        <path opacity="0.4" d="M16.5001 21.29L7.1401 22.39C6.4901 22.47 5.9101 22.37 5.4201 22.13C4.90202 21.8769 4.48324 21.4581 4.2301 20.94C3.9901 20.45 3.9001 19.88 3.9701 19.24L5.0101 10.53C5.1801 10.62 5.3701 10.7 5.5601 10.76C6.0101 10.92 6.4901 11 7.0001 11C8.1401 11 9.1701 10.58 9.9601 9.88001C10.6214 9.30402 11.0979 8.54568 11.3301 7.70001C11.3901 7.50001 11.4301 7.29001 11.4601 7.07001L13.1201 7.17001L19.2001 13.26L19.4601 17.68C19.7101 20.16 18.8501 21.02 16.5001 21.29Z" fill="#E6F7FF"/>
        <path d="M9.28005 18.281L5.43005 22.131C4.90005 21.871 4.50005 21.471 4.24005 20.941L8.09005 17.091C8.43005 16.761 8.96005 16.761 9.28005 17.091C9.61005 17.421 9.61005 17.951 9.28005 18.281ZM7.00005 2C5.94005 2 4.96005 2.37 4.19005 2.99C3.6605 3.4085 3.23315 3.94202 2.94034 4.55014C2.64754 5.15827 2.49697 5.82506 2.50005 6.5C2.50005 7.34 2.74005 8.14 3.15005 8.82C3.69005 9.72 4.54005 10.42 5.56005 10.76C6.01005 10.92 6.49005 11 7.00005 11C8.14005 11 9.17005 10.58 9.96005 9.88C10.6213 9.30401 11.0979 8.54567 11.33 7.7C11.44 7.32 11.5 6.91 11.5 6.5C11.5 4.01 9.49005 2 7.00005 2ZM8.66005 7.25H7.77005V8.18C7.77005 8.59 7.43005 8.93 7.02005 8.93C6.61005 8.93 6.27005 8.59 6.27005 8.18V7.25H5.30005C4.89005 7.25 4.55005 6.91 4.55005 6.5C4.55005 6.09 4.89005 5.75 5.30005 5.75H6.27005V4.82C6.27005 4.41 6.61005 4.07 7.02005 4.07C7.43005 4.07 7.77005 4.41 7.77005 4.82V5.75H8.66005C8.85896 5.75 9.04972 5.82902 9.19038 5.96967C9.33103 6.11032 9.41005 6.30109 9.41005 6.5C9.41005 6.69891 9.33103 6.88968 9.19038 7.03033C9.04972 7.17098 8.85896 7.25 8.66005 7.25Z" fill="#E6F7FF"/>
    </svg>
)

export const InfoIcon = ({size=16}:SVGProp) => (    
    <svg width={size} height={size-1} viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path opacity="0.4" d="M10.5001 18.3334C15.1026 18.3334 18.8334 14.6026 18.8334 10.0001C18.8334 5.39758 15.1026 1.66675 10.5001 1.66675C5.89758 1.66675 2.16675 5.39758 2.16675 10.0001C2.16675 14.6026 5.89758 18.3334 10.5001 18.3334Z" fill="white"/>
        <path d="M10.5001 11.4584C10.8417 11.4584 11.1251 11.1751 11.1251 10.8334V6.66675C11.1251 6.32508 10.8417 6.04175 10.5001 6.04175C10.1584 6.04175 9.87508 6.32508 9.87508 6.66675V10.8334C9.87508 11.1751 10.1584 11.4584 10.5001 11.4584ZM11.2667 13.0159C11.2251 12.9159 11.1667 12.8242 11.0917 12.7409C11.0084 12.6659 10.9167 12.6076 10.8167 12.5659C10.6139 12.4826 10.3863 12.4826 10.1834 12.5659C10.0834 12.6076 9.99175 12.6659 9.90841 12.7409C9.83341 12.8242 9.77508 12.9159 9.73341 13.0159C9.69175 13.1159 9.66675 13.2242 9.66675 13.3326C9.66675 13.4409 9.69175 13.5492 9.73341 13.6492C9.77508 13.7576 9.83341 13.8409 9.90841 13.9242C9.99175 13.9992 10.0834 14.0576 10.1834 14.0992C10.2834 14.1409 10.3917 14.1659 10.5001 14.1659C10.6084 14.1659 10.7167 14.1409 10.8167 14.0992C10.9167 14.0576 11.0084 13.9992 11.0917 13.9242C11.1667 13.8409 11.2251 13.7576 11.2667 13.6492C11.3084 13.5492 11.3334 13.4409 11.3334 13.3326C11.3334 13.2242 11.3084 13.1159 11.2667 13.0159V13.0159Z" fill="white"/>
    </svg>
)

export const RecordingIcon = ({size=16}:SVGProp) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path opacity="0.4" d="M17.3333 4.33331H9.33333C4.77333 4.33331 3 6.10665 3 10.6666V21.3333C3 24.4 4.66667 27.6666 9.33333 27.6666H17.3333C21.8933 27.6666 23.6667 25.8933 23.6667 21.3333V10.6666C23.6667 6.10665 21.8933 4.33331 17.3333 4.33331Z" fill="black"/>
        <path d="M15.3348 15.1747C15.664 15.1747 15.9899 15.1099 16.2941 14.9839C16.5982 14.8579 16.8745 14.6733 17.1073 14.4405C17.34 14.2077 17.5247 13.9314 17.6506 13.6273C17.7766 13.3232 17.8415 12.9972 17.8415 12.668C17.8415 12.3388 17.7766 12.0129 17.6506 11.7088C17.5247 11.4046 17.34 11.1283 17.1073 10.8955C16.8745 10.6628 16.5982 10.4781 16.2941 10.3522C15.9899 10.2262 15.664 10.1614 15.3348 10.1614C14.67 10.1614 14.0324 10.4255 13.5623 10.8955C13.0922 11.3656 12.8281 12.0032 12.8281 12.668C12.8281 13.3328 13.0922 13.9704 13.5623 14.4405C14.0324 14.9106 14.67 15.1747 15.3348 15.1747ZM28.8668 8.22936C28.3201 7.94936 27.1735 7.62936 25.6135 8.72269L23.6401 10.1094C23.6535 10.296 23.6668 10.4694 23.6668 10.6694V21.336C23.6668 21.536 23.6401 21.7094 23.6401 21.896L25.6135 23.2827C26.4401 23.8694 27.1601 24.056 27.7335 24.056C28.2268 24.056 28.6135 23.9227 28.8668 23.7894C29.4135 23.5094 30.3335 22.7494 30.3335 20.8427V11.176C30.3335 9.26936 29.4135 8.50936 28.8668 8.22936Z" fill="black"/>
    </svg>
)

export const TwitterIcon2 = ({size=25}:SVGProp) => (
    <svg width={size} height={size-1} viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path opacity="0.4" d="M12.5 22.0122C18.023 22.0122 22.5 17.5352 22.5 12.0122C22.5 6.48921 18.023 2.01221 12.5 2.01221C6.977 2.01221 2.5 6.48921 2.5 12.0122C2.5 17.5352 6.977 22.0122 12.5 22.0122Z" fill="#498CD6"/>
        <path d="M18.8477 8.61945C18.4133 8.8116 17.9526 8.93779 17.481 8.99385C17.9781 8.69651 18.3502 8.22857 18.5279 7.67721C18.0613 7.95488 17.5498 8.14947 17.0167 8.25473C16.6586 7.87157 16.1839 7.61745 15.6664 7.53188C15.149 7.44632 14.6178 7.53411 14.1554 7.78159C13.693 8.02908 13.3253 8.42241 13.1095 8.90042C12.8937 9.37843 12.8419 9.91435 12.9621 10.4249C12.0159 10.3774 11.0903 10.1316 10.2453 9.70318C9.40034 9.27482 8.6549 8.67354 8.05739 7.93838C7.8459 8.30165 7.73475 8.7146 7.73535 9.13496C7.73535 9.95999 8.15526 10.6889 8.79366 11.1156C8.41586 11.1037 8.04637 11.0017 7.716 10.818V10.8476C7.71611 11.3971 7.90625 11.9296 8.25418 12.3549C8.6021 12.7802 9.0864 13.0721 9.62495 13.181C9.27424 13.2761 8.9065 13.2901 8.54957 13.222C8.70141 13.695 8.99736 14.1086 9.39599 14.405C9.79461 14.7014 10.2759 14.8657 10.7726 14.8749C10.279 15.2626 9.71382 15.5491 9.10938 15.7182C8.50495 15.8873 7.87311 15.9356 7.25 15.8604C8.33773 16.5599 9.60396 16.9313 10.8972 16.9301C15.2744 16.9301 17.6682 13.3039 17.6682 10.1591C17.6682 10.0567 17.6653 9.95316 17.6608 9.85188C18.1267 9.51514 18.5288 9.09798 18.8482 8.62002L18.8477 8.61945Z" fill="#498CD6"/>
    </svg>
)

export const NotificationIcon = ({size=16}: SVGProp) => (
    <svg width={size} height={size-1} viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M27.1667 8.99984C28.1391 8.99984 29.0718 8.61353 29.7594 7.9259C30.447 7.23826 30.8333 6.30563 30.8333 5.33317C30.8333 4.36071 30.447 3.42808 29.7594 2.74045C29.0718 2.05281 28.1391 1.6665 27.1667 1.6665C26.1942 1.6665 25.2616 2.05281 24.5739 2.74045C23.8863 3.42808 23.5 4.36071 23.5 5.33317C23.5 6.30563 23.8863 7.23826 24.5739 7.9259C25.2616 8.61353 26.1942 8.99984 27.1667 8.99984Z" fill="#E6F7FF"/>
        <path opacity="0.4" d="M27.1666 10.6665C24.22 10.6665 21.8333 8.27984 21.8333 5.33317C21.8333 4.35984 22.1133 3.45317 22.58 2.6665H9.83329C6.15329 2.6665 3.16663 5.63984 3.16663 9.3065V18.6132C3.16663 22.2798 6.15329 25.2532 9.83329 25.2532H11.8333C12.1933 25.2532 12.6733 25.4932 12.9 25.7865L14.9 28.4398C15.78 29.6132 17.22 29.6132 18.1 28.4398L20.1 25.7865C20.3533 25.4532 20.7533 25.2532 21.1666 25.2532H23.1666C26.8466 25.2532 29.8333 22.2798 29.8333 18.6132V9.91984C29.0466 10.3865 28.14 10.6665 27.1666 10.6665Z" fill="#E6F7FF"/>
        <path d="M16.5 16.0002C15.7534 16.0002 15.1667 15.4002 15.1667 14.6668C15.1667 13.9335 15.7667 13.3335 16.5 13.3335C17.2334 13.3335 17.8334 13.9335 17.8334 14.6668C17.8334 15.4002 17.2467 16.0002 16.5 16.0002ZM21.8334 16.0002C21.0867 16.0002 20.5 15.4002 20.5 14.6668C20.5 13.9335 21.1 13.3335 21.8334 13.3335C22.5667 13.3335 23.1667 13.9335 23.1667 14.6668C23.1667 15.4002 22.58 16.0002 21.8334 16.0002ZM11.1667 16.0002C10.42 16.0002 9.83337 15.4002 9.83337 14.6668C9.83337 13.9335 10.4334 13.3335 11.1667 13.3335C11.9 13.3335 12.5 13.9335 12.5 14.6668C12.5 15.4002 11.9134 16.0002 11.1667 16.0002Z" fill="#E6F7FF"/>
    </svg>
)

export const FundDiscourseIcon2 = ({size=32}:SVGProp) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path opacity="0.4" d="M25.0785 8.33332H26.8918C26.6385 7.97332 26.3718 7.63999 26.0918 7.30666L25.0785 8.33332ZM24.6932 5.89332C24.3598 5.61332 24.0265 5.34666 23.6665 5.09332V6.90666L24.6932 5.89332Z" fill="#68D391"/>
        <path opacity="0.4" d="M22.6665 10.3333C22.5332 10.3333 22.4132 10.3067 22.2798 10.2533C22.0343 10.1479 21.8386 9.9522 21.7332 9.70666C21.6799 9.58474 21.6526 9.45304 21.6532 9.31999V3.98666C21.6532 3.97332 21.6665 3.95999 21.6665 3.93332C19.9465 3.13332 18.0265 2.66666 15.9998 2.66666C8.63984 2.66666 2.6665 8.63999 2.6665 16C2.6665 23.36 8.63984 29.3333 15.9998 29.3333C23.3598 29.3333 29.3332 23.36 29.3332 16C29.3332 13.9733 28.8665 12.0533 28.0532 10.32C28.0398 10.32 28.0265 10.3333 27.9998 10.3333H22.6665Z" fill="#68D391"/>
        <path d="M26.1065 7.30799L30.0398 3.37465C30.4265 2.98799 30.4265 2.34799 30.0398 1.96132C29.8517 1.77535 29.5977 1.67105 29.3332 1.67105C29.0686 1.67105 28.8147 1.77535 28.6265 1.96132L24.6932 5.89465C25.1998 6.33465 25.6665 6.81465 26.1065 7.30799ZM23.6692 3.99999C23.6692 3.45332 23.2158 2.99999 22.6692 2.99999C22.1358 2.99999 21.7092 3.42665 21.6825 3.94665C22.3758 4.27999 23.0425 4.65332 23.6692 5.09332V3.99999ZM29.0025 9.33332C29.0025 8.78665 28.5492 8.33332 28.0025 8.33332H26.8958C27.3358 8.95999 27.7225 9.62665 28.0425 10.32C28.5758 10.2933 29.0025 9.86665 29.0025 9.33332ZM18.3332 15.76L16.9998 15.2933V12.3333H17.1065C17.7865 12.3333 18.3332 12.9333 18.3332 13.6667C18.3332 14.2133 18.7865 14.6667 19.3332 14.6667C19.8798 14.6667 20.3332 14.2133 20.3332 13.6667C20.3332 11.8267 18.8932 10.3333 17.1065 10.3333H16.9998V9.99999C16.9998 9.45332 16.5465 8.99999 15.9998 8.99999C15.4532 8.99999 14.9998 9.45332 14.9998 9.99999V10.3333H14.5998C12.9865 10.3333 11.6665 11.6933 11.6665 13.3733C11.6665 15.32 12.7998 15.9467 13.6665 16.2533L14.9998 16.72V19.68H14.8932C14.2132 19.68 13.6665 19.08 13.6665 18.3467C13.6665 17.8 13.2132 17.3467 12.6665 17.3467C12.1198 17.3467 11.6665 17.8 11.6665 18.3467C11.6665 20.1867 13.1065 21.68 14.8932 21.68H14.9998V22.0133C14.9998 22.56 15.4532 23.0133 15.9998 23.0133C16.5465 23.0133 16.9998 22.56 16.9998 22.0133V21.68H17.3998C19.0132 21.68 20.3332 20.32 20.3332 18.64C20.3332 16.68 19.1998 16.0533 18.3332 15.76ZM14.3198 14.3467C13.8665 14.1867 13.6665 14.0933 13.6665 13.36C13.6665 12.7867 14.0932 12.32 14.5998 12.32H14.9998V14.5733L14.3198 14.3467ZM17.3998 19.6667H16.9998V17.4133L17.6798 17.6533C18.1332 17.8133 18.3332 17.9067 18.3332 18.64C18.3332 19.2 17.9065 19.6667 17.3998 19.6667Z" fill="#68D391"/>
    </svg>
)

export const ClaimNFTIcon = ({size=32}:SVGProp) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M29.3321 18.5318V21.5851C29.3321 26.4385 26.4388 29.3318 21.5854 29.3318H10.4121C7.01211 29.3318 4.55878 27.9051 3.41211 25.3718L3.55878 25.2651L10.1188 20.8651C11.1854 20.1451 12.6921 20.2251 13.6388 21.0518L14.0921 21.4251C15.1321 22.3185 16.8121 22.3185 17.8521 21.4251L23.3988 16.6651C24.4388 15.7718 26.1188 15.7718 27.1588 16.6651L29.3321 18.5318Z" fill="#68D391"/>
        <path opacity="0.4" d="M27.9601 10.6665H24.0401C22.3468 10.6665 21.3334 9.65317 21.3334 7.95984V4.03984C21.3334 3.5065 21.4401 3.05317 21.6267 2.6665H10.4134C5.56008 2.6665 2.66675 5.55984 2.66675 10.4132V21.5865C2.66675 23.0398 2.92008 24.3065 3.41341 25.3732L3.56008 25.2665L10.1201 20.8665C11.1867 20.1465 12.6934 20.2265 13.6401 21.0532L14.0934 21.4265C15.1334 22.3198 16.8134 22.3198 17.8534 21.4265L23.4001 16.6665C24.4401 15.7732 26.1201 15.7732 27.1601 16.6665L29.3334 18.5332V10.3732C28.9467 10.5598 28.4934 10.6665 27.9601 10.6665Z" fill="#68D391"/>
        <path d="M12.0012 13.8415C12.8428 13.8415 13.65 13.5072 14.2451 12.912C14.8402 12.3169 15.1745 11.5098 15.1745 10.6682C15.1745 9.82654 14.8402 9.01939 14.2451 8.42428C13.65 7.82916 12.8428 7.49483 12.0012 7.49483C11.1596 7.49483 10.3524 7.82916 9.75733 8.42428C9.16221 9.01939 8.82788 9.82654 8.82788 10.6682C8.82788 11.5098 9.16221 12.3169 9.75733 12.912C10.3524 13.5072 11.1596 13.8415 12.0012 13.8415ZM27.9599 1.3335H24.0399C22.3465 1.3335 21.3332 2.34683 21.3332 4.04016V7.96016C21.3332 9.6535 22.3465 10.6668 24.0399 10.6668H27.9599C29.6532 10.6668 30.6665 9.6535 30.6665 7.96016V4.04016C30.6665 2.34683 29.6532 1.3335 27.9599 1.3335ZM28.8399 4.60016L25.6799 8.2935C25.62 8.36687 25.5448 8.42635 25.4596 8.46779C25.3744 8.50923 25.2813 8.53165 25.1865 8.5335H25.1599C24.9732 8.5335 24.7999 8.46683 24.6665 8.3335L23.1999 6.8935C23.072 6.76377 23.0004 6.58896 23.0004 6.40683C23.0004 6.2247 23.072 6.04988 23.1999 5.92016C23.4665 5.6535 23.9065 5.64016 24.1732 5.92016L25.1065 6.84016L27.7732 3.72016C28.0265 3.42683 28.4532 3.40016 28.7465 3.64016C29.0532 3.88016 29.0799 4.32016 28.8399 4.60016Z" fill="#68D391"/>
    </svg>
)
