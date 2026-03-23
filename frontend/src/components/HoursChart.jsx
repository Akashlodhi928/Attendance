import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from "recharts";

function HoursChart({ data }) {
  // Custom Tooltip for a better look
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 shadow-xl border border-slate-100 rounded-lg">
          <p className="text-sm font-bold text-slate-800">{label}</p>
          <p className="text-sm text-indigo-600 font-medium">
            Hours: <span className="text-lg">{payload[0].value}h</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-6 transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Working Hours</h2>
          <p className="text-sm text-slate-500">Daily productivity tracking</p>
        </div>
        <div className="flex gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-indigo-500 rounded-full"></span> Done
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-red-400 rounded-full"></span> Goal (9h)
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={380}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            domain={[0, 12]} // Set range to 12 hours for a "real" feel
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
          
          {/* Goal line at 9 hours */}
          <ReferenceLine y={9} stroke="#f87171" strokeDasharray="5 5" label={{ position: 'right', value: '9h', fill: '#f87171', fontSize: 12 }} />
          
          <Bar dataKey="hours" radius={[6, 6, 0, 0]} barSize={40}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.hours >= 9 ? "#6366f1" : "#94a3b8"} // Blue if goal met, Gray if not
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default HoursChart;