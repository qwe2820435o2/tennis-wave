"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {hydrateUser, setUser} from "@/store/slices/userSlice";
import { RootState } from "@/store";
import signalRService from "@/services/signalRService";

export default function UserBootstrap() {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user);

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        const token = localStorage.getItem("token");
        if (userStr && token) {
            try {
                const userObj = JSON.parse(userStr);
                dispatch(setUser({ ...userObj, token }));
                return;
            } catch (error) {
                console.error('Failed to parse user data:', error);
            }
        }
        // init status
        dispatch(hydrateUser());
    }, [dispatch]);

    // Start SignalR connection when user is authenticated
    useEffect(() => {
        console.log('UserBootstrap: Checking user authentication...');
        console.log('User ID:', user.userId);
        console.log('Has token:', !!user.token);
        
        if (user.userId && user.token) {
            console.log('UserBootstrap: Starting SignalR connection...');
            signalRService.startConnection().catch(error => {
                console.error('UserBootstrap: Failed to start SignalR connection:', error);
            });
        } else {
            console.log('UserBootstrap: Stopping SignalR connection...');
            signalRService.stopConnection().catch(error => {
                console.error('UserBootstrap: Failed to stop SignalR connection:', error);
            });
        }
    }, [user.userId, user.token]);

    return null;
}