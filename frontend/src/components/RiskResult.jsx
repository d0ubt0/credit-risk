/**
 * ============================================
 * RiskResult - Panel principal de resultados
 * ============================================
 * Muestra el resultado completo: probabilidad de default,
 * score gauge, clasificación de riesgo, factores y recomendaciones.
 */
import { forwardRef } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  ChevronRight,
} from 'lucide-react';
import ScoreGauge from './ScoreGauge';

// Iconos según nivel de riesgo
const riskIcons = {
  low: CheckCircle2,
  medium: AlertCircle,
  high: AlertTriangle,
};

// Clases de glow según nivel de riesgo
const riskGlow = {
  low: 'glow-green',
  medium: 'glow-yellow',
  high: 'glow-red',
};

const RiskResult = forwardRef(({ result }, ref) => {
  if (!result) return null;

  const {
    probabilityPercent,
    score,
    riskLevel,
    riskLabel,
    riskColor,
    riskDescription,
    contributions,
    recommendations,
  } = result;

  const RiskIcon = riskIcons[riskLevel];

  return (
    <div ref={ref} className="space-y-6 animate-fade-in-up">
      {/* Header card - Score + Probability */}
      <div className={`glass rounded-3xl p-8 ${riskGlow[riskLevel]}`}>
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Score Gauge */}
          <div className="flex-shrink-0">
            <ScoreGauge score={score} riskColor={riskColor} />
          </div>

          {/* Risk info */}
          <div className="flex-1 text-center lg:text-left space-y-4">
            {/* Risk badge */}
            <div className="inline-flex items-center gap-2">
              <div
                className="relative w-3 h-3 rounded-full"
                style={{ backgroundColor: riskColor }}
              >
                <div
                  className="absolute inset-0 rounded-full pulse-ring"
                  style={{ backgroundColor: riskColor }}
                />
              </div>
              <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: riskColor }}>
                {riskLabel}
              </span>
            </div>

            {/* Probability display */}
            <div>
              <p className="text-surface-200/60 text-sm mb-1">Probabilidad de Incumplimiento</p>
              <div className="flex items-baseline gap-1 justify-center lg:justify-start">
                <span className="text-5xl font-black text-white">{probabilityPercent}</span>
                <span className="text-2xl font-bold text-surface-200/40">%</span>
              </div>
            </div>

            {/* Description */}
            <div className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: `${riskColor}10` }}>
              <RiskIcon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: riskColor }} />
              <p className="text-sm text-surface-200/80 leading-relaxed">{riskDescription}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contributing factors */}
      <div className="glass rounded-3xl p-8 animate-fade-in-up-delay-1">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-brand-400" />
          Factores que Influyen en tu Riesgo
        </h3>

        <div className="space-y-4">
          {contributions.map((factor, index) => (
            <div key={factor.name} className="space-y-2" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {factor.direction === 'negative' ? (
                    <TrendingDown className="w-4 h-4 text-risk-high" />
                  ) : (
                    <TrendingUp className="w-4 h-4 text-risk-low" />
                  )}
                  <span className="text-surface-200/80">{factor.name}</span>
                </div>
                <span className="font-medium text-white">{factor.label}</span>
              </div>
              <div className="h-2 rounded-full bg-surface-900/60 overflow-hidden">
                <div
                  className="h-full rounded-full grow-bar"
                  style={{
                    width: `${Math.round(factor.value * 100)}%`,
                    backgroundColor: factor.direction === 'negative' ? 'var(--color-risk-high)' : 'var(--color-risk-low)',
                    animationDelay: `${0.5 + index * 0.15}s`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="glass rounded-3xl p-8 animate-fade-in-up-delay-2">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-risk-medium" />
            Recomendaciones
          </h3>
          <div className="space-y-3">
            {recommendations.map((rec, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 rounded-xl bg-brand-600/8 border border-brand-500/10
                  hover:bg-brand-600/12 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-surface-200/80 leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

RiskResult.displayName = 'RiskResult';
export default RiskResult;
