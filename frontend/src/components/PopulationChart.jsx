/**
 * ============================================
 * PopulationChart - Gráfico comparativo
 * ============================================
 * Compara el valor del usuario contra la distribución
 * poblacional de cualquier atributo del JSON de Python.
 * Incluye interpretación narrativa automática.
 *
 * Props:
 *  - distributionData : objeto JSON completo generado por Python
 *  - feature          : clave del atributo a mostrar (ej: "fico_range_low", "grade")
 *  - userValue        : valor del usuario para ese atributo
 *  - getScoreCategory : función opcional (value) => { color, label }
 *  - title            : título del gráfico
 */
import { BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';
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

function CustomTooltip({ active, payload, label }) {
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

function findUserBucket(data, type, userValue) {
  if (type === 'categorical') {
    return data.find((d) => String(d.label).trim() === String(userValue).trim());
  }
  const numeric = [...data].reverse().find((d) => d.value <= userValue);
  return numeric ?? null;
}

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

function calcMean(data) {
  if (!data || data.length === 0) return null;
  let weightedSum = 0;
  let totalWeight = 0;
  for (const d of data) {
    weightedSum += d.value * d.porcentaje;
    totalWeight += d.porcentaje;
  }
  return totalWeight > 0 ? weightedSum / totalWeight : null;
}

function generateNarrative(feature, userValue, percentile, userBucket, type, data) {
  if (userValue == null || !userBucket) return null;

  const mean = type === 'numeric' ? calcMean(data) : null;
  const featureLabels = {
    last_pymnt_amnt: { name: 'último pago', unit: '$', higherIsBetter: true },
    recoveries: { name: 'cobros por recuperación', unit: '$', higherIsBetter: false },
    out_prncp: { name: 'capital pendiente', unit: '$', higherIsBetter: false },
    int_rate: { name: 'tasa de interés', unit: '%', higherIsBetter: false },
    term: { name: 'plazo del préstamo', unit: '', higherIsBetter: false },
    tot_cur_bal: { name: 'saldo actual total', unit: '$', higherIsBetter: false },
    dti: { name: 'relación deuda-ingreso', unit: '%', higherIsBetter: false },
    initial_list_status: { name: 'tipo de registro', unit: '', higherIsBetter: true },
    loan_amnt: { name: 'monto del préstamo', unit: '$', higherIsBetter: false },
  };

  const info = featureLabels[feature];
  if (!info) return null;

  const isAbove = percentile > 55;
  const isBelow = percentile < 45;
  const isAverage = !isAbove && !isBelow;

  if (isAverage) {
    return {
      icon: Minus,
      color: '#fabd2f',
      text: `Tu ${info.name} se encuentra dentro del rango promedio de la población. Esto indica un perfil equilibrado en este aspecto.`,
    };
  }

  if (type === 'numeric' && mean != null) {
    const diff = Math.abs(((userValue - mean) / mean) * 100).toFixed(0);
    const aboveMean = userValue > mean;

    if (info.higherIsBetter) {
      if (aboveMean) {
        return {
          icon: TrendingUp,
          color: '#b8bb26',
          text: `Tu ${info.name} es un ${diff}% superior al promedio de la población (${info.unit}${Math.round(mean).toLocaleString()}). Esto fortalece tu perfil crediticio, ya que demuestra mayor capacidad de pago.`,
        };
      } else {
        return {
          icon: TrendingDown,
          color: '#fb4934',
          text: `Tu ${info.name} es un ${diff}% inferior al promedio de la población (${info.unit}${Math.round(mean).toLocaleString()}). Esto puede debilitar tu perfil, ya que refleja menor actividad de pago reciente.`,
        };
      }
    } else {
      if (aboveMean) {
        return {
          icon: TrendingUp,
          color: '#fb4934',
          text: `Tu ${info.name} es un ${diff}% superior al promedio de la población (${info.unit}${Math.round(mean).toLocaleString()}), lo que incrementa el riesgo. Un valor más bajo mejoraría tu evaluación.`,
        };
      } else {
        return {
          icon: TrendingUp,
          color: '#b8bb26',
          text: `Tu ${info.name} es un ${diff}% inferior al promedio de la población (${info.unit}${Math.round(mean).toLocaleString()}). Esto es favorable, ya que reduce tu exposición crediticia.`,
        };
      }
    }
  }

  if (isAbove) {
    return {
      icon: TrendingUp,
      color: info.higherIsBetter ? '#b8bb26' : '#fb4934',
      text: `Tu ${info.name} se encuentra por encima del ${percentile}% de la población. ${info.higherIsBetter ? 'Esto es favorable para tu perfil.' : 'Esto puede incrementar tu nivel de riesgo.'}`,
    };
  }

  return {
    icon: TrendingDown,
    color: info.higherIsBetter ? '#fb4934' : '#b8bb26',
    text: `Tu ${info.name} se encuentra por debajo del ${100 - percentile}% de la población. ${info.higherIsBetter ? 'Un valor más alto mejoraría tu evaluación.' : 'Esto es positivo para tu perfil de riesgo.'}`,
  };
}

export default function PopulationChart({
  distributionData,
  feature,
  userValue,
  getScoreCategory,
  title,
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
  const userBinLabel = userBucket?.label ?? null;
  const narrative = generateNarrative(feature, userValue, percentile, userBucket, type, data);

  return (
    <div className="glass rounded-3xl p-8 animate-fade-in-up-delay-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-brand-400" />
          {title ?? `Distribución: ${feature}`}
        </h3>
        {percentile != null && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-light">
            <span className="text-xs font-semibold text-brand-300">
              Percentil {percentile}
            </span>
          </div>
        )}
      </div>

      <div className="h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
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
              <Tooltip content={<CustomTooltip />} />
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

      {narrative && (
        <div
          className="mt-5 flex items-start gap-3 p-4 rounded-xl"
          style={{ backgroundColor: `${narrative.color}08`, border: `1px solid ${narrative.color}15` }}
        >
          <narrative.icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: narrative.color }} />
          <p className="text-xs text-surface-200/70 leading-relaxed">{narrative.text}</p>
        </div>
      )}
    </div>
  );
}
