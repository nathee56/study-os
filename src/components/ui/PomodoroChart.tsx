import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface PomodoroChartProps {
  todayFocusMinutes: number;
}

export default function PomodoroChart({ todayFocusMinutes }: PomodoroChartProps) {
  // Generate mock data for the last 6 days + today
  const days = ['จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.', 'อา.'];
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  
  const data = days.map((day, index) => {
    let value = 0;
    if (index === todayIndex) {
      value = todayFocusMinutes;
    } else if (index < todayIndex) {
      // Random past data
      value = Math.floor(Math.random() * 120) + 30;
    }
    return { name: day, minutes: value };
  });

  return (
    <div className="w-full h-[180px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--orange)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--orange)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-hint)' }} />
          <Tooltip 
            cursor={{ stroke: 'var(--border-strong)', strokeWidth: 1, strokeDasharray: '4 4' }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', background: 'var(--surface-card)' }}
            itemStyle={{ color: 'var(--orange)', fontWeight: 600 }}
            labelStyle={{ color: 'var(--text-secondary)', marginBottom: 4 }}
            formatter={(value: any) => [`${value} นาที`, 'เวลาโฟกัส']}
          />
          <Area type="monotone" dataKey="minutes" stroke="var(--orange)" strokeWidth={3} fillOpacity={1} fill="url(#colorMinutes)" activeDot={{ r: 6, fill: 'var(--orange)', stroke: '#fff', strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
