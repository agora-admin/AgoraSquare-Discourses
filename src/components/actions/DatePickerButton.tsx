import React, { Dispatch, SetStateAction, useState, useEffect } from "react";
import { getEndDate } from "../../helper/TimeHelper";

interface SpanishMonth {
    name: string;
    shortName: string;
    spanishCalendarMonthNumber: number;
}

interface DatePickerReducerState {
    isOpen: boolean;
    date: string;
    displayDate: string;
    month: number;
    year: number;
    daysInMonthArr: number[];
    blankDaysArr: number[];
}

const months: { [id: number]: string } = {
    0: "January",
    1: "February",
    2: "March",
    3: "April",
    4: "May",
    5: "June",
    6: "July",
    7: "August",
    8: "September",
    9: "October",
    10: "November",
    11: "December"
};

const spanishMonths: { [id: number]: SpanishMonth } = {
    0: {
        name: "January",
        shortName: "Jan",
        spanishCalendarMonthNumber: 1
    },
    1: {
        name: "February",
        shortName: "Feb",
        spanishCalendarMonthNumber: 2
    },
    2: {
        name: "March",
        shortName: "Mar",
        spanishCalendarMonthNumber: 3
    },
    3: {
        name: "April",
        shortName: "Apr",
        spanishCalendarMonthNumber: 4
    },
    4: {
        name: "May",
        shortName: "May",
        spanishCalendarMonthNumber: 5
    },
    5: {
        name: "June",
        shortName: "Jun",
        spanishCalendarMonthNumber: 6
    },
    6: {
        name: "July",
        shortName: "Jul",
        spanishCalendarMonthNumber: 7
    },
    7: {
        name: "August",
        shortName: "Aug",
        spanishCalendarMonthNumber: 8
    },
    8: {
        name: "September",
        shortName: "Sep",
        spanishCalendarMonthNumber: 9
    },
    9: {
        name: "October",
        shortName: "Oct",
        spanishCalendarMonthNumber: 10
    },
    10: {
        name: "November",
        shortName: "Nov",
        spanishCalendarMonthNumber: 11
    },
    11: {
        name: "December",
        shortName: "Dec",
        spanishCalendarMonthNumber: 12
    }
};

interface SpanishCalendarDay {
    name: string;
    shortName: string;
    spanishCalendarWeekdayNumber: number;
}

const spanishDays: { [id: number]: SpanishCalendarDay } = {
    0: {
        name: "Monday",
        shortName: "Mon",
        spanishCalendarWeekdayNumber: 6
    },
    1: {
        name: "Tuesday",
        shortName: "Tue",
        spanishCalendarWeekdayNumber: 0
    },
    2: {
        name: "Wednesday",
        shortName: "Wed",
        spanishCalendarWeekdayNumber: 1
    },
    3: {
        name: "Thursday",
        shortName: "Thu",
        spanishCalendarWeekdayNumber: 2
    },
    4: {
        name: "Friday",
        shortName: "Fri",
        spanishCalendarWeekdayNumber: 3
    },
    5: {
        name: "Saturday",
        shortName: "Sat",
        spanishCalendarWeekdayNumber: 4
    },
    6: {
        name: "Sunday",
        shortName: "Sun",
        spanishCalendarWeekdayNumber: 5
    }
};

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];


export const getSpanishDate = (date: Date): string => {
    const year = date.getFullYear();
    const monthShortName = spanishMonths[date.getMonth()].shortName;
    const day = ("0" + date.getDate()).slice(-2);
    const dayShortName = spanishDays[date.getDay()].shortName;

    return `${dayShortName} ${day} ${monthShortName}, ${year}`;
};

const formatYearsMonthDay = (date: Date): string => {
    return (
        date.getFullYear() +
        "-" +
        ("0" + (date.getMonth() + 1)).slice(-2) +
        "-" +
        ("0" + date.getDate()).slice(-2)
    );
};

