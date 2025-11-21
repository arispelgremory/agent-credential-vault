"use client";

import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Legend } from "recharts";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

import type { Props as RechartsLegendProps } from "recharts/types/component/Legend";

export const description = "A line chart";

interface LineChartProps {
    data: Array<{ date: string; value: number }>;
    xField: string;
    yField: string;
    height: number;
    colors?: string[];
    legend?: Partial<RechartsLegendProps>;
    xAxisLabel?: string;
    yAxisLabel?: string;
}

const chartConfig = {
    value: {
        label: "Value",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig;

export function LineChartComponent(props: LineChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Line Chart</CardTitle>
                <CardDescription>January - June 2024</CardDescription>
            </CardHeader>
            <CardContent className="w-full">
                <ChartContainer config={chartConfig}>
                    <LineChart
                        accessibilityLayer
                        data={props.data}
                        margin={{
                            left: 48,
                            right: 12,
                            bottom: 24,
                            top: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey={props.xField}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.slice(0, 10)}
                            label={{
                                value: props.xAxisLabel,
                                position: "bottom",
                                offset: 10,
                            }}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            label={{
                                value: props.yAxisLabel,
                                angle: -90,
                                position: "left",
                                offset: 32,
                            }}
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        {props.legend && <Legend {...(props.legend as any)} />}
                        <Line
                            dataKey={props.yField}
                            type="natural"
                            stroke={props.colors?.[0] ?? "var(--color-desktop)"}
                            strokeWidth={2}
                            dot={false}
                            name={chartConfig.value.label}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 leading-none font-medium">
                    Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground leading-none">Showing total visitors for the last 6 months</div>
            </CardFooter>
        </Card>
    );
}
