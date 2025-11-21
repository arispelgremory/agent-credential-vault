"use client";

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ScatterChartProps {
    data: Array<{ orderValue: number; sales: number }>;
    xField: string;
    yField: string;
    height?: number;
    colors?: string[];
    xAxisLabel?: string;
    yAxisLabel?: string;
}

export function ScatterChartComponent({
    data,
    xField,
    yField,
    height = 300,
    colors = ["#4169E1"],
    xAxisLabel,
    yAxisLabel,
}: ScatterChartProps) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <ScatterChart
                margin={{
                    top: 20,
                    right: 20,
                    bottom: 40,
                    left: 40,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey={xField}
                    type="number"
                    name={xAxisLabel}
                    label={{ value: xAxisLabel, position: "bottom", offset: 20 }}
                />
                <YAxis
                    dataKey={yField}
                    type="number"
                    name={yAxisLabel}
                    label={{ value: yAxisLabel, angle: -90, position: "left", offset: 20 }}
                />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Scatter name="Data Points" data={data} fill={colors[0]} />
            </ScatterChart>
        </ResponsiveContainer>
    );
}
