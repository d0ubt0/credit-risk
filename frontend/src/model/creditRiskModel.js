/**
 * ============================================
 * Modelo simulado de riesgo crediticio
 * ============================================
 *
 * Esta función simula un modelo de red neuronal que calcula
 * la probabilidad de incumplimiento (default) de un crédito.
 *
 * En producción, este módulo se reemplazaría por una llamada
 * a un API que ejecute el modelo entrenado real.
 *
 * Variables consideradas:
 * - Edad del solicitante
 * - Ingreso anual
 * - Estado laboral
 * - Historial crediticio (años)
 * - Monto del préstamo
 * - Tasa de interés
 * - Porcentaje del ingreso destinado al préstamo
 * - Propósito del préstamo
 * - Vivienda propia/alquilada
 */

// Pesos simulados del modelo (representan importancia relativa)
const MODEL_WEIGHTS = {
  last_pymnt_amnt: { weight: -0.4, bias: 0 },
  recoveries: { weight: 0.35, bias: 0 },
  out_prncp: { weight: 0.25, bias: 0 },
  int_rate: { weight: 0.1, bias: 0 },
  total_rec_late_fee: { weight: 0.15, bias: 0 },
  tot_cur_bal: { weight: -0.05, bias: 0 },
  dti: { weight: 0.12, bias: 0 },
  loan_amnt: { weight: 0.05, bias: 0 },
  term: { weight: 0, bias: 0 }, // Categorical
  initial_list_status: { weight: 0, bias: 0 }, // Categorical
  grade: { weight: 0, bias: 0 }, // Categorical
};

// Importancia de cada variable (para visualización)
export const FEATURE_IMPORTANCE = [
  { name: "Último pago", key: "last_pymnt_amnt", importance: 0.356140 },
  { name: "Recuperaciones", key: "recoveries", importance: 0.292410 },
  { name: "Capital pendiente", key: "out_prncp", importance: 0.193586 },
  { name: "Tasa de interés", key: "int_rate", importance: 0.029527 },
  { name: "Plazo (60 meses)", key: "term", importance: 0.027584 },
  { name: "Cargos por mora", key: "total_rec_late_fee", importance: 0.017887 },
  { name: "Saldo actual total", key: "tot_cur_bal", importance: 0.015299 },
  { name: "Relación DTI", key: "dti", importance: 0.009023 },
  { name: "Estado de lista inicial", key: "initial_list_status", importance: 0.008162 },
  { name: "Monto del préstamo", key: "loan_amnt", importance: 0.005557 },
];

/**
 * Normaliza un valor numérico a un rango [0, 1]
 * @param {number} value - Valor a normalizar
 * @param {number} min - Mínimo esperado
 * @param {number} max - Máximo esperado
 * @returns {number} Valor normalizado
 */
