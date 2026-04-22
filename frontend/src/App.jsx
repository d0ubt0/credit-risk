/**
 * ============================================
 * App.jsx - Componente principal de CreditAI
 * ============================================
 * Orquesta todos los componentes y maneja el estado
 * global de la evaluación de riesgo crediticio.
 */
import { Sparkles } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import AboutModel from './components/AboutModel';
import CreditForm from './components/CreditForm';
import FeatureImportance from './components/FeatureImportance';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Navbar from './components/Navbar';
import PopulationChart from './components/PopulationChart';
import Resources from './components/Resources';
import RiskResult from './components/RiskResult';
import { calculateCreditRisk } from './model/creditRiskModel';
import distributionData from "./population_distribution.json";

export default function App() {
  // Estado del resultado de la evaluación
  const [result, setResult] = useState(null);
  const resultRef = useRef(null);

  /**
   * Maneja el envío del formulario.
   * Calcula el riesgo y hace scroll al resultado.
   */
  const handleSubmit = useCallback(async (inputs) => {
    try {
      const riskResult = await calculateCreditRisk(inputs);
      setResult(riskResult);

      // Scroll suave al resultado después de que se renderice
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      console.error("Error al calcular el riesgo:", error);
      alert("Hubo un error al conectar con el servidor.");
    }
  }, []);

  return (
    <div className="bg-animated min-h-screen">
      {/* Barra de navegación fija */}
      <Navbar />

      {/* Hero/Landing section */}
      <Hero />

      {/* Sección de evaluación: Formulario + Resultados */}
      <section id="evaluacion" className="py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-light mb-4">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span className="text-xs font-semibold text-brand-300 uppercase tracking-wider">
                Evaluación
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Calcula tu Riesgo Crediticio
            </h2>
            <p className="text-surface-200/60 max-w-xl mx-auto">
              Completa el formulario con tu información financiera para obtener
              tu score crediticio y probabilidad de incumplimiento.
            </p>
          </div>

          {/* Formulario */}
          <div className="glass rounded-3xl p-6 sm:p-8 glow-brand mb-8">
            <CreditForm onSubmit={handleSubmit} />
          </div>

          {/* Resultados (solo se muestran tras calcular) */}
          {result && (
            <div className="space-y-6">
              <RiskResult ref={resultRef} result={result} />



              {/* Comparativas con la población */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { key: 'last_pymnt_amnt', title: 'Último Pago' },
                  //{ key: 'recoveries', title: 'Recuperaciones' },
                  { key: 'out_prncp', title: 'Capital Pendiente' },
                  { key: 'int_rate', title: 'Tasa de Interés' },
                  { key: 'term', title: 'Plazo' },
                  //{ key: 'total_rec_late_fee', title: 'Cargos por Mora' },
                  { key: 'tot_cur_bal', title: 'Saldo Actual Total' },
                  { key: 'dti', title: 'DTI' },
                  { key: 'initial_list_status', title: 'Estado Inicial' },
                  { key: 'loan_amnt', title: 'Monto del Préstamo' },
                ].map((feat) => (
                  <PopulationChart
                    key={feat.key}
                    distributionData={distributionData}
                    feature={feat.key}
                    userValue={result.inputs[feat.key]}
                    title={`${feat.title} vs. Población`}
                  />
                ))}
              </div>

              <FeatureImportance />
            </div>
          )}
        </div>
      </section>

      {/* Sección informativa del modelo */}
      <AboutModel />

      {/* Recursos y enlaces */}
      <Resources />

      {/* Pie de página */}
      <Footer />
    </div>
  );
}
