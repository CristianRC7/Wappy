import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import troubleshootingData from '../data/troubleshooting-data.json';

interface Solution {
  type: string;
  title?: string;
  description?: string;
  code?: string;
  language?: string;
}

interface Problem {
  id: number;
  title: string;
  description: string;
  causes?: string[];
  symptoms?: string[];
  solutions: Solution[];
  notes?: string[];
  filesToCheck?: string[];
  examples?: Array<{
    country: string;
    correct: string;
    incorrect: string[];
  }>;
  supportedFormats?: {
    images?: string[];
    videos?: string[];
    documents?: string[];
    audio?: string[];
  };
  recommendation?: {
    type: string;
    language?: string;
    description: string;
    code?: string;
  };
  correctFormat?: {
    type: string;
    example: string;
  };
}

const Troubleshooting = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const problems: Problem[] = troubleshootingData.problems;

  const filteredProblems = problems.filter(problem =>
    problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    problem.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    problem.causes?.some(cause => cause.toLowerCase().includes(searchTerm.toLowerCase())) ||
    problem.symptoms?.some(symptom => symptom.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const renderCodeBlock = (solution: Solution, index: number, problemId: number) => {
    const codeId = `${problemId}-${index}`;
    return (
      <div className="relative bg-gray-900 rounded-lg p-4 mt-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-400 font-mono uppercase">
            {solution.language || 'bash'}
          </span>
          <button
            onClick={() => copyToClipboard(solution.code!, codeId)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 transition-colors text-xs text-gray-300"
          >
            {copiedCode === codeId ? (
              <>
                <Check size={14} />
                Copiado
              </>
            ) : (
              <>
                <Copy size={14} />
                Copiar
              </>
            )}
          </button>
        </div>
        <pre className="text-sm text-gray-100 overflow-x-auto">
          <code>{solution.code}</code>
        </pre>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Centro de Ayuda
        </h1>
        <p className="text-gray-600">
          Encuentra soluciones a los problemas más comunes
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar problema o solución..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
        />
      </div>

      {/* Results Count */}
      {searchTerm && (
        <div className="mb-4 text-sm text-gray-600">
          {filteredProblems.length} {filteredProblems.length === 1 ? 'resultado' : 'resultados'}
        </div>
      )}

      {/* Problems List */}
      <div className="space-y-3">
        {filteredProblems.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">No se encontraron resultados</p>
            <p className="text-sm">Intenta con otros términos de búsqueda</p>
          </div>
        ) : (
          filteredProblems.map((problem) => (
            <div
              key={problem.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Problem Header */}
              <div
                onClick={() => toggleExpand(problem.id)}
                className="p-5 cursor-pointer flex justify-between items-start hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {problem.id}. {problem.title}
                  </h3>
                  <p className="text-sm text-gray-600">{problem.description}</p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  {expandedId === problem.id ? (
                    <ChevronUp className="text-gray-400" size={20} />
                  ) : (
                    <ChevronDown className="text-gray-400" size={20} />
                  )}
                </div>
              </div>

              {/* Problem Details */}
              {expandedId === problem.id && (
                <div className="px-5 pb-5 pt-2 space-y-5 border-t border-gray-100">
                  {/* Causes */}
                  {problem.causes && problem.causes.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 text-sm">
                        Causas Posibles
                      </h4>
                      <ul className="space-y-2">
                        {problem.causes.map((cause, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-emerald-600 mt-0.5">•</span>
                            <span>{cause}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Symptoms */}
                  {problem.symptoms && problem.symptoms.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 text-sm">
                        Síntomas
                      </h4>
                      <ul className="space-y-2">
                        {problem.symptoms.map((symptom, idx) => (
                          <li key={idx} className="text-sm">
                            <code className="bg-gray-100 px-2 py-1 rounded text-gray-800">
                              {symptom}
                            </code>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Solutions */}
                  {problem.solutions && problem.solutions.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 text-sm">
                        Soluciones
                      </h4>
                      <div className="space-y-3">
                        {problem.solutions.map((solution, idx) => (
                          <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                            {solution.title && (
                              <h5 className="font-medium text-gray-900 mb-2 text-sm">
                                {solution.title}
                              </h5>
                            )}
                            {solution.description && (
                              <p className="text-sm text-gray-700 mb-2">{solution.description}</p>
                            )}
                            {solution.code && renderCodeBlock(solution, idx, problem.id)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {problem.notes && problem.notes.length > 0 && (
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <h4 className="font-semibold text-gray-900 mb-3 text-sm">
                        Notas Importantes
                      </h4>
                      <ul className="space-y-2">
                        {problem.notes.map((note, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-yellow-600">⚠</span>
                            <span>{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Files to Check */}
                  {problem.filesToCheck && problem.filesToCheck.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 text-sm">
                        Archivos a Revisar
                      </h4>
                      <ul className="space-y-2">
                        {problem.filesToCheck.map((file, idx) => (
                          <li key={idx} className="text-sm font-mono bg-gray-100 px-3 py-2 rounded">
                            {file}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Examples */}
                  {problem.examples && problem.examples.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 text-sm">
                        Ejemplos de Formato
                      </h4>
                      <div className="space-y-3">
                        {problem.examples.map((example, idx) => (
                          <div key={idx} className="space-y-2">
                            <p className="font-medium text-sm text-gray-700">{example.country}</p>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-green-600">✓</span>
                                <code className="bg-green-50 px-2 py-1 rounded text-green-800">
                                  {example.correct}
                                </code>
                                <span className="text-xs text-green-600">Correcto</span>
                              </div>
                              {example.incorrect.map((inc, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm">
                                  <span className="text-red-600">✗</span>
                                  <code className="bg-red-50 px-2 py-1 rounded text-red-800 line-through">
                                    {inc}
                                  </code>
                                  <span className="text-xs text-red-600">Incorrecto</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Supported Formats */}
                  {problem.supportedFormats && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 text-sm">
                        Formatos Soportados
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(problem.supportedFormats).map(([key, formats]) => (
                          <div key={key} className="bg-gray-50 p-3 rounded-lg">
                            <h5 className="font-medium text-xs text-gray-700 mb-2 capitalize">
                              {key}
                            </h5>
                            <div className="flex flex-wrap gap-1.5">
                              {(formats as string[]).map((format, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs bg-white px-2 py-1 rounded border border-gray-200"
                                >
                                  {format}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendation */}
                  {problem.recommendation && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                        Recomendación
                      </h4>
                      <p className="text-sm text-gray-700 mb-2">
                        {problem.recommendation.description}
                      </p>
                      {problem.recommendation.code && (
                        <div className="bg-gray-900 rounded p-3 mt-2">
                          <pre className="text-sm text-gray-100 overflow-x-auto">
                            <code>{problem.recommendation.code}</code>
                          </pre>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Correct Format */}
                  {problem.correctFormat && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-gray-900 mb-3 text-sm">
                        Formato Correcto
                      </h4>
                      <pre className="text-sm text-gray-800 overflow-x-auto font-mono bg-white p-3 rounded">
                        {problem.correctFormat.example}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Troubleshooting;