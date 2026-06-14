/**
 * ============================================
 * AboutModel - Sección descriptiva del proyecto
 * ============================================
 * Explica el modelo, la metodología y el dataset utilizado.
 * Incluye visualización interactiva de la arquitectura ANN
 * y métricas de rendimiento del modelo.
 */
import { Brain, Database, Cpu, BookOpen } from 'lucide-react';
import NeuralNetworkDiagram from './NeuralNetworkDiagram';
import ModelMetrics from './ModelMetrics';

const features = [
  {
    icon: Brain,
    title: 'Red Neuronal Profunda',
    description:
      'Modelo de deep learning con 3 capas ocultas (384 → 230 → 138 neuronas), entrenado para capturar relaciones no lineales complejas entre las variables financieras.',
  },
  {
    icon: Database,
    title: 'Credit Risk Dataset',
    description:
      'Entrenado con el dataset LendingClub Loan Data que contiene 887,379 registros con información demográfica, financiera y crediticia de solicitantes de préstamos (2007-2015). Tras la limpieza y recodificación, se utilizaron aproximadamente 190,000 registros.',
  },
  {
    icon: Cpu,
    title: '10 Variables Clave',
    description:
      'Utiliza 10 variables incluyendo el último pago, cobros por recuperación, capital pendiente, tasa de interés y plazo del préstamo.',
  },
  {
    icon: BookOpen,
    title: 'Transparencia Total',
    description:
      'Además de la predicción, el modelo ofrece explicaciones sobre qué factores influyen más en cada decisión individual, métricas de rendimiento y visualización de su arquitectura.',
  },
];

export default function AboutModel() {
  return (
    <section id="acerca" className="py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-light mb-4">
            <Brain className="w-4 h-4 text-brand-400" />
            <span className="text-xs font-semibold text-brand-300 uppercase tracking-wider">
              Sobre el Modelo
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            ¿Cómo Funciona Nuestro Modelo?
          </h2>
          <p className="text-surface-200/60 max-w-2xl mx-auto leading-relaxed">
            Nuestra inteligencia artificial analiza múltiples variables financieras
            para estimar la probabilidad de incumplimiento crediticio. Aquí te mostramos
            exactamente cómo funciona — sin caja negra.
          </p>
        </div>

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

        <div className="mt-12 text-center">
          <NeuralNetworkDiagram />
        </div>

        <div className="mt-12">
          <ModelMetrics />
        </div>
      </div>
    </section>
  );
}
