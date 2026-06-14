import { useState } from 'react';
import { X, Layers, Info } from 'lucide-react';

const LAYERS = [
  {
    id: 'input',
    label: 'Capa de Entrada',
    neurons: 10,
    maxNeurons: 10,
    color: '#83a598',
    description: 'Recibe las 10 variables financieras del solicitante (pago, capital pendiente, tasa de interés, etc.)',
    activation: 'Normalización',
    detail: 'Cada neurona representa una variable normalizada entre 0 y 1',
  },
  {
    id: 'hidden1',
    label: 'Capa Oculta 1',
    neurons: 10,
    maxNeurons: 16,
    color: '#8ec07c',
    description: 'Primera capa de procesamiento profundo. Captura interacciones básicas entre variables.',
    activation: 'ReLU + BatchNorm + L1',
    detail: '384 neuronas con regularización L1 para evitar sobreajuste',
  },
  {
    id: 'hidden2',
    label: 'Capa Oculta 2',
    neurons: 8,
    maxNeurons: 16,
    color: '#fabd2f',
    description: 'Segunda capa de abstracción. Combina patrones de la capa anterior para detectar relaciones complejas.',
    activation: 'ReLU + Dropout',
    detail: '230 neuronas con Dropout para generalización',
  },
  {
    id: 'hidden3',
    label: 'Capa Oculta 3',
    neurons: 6,
    maxNeurons: 16,
    color: '#fe8019',
    description: 'Tercera capa de procesamiento. Refina las representaciones aprendidas.',
    activation: 'ReLU + BatchNorm',
    detail: '138 neuronas con normalización por lotes',
  },
  {
    id: 'output',
    label: 'Capa de Salida',
    neurons: 1,
    maxNeurons: 10,
    color: '#fb4934',
    description: 'Produce la probabilidad final de incumplimiento crediticio (valor entre 0 y 1).',
    activation: 'Sigmoide',
    detail: '1 neurona que mapea a una probabilidad [0, 1]',
  },
];

function Neuron({ cx, cy, r, color, active, onClick, delay }) {
  return (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      fill={`${color}${active ? '60' : '25'}`}
      stroke={color}
      strokeWidth={active ? 2 : 1}
      className="transition-all duration-300 cursor-pointer hover:opacity-100"
      style={{
        filter: active ? `drop-shadow(0 0 6px ${color}88)` : 'none',
        animationDelay: `${delay}ms`,
      }}
      onClick={onClick}
    />
  );
}

function Connection({ x1, y1, x2, y2, color, active }) {
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={color}
      strokeWidth={active ? 1.2 : 0.5}
      strokeOpacity={active ? 0.5 : 0.12}
      className="transition-all duration-300"
    />
  );
}

