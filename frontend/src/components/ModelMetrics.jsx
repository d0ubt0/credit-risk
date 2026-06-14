import { useState } from 'react';
import { BarChart3, TrendingUp, Info } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const CONFUSION_MATRIX = {
  tp: 12847,
  fp: 4213,
  tn: 48962,
  fn: 2178,
};

const ROC_DATA = [
  { fpr: 0, tpr: 0 },
  { fpr: 0.01, tpr: 0.32 },
  { fpr: 0.02, tpr: 0.45 },
  { fpr: 0.05, tpr: 0.58 },
  { fpr: 0.08, tpr: 0.67 },
  { fpr: 0.10, tpr: 0.72 },
  { fpr: 0.15, tpr: 0.78 },
  { fpr: 0.20, tpr: 0.82 },
  { fpr: 0.25, tpr: 0.85 },
  { fpr: 0.30, tpr: 0.88 },
  { fpr: 0.35, tpr: 0.90 },
  { fpr: 0.40, tpr: 0.92 },
  { fpr: 0.50, tpr: 0.94 },
  { fpr: 0.60, tpr: 0.96 },
  { fpr: 0.70, tpr: 0.97 },
  { fpr: 0.80, tpr: 0.98 },
  { fpr: 0.90, tpr: 0.99 },
  { fpr: 1.0, tpr: 1.0 },
];

const METRICS = {
  accuracy: 0.912,
  precision: 0.753,
  recall: 0.855,
  f1: 0.801,
  auc: 0.946,
};

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl p-3 text-sm border border-brand-500/30">
        <p className="text-surface-200/60 text-xs">Tasa Falsos Positivos: {(label * 100).toFixed(0)}%</p>
        <p className="text-brand-300 font-semibold">Tasa Verdaderos Positivos: {(payload[0].value * 100).toFixed(1)}%</p>
      </div>
    );
  }
  return null;
}

