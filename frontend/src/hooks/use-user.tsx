import { useState } from "react";
import { UserTypes } from "@/features/user/schema/user-schema";

// import { userData } from "@/constants/demo-data";

export const useUser = () => {
    const [user, setUser] = useState<UserTypes | null>(null);
    return [user, setUser];
};
