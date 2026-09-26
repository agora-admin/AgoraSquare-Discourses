import dynamic from "next/dynamic";
import loading from "react-useanimations/lib/loading";

// `react-useanimations` requires `lottie-web` at module scope, and `lottie-web` is browser-only.
// It guards itself with `typeof navigator !== "undefined"`, but Node 21 added a global `navigator`,
// so the guard passes and the library touches `document` while the module is evaluated. Under
// `next build` that surfaces as `Failed to collect page data for /`. Loading the component
// client-only keeps the real animation in the browser and the module out of the server bundle.
// `loading` above is plain JSON, so it is safe to import normally.
const UseAnimations = dynamic(() => import("react-useanimations"), { ssr: false });
const LoadingSpinner = ({strokeColor = "#ffffff"} : {strokeColor: string}) => {
    return (
        <UseAnimations animation={loading} size={24} strokeColor={strokeColor} />
    );
}


export default LoadingSpinner;