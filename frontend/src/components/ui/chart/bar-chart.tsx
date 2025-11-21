"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
export const description = "Performance metrics chart";

interface BarChartProps {
    data: Array<{ name: string; value: number }>;
    title: string;
    description: string;
    height?: number;
    width?: number;
    colors?: string[];
    showTrend?: boolean;
    trendValue?: string;
    trendDescription?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
}

const formatNumber = (value: any): string => {
    if (typeof value === "number") {
        return value.toLocaleString();
    }
    if (typeof value === "string" && !isNaN(Number(value))) {
        return Number(value).toLocaleString();
    }
    return "0";
};

export function BarChartComponent({
    data,
    title,
    description,
    height = 300,
    width = 500,
    colors = ["var(--chart-primary)"],
    showTrend = true,
    trendValue,
    trendDescription,
    xAxisLabel,
    yAxisLabel,
}: BarChartProps) {
    return (
        <Card className="">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width={width} height={height}>
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 40, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="name"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => (value.length > 12 ? `${value.slice(0, 12)}...` : value)}
                            label={{ value: xAxisLabel, position: "bottom", offset: 0 }}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 12 }}
                            label={{ value: yAxisLabel, angle: -90, position: "left", offset: 0 }}
                            tickFormatter={(value: number) => formatNumber(value)}
                        />
                        <Tooltip
                            cursor={false}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-background rounded-lg border p-2 shadow-sm">
                                            <p className="font-medium">{payload[0].payload.name}</p>
                                            <p className="text-muted-foreground">{payload[0].value?.toLocaleString()}</p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar dataKey="value" fill={colors[0]} radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
            {showTrend && trendValue && (
                <CardFooter className="flex-col items-start gap-2 text-sm">
                    <div className="flex gap-2 leading-none font-medium">
                        {trendValue} <TrendingUp className="h-4 w-4" />
                    </div>
                    {trendDescription && <div className="text-muted-foreground leading-none">{trendDescription}</div>}
                </CardFooter>
            )}
        </Card>
    );
}

// Example usage in dashboard:
/*
// Top Products Chart
<BarChartComponent
    data={processTopPerformers(mockData.product.categories, 'count')}
    xField="name"
    yField="value"
    title="Top Products"
    description="Best performing products by sales volume"
    trend="+12.5%"
    trendValue="Sales increasing"
    trendDescription="Compared to last month"
/>

// Top Outlets Chart
<BarChartComponent
    data={processTopPerformers(mockData.sales.regions, 'count')}
    xField="name"
    yField="value"
    title="Top Outlets"
    description="Best performing outlets by revenue"
    trend="+8.3%"
    trendValue="Revenue growth"
    trendDescription="Month-over-month improvement"
/>
*/
