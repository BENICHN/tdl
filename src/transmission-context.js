import { createContext, useContext, useEffect, useState } from "react";
import { getTrTL } from "./utils";

const TransmissionContext = createContext([])

export const useTransmission = () => useContext(TransmissionContext)

export function TransmissionProvider(props) {
    const [value, setValue] = useState([])
    useEffect(() => {
        setInterval(async () => {
            setValue(await getTrTL())
        }, 500)
    }, [])
    return <TransmissionContext.Provider value={value} {...props} />
}