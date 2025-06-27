"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {hydrateUser, setUser} from "@/store/slices/userSlice";

export default function UserBootstrap() {
    const dispatch = useDispatch();

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            try {
                const userObj = JSON.parse(userStr);
                dispatch(setUser(userObj));
                return;
            } catch {}
        }
        // init status
        dispatch(hydrateUser());
    }, [dispatch]);

    return null;
}