"use client"

import { useState } from "react"
import { generateExerciseRecommendations } from "@/lib/actions" // Importa desde actions
import { ExerciseCard } from "@/components/exercise-card"

export default function Home() {
  const [step, setStep] = useState<"diagnosis" | "results">("diagnosis")
  const [diagnosis, setDiagnosis] = useState("")
  const [exercises, setExercises] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDiagnosisSubmit = async () => {
    if (!diagnosis.trim()) {
      alert("Por favor ingresa tu diagnóstico antes de continuar.")
      return
    }

    setLoading(true)
    setError(null)

    console.log("Enviando diagnóstico:", diagnosis)

    try {
      const recommendations = await generateExerciseRecommendations(diagnosis)
      console.log("Recomendaciones recibidas:", recommendations.length)

      setExercises(recommendations)
      setStep("results")
    } catch (error) {
      console.error("Error al generar recomendaciones:", error)
      setError("Hubo un error al procesar tu solicitud. Por favor intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setDiagnosis("")
    setExercises([])
    setError(null)
    setStep("diagnosis")
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center mb-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 mr-2 text-emerald-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.24 12.24a6 6 0 018.49-8.49M5 19a2 2 0 104 0 2 2 0 00-4 0zm4 0a2 2 0 104 0 2 2 0 00-4 0z"
            />
          </svg>
          <h1 className="text-3xl font-bold text-gray-800">Rutina Personalizada con IA</h1>
        </div>

        {step === "diagnosis" && (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Ingresa tu diagnóstico</h2>
              <p className="text-gray-600 mt-1">
                Proporciona tu diagnóstico médico o condición para que podamos crear una rutina personalizada para ti.
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-emerald-600 mt-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <label className="text-sm font-medium text-gray-700">
                    ¿Cuál es tu diagnóstico o condición médica?
                  </label>
                </div>
                <textarea
                  placeholder="Ej: Tendinitis rotuliana, Lumbalgia crónica, Síndrome del túnel carpiano..."
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <button
                onClick={handleDiagnosisSubmit}
                className="w-full flex items-center justify-center py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md transition-colors"
                disabled={loading}
              >
                {loading ? "Generando rutina..." : "Generar rutina"}
                {!loading && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        )}

        {step === "results" && (
          <div className="space-y-8">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Tu rutina personalizada</h2>
                <p className="text-gray-600 mt-1">
                  Basado en tu diagnóstico de <span className="font-medium">{diagnosis}</span>, hemos seleccionado estos
                  ejercicios específicos para ti.
                </p>
              </div>
              <div className="p-6">
                <div className="bg-amber-50 p-4 rounded-md border border-amber-100 mb-6">
                  <p className="text-sm text-amber-800">
                    <strong>Importante:</strong> Estos ejercicios son orientativos y no sustituyen la opinión de un
                    profesional cualificado. Te recomendamos consultar con un fisioterapeuta o médico antes de realizar
                    cualquier ejercicio.
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 p-4 rounded-md border border-red-100 mb-6">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {exercises.length > 0 ? (
                  <div className="space-y-6">
                    {exercises.map((exercise, index) => (
                      <ExerciseCard key={index} exercise={exercise} index={index} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No se encontraron ejercicios específicos para tu diagnóstico. Por favor, intenta con un diagnóstico
                    más detallado.
                  </div>
                )}
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={handleReset}
                  className="w-full py-2 px-4 bg-white border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
                >
                  Volver a empezar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}