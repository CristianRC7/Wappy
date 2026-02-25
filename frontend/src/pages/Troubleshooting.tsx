import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Copy, AlertCircle, CheckCircle2, Info } from 'lucide-react';
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
      <div className="relative bg-gray-900 rounded-lg p-4 mt-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-400 font-mono">
            {solution.language || 'bash'}
          </span>
          <button
            onClick={() => copyToClipboard(solution.code!, codeId)}
            className="text-gray-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs"
          >
            {copiedCode === codeId ? (
              <>
                <CheckCircle2 size={14} className="text-green-400" />
                <span className="text-green-400">Copiado!</span>
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
    <div className="max-w-5xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-blue-700 mb-2 flex items-center gap-3">
          <AlertCircle size={36} />
          Solución de Problemas
        </h1>
        <p className="text-gray-600">
          Encuentra soluciones rápidas a los problemas más comunes de Wappy
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
          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
        />
      </div>

      {/* Results Count */}
      {searchTerm && (
        <div className="mb-4 text-sm text-gray-600">
          {filteredProblems.length} {filteredProblems.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
        </div>
      )}

      {/* Problems List */}
      <div className="space-y-4">
        {filteredProblems.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Info size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No se encontraron resultados para "{searchTerm}"</p>
            <p className="text-sm mt-2">Intenta con otros términos de búsqueda</p>
          </div>
        ) : (
          filteredProblems.map((problem) => (
            <div
              key={problem.id}
              className="border-2 border-gray-200 rounded-lg overflow-hidden transition-all hover:shadow-lg"
            >
              {/* Problem Header */}
              <div
                onClick={() => toggleExpand(problem.id)}
                className="p-4 bg-white cursor-pointer flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {problem.id}. {problem.title}
                  </h3>
                  <p className="text-sm text-gray-600">{problem.description}</p>
                </div>
                <div className="ml-4">
                  {expandedId === problem.id ? (
                    <ChevronUp className="text-blue-600" size={24} />
                  ) : (
                    <ChevronDown className="text-gray-400" size={24} />
                  )}
                </div>
              </div>

              {/* Problem Details */}
              {expandedId === problem.id && (
                <div className="p-6 bg-gray-50 border-t-2 border-gray-200">
                  {/* Causes */}
                  {problem.causes && problem.causes.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <AlertCircle size={18} className="text-orange-500" />
                        Causas Posibles
                      </h4>
                      <ul className="space-y-2">
                        {problem.causes.map((cause, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-700">
                            <span className="text-orange-500 mt-1">•</span>
                            <span>{cause}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Symptoms */}
                  {problem.symptoms && problem.symptoms.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Info size={18} className="text-blue-500" />
                        Síntomas
                      </h4>
                      <ul className="space-y-2">
                        {problem.symptoms.map((symptom, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-700">
                            <span className="text-blue-500 mt-1">•</span>
                            <span className="font-mono text-sm bg-blue-50 px-2 py-1 rounded">{symptom}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Solutions */}
                  {problem.solutions && problem.solutions.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-green-500" />
                        Soluciones
                      </h4>
                      <div className="space-y-4">
                        {problem.solutions.map((solution, idx) => (
                          <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200">
                            {solution.title && (
                              <h5 className="font-semibold text-gray-800 mb-2">{solution.title}</h5>
                            )}
                            {solution.description && (
                              <p className="text-gray-700 mb-2">{solution.description}</p>
                            )}
                            {solution.code && renderCodeBlock(solution, idx, problem.id)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {problem.notes && problem.notes.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-800 mb-3">Notas Importantes</h4>
                      <ul className="space-y-2 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        {problem.notes.map((note, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-700">
                            <span className="text-yellow-600 mt-1">⚠️</span>
                            <span>{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Files to Check */}
                  {problem.filesToCheck && problem.filesToCheck.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-800 mb-3">Archivos a Revisar</h4>
                      <ul className="space-y-2">
                        {problem.filesToCheck.map((file, idx) => (
                          <li key={idx} className="font-mono text-sm bg-purple-50 px-3 py-2 rounded border-l-4 border-purple-400">
                            {file}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Examples */}
                  {problem.examples && problem.examples.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-800 mb-3">Ejemplos de Formato</h4>
                      <div className="space-y-4">
                        {problem.examples.map((example, idx) => (
                          <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200">
                            <h5 className="font-semibold text-gray-700 mb-2">{example.country}</h5>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-green-500" />
                                <span className="font-mono text-sm bg-green-50 px-2 py-1 rounded">{example.correct}</span>
                                <span className="text-xs text-green-600 font-semibold">Correcto</span>
                              </div>
                              {example.incorrect.map((inc, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <AlertCircle size={16} className="text-red-500" />
                                  <span className="font-mono text-sm bg-red-50 px-2 py-1 rounded">{inc}</span>
                                  <span className="text-xs text-red-600 font-semibold">Incorrecto</span>
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
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-800 mb-3">Formatos Soportados</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(problem.supportedFormats).map(([key, formats]) => (
                          <div key={key} className="bg-white p-3 rounded-lg border border-gray-200">
                            <h5 className="font-semibold text-gray-700 mb-2 capitalize">{key}</h5>
                            <div className="flex flex-wrap gap-2">
                              {(formats as string[]).map((format, idx) => (
                                <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-mono">
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
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-800 mb-3">Recomendación</h4>
                      <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                        <p className="text-gray-700 mb-2">{problem.recommendation.description}</p>
                        {problem.recommendation.code && (
                          <div className="relative bg-gray-900 rounded-lg p-4 mt-2">
                            <pre className="text-sm text-gray-100 overflow-x-auto">
                              <code>{problem.recommendation.code}</code>
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Correct Format */}
                  {problem.correctFormat && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-800 mb-3">Formato Correcto</h4>
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <pre className="text-sm text-gray-800 overflow-x-auto font-mono">
                          {problem.correctFormat.example}
                        </pre>
                      </div>
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