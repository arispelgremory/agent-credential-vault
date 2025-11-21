import { getStatusHexColor } from "@/constants/status";

export interface LocationProps {
    lat: number;
    lng: number;
    text: string;
    status: string;
    onClick?: () => void;
    isSelected?: boolean;
    color?: string;
}

export const LocationMarker: React.FC<LocationProps> = ({ lat, lng, text, status, onClick, isSelected = false, color }) => {
    const _lat = lat.toFixed(6);
    const _lng = lng.toFixed(6);
    const _status = status.toLowerCase();
    const _isSelected = isSelected ? "selected" : "";
    const markerColor = color || `${getStatusHexColor(_status)}`;

    return (
        <div className="group relative" onClick={onClick}>
            <div
                className="marker-pin"
                style={{
                    position: "absolute",
                    transform: "translate(-50%, -50%)",
                    backgroundColor: markerColor,
                    border: "3px solid #FFFFFF",
                    borderRadius: "50%",
                    height: "24px",
                    width: "24px",
                    cursor: "pointer",
                    boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
                    zIndex: isSelected ? 2 : 1,
                }}
            />
            <div className="absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 transform rounded bg-white p-2 whitespace-nowrap shadow-lg group-hover:block">
                {text}
            </div>
        </div>
    );
};
