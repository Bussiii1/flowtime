'use client';

import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  Calendar, 
  Euro,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPIData {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isUp: boolean;
  };
  color: string;
}

interface KPICardsProps {
  data?: KPIData[];
}

/**
 * Default KPI configuration if no data is provided.
 */
const defaultKpis: KPIData[] = [
  { 
    title: "Actifs aujourd'hui", 
    value: 12, 
    description: "Équipiers sur le pont", 
    icon: Users, 
    trend: { value: 8, isUp: true },
    color: "text-primary"
  },
  { 
    title: "Heures à valider", 
    value: 5, 
    description: "Déclarations en attente", 
    icon: Clock, 
    color: "text-orange-500"
  },
  { 
    title: "Total Heures Semaine", 
    value: "245h", 
    description: "Cumul hebdomadaire", 
    icon: Calendar, 
    trend: { value: 12, isUp: true },
    color: "text-secondary"
  },
  { 
    title: "Coût salarial (Est.)", 
    value: "3.450 €", 
    description: "Dépense brute estimée", 
    icon: Euro, 
    trend: { value: 3, isUp: false },
    color: "text-primary"
  },
];

/**
 * Grid of KPI cards for the admin dashboard.
 */
export const KPICards = React.memo(({ data = defaultKpis }: KPICardsProps) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {data.map((kpi, index) => (
        <Card key={index} className="border-2 shadow-none transition-all hover:border-primary/50 group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
              {kpi.title}
            </CardTitle>
            <kpi.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", kpi.color)} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tight">{kpi.value}</div>
            <div className="flex items-center gap-2 mt-1">
              {kpi.trend && (
                <div className={cn(
                  "flex items-center gap-0.5 text-[10px] font-black uppercase px-1.5 py-0.5 rounded-full",
                  kpi.trend.isUp ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                )}>
                  {kpi.trend.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {kpi.trend.value}%
                </div>
              )}
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide">
                {kpi.description}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});

KPICards.displayName = 'KPICards';
