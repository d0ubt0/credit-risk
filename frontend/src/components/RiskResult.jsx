/**
 * ============================================
 * RiskResult - Panel principal de resultados
 * ============================================
 * Muestra el resultado completo: probabilidad de default,
 * score gauge, clasificación de riesgo, factores críticos y recomendaciones.
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
  ShieldAlert,
} from 'lucide-react';
import ScoreGauge from './ScoreGauge';

const riskIcons = {
  low: CheckCircle2,
  medium: AlertCircle,
  high: AlertTriangle,
};

const riskGlow = {
  low: 'glow-green',
  medium: 'glow-yellow',
  high: 'glow-red',
};

const CRITICAL_FACTORS_INFO = {
  "Último pago": {
    explanation: 'Un último pago bajo sugiere dificultad para cubrir las cuotas, lo que incrementa significativamente el riesgo de incumplimiento.',
    suggestion: 'Aumentar el monto de tus pagos mensuales mejora la percepción de capacidad de pago.',
  },
  "Cobros por recuperación": {
    explanation: 'Los cobros por recuperación indican que préstamos anteriores cayeron en default. Este es uno de los indicadores más fuertes de riesgo futuro.',
    suggestion: 'Mantener un historial limpio de pagos puntuales durante al menos 12 meses ayudará a reducir este factor.',
  },
  "Capital pendiente": {
    explanation: 'Un capital pendiente alto significa que aún debes una porción significativa del préstamo, lo que eleva la exposición crediticia.',
    suggestion: 'Reducir el capital pendiente mediante pagos adicionales puede mejorar tu perfil de riesgo.',
  },
  "Tasa de interés": {
    explanation: 'Una tasa de interés alta incrementa el costo total del crédito y la carga financiera mensual.',
    suggestion: 'Considera refinanciar o buscar opciones con tasas más competitivas.',
  },
  "DTI": {
    explanation: 'Una relación deuda-ingreso alta indica que gran parte de tus ingresos ya están comprometidos con deudas existentes.',
    suggestion: 'Reducir deudas existentes antes de solicitar un nuevo crédito mejorará este ratio.',
  },
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

  const negativeFactors = contributions
    .filter((f) => f.direction === 'negative')
    .slice(0, 3);

  return (
    <div ref={ref} className="space-y-6 animate-fade-in-up">
      <div className={`glass rounded-3xl p-8 ${riskGlow[riskLevel]}`}>
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-shrink-0">
            <ScoreGauge score={score} riskColor={riskColor} />
          </div>

          <div className="flex-1 text-center lg:text-left space-y-4">
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

            <div>
              <p className="text-surface-200/60 text-sm mb-1">Probabilidad de Incumplimiento</p>
              <div className="flex items-baseline gap-1 justify-center lg:justify-start">
                <span className="text-5xl font-black text-white">{probabilityPercent}</span>
                <span className="text-2xl font-bold text-surface-200/40">%</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: `${riskColor}10` }}>
              <RiskIcon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: riskColor }} />
              <p className="text-sm text-surface-200/80 leading-relaxed">{riskDescription}</p>
            </div>
          </div>
        </div>
      </div>

      {negativeFactors.length > 0 && (
        <div className="glass rounded-3xl p-8 animate-fade-in-up-delay-1" style={{ borderColor: 'rgba(251, 73, 52, 0.2)' }}>
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-risk-high" />
            Factores de Riesgo Críticos
          </h3>
          <p className="text-sm text-surface-200/50 mb-6">
            Estas son las {negativeFactors.length} variables que más están penalizando tu puntaje crediticio.
            Mejorarlas tendría el mayor impacto positivo en tu evaluación.
          </p>

          <div className="space-y-5">
            {negativeFactors.map((factor, index) => {
              const info = CRITICAL_FACTORS_INFO[factor.name];
              return (
                <div
                  key={factor.name}
                  className="rounded-2xl p-5 border border-risk-high/15"
                  style={{ backgroundColor: 'rgba(251, 73, 52, 0.04)' }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black text-white"
                      style={{ backgroundColor: 'rgba(251, 73, 52, 0.2)' }}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{factor.name}</span>
                        <span className="text-sm font-semibold text-risk-high">{factor.label}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-surface-200/70 leading-relaxed mb-2">
                    {info?.explanation || `Este factor está contribuyendo negativamente a tu evaluación de riesgo.`}
                  </p>

                  {info?.suggestion && (
                    <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-brand-600/8 border border-brand-500/10">
                      <Lightbulb className="w-3.5 h-3.5 text-brand-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-surface-200/70 leading-relaxed">{info.suggestion}</p>
                    </div>
                  )}

                  <div className="mt-3">
                    <div className="h-2 rounded-full bg-surface-900/60 overflow-hidden">
                      <div
                        className="h-full rounded-full grow-bar"
                        style={{
                          width: `${Math.round(factor.value * 100)}%`,
                          backgroundColor: 'var(--color-risk-high)',
                          animationDelay: `${0.5 + index * 0.15}s`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