const DatePicker = ({ endTS, dates, setDates }: { endTS: number , dates: Array<any>, setDates: Dispatch<SetStateAction<any>> }) => {
    // const [state, dispatch] = React.useReducer<
    //     React.Reducer<DatePickerReducerState, DatePickeReducerAction>
    // >(datePickerReducer, initState);
    const displayDateRef = React.useRef<HTMLInputElement>();
    const daysDivRef = React.useRef<HTMLDivElement>();

    const [month, setMonth] = useState(new Date().getMonth());
    const [year, setYear] = useState(new Date().getFullYear());
    const [dayNum, setDayNum] = useState(new Date().getDate());
    // const [selectedDates, setSelectedDates] = useState<Array<number>>([]);
    const [monthCount, setMonthCount] = useState(0);


    const [blankDays, setBlankDays] = useState<Array<number>>([]);
    const [daysInMonth, setDaysInMonth] = useState<Array<number>>([]);


    const handleClick = (dayN: number) => {
        const dateToFormat = new Date(year, month, dayN);
        const date = formatYearsMonthDay(dateToFormat);
        const displayDate = getSpanishDate(dateToFormat);
        if (dates.includes(dateToFormat) || disableDate(dayN)) {
            return;
        }
        if (dates.length >= 3) {
            // TODO: Show error message
        } else {
            setDates([...dates, dateToFormat]);
        }
    }


    useEffect(() => {

        const dayOfWeek = new Date(year, month).getDay();
        const spanishWeekday =
            spanishDays[dayOfWeek].spanishCalendarWeekdayNumber;
        let blankDaysArr: number[] = [];
        for (let i = 1; i <= spanishWeekday; i++) {
            blankDaysArr.push(i);
        }

        setBlankDays(blankDaysArr);

        // Get last day number of the previous actual month
        const daysInMonth = new Date(year, month, 0).getDate();
        let daysInMonthArr: number[] = [];
        for (let i = 1; i < daysInMonth; i++) {
            daysInMonthArr.push(i);
        }

        setDaysInMonth(daysInMonthArr);
    }, []);

    const handleClickPrevMonth = () => {
        let newYear: number;
        let newMonth: number;
        if (month === 0) {
            newMonth = 11;
            newYear = year - 1;
        } else {
            newMonth = month - 1;
            newYear = year;
        }

        const newMonthFirstWeekdayNumber = new Date(
            newYear,
            newMonth,
            1
        ).getDay();
        const spanishFirstWeekdayNumber =
            spanishDays[newMonthFirstWeekdayNumber].spanishCalendarWeekdayNumber;
        const daysInMonth = new Date(newYear, newMonth + 1, 0).getDate();

        let blankDaysArr = [];
        for (let i = 1; i <= spanishFirstWeekdayNumber; i++) {
            blankDaysArr.push(i);
        }

        setBlankDays(blankDaysArr);
        let daysInMonthArr = [];
        for (let i = 1; i <= daysInMonth; i++) {
            daysInMonthArr.push(i);
        }


        setDaysInMonth(daysInMonthArr);

        setMonth(newMonth);
        setYear(newYear);
        setMonthCount(prev => prev - 1);
    }

    const handleClickNextMonth = () => {
        let newYear: number;
        let newMonth: number;
        if (month === 11) {
            newMonth = 0;
            newYear = year + 1;
        } else {
            newMonth = month + 1;
            newYear = year;
        }

        const newMonthFirstWeekdayNumber = new Date(
            newYear,
            newMonth,
            1
        ).getDay();
        const spanishFirstWeekdayNumber =
            spanishDays[newMonthFirstWeekdayNumber].spanishCalendarWeekdayNumber;
        const daysInMonth = new Date(newYear, newMonth + 1, 0).getDate();

        let blankDaysArr = [];
        for (let i = 1; i <= spanishFirstWeekdayNumber; i++) {
            blankDaysArr.push(i);
        }

        setBlankDays(blankDaysArr);

        let daysInMonthArr = [];
        for (let i = 1; i <= daysInMonth; i++) {
            daysInMonthArr.push(i);
        }

        setDaysInMonth(daysInMonthArr);

        setMonth(newMonth);
        setYear(newYear);
        setMonthCount(prev => prev + 1);
    }

    const isSelectedDate = (day: number) => {
        if (dates.find(date => date.getDate() === day && date.getMonth() === month && date.getFullYear() === year)) {
            return true;
        }
    }

    const showNextMonth = () => {
        const today = new Date();
        // Get last day number of the previous actual month
        const lastDay = new Date(today.getFullYear(), today.getMonth(), 0).getDate();

        if (lastDay - today.getDate() >= 14) {
            return false;
        } else {
            return true;
        }
    }

    const getNextMonthDayLimit = () => {
        const today = new Date();
        // Get last day number of the previous actual month
        const lastDay = new Date(today.getFullYear(), today.getMonth(), 0).getDate();

        const daysInCurrentMonth = lastDay - today.getDate();
        

        return getEndDate(endTS).getDate() - daysInCurrentMonth;
    }

    const disableDate = (day: number) => {
        const today = new Date();

        if (monthCount === 0) {
            if (day < today.getDate() || day > (today.getDate() + 14)) {
                return true;
            } else {
                return false;
            }
        } else {
            if (day < getNextMonthDayLimit()) {
                return false;
            } else {
                return true;
            }
        }
        
    }

    const isToday = (dayNumber: number) => {
        const today = new Date();
        const day = new Date(year, month, dayNumber);

        return today.toDateString() === day.toDateString() ? true : false;
    };



    return (


        <div className="relative flex ">


            <div
                className={`focus:outline-none duration-200 rounded-lg shadow p-4 top-0 left-0 visible opacity-100
                    `}
                style={{ width: "17rem" }}
                tabIndex={-1}
            >
                <div className="flex justify-between items-center mb-2">
                    <div>
                        <span className="text-lg font-bold text-[#c6c6c6]">
                            {months[month]}
                        </span>
                        <span className="ml-1 text-lg text-gray-600 font-normal">
                            {year}
                        </span>
                    </div>
                    <div>
                        {monthCount > 0 && <button
                            type="button"
                            className={`transition ease-in-out duration-100 inline-flex cursor-pointer hover:bg-gray-200 p-1 rounded-full focus:shadow-outline focus:outline-none mr-1`}
                            onClick={handleClickPrevMonth}
                        >
                            <svg
                                className="h-6 w-6 text-gray-500 inline-flex"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                        </button>}

                        {showNextMonth() && monthCount ===0 && <button
                            type="button"
                            // onMouseDown={event => event.preventDefault()}
                            className={`transition ease-in-out duration-100 inline-flex cursor-pointer hover:bg-gray-200 p-1 rounded-full focus:shadow-outline focus:outline-none`}
                            onClick={handleClickNextMonth}
                        >
                            <svg
                                className="h-6 w-6 text-gray-500 inline-flex"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </button>}
                    </div>
                </div>

                <div className="flex flex-wrap mb-3 -mx-1">
                    {days.map((day, index) => (
                        <div
                            key={index}
                            style={{ width: "14.26%" }}
                            className="px-1"
                        >
                            <div className="text-[#c6c6c6] font-medium text-center text-xs">
                                {day}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-wrap -mx-1">
                    {blankDays.map(day => (
                        <div
                            key={day}
                            style={{ width: "14.28%" }}
                            className="text-center border p-1 border-transparent text-sm"
                        />
                    ))}
                    {daysInMonth.map((dayNumber, index) => (
                        <div
                            key={index}
                            style={{ width: "14.28%" }}
                            className="px-1 mb-1"
                        >
                            <div
                                onClick={() => {
                                    handleClick(dayNumber);
                                    // dispatch({ type: "SET_DATE", dayNumber });
                                    // toggleDisplayDateFocus();
                                }}
                                // onMouseDown={event => event.preventDefault()}
                                className={`cursor-pointer text-center text-sm leading-none rounded-lg leading-loose transition ease-in-out duration-100 
                                                ${isSelectedDate(dayNumber)
                                        ? "bg-blue-500 text-white"
                                        : disableDate(dayNumber) ? "text-[#c6c6c6]/30" : "text-[#c6c6c6] hover:bg-blue-200/30"
                                    }`}
                            >
                                {dayNumber}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>


    );
};

export default DatePicker;
