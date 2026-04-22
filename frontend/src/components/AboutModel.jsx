/**
 * ============================================
 * AboutModel - Sección descriptiva del proyecto
 * ============================================
 * Explica el modelo, la metodología y el dataset utilizado.
 */
import { Brain, Database, Target, Cpu, BookOpen, Network } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Red Neuronal Profunda',
    description:
      'Modelo de deep learning con múltiples capas ocultas, entrenado para capturar relaciones no lineales complejas entre las variables financieras.',
  },
  {
    icon: Database,
    title: 'Credit Risk Dataset',
    description:
      'Entrenado con un dataset real de más de 190,000 registros con información demográfica, financiera y crediticia de solicitantes de préstamos.',
  },

  {
    icon: Cpu,
    title: 'Variables Clave',
    description:
      'Utiliza 10 variables incluyendo el último pago, recuperaciones, capital pendiente, tasa de interés y plazo del préstamo.',
  },
  {
    icon: BookOpen,
    title: 'Interpretabilidad',
    description:
      'Además de la predicción, el modelo ofrece explicaciones sobre qué factores influyen más en cada decisión individual.',
  }
];

export default function AboutModel() {
  return (
    <section id="acerca" className="py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-light mb-4">
            <Brain className="w-4 h-4 text-brand-400" />
            <span className="text-xs font-semibold text-brand-300 uppercase tracking-wider">
              Sobre el Modelo
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            ¿Cómo Funciona?
          </h2>
          <p className="text-surface-200/60 max-w-2xl mx-auto leading-relaxed">
            Nuestro modelo de inteligencia artificial analiza múltiples variables financieras
            para estimar la probabilidad de incumplimiento crediticio de manera precisa y confiable.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="glass rounded-2xl p-6 hover:bg-white/5 transition-all duration-300 group
                hover:border-brand-500/30 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-brand-500/5"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-600/15 flex items-center justify-center mb-4
                group-hover:bg-brand-600/25 group-hover:scale-110 transition-all duration-300">
                <Icon className="w-6 h-6 text-brand-400" />
              </div>
              <h3 className="font-bold text-white mb-2">{title}</h3>
              <p className="text-sm text-surface-200/60 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>

        {/* Architecture diagram placeholder */}
        <div className="mt-16 glass rounded-3xl p-8 text-center">
          <h3 className="text-xl font-bold text-white mb-4">Arquitectura del Modelo</h3>
          <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap py-8">
            {[
              { label: 'Input Layer', sub: '10 features', color: '#83a598' },
              { label: 'Dense 384', sub: 'ReLU + BN + L1', color: '#8ec07c' },
              { label: 'Dense 230', sub: 'ReLU + Dropout', color: '#fabd2f' },
              { label: 'Dense 138', sub: 'ReLU + BN', color: '#8ec07c' },
              { label: 'Output', sub: 'Sigmoid', color: '#83a598' },
            ].map((layer, i, arr) => (
              <div key={layer.label} className="flex items-center gap-2 sm:gap-4">
                <div
                  className="rounded-xl px-4 py-3 text-center min-w-[90px]"
                  style={{ backgroundColor: `${layer.color}20`, border: `1px solid ${layer.color}40` }}
                >
                  <p className="text-xs font-bold text-white">{layer.label}</p>
                  <p className="text-[10px] text-surface-200/50 mt-0.5">{layer.sub}</p>
                </div>
                {i < arr.length - 1 && (
                  <div className="text-brand-400/50 hidden sm:block">→</div>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-surface-200/40 mt-4">
            Función de pérdida: Binary Cross-Entropy | Optimizador: Adam | Learning Rate: 0.002
          </p>
        </div>
      </div>
    </section>
  );
}