function normalize(value, min, max) {
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

/**
 * Función sigmoide para convertir logits en probabilidad
 * @param {number} x - Valor de entrada
 * @returns {number} Probabilidad entre 0 y 1
 */
function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

/**
 * Término del préstamo y su efecto
 */
const TERM_EFFECT = {
  "36 months": -0.05,
  "60 months": 0.1,
};

/**
 * Estado de listado inicial y su efecto
 */
const INITIAL_LIST_STATUS_EFFECT = {
  w: -0.02,
  f: 0.02,
};

/**
 * Grados de crédito y su efecto
 */
const LOAN_GRADE_EFFECT = {
  A: -0.3,
  B: -0.15,
  C: 0.0,
  D: 0.1,
  E: 0.2,
  F: 0.3,
  G: 0.4,
};

/**
 * Calcula la probabilidad de incumplimiento dado un conjunto de variables.
 *
 * @param {Object} inputs - Variables del solicitante
 * @param {number} inputs.person_age - Edad (18-100)
 * @param {number} inputs.person_income - Ingreso anual en USD
 * @param {number} inputs.person_emp_length - Años de empleo
 * @param {number} inputs.loan_amnt - Monto del préstamo en USD
 * @param {number} inputs.loan_int_rate - Tasa de interés (%)
 * @param {number} inputs.loan_percent_income - Préstamo como % del ingreso
 * @param {number} inputs.cb_person_cred_hist_length - Años de historial crediticio
 * @param {string} inputs.person_home_ownership - OWN | MORTGAGE | RENT | OTHER
 * @param {string} inputs.loan_intent - Propósito del préstamo
 * @param {string} inputs.loan_grade - Grado del crédito (A-G)
 * @param {string} inputs.cb_person_default_on_file - Y | N (historial de default)
 *
 * @returns {Object} Resultado con probabilidad, score y clasificación
 */
export function calculateCreditRisk(inputs) {
  // Normalizar variables numéricas
  const normalizedLastPymnt = normalize(inputs.last_pymnt_amnt, 0, 10000);
  const normalizedRecoveries = normalize(inputs.recoveries, 0, 5000);
  const normalizedOutPrncp = normalize(inputs.out_prncp, 0, 20000);
  const normalizedIntRate = normalize(inputs.int_rate, 5, 25);
  const normalizedLateFee = normalize(inputs.total_rec_late_fee, 0, 100);
  const normalizedCurBal = normalize(inputs.tot_cur_bal, 0, 500000);
  const normalizedDti = normalize(inputs.dti, 0, 50);
  const normalizedLoanAmnt = normalize(inputs.loan_amnt, 500, 40000);

  // Calcular logit (combinación lineal ponderada)
  let logit = -0.2; // sesgo base

  // Contribuciones numéricas
  logit += MODEL_WEIGHTS.last_pymnt_amnt.weight * normalizedLastPymnt;
  logit += MODEL_WEIGHTS.recoveries.weight * normalizedRecoveries;
  logit += MODEL_WEIGHTS.out_prncp.weight * normalizedOutPrncp;
  logit += MODEL_WEIGHTS.int_rate.weight * normalizedIntRate;
  logit += MODEL_WEIGHTS.total_rec_late_fee.weight * normalizedLateFee;
  logit += MODEL_WEIGHTS.tot_cur_bal.weight * normalizedCurBal;
  logit += MODEL_WEIGHTS.dti.weight * normalizedDti;
  logit += MODEL_WEIGHTS.loan_amnt.weight * normalizedLoanAmnt;

  // Contribuciones categóricas
  logit += TERM_EFFECT[inputs.term] || 0;
  logit += INITIAL_LIST_STATUS_EFFECT[inputs.initial_list_status] || 0;
  logit += LOAN_GRADE_EFFECT[inputs.grade] || 0;

  // Convertir logit a probabilidad usando sigmoide
  const defaultProbability = sigmoid(logit);

  // Calcular score crediticio (300-850) - inversamente proporcional a la probabilidad
  const score = Math.round(850 - defaultProbability * 550);

  // Clasificación del riesgo
  let riskLevel, riskLabel, riskColor, riskDescription;
  if (defaultProbability < 0.25) {
    riskLevel = "low";
    riskLabel = "Bajo Riesgo";
    riskColor = "#b8bb26"; // Gruvbox Green
    riskDescription =
      "Excelente perfil crediticio. Alta probabilidad de cumplimiento del préstamo.";
  } else if (defaultProbability < 0.55) {
    riskLevel = "medium";
    riskLabel = "Riesgo Moderado";
    riskColor = "#fabd2f"; // Gruvbox Yellow
    riskDescription =
      "Perfil crediticio aceptable. Se recomienda revisar las condiciones del préstamo.";
  } else {
    riskLevel = "high";
    riskLabel = "Alto Riesgo";
    riskColor = "#fb4934"; // Gruvbox Red
    riskDescription =
      "Perfil crediticio de alto riesgo. Se recomienda mejorar las condiciones antes de solicitar.";
  }

  // Calcular contribución de cada variable al riesgo
  const contributions = calculateContributions(inputs, defaultProbability);

  // Generar recomendaciones personalizadas
  const recommendations = generateRecommendations(inputs, riskLevel);

  return {
    probability: defaultProbability,
    probabilityPercent: Math.round(defaultProbability * 100 * 10) / 10,
    score,
    riskLevel,
    riskLabel,
    riskColor,
    riskDescription,
    contributions,
    recommendations,
    inputs, // Incluir los inputs originales para comparaciones
  };
}

/**
 * Calcula cuánto contribuye cada variable al riesgo total
 */
function calculateContributions(inputs, totalProb) {
  const factors = [];

  // Último pago
  const pymntRisk = 1 - normalize(inputs.last_pymnt_amnt, 0, 10000);
  factors.push({
    name: "Último pago",
    value: pymntRisk,
    label: `$${inputs.last_pymnt_amnt.toLocaleString()}`,
    direction: pymntRisk > 0.5 ? "negative" : "positive",
  });

  // Recuperaciones
  const recRisk = normalize(inputs.recoveries, 0, 5000);
  factors.push({
    name: "Recuperaciones",
    value: recRisk,
    label: `$${inputs.recoveries.toLocaleString()}`,
    direction: recRisk > 0.3 ? "negative" : "positive",
  });

  // Capital pendiente
  const outRisk = normalize(inputs.out_prncp, 0, 20000);
  factors.push({
    name: "Capital pendiente",
    value: outRisk,
    label: `$${inputs.out_prncp.toLocaleString()}`,
    direction: outRisk > 0.5 ? "negative" : "positive",
  });

  // Tasa de interés
  const rateRisk = normalize(inputs.int_rate, 5, 25);
  factors.push({
    name: "Tasa de interés",
    value: rateRisk,
    label: `${inputs.int_rate}%`,
    direction: rateRisk > 0.5 ? "negative" : "positive",
  });

  // DTI
  const dtiRisk = normalize(inputs.dti, 0, 50);
  factors.push({
    name: "DTI",
    value: dtiRisk,
    label: `${inputs.dti}%`,
    direction: dtiRisk > 0.4 ? "negative" : "positive",
  });

  // Grade
  const gradeEffect = LOAN_GRADE_EFFECT[inputs.grade] || 0;
  const gradeRisk = normalize(gradeEffect, -0.3, 0.4);
  factors.push({
    name: "Calificación (Grade)",
    value: gradeRisk,
    label: inputs.grade,
    direction: gradeRisk > 0.5 ? "negative" : "positive",
  });

  return factors.sort((a, b) => b.value - a.value);
}

/**
 * Genera recomendaciones personalizadas para el usuario
 */
function generateRecommendations(inputs, riskLevel) {
  const recs = [];

  if (inputs.dti > 40) {
    recs.push(
      "Su relación DTI es alta. Considere reducir sus deudas mensuales antes de solicitar un nuevo crédito.",
    );
  }
  if (inputs.int_rate > 15) {
    recs.push(
      "La tasa de interés es elevada. Esto aumenta el costo total del crédito significativamente.",
    );
  }
  if (inputs.recoveries > 1000) {
    recs.push(
      "El historial de recuperaciones indica riesgos previos. Mantener pagos puntuales es crucial ahora.",
    );
  }
  if (inputs.last_pymnt_amnt < 500) {
    recs.push(
      "Incrementar el monto de su último pago puede mejorar la percepción de su capacidad de pago.",
    );
  }
  if (inputs.grade === "E" || inputs.grade === "F" || inputs.grade === "G") {
    recs.push("Su calificación de crédito es baja. Busque asesoría para mejorar su perfil financiero.");
  }
  if (riskLevel === "low" && recs.length === 0) {
    recs.push("¡Excelente perfil! Mantenga sus buenos hábitos financieros.");
  }

  return recs;
}

/**
 * Genera datos de distribución poblacional simulada para el gráfico comparativo.
 * Simula cómo se distribuyen los scores crediticios en la población general.
 */
export function getPopulationDistribution() {
  // Distribución simulada (ligeramente sesgada hacia scores altos)
  const data = [];
  for (let score = 300; score <= 850; score += 25) {
    // Distribución normal centrada en ~650 con std ~120
    const mean = 650;
    const std = 120;
    const z = (score - mean) / std;
    const density = Math.exp(-0.5 * z * z) / (std * Math.sqrt(2 * Math.PI));
    const percentage = Math.round(density * 2500 * 100) / 100;

    data.push({
      score,
      porcentaje: percentage,
      label: `${score}`,
    });
  }
  return data;
}

/**
 * Categorías de score y sus etiquetas
 */
export const SCORE_RANGES = [
  { min: 300, max: 499, label: "Muy Pobre", color: "#fb4934" }, // Gruvbox Red
  { min: 500, max: 579, label: "Pobre", color: "#fe8019" }, // Gruvbox Orange
  { min: 580, max: 669, label: "Regular", color: "#fabd2f" }, // Gruvbox Yellow
  { min: 670, max: 739, label: "Bueno", color: "#b8bb26" }, // Gruvbox Green
  { min: 740, max: 799, label: "Muy Bueno", color: "#8ec07c" }, // Gruvbox Aqua
  { min: 800, max: 850, label: "Excelente", color: "#83a598" }, // Gruvbox Blue
];

/**
 * Retorna la categoría de score para un score dado
 */
export function getScoreCategory(score) {
  return (
    SCORE_RANGES.find((r) => score >= r.min && score <= r.max) ||
    SCORE_RANGES[0]
  );
}
