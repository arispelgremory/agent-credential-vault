import React, { useRef, useEffect } from "react";

interface CameraAccessProps {
    onCapture: (imageData: string) => void;
    onClose: () => void;
}

const CameraAccess: React.FC<CameraAccessProps> = ({ onCapture, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        const getCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    streamRef.current = stream;
                }
            } catch (error) {
                console.error("Error accessing camera:", error);
            }
        };

        getCamera();

        // Store ref in a variable for cleanup
        const currentVideoRef = videoRef.current;

        // Cleanup function to stop the camera when component unmounts
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => {
                    track.stop();
                });
            }
            if (currentVideoRef) {
                currentVideoRef.srcObject = null;
            }
        };
    }, []); // Run once when the component mounts

    const takePicture = () => {
        const canvas = canvasRef.current;
        const video = videoRef.current;

        if (canvas && video) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const context = canvas.getContext("2d");
            if (context) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageData = canvas.toDataURL("image/jpeg");
                onCapture(imageData);
            }
        }
    };

    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center justify-between bg-black p-4">
                <h2 className="text-lg font-medium text-white">Take Photo</h2>
                <button onClick={onClose} className="text-white transition-colors hover:text-gray-300">
                    ✕
                </button>
            </div>

            <div className="relative flex flex-1 flex-col items-center justify-center bg-black">
                <video ref={videoRef} autoPlay playsInline className="mb-8 h-[300px] w-full object-contain" />

                <button
                    onClick={takePicture}
                    className="flex items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-3 text-white shadow-lg transition-colors hover:bg-blue-700"
                >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" strokeWidth="2" />
                        <circle cx="12" cy="12" r="3" fill="currentColor" />
                    </svg>
                    Take Picture
                </button>
            </div>

            <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
    );
};

export default CameraAccess;
