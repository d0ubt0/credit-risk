/**
 * ============================================
 * Resources - Sección de recursos y enlaces
 * ============================================
 * Enlaces a documentación, reporte técnico y
 * video promocional del proyecto.
 */
import { FileText, PlayCircle, Code, ExternalLink } from 'lucide-react';

const resources = [
  {
    icon: FileText,
    title: 'Reporte Técnico',
    description:
      'Documentación completa del proyecto incluyendo análisis exploratorio, preprocesamiento, entrenamiento y evaluación del modelo.',
    link: '#',
    linkLabel: 'Ver Reporte',
    color: '#83a598', // Gruvbox Blue
    badge: 'PDF',
  },
  {
    icon: PlayCircle,
    title: 'Video Promocional',
    description:
      'Presentación en video del proyecto, demostrando las capacidades del modelo y la interfaz de usuario.',
    link: '#',
    linkLabel: 'Ver Video',
    color: '#fb4934', // Gruvbox Red
    badge: 'YouTube',
  },
  {
    icon: Code,
    title: 'Código Fuente',
    description:
      'Repositorio completo con el notebook de entrenamiento, el modelo exportado, y el código de esta aplicación web.',
    link: '#',
    linkLabel: 'Ver Repositorio',
    color: '#a89984', // Gruvbox Gray
    badge: 'GitHub',
  },
];

export default function Resources() {
  return (
    <section id="recursos" className="py-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-light mb-4">
            <FileText className="w-4 h-4 text-brand-400" />
            <span className="text-xs font-semibold text-brand-300 uppercase tracking-wider">
              Recursos
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Documentación y Enlaces
          </h2>
          <p className="text-surface-200/60 max-w-xl mx-auto">
            Explora los recursos del proyecto para conocer más sobre la metodología,
            el modelo y el código fuente.
          </p>
        </div>

        {/* Resource cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {resources.map(({ icon: Icon, title, description, link, linkLabel, color, badge }) => (
            <a
              key={title}
              href={link}
              className="glass rounded-2xl p-6 group hover:bg-white/5 transition-all duration-300
                hover:border-brand-500/30 hover:translate-y-[-4px] hover:shadow-xl hover:shadow-brand-500/10 block"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center
                    group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: `${color}15` }}
                >
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: `${color}15`, color }}
                >
                  {badge}
                </span>
              </div>

              <h3 className="font-bold text-white mb-2 group-hover:text-brand-300 transition-colors">
                {title}
              </h3>
              <p className="text-sm text-surface-200/60 leading-relaxed mb-4">
                {description}
              </p>

              <div className="flex items-center gap-1.5 text-sm font-medium text-brand-400 
                group-hover:text-brand-300 transition-colors">
                {linkLabel}
                <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
