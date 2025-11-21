import React, { useState, useCallback, useEffect, memo } from "react";

import CameraAccess from "./camera";

interface TimerState {
    isRunning: boolean;
    time: string;
    timerId: number | null;
    isCompleted: boolean;
}

export const Timer = memo(
    ({
        onClose,
        onTimerStateChange,
        showButton = true,
        outletId,
        outletStatus,
        onStatusChange,
    }: {
        onClose: () => void;
        onTimerStateChange: (isRunning: boolean) => void;
        showButton?: boolean;
        outletId: string;
        outletStatus: string;
        onStatusChange?: (status: string) => void;
    }) => {
        const [showCamera, setShowCamera] = useState(false);
        const [showDialog, setShowDialog] = useState(false);

        const getInitialState = useCallback((): TimerState => {
            const savedState = localStorage.getItem(`timer_${outletId}`);
            if (savedState) {
                const parsed = JSON.parse(savedState);
                const lastSaved = new Date(parsed.lastSaved);
                const now = new Date();
                const hoursDiff = (now.getTime() - lastSaved.getTime()) / (1000 * 60 * 60);

                if (hoursDiff < 24) {
                    return {
                        isRunning: false,
                        time: parsed.time,
                        timerId: null,
                        isCompleted: parsed.isCompleted,
                    };
                }
            }
            return {
                isRunning: false,
                time: "00:00:00",
                timerId: null,
                isCompleted: false,
            };
        }, [outletId]);

        const [timerState, setTimerState] = useState<TimerState>(getInitialState);

        useEffect(() => {
            localStorage.setItem(
                `timer_${outletId}`,
                JSON.stringify({
                    ...timerState,
                    lastSaved: new Date().toISOString(),
                })
            );
        }, [timerState, outletId]);

        const handleImageCapture = (imageData: string) => {
            setShowCamera(false);
            if (timerState.timerId) {
                clearInterval(timerState.timerId);
            }
            setTimerState((prev) => ({
                ...prev,
                isRunning: false,
                time: timerState.time,
                timerId: null,
                isCompleted: true,
            }));
            onTimerStateChange(false);
            onStatusChange?.("Completed");
            onClose();
        };

        const handleTimerClick = useCallback(() => {
            if (!timerState.isRunning) {
                let seconds = 0;
                const timer = setInterval(() => {
                    seconds++;
                    const hours = Math.floor(seconds / 3600);
                    const minutes = Math.floor((seconds % 3600) / 60);
                    const secs = seconds % 60;
                    setTimerState((prev) => ({
                        ...prev,
                        time: `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`,
                    }));
                }, 1000);
                setTimerState((prev) => ({
                    ...prev,
                    isRunning: true,
                    timerId: timer as unknown as number,
                }));
                onTimerStateChange(true);
            } else {
                setShowDialog(true);
            }
        }, [timerState.isRunning, onTimerStateChange]);

        const handleDialogConfirm = () => {
            if (timerState.timerId) {
                clearInterval(timerState.timerId);
            }
            setTimerState((prev) => ({
                ...prev,
                isRunning: false,
                time: timerState.time,
                timerId: null,
                isCompleted: true,
            }));
            setShowDialog(false);
            onTimerStateChange(false);
            onClose();
        };

        const handleDialogCancel = () => {
            setShowDialog(false);
            if (timerState.timerId) {
                clearInterval(timerState.timerId);
            }
            setTimerState((prev) => ({
                ...prev,
                isRunning: false,
                time: timerState.time,
                timerId: null,
                isCompleted: true,
            }));
            onTimerStateChange(false);
            onClose();
        };

        useEffect(() => {
            return () => {
                if (timerState.timerId) {
                    clearInterval(timerState.timerId);
                }
            };
        }, [timerState.timerId]);

        return (
            <>
                {showDialog && (
                    <div className="bg-opacity-50 fixed inset-0 z-70 flex items-center justify-center bg-black">
                        <div className="mx-4 w-full max-w-sm rounded-lg bg-white p-6">
                            {!showCamera ? (
                                <>
                                    <h3 className="mb-4 text-lg font-medium">Confirm Time Out</h3>
                                    <p className="mb-6 text-gray-600">
                                        Are you sure you want to time out? You&apos;ll need to take a picture to confirm.
                                    </p>
                                    <button
                                        onClick={() => setShowCamera(true)}
                                        className="mb-6 flex w-full items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
                                    >
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                        </svg>
                                        Take Picture
                                    </button>
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            onClick={handleDialogCancel}
                                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleDialogConfirm}
                                            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                                        >
                                            Confirm
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <CameraAccess onCapture={handleImageCapture} onClose={() => setShowCamera(false)} />
                            )}
                        </div>
                    </div>
                )}
                {showCamera && <CameraAccess onCapture={handleImageCapture} onClose={() => setShowCamera(false)} />}
                <div className="fixed bottom-0 left-1/2 z-60 w-full max-w-md -translate-x-1/2 transform border-t border-gray-200 bg-white p-2">
                    <div className="flex flex-row items-center justify-between">
                        <div className="flex items-center">
                            <svg
                                className="mr-2 h-5 w-5 text-gray-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <span className="font-medium">Timer</span>
                            <span id="timer" className="ml-4 font-mono text-lg">
                                {timerState.time}
                            </span>
                        </div>
                        {showButton && (
                            <button
                                data-time-button
                                className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                                onClick={handleTimerClick}
                                disabled={timerState.isCompleted || outletStatus === "Completed"}
                            >
                                {outletStatus === "Completed"
                                    ? "Completed"
                                    : timerState.isCompleted
                                      ? "Completed"
                                      : timerState.isRunning
                                        ? "Time Out"
                                        : "Time In"}
                            </button>
                        )}
                    </div>
                </div>
            </>
        );
    }
);

Timer.displayName = "Timer";
