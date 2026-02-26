'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Users, ClipboardCheck, DollarSign, Star, Target, Award, ArrowUp, Clock, BarChart3 } from 'lucide-react';

const DATA = {
  stats: { clients: 45, newClients: 8, verifications: 87, verificationRate: 94, avgResponse: '2.4 hrs', satisfaction: 4.8, revenue: 125000, growth: 12.5 },
  targets: { clients: { current: 45, target: 50 }, verifications: { current: 87, target: 100 }, revenue: { current: 125000, target: 150000 }, satisfaction: { current: 4.8, target: 4.5 } },
  weekly: [
    { day: 'Mon', verifications: 5, calls: 8, emails: 12 },
    { day: 'Tue', verifications: 4, calls: 6, emails: 15 },
    { day: 'Wed', verifications: 6, calls: 10, emails: 8 },
    { day: 'Thu', verifications: 3, calls: 7, emails: 11 },
    { day: 'Fri', verifications: 5, calls: 9, emails: 14 },
  ],
  leaderboard: [
    { rank: 1, name: 'Sarah Johnson', score: 98, isYou: true },
    { rank: 2, name: 'Michael Chen', score: 95, isYou: false },
    { rank: 3, name: 'Emily Davis', score: 92, isYou: false },
    { rank: 4, name: 'Robert Wilson', score: 89, isYou: false },
    { rank: 5, name: 'Anna Lee', score: 87, isYou: false },
  ],
  achievements: [
    { title: 'Top Performer - Q4', desc: 'Highest client acquisition rate', date: '2024-01-15' },
    { title: 'Perfect Score', desc: '100% accuracy in December', date: '2024-01-01' },
    { title: 'Satisfaction Award', desc: '4.9 rating for Q4', date: '2023-12-20' },
  ],
};

export default function PerformancePage() {
  const [timeRange, setTimeRange] = useState('month');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Performance</h1>
          <p className="text-slate-400">Track your metrics and achievements</p>
        </div>
        <div className="flex gap-2">
          {['week', 'month', 'quarter'].map((t) => (
            <Button key={t} variant={timeRange === t ? 'default' : 'outline'} onClick={() => setTimeRange(t)} size="sm" className="border-slate-700 capitalize">
              This {t}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-4">
            <Users className="h-5 w-5 text-blue-400" />
            <p className="text-2xl font-bold text-white mt-2">{DATA.stats.clients}</p>
            <p className="text-sm text-slate-400">Total Clients</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-4">
            <ClipboardCheck className="h-5 w-5 text-purple-400" />
            <p className="text-2xl font-bold text-white mt-2">{DATA.stats.verifications}</p>
            <p className="text-sm text-slate-400">Verifications</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-4">
            <Clock className="h-5 w-5 text-yellow-400" />
            <p className="text-2xl font-bold text-white mt-2">{DATA.stats.avgResponse}</p>
            <p className="text-sm text-slate-400">Avg Response</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-4">
            <Star className="h-5 w-5 text-yellow-400" />
            <p className="text-2xl font-bold text-white mt-2">{DATA.stats.satisfaction}</p>
            <p className="text-sm text-slate-400">Satisfaction</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <DollarSign className="h-5 w-5 text-green-400" />
              <span className="text-green-400 text-xs flex items-center"><ArrowUp className="h-3 w-3" />{DATA.stats.growth}%</span>
            </div>
            <p className="text-2xl font-bold text-white mt-2">${(DATA.stats.revenue / 1000).toFixed(0)}K</p>
            <p className="text-sm text-slate-400">Revenue</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border-blue-500/30">
          <CardContent className="pt-4">
            <Award className="h-5 w-5 text-blue-400" />
            <p className="text-2xl font-bold text-white mt-2">#1</p>
            <p className="text-sm text-slate-400">Team Rank</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2"><Target className="h-5 w-5 text-blue-400" />Monthly Targets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[{ label: 'Clients', ...DATA.targets.clients }, { label: 'Verifications', ...DATA.targets.verifications }, { label: 'Revenue', current: DATA.targets.revenue.current / 1000, target: DATA.targets.revenue.target / 1000, suffix: 'K' }, { label: 'Satisfaction', ...DATA.targets.satisfaction }].map((t) => (
              <div key={t.label} className="space-y-2">
                <div className="flex justify-between"><span className="text-slate-300">{t.label}</span><span className="text-white">{t.current}{t.suffix || ''}/{t.target}{t.suffix || ''}</span></div>
                <Progress value={(t.current / t.target) * 100} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><BarChart3 className="h-5 w-5 text-purple-400" />Weekly Activity</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {DATA.weekly.map((d) => (
                <div key={d.day} className="flex items-center gap-4">
                  <span className="w-10 text-slate-400">{d.day}</span>
                  <div className="flex-1 flex gap-1">
                    <div className="flex-1 bg-slate-800 rounded h-5"><div className="bg-blue-500 h-full rounded text-xs text-white flex items-center justify-center" style={{ width: `${d.verifications * 10}%` }}>{d.verifications}</div></div>
                    <div className="flex-1 bg-slate-800 rounded h-5"><div className="bg-green-500 h-full rounded text-xs text-white flex items-center justify-center" style={{ width: `${d.calls * 7}%` }}>{d.calls}</div></div>
                    <div className="flex-1 bg-slate-800 rounded h-5"><div className="bg-purple-500 h-full rounded text-xs text-white flex items-center justify-center" style={{ width: `${d.emails * 5}%` }}>{d.emails}</div></div>
                  </div>
                </div>
              ))}
              <div className="flex gap-4 pt-2 border-t border-slate-800 text-xs text-slate-400">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-blue-500"></span>Verifications</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-green-500"></span>Calls</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-purple-500"></span>Emails</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><Award className="h-5 w-5 text-yellow-400" />Team Leaderboard</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {DATA.leaderboard.map((p) => (
                <div key={p.rank} className={`flex items-center gap-3 p-3 rounded-lg ${p.isYou ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-slate-800/50'}`}>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${p.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' : p.rank === 2 ? 'bg-slate-400/20 text-slate-300' : p.rank === 3 ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-700 text-slate-400'}`}>
                    {p.rank}
                  </span>
                  <span className="flex-1 text-white">{p.name} {p.isYou && <Badge className="ml-2 bg-blue-500/20 text-blue-400 text-xs">You</Badge>}</span>
                  <span className="text-slate-300 font-medium">{p.score} pts</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader><CardTitle className="text-white flex items-center gap-2"><Award className="h-5 w-5 text-green-400" />Recent Achievements</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {DATA.achievements.map((a, i) => (
              <div key={i} className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30">
                <Award className="h-8 w-8 text-green-400 mb-2" />
                <h3 className="font-semibold text-white">{a.title}</h3>
                <p className="text-sm text-slate-400">{a.desc}</p>
                <p className="text-xs text-slate-500 mt-2">{a.date}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
