import { CloseCircle, Information, Timer, Verify, Warning2 } from "iconsax-react";
import { uuid } from "uuidv4";
import { Toast, ToastTypes } from "../../lib/Types";

const ToastCard = ({ data, close }: { data: Toast, close: (id: string) => void }) => {
    const getTextColor = (type: ToastTypes) => {
        switch (type) {
            case ToastTypes.success:
                return "text-[#ABECD6]";
            case ToastTypes.info:
                return "text-[#c6c6c6]";
            case ToastTypes.error:
                return "text-[#fc8181]";
            default:
                return "text-[#c6c6c6]";
        }
    }
    const getTitle = (type: ToastTypes) => {
        switch (type) {
            case ToastTypes.success:
                return "Success";
            case ToastTypes.info:
                return "Information";
            case ToastTypes.error:
                return "Error!";
            default:
                return "Toast";
        }
    }

    const handleClose = () => {
        close(data.id);
    }

    return (
        <div className=" pointer-events-auto w-full bg-card p-4 rounded-xl flex flex-col gap-2 relative t-all-100 animate-animateIn">
            <button onClick={() => handleClose()} className="button-i absolute right-0 top-0 m-2"><CloseCircle size={16} color="#c6c6c6" /></button>
            <div className="flex items-center gap-2">
                { data.type === ToastTypes.info && <Warning2 size={16} color="#c6c6c6" />}
                { data.type === ToastTypes.error && <Information size={16} color="#fc8181" />}
                { data.type === ToastTypes.success && <Verify size={16} color="#ABECD6" />}
                { data.type === ToastTypes.wait && <Timer size={16} color="#c6c6c6" /> }
                <p className={`text-xs font-Lexend ${getTextColor(data.type)}`}>{data.title !== "" ? data.title : getTitle(data.type)}</p>
            </div>
            <p className="text-[10px] font-Lexend w-full text-[#c6c6c6]">{data.body}</p>
        </div>
    );
}

export default ToastCard;