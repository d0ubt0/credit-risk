/**
 * ============================================
 * PopulationChart - Gráfico comparativo
 * ============================================
 * Compara el valor del usuario contra la distribución
 * poblacional de cualquier atributo del JSON de Python.
 *
 * Props:
 *  - distributionData : objeto JSON completo generado por Python
 *  - feature          : clave del atributo a mostrar (ej: "fico_range_low", "grade")
 *  - userValue        : valor del usuario para ese atributo
 *  - getScoreCategory : función opcional (value) => { color, label }
 */
import { BarChart3 } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine, ResponsiveContainer,
  Tooltip,
  XAxis, YAxis,
} from 'recharts';

// ── Tooltip personalizado ─────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label, isCategoric }) {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl p-3 text-sm border border-brand-500/30">
        <p className="font-semibold text-white">{label}</p>
        <p className="text-brand-100">{payload[0].value}% de la población</p>
        <p className="text-brand-100/60">{payload[0]?.payload?.count?.toLocaleString()} registros</p>
      </div>
    );
  }
  return null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Dado el JSON de Python y una feature, devuelve los datos normalizados
 * listos para Recharts con la forma: { label, value, count, porcentaje }
 */
function parseFeatureData(distributionData, feature) {
  const entry = distributionData?.[feature];
  if (!entry) return { type: null, data: [] };

  const data = entry.distribution.map((d) => ({
    label: d.label,
    value: d.value,
    count: d.count,
    porcentaje: d.porcentaje,
  }));

  return { type: entry.type, data };
}

/**
 * Encuentra el bucket/categoría que contiene el userValue.
 * Para numérico compara por value (inicio del bin).
 * Para categórico compara el label exacto.
 */
function findUserBucket(data, type, userValue) {
  if (type === 'categorical') {
    return data.find((d) => String(d.label).trim() === String(userValue).trim());
  }
  // numérico: el bucket cuyo value <= userValue y es el más cercano por abajo
  const numeric = [...data].reverse().find((d) => d.value <= userValue);
  return numeric ?? null;
}

/**
 * Calcula el percentil acumulado hasta el bucket del usuario.
 */
function calcPercentile(data, userBucket) {
  if (!userBucket) return null;
  let below = 0;
  let total = 0;
  for (const d of data) {
    total += d.porcentaje;
    if (d.label === userBucket.label) break;
    below += d.porcentaje;
  }
  return total > 0 ? Math.round((below / total) * 100) : null;
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function PopulationChart({
  distributionData,
  feature,
  userValue,
  getScoreCategory,       // opcional: (value) => { color: string, label: string }
  title,                  // opcional: título del gráfico
}) {
  const { type, data } = parseFeatureData(distributionData, feature);

  if (!type || data.length === 0) {
    return (
      <div className="glass rounded-3xl p-8 flex items-center justify-center text-surface-200/50">
        Sin datos para <span className="ml-1 font-mono text-brand-300">{feature}</span>
      </div>
    );
  }

  const userBucket  = userValue != null ? findUserBucket(data, type, userValue) : null;
  const percentile  = userBucket ? calcPercentile(data, userBucket) : null;
  const category    = getScoreCategory && userValue != null ? getScoreCategory(userValue) : null;
  const accentColor = category?.color ?? '#83a598';

  // Para numérico: la ReferenceLine necesita el label (string) del bin
  const userBinLabel = userBucket?.label ?? null;

  return (
    <div className="glass rounded-3xl p-8 animate-fade-in-up-delay-3">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-brand-400" />
          {title ?? `Distribución: ${feature}`}
        </h3>

      </div>

      {/* ── Gráfico ── */}
      <div className="h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">

          {/* NUMÉRICO → AreaChart */}
          {type === 'numeric' ? (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#83a598" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#83a598" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(168,153,132,0.15)"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fill: '#ebdbb2', fontSize: 10 }}
                axisLine={{ stroke: 'rgba(168,153,132,0.3)' }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: '#ebdbb2', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="porcentaje"
                stroke="#83a598"
                strokeWidth={2}
                fill="url(#areaGradient)"
              />
              {userBinLabel && (
                <ReferenceLine
                  x={userBinLabel}
                  stroke={accentColor}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  label={{
                    value: `Tú: ${userValue}`,
                    position: 'top',
                    fill: accentColor,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                />
              )}
            </AreaChart>

          ) : (
          /* CATEGÓRICO → BarChart */
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(168,153,132,0.15)"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fill: '#ebdbb2', fontSize: 10 }}
                axisLine={{ stroke: 'rgba(168,153,132,0.3)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#ebdbb2', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip content={<CustomTooltip isCategoric />} />
              <Bar dataKey="porcentaje" radius={[4, 4, 0, 0]}>
                {data.map((entry) => (
                  <Cell
                    key={entry.label}
                    fill={
                      userBucket && entry.label === userBucket.label
                        ? accentColor
                        : 'rgba(131,165,152,0.35)'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          )}

        </ResponsiveContainer>
      </div>
    </div>
  );
}
