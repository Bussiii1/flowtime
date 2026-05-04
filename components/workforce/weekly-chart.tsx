'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';

interface ChartDataPoint {
  name: string;
  hours: number;
}

interface WeeklyChartProps {
  data: ChartDataPoint[];
}

/**
 * Chart component showing weekly hours distribution using Recharts.
 */
export const WeeklyChart = React.memo(({ data }: WeeklyChartProps) => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke="hsl(var(--muted-foreground))" 
            opacity={0.1} 
          />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fontWeight: 600 }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fontWeight: 600 }}
            dx={-10}
          />
          <Tooltip 
            cursor={{ fill: 'hsl(var(--primary) / 0.05)' }}
            contentStyle={{ 
              borderRadius: '12px', 
              border: '2px solid hsl(var(--border))',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
              fontWeight: 'bold'
            }}
          />
          <Bar 
            dataKey="hours" 
            radius={[6, 6, 0, 0]}
            barSize={40}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={index === data.length - 1 ? 'hsl(var(--primary))' : 'hsl(var(--secondary))'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

WeeklyChart.displayName = 'WeeklyChart';
