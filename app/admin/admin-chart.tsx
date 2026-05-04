'use client';

import React, { useEffect, useState } from 'react';
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

interface AdminChartProps {
  data: ChartDataPoint[];
}

/**
 * AdminChart component showing daily hours distribution using Recharts.
 * Fixed "width/height greater than 0" warning by ensuring mounting state.
 */
export default function AdminChart({ data }: AdminChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="h-[300px] w-full bg-muted/10 animate-pulse rounded-xl" />;
  }

  return (
    <div className="h-[300px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
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
            tick={{ fontSize: 10, fontWeight: 600, fill: 'hsl(var(--muted-foreground))' }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fontWeight: 600, fill: 'hsl(var(--muted-foreground))' }}
            dx={-10}
          />
          <Tooltip 
            cursor={{ fill: 'hsl(var(--primary) / 0.05)' }}
            contentStyle={{ 
              borderRadius: '12px', 
              border: '2px solid hsl(var(--border))',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
              fontWeight: 'bold',
              fontSize: '12px'
            }}
          />
          <Bar 
            dataKey="hours" 
            radius={[6, 6, 0, 0]}
            barSize={20}
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
}
