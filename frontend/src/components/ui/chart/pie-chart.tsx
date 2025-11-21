"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

import type { Props as RechartsLegendProps } from "recharts/types/component/Legend";

interface PieChartProps {
    data: Array<{ type: string; count: number }>;
    colorField: string;
    valueField: string;
    height: number;
    colors?: string[];
    legend?: RechartsLegendProps;
}

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, _index, name, value, fill }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const sin = Math.sin(-midAngle * RADIAN);
    const cos = Math.cos(-midAngle * RADIAN);
    const sx = cx + (radius + 10) * cos;
    const sy = cy + (radius + 10) * sin;
    const mx = cx + (radius + 30) * cos;
    const my = cy + (radius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? "start" : "end";

    if (percent < 0.05) return null;

    return (
        <g>
            <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" strokeWidth={1.5} />
            <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
            <text
                x={ex + (cos >= 0 ? 1 : -1) * 12}
                y={ey}
                textAnchor={textAnchor}
                fill={fill}
                dominantBaseline="central"
                fontSize="13"
                fontWeight="600"
            >
                {name}
            </text>
            <text
                x={ex + (cos >= 0 ? 1 : -1) * 12}
                y={ey}
                dy={20}
                textAnchor={textAnchor}
                fill={fill}
                dominantBaseline="central"
                fontSize="12"
            >
                {`${(percent * 100).toFixed(1)}% (${value})`}
            </text>
        </g>
    );
};

export function PieChartComponent(props: PieChartProps) {
    return (
        <>
            <ResponsiveContainer width="100%" height={props.height}>
                <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <Pie
                        data={props.data}
                        nameKey={props.colorField}
                        dataKey={props.valueField}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={140}
                        innerRadius={70}
                        paddingAngle={2}
                    >
                        {props.data.map((_, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={props.colors?.[index % (props.colors?.length ?? 1)] ?? "#000"}
                                stroke="#fff"
                                strokeWidth={3}
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(name: string, value: number) => [`${name}`, `${value}`]}
                        contentStyle={{
                            backgroundColor: "rgb(255, 255, 255, 0.9)",
                            borderRadius: "8px",
                            padding: "12px",
                            border: "1px solid var(--border)",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                        wrapperStyle={{
                            outline: "none",
                        }}
                    />
                    {props.legend && <Legend {...(props.legend as any)} />}
                </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-4">
                {props.data.map((item, index) => (
                    <div key={item.type} className="flex items-center gap-2">
                        <div
                            className="h-3 w-3 rounded-sm"
                            style={{ backgroundColor: props.colors?.[index % (props.colors?.length ?? 1)] ?? "#000" }}
                        />
                        <span className="text-sm font-medium">{item.type}</span>
                        <span className="text-muted-foreground text-sm">
                            ({((item.count / props.data.reduce((acc, curr) => acc + curr.count, 0)) * 100).toFixed(1)}%)
                        </span>
                    </div>
                ))}
            </div>
        </>
    );
}
