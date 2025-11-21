import { ArrowUpRight } from "lucide-react";
import { ThousandSeparator } from "./thousand-separator";
import { Card, CardContent } from "./ui/card";

export const MetricCard = ({ title, value, trend, icon, color }: any) => (
    <Card className="relative overflow-hidden">
        <div className={`absolute top-0 left-0 h-full w-1 ${color}`} />
        <CardContent className="p-6">
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-2xl font-bold">
                        {typeof value === "number" ? <ThousandSeparator value={value} /> : value}
                    </p>
                    {trend && (
                        <p className="text-success-600 text-xs">
                            <ArrowUpRight className="mr-1 inline h-4 w-4" />
                            {trend}
                        </p>
                    )}
                </div>
                <div className={`rounded-lg p-3 ${color}/10`}>{icon}</div>
            </div>
        </CardContent>
    </Card>
);