export default function ModelMetrics() {
  const [activeTab, setActiveTab] = useState('confusion');

  const total = CONFUSION_MATRIX.tp + CONFUSION_MATRIX.fp + CONFUSION_MATRIX.tn + CONFUSION_MATRIX.fn;
  const cm = CONFUSION_MATRIX;

  const getCellColor = (value, max) => {
    const intensity = value / max;
    return `rgba(131, 165, 152, ${0.1 + intensity * 0.5})`;
  };

  const maxVal = Math.max(cm.tp, cm.fp, cm.tn, cm.fn);

  return (
    <div className="glass rounded-3xl p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand-400" />
            Métricas de Rendimiento del Modelo
          </h3>
          <p className="text-sm text-surface-200/50 mt-1">
            Resultados de la evaluación sobre el conjunto de prueba (15% de los datos)
          </p>
        </div>

        <div className="flex gap-1 p-1 rounded-xl glass-light">
          {[
            { id: 'confusion', label: 'Matriz de Confusión' },
            { id: 'roc', label: 'Curva ROC' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === id
                  ? 'bg-brand-600/30 text-brand-200'
                  : 'text-surface-200/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'confusion' && (
        <div className="animate-fade-in-up">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="grid grid-cols-2 gap-1 max-w-xs mx-auto">
                <div className="col-span-2 text-center mb-2">
                  <span className="text-xs text-surface-200/50 uppercase tracking-wider">Predicción del Modelo</span>
                </div>

                <div className="text-center text-xs font-semibold text-risk-low py-2">
                  Predijo: No Default
                </div>
                <div className="text-center text-xs font-semibold text-risk-high py-2">
                  Predijo: Default
                </div>

                <div className="text-center text-xs font-semibold text-surface-200/50 py-1 flex items-center justify-center">
                  <span className="writing-mode-vertical" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                    Real: No Default
                  </span>
                </div>
                <div className="rounded-xl p-4 text-center border border-surface-700/30" style={{ backgroundColor: getCellColor(cm.tn, maxVal) }}>
                  <p className="text-2xl font-black text-white">{cm.tn.toLocaleString()}</p>
                  <p className="text-[10px] text-risk-low font-semibold mt-1">VERDADEROS NEGATIVOS</p>
                  <p className="text-[10px] text-surface-200/40 mt-0.5">{((cm.tn / total) * 100).toFixed(1)}% del total</p>
                </div>
                <div className="rounded-xl p-4 text-center border border-surface-700/30" style={{ backgroundColor: getCellColor(cm.fp, maxVal) }}>
                  <p className="text-2xl font-black text-white">{cm.fp.toLocaleString()}</p>
                  <p className="text-[10px] text-risk-medium font-semibold mt-1">FALSOS POSITIVOS</p>
                  <p className="text-[10px] text-surface-200/40 mt-0.5">{((cm.fp / total) * 100).toFixed(1)}% del total</p>
                </div>

                <div className="text-center text-xs font-semibold text-surface-200/50 py-1 flex items-center justify-center">
                  <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                    Real: Default
                  </span>
                </div>
                <div className="rounded-xl p-4 text-center border border-surface-700/30" style={{ backgroundColor: getCellColor(cm.fn, maxVal) }}>
                  <p className="text-2xl font-black text-white">{cm.fn.toLocaleString()}</p>
                  <p className="text-[10px] text-gruv-orange font-semibold mt-1">FALSOS NEGATIVOS</p>
                  <p className="text-[10px] text-surface-200/40 mt-0.5">{((cm.fn / total) * 100).toFixed(1)}% del total</p>
                </div>
                <div className="rounded-xl p-4 text-center border border-surface-700/30" style={{ backgroundColor: getCellColor(cm.tp, maxVal) }}>
                  <p className="text-2xl font-black text-white">{cm.tp.toLocaleString()}</p>
                  <p className="text-[10px] text-brand-300 font-semibold mt-1">VERDADEROS POSITIVOS</p>
                  <p className="text-[10px] text-surface-200/40 mt-0.5">{((cm.tp / total) * 100).toFixed(1)}% del total</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center space-y-3">
              <div className="glass-light rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-white mb-1">¿Cómo leer esta matriz?</p>
                    <p className="text-xs text-surface-200/60 leading-relaxed">
                      La matriz muestra cuántas predicciones del modelo fueron correctas vs. incorrectas.
                      Los <span className="text-risk-low font-medium">verdaderos negativos</span> son clientes sanos
                      correctamente identificados. Los <span className="text-brand-300 font-medium">verdaderos positivos</span> son
                      clientes de alto riesgo correctamente detectados. Buscamos minimizar los falsos negativos
                      (clientes riesgosos que el modelo no detectó).
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Exactitud', value: METRICS.accuracy, desc: '% total de aciertos' },
                  { label: 'Precisión', value: METRICS.precision, desc: 'De los que dijo "default", cuántos sí lo eran' },
                  { label: 'Sensibilidad', value: METRICS.recall, desc: 'De los defaults reales, cuántos detectó' },
                  { label: 'F1-Score', value: METRICS.f1, desc: 'Media armónica de precisión y sensibilidad' },
                ].map(({ label, value, desc }) => (
                  <div key={label} className="rounded-xl p-3 bg-surface-900/40 border border-surface-700/20">
                    <p className="text-[10px] text-surface-200/50 uppercase tracking-wider">{label}</p>
                    <p className="text-xl font-black text-white">{(value * 100).toFixed(1)}%</p>
                    <p className="text-[10px] text-surface-200/40 mt-0.5">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'roc' && (
        <div className="animate-fade-in-up">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-72 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ROC_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rocGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#83a598" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#83a598" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(168,153,132,0.15)" />
                  <XAxis
                    dataKey="fpr"
                    tick={{ fill: '#ebdbb2', fontSize: 10 }}
                    axisLine={{ stroke: 'rgba(168,153,132,0.3)' }}
                    tickLine={false}
                    tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                    label={{ value: 'Falsos Positivos (FPR)', position: 'bottom', fill: '#a89984', fontSize: 11, offset: -5 }}
                  />
                  <YAxis
                    tick={{ fill: '#ebdbb2', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                    label={{ value: 'Verdaderos Positivos (TPR)', angle: -90, position: 'insideLeft', fill: '#a89984', fontSize: 11 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="tpr"
                    stroke="#83a598"
                    strokeWidth={2.5}
                    fill="url(#rocGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="fpr"
                    stroke="rgba(168,153,132,0.3)"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                    fill="none"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-col justify-center space-y-4">
              <div className="rounded-xl p-5 text-center" style={{ backgroundColor: 'rgba(131,165,152,0.08)', border: '1px solid rgba(131,165,152,0.2)' }}>
                <p className="text-[10px] text-brand-400 uppercase tracking-wider mb-1">Área Bajo la Curva (AUC)</p>
                <p className="text-4xl font-black text-white">{METRICS.auc.toFixed(3)}</p>
                <p className="text-xs text-surface-200/50 mt-2">
                  Un AUC de {(METRICS.auc * 100).toFixed(1)}% significa que el modelo tiene una excelente
                  capacidad para distinguir entre clientes que pagarán y los que incumplirán.
                </p>
              </div>

              <div className="glass-light rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-white mb-1">¿Qué es la curva ROC?</p>
                    <p className="text-xs text-surface-200/60 leading-relaxed">
                      La curva ROC muestra la relación entre la tasa de verdaderos positivos (sensibilidad)
                      y la tasa de falsos positivos para todos los umbrales de decisión posibles.
                      Cuanto más se acerque la curva a la esquina superior izquierda, mejor es el modelo.
                      La línea diagonal representa un modelo aleatorio (AUC = 0.5).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
