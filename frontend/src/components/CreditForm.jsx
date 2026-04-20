/**
 * ============================================
 * CreditForm - Formulario de evaluación
 * ============================================
 * Recoge todas las variables financieras del usuario.
 * Cada campo incluye un tooltip explicativo.
 */
import { useState } from 'react';
import { HelpCircle, Calculator, RotateCcw } from 'lucide-react';

// Definición de campos con sus tooltips
const FIELDS = [
  {
    id: 'last_pymnt_amnt',
    label: 'Último Pago',
    type: 'number',
    placeholder: '500',
    min: 0,
    max: 50000,
    tooltip: 'El monto del último pago recibido.',
    unit: 'USD',
  },
  {
    id: 'recoveries',
    label: 'Recuperaciones',
    type: 'number',
    placeholder: '0',
    min: 0,
    max: 20000,
    tooltip: 'Monto recuperado después del incumplimiento.',
    unit: 'USD',
  },
  {
    id: 'out_prncp',
    label: 'Capital Pendiente',
    type: 'number',
    placeholder: '5000',
    min: 0,
    max: 40000,
    tooltip: 'Capital pendiente total de los préstamos.',
    unit: 'USD',
  },
  {
    id: 'int_rate',
    label: 'Tasa de Interés',
    type: 'number',
    placeholder: '12',
    min: 5,
    max: 30,
    step: 0.01,
    tooltip: 'Tasa de interés anual del préstamo.',
    unit: '%',
  },
  {
    id: 'total_rec_late_fee',
    label: 'Cargos por Mora',
    type: 'number',
    placeholder: '0',
    min: 0,
    max: 1000,
    tooltip: 'Total de cargos por mora recibidos hasta la fecha.',
    unit: 'USD',
  },
  {
    id: 'tot_cur_bal',
    label: 'Saldo Actual Total',
    type: 'number',
    placeholder: '20000',
    min: 0,
    max: 1000000,
    tooltip: 'Saldo actual total de todas las cuentas.',
    unit: 'USD',
  },
  {
    id: 'dti',
    label: 'Relación DTI',
    type: 'number',
    placeholder: '15',
    min: 0,
    max: 100,
    step: 0.1,
    tooltip: 'Relación deuda-ingreso (Debt-to-Income ratio).',
    unit: '%',
  },
  {
    id: 'loan_amnt',
    label: 'Monto del Préstamo',
    type: 'number',
    placeholder: '10000',
    min: 500,
    max: 40000,
    tooltip: 'El monto total solicitado.',
    unit: 'USD',
  },
];

const SELECT_FIELDS = [
  {
    id: 'term',
    label: 'Plazo del Préstamo',
    tooltip: 'Duración del préstamo en meses.',
    options: [
      { value: '36 months', label: '36 Meses' },
      { value: '60 months', label: '60 Meses' },
    ],
  },
  {
    id: 'initial_list_status',
    label: 'Estado Listado Inicial',
    tooltip: 'Estado inicial del préstamo en el sistema.',
    options: [
      { value: 'w', label: 'Whole (W)' },
      { value: 'f', label: 'Fractional (F)' },
    ],
  },
  {
    id: 'grade',
    label: 'Calificación (Grade)',
    tooltip: 'Clasificación de riesgo. A es el mejor, G el más riesgoso.',
    options: [
      { value: 'A', label: 'A - Excelente' },
      { value: 'B', label: 'B - Bueno' },
      { value: 'C', label: 'C - Regular' },
      { value: 'D', label: 'D - Bajo' },
      { value: 'E', label: 'E - Pobre' },
      { value: 'F', label: 'F - Muy Pobre' },
      { value: 'G', label: 'G - Riesgoso' },
    ],
  },
];

// Valores por defecto para el formulario
const DEFAULT_VALUES = {
  last_pymnt_amnt: '',
  recoveries: '',
  out_prncp: '',
  int_rate: '',
  total_rec_late_fee: '',
  tot_cur_bal: '',
  dti: '',
  loan_amnt: '',
  term: '36 months',
  initial_list_status: 'w',
  grade: 'B',
};

/**
 * Tooltip component reutilizable
 */