export default function NeuralNetworkDiagram() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeLayer, setActiveLayer] = useState(null);

  const svgWidth = 800;
  const svgHeight = 400;
  const layerSpacing = svgWidth / (LAYERS.length + 1);
  const neuronRadius = 12;

  const getNeuronPositions = (layer, layerIndex) => {
    const positions = [];
    const x = layerSpacing * (layerIndex + 1);
    const totalNeurons = layer.neurons;
    const maxDisplay = Math.min(totalNeurons, layer.maxNeurons);
    const neuronSpacing = Math.min(30, (svgHeight - 80) / (maxDisplay + 1));
    const startY = (svgHeight - neuronSpacing * (maxDisplay - 1)) / 2;

    for (let i = 0; i < maxDisplay; i++) {
      positions.push({ x, y: startY + i * neuronSpacing });
    }
    return positions;
  };

  const handleLayerClick = (layerId) => {
    setActiveLayer(activeLayer === layerId ? null : layerId);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-xl
          bg-brand-600/15 border border-brand-500/30 text-brand-300 font-medium
          hover:bg-brand-600/25 hover:border-brand-400/50 transition-all cursor-pointer
          hover:scale-105 hover:shadow-lg hover:shadow-brand-500/10"
      >
        <Layers className="w-5 h-5" />
        Ver Arquitectura de la Red Neuronal
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

          <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto glass rounded-3xl p-6 sm:p-8 glow-brand animate-fade-in-up">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-surface-200/60" />
            </button>

            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-light mb-3">
                <Layers className="w-4 h-4 text-brand-400" />
                <span className="text-xs font-semibold text-brand-300 uppercase tracking-wider">
                  Arquitectura del Modelo
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
                Red Neuronal Artificial (ANN)
              </h2>
              <p className="text-surface-200/60 text-sm max-w-2xl">
                Haz clic en cada capa para ver detalles. La red procesa tus datos financieros a través de
                4 capas de neuronas interconectadas hasta producir una predicción de riesgo.
              </p>
            </div>

            <div className="relative overflow-x-auto">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full min-w-[600px]"
                style={{ minHeight: 350 }}
              >
                {LAYERS.map((layer, layerIndex) => {
                  const positions = getNeuronPositions(layer, layerIndex);
                  const nextPositions = layerIndex < LAYERS.length - 1
                    ? getNeuronPositions(LAYERS[layerIndex + 1], layerIndex + 1)
                    : [];
                  const isActive = activeLayer === layer.id;

                  return (
                    <g key={layer.id}>
                      {layerIndex < LAYERS.length - 1 && positions.map((from) =>
                        nextPositions.map((to) => (
                          <Connection
                            key={`${from.x}-${from.y}-${to.x}-${to.y}`}
                            x1={from.x}
                            y1={from.y}
                            x2={to.x}
                            y2={to.y}
                            color={layer.color}
                            active={isActive}
                          />
                        ))
                      )}

                      {positions.map((pos, neuronIndex) => (
                        <Neuron
                          key={`${layer.id}-${neuronIndex}`}
                          cx={pos.x}
                          cy={pos.y}
                          r={neuronRadius}
                          color={layer.color}
                          active={isActive}
                          onClick={() => handleLayerClick(layer.id)}
                          delay={layerIndex * 100 + neuronIndex * 50}
                        />
                      ))}

                      <text
                        x={positions[0]?.x ?? layerSpacing * (layerIndex + 1)}
                        y={svgHeight - 15}
                        textAnchor="middle"
                        fill={layer.color}
                        fontSize="11"
                        fontWeight="600"
                        className="cursor-pointer"
                        onClick={() => handleLayerClick(layer.id)}
                      >
                        {layer.label}
                      </text>

                      <text
                        x={positions[0]?.x ?? layerSpacing * (layerIndex + 1)}
                        y={svgHeight - 2}
                        textAnchor="middle"
                        fill={`${layer.color}88`}
                        fontSize="9"
                      >
                        {layer.neurons === 1 ? '1 neurona' : `${layer.neurons} neuronas`}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {activeLayer && (
              <div className="mt-6 glass-light rounded-2xl p-5 animate-fade-in-up">
                {(() => {
                  const layer = LAYERS.find((l) => l.id === activeLayer);
                  if (!layer) return null;
                  return (
                    <div className="flex items-start gap-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${layer.color}20`, border: `1px solid ${layer.color}40` }}
                      >
                        <Info className="w-5 h-5" style={{ color: layer.color }} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white mb-1">{layer.label}</h4>
                        <p className="text-sm text-surface-200/70 mb-2">{layer.description}</p>
                        <div className="flex flex-wrap gap-2">
                          <span
                            className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                            style={{ backgroundColor: `${layer.color}15`, color: layer.color }}
                          >
                            {layer.activation}
                          </span>
                          <span className="text-xs text-surface-200/50 px-2.5 py-1">
                            {layer.detail}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Función de Pérdida', value: 'Binary Cross-Entropy', color: '#83a598' },
                { label: 'Optimizador', value: 'Adam (lr=0.002)', color: '#8ec07c' },
                { label: 'Total de Parámetros', value: '~210,000', color: '#fabd2f' },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="rounded-xl p-4 text-center"
                  style={{ backgroundColor: `${color}08`, border: `1px solid ${color}20` }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color }}>
                    {label}
                  </p>
                  <p className="text-sm font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
