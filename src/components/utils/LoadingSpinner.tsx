import UseAnimations from "react-useanimations";
import loading from "react-useanimations/lib/loading";
const LoadingSpinner = ({strokeColor = "#ffffff"} : {strokeColor: string}) => {
    return (
        <UseAnimations animation={loading} size={24} strokeColor={strokeColor} />
    );
}


export default LoadingSpinner;