import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  PolarRadiusAxis,
} from "recharts";

function AttendanceRadar({ data }) {
  return (
    <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-6 h-full">
      <h2 className="text-lg font-bold text-slate-800 mb-1">Weekly Balance</h2>
      <p className="text-xs text-slate-500 mb-6">Consistency across the week</p>
      
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis 
            dataKey="date" 
            tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} 
          />
          <PolarRadiusAxis angle={30} domain={[0, 12]} tick={false} axisLine={false} />
          <Radar
            name="Hours"
            dataKey="hours"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.5}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AttendanceRadar;