function Tooltip({ text }) {
  return (
    <div className="tooltip-container ml-1">
      <HelpCircle className="w-4 h-4 text-brand-400/60 hover:text-brand-300 transition-colors cursor-help" />
      <span className="tooltip-text">{text}</span>
    </div>
  );
}

export default function CreditForm({ onSubmit }) {
  const [formData, setFormData] = useState(DEFAULT_VALUES);
  const [errors, setErrors] = useState({});
  const [isCalculating, setIsCalculating] = useState(false);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? value : value,
    }));
    // Limpiar error al modificar
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    FIELDS.forEach((field) => {
      const val = parseFloat(formData[field.id]);
      if (!formData[field.id] || isNaN(val)) {
        newErrors[field.id] = 'Campo requerido';
      } else if (val < field.min || val > field.max) {
        newErrors[field.id] = `Debe ser entre ${field.min} y ${field.max}`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsCalculating(true);

    // Calcular la proporción préstamo/ingreso automáticamente
    const parsedData = {
      last_pymnt_amnt: parseFloat(formData.last_pymnt_amnt),
      recoveries: parseFloat(formData.recoveries),
      out_prncp: parseFloat(formData.out_prncp),
      int_rate: parseFloat(formData.int_rate),
      total_rec_late_fee: parseFloat(formData.total_rec_late_fee),
      tot_cur_bal: parseFloat(formData.tot_cur_bal),
      dti: parseFloat(formData.dti),
      loan_amnt: parseFloat(formData.loan_amnt),
      term: formData.term,
      initial_list_status: formData.initial_list_status,
      grade: formData.grade,
    };

    // Simular latencia de red
    await new Promise((r) => setTimeout(r, 1200));
    setIsCalculating(false);
    onSubmit(parsedData);
  };

  const handleReset = () => {
    setFormData(DEFAULT_VALUES);
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Campos numéricos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {FIELDS.map((field) => (
          <div key={field.id} className="space-y-2">
            <label htmlFor={field.id} className="flex items-center text-sm font-medium text-surface-200">
              {field.label}
              <Tooltip text={field.tooltip} />
            </label>
            <div className="relative">
              <input
                id={field.id}
                name={field.id}
                type="number"
                placeholder={field.placeholder}
                min={field.min}
                max={field.max}
                step={field.step || 1}
                value={formData[field.id]}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl bg-surface-900/60 border text-white placeholder-surface-200/30
                  focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all
                  ${errors[field.id] ? 'border-risk-high/60' : 'border-surface-700/50 hover:border-surface-200/30'}`}
              />
              {field.unit && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-surface-200/40 font-medium">
                  {field.unit}
                </span>
              )}
            </div>
            {errors[field.id] && (
              <p className="text-xs text-risk-high flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-risk-high" />
                {errors[field.id]}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Campos select */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {SELECT_FIELDS.map((field) => (
          <div key={field.id} className="space-y-2">
            <label htmlFor={field.id} className="flex items-center text-sm font-medium text-surface-200">
              {field.label}
              <Tooltip text={field.tooltip} />
            </label>
            <select
              id={field.id}
              name={field.id}
              value={formData[field.id]}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-surface-900/60 border border-surface-700/50
                text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500
                transition-all hover:border-surface-200/30 cursor-pointer appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%2383a598' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
              }}
            >
              {field.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <button
          type="submit"
          disabled={isCalculating}
          className={`btn-primary flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-lg
            transition-all duration-300 cursor-pointer
            ${isCalculating
              ? 'bg-brand-700/50 text-brand-200/50 cursor-wait'
              : 'bg-gradient-to-r from-brand-600 to-brand-500 text-white hover:from-brand-500 hover:to-brand-400 hover:shadow-xl hover:shadow-brand-500/20 hover:scale-[1.02]'
            }`}
        >
          {isCalculating ? (
            <>
              <div className="w-5 h-5 border-2 border-brand-300/30 border-t-brand-300 rounded-full animate-spin" />
              Calculando...
            </>
          ) : (
            <>
              <Calculator className="w-5 h-5" />
              Calcular Riesgo
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-medium
            border border-surface-700/50 text-surface-200 hover:bg-white/5 hover:border-surface-200/30
            transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Limpiar
        </button>
      </div>
    </form>
  );
}
