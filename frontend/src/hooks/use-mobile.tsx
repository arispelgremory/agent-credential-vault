import { useState } from "react";

export const useIsMobile = () => {
    const [isMobile] = useState(() => {
        if (typeof window !== "undefined") {
            return window.innerWidth < 768;
        }
        return false;
    });

    return isMobile;
};
