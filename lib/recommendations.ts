import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { exerciseDatabase } from "./exercise-database"

export async function generateExerciseRecommendations(diagnosis: string) {
  console.log("Diagnóstico recibido:", diagnosis)

  if (!diagnosis || diagnosis.trim() === "") {
    console.error("Error: Diagnóstico vacío o nulo")
    return []
  }

  // Crear una lista de títulos de ejercicios disponibles con sus descripciones resumidas
  const exerciseSummaries = exerciseDatabase.map((exercise) => {
    const shortDescription = exercise.description.substring(0, 150) + "..."
    return `Título: "${exercise.title}"\nDescripción breve: ${shortDescription}`
  })

  const prompt = `
Eres un fisioterapeuta experto que recomienda ejercicios personalizados basados en diagnósticos específicos.

DIAGNÓSTICO DEL PACIENTE: "${diagnosis}"

INSTRUCCIONES:
1. Analiza cuidadosamente el diagnóstico del paciente.
2. Selecciona 3-5 ejercicios de la base de datos que sean ESPECÍFICAMENTE RELEVANTES para este diagnóstico particular.
3. Para cada ejercicio seleccionado, proporciona un breve razonamiento (2-3 frases) de por qué este ejercicio es beneficioso para este diagnóstico específico.
4. Considera la anatomía, biomecánica y principios de rehabilitación relacionados con este diagnóstico específico.
5. Si el diagnóstico afecta a una articulación o músculo específico, selecciona ejercicios que trabajen esa zona.
6. NO selecciones siempre los mismos ejercicios para diagnósticos diferentes.
7. Responde ÚNICAMENTE con un array JSON que incluya el título exacto y el razonamiento para cada ejercicio.

A continuación tienes información sobre los ejercicios disponibles en nuestra base de datos:

${exerciseSummaries.join("\n\n")}

Formato de respuesta (SOLO JSON):
[
  {
    "title": "Título exacto del ejercicio 1 (debe ser exactamente igual a como aparece en la lista)",
    "razonamiento": "Breve explicación de por qué este ejercicio es beneficioso para este diagnóstico específico."
  },
  {
    "title": "Título exacto del ejercicio 2 (debe ser exactamente igual a como aparece en la lista)",
    "razonamiento": "Breve explicación de por qué este ejercicio es beneficioso para este diagnóstico específico."
  },
  ...
]
`

  console.log("Enviando solicitud a OpenAI...")

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.7,
      response_format: { type: "json_object" }
    } as any) //
    console.log("Respuesta recibida:", text.substring(0, 100) + "...")

    // Extraer JSON
    const jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/)
    const jsonText = jsonMatch ? jsonMatch[0] : text

    try {
      const recommendations = JSON.parse(jsonText)
      console.log("Recomendaciones parseadas:", recommendations)

      // Buscar los ejercicios completos por título y añadir el razonamiento
      const exercises = recommendations
        .map((item: any) => {
          if (!item.title) {
            console.warn("Elemento sin título:", item)
            return null
          }

          const matchingExercise = exerciseDatabase.find((ex) => ex.title === item.title)

          if (!matchingExercise) {
            console.warn("Ejercicio no encontrado en la base de datos:", item.title)
            return null
          }

          // Añadir el razonamiento al ejercicio
          return {
            ...matchingExercise,
            razonamiento:
              item.razonamiento || "Este ejercicio ayuda a fortalecer y mejorar la movilidad en la zona afectada.",
          }
        })
        .filter(Boolean) // Eliminar los null

      console.log("Ejercicios encontrados en la base de datos:", exercises.length)

      if (exercises.length === 0) {
        console.log(
          "No se encontraron ejercicios específicos, buscando por palabras clave relacionadas con el diagnóstico...",
        )

        // Usar la función de fallback pero añadir razonamientos genéricos
        const fallbackExercises = getFallbackExercises(diagnosis)
        return fallbackExercises.map((exercise) => ({
          ...exercise,
          razonamiento: "Este ejercicio puede ayudar a mejorar la movilidad y reducir el dolor en la zona afectada.",
        }))
      }

      return exercises
    } catch (parseError) {
      console.error("Error al parsear JSON:", parseError)
      console.error("Texto que causó el error:", jsonText)

      // Implementar un fallback más inteligente basado en el diagnóstico
      const fallbackExercises = getFallbackExercises(diagnosis)
      return fallbackExercises.map((exercise) => ({
        ...exercise,
        razonamiento: "Este ejercicio puede ayudar a mejorar la movilidad y reducir el dolor en la zona afectada.",
      }))
    }
  } catch (error) {
    console.error("Error al generar recomendaciones:", error)

    // Implementar un fallback más inteligente basado en el diagnóstico
    const fallbackExercises = getFallbackExercises(diagnosis)
    return fallbackExercises.map((exercise) => ({
      ...exercise,
      razonamiento: "Este ejercicio puede ayudar a mejorar la movilidad y reducir el dolor en la zona afectada.",
    }))
  }
}

// Función auxiliar para obtener ejercicios de fallback basados en el diagnóstico
function getFallbackExercises(diagnosis: string) {
  // El código de la función getFallbackExercises se mantiene igual
  console.log("Buscando ejercicios de fallback para:", diagnosis)

  // Extraer palabras clave del diagnóstico
  const diagnosisWords = diagnosis
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 3)

  // Mapeo de condiciones comunes a palabras clave
  const conditionKeywords: Record<string, string[]> = {
    rodilla: ["rodilla", "rotuliano", "menisco", "lca", "lcl", "lcp", "ligamento", "cruzado"],
    hombro: ["hombro", "manguito", "rotador", "deltoides", "supraespinoso"],
    espalda: ["espalda", "lumbar", "cervical", "dorsal", "columna", "vertebral", "hernia"],
    tobillo: ["tobillo", "pie", "plantar", "aquiles", "esguince"],
    cadera: ["cadera", "glúteo", "piramidal", "coxalgia"],
    muñeca: ["muñeca", "mano", "carpo", "túnel", "carpiano"],
  }

  // Determinar qué condición está más relacionada con el diagnóstico
  let relevantCondition = ""
  let maxMatches = 0

  for (const [condition, keywords] of Object.entries(conditionKeywords)) {
    const matches = diagnosisWords.filter((word) =>
      keywords.some((keyword) => word.includes(keyword) || keyword.includes(word)),
    ).length

    if (matches > maxMatches) {
      maxMatches = matches
      relevantCondition = condition
    }
  }

  console.log("Condición relevante identificada:", relevantCondition || "No identificada específicamente")

  // Si se identificó una condición, buscar ejercicios relacionados
  if (relevantCondition) {
    const keywords = conditionKeywords[relevantCondition]

    const relevantExercises = exerciseDatabase.filter((exercise) => {
      const title = exercise.title.toLowerCase()
      const desc = exercise.description.toLowerCase()

      return keywords.some((keyword) => title.includes(keyword) || desc.includes(keyword))
    })

    console.log("Ejercicios de fallback encontrados:", relevantExercises.length)

    if (relevantExercises.length > 0) {
      // Devolver hasta 5 ejercicios, pero seleccionados aleatoriamente para variedad
      const shuffled = [...relevantExercises].sort(() => 0.5 - Math.random())
      return shuffled.slice(0, 5)
    }
  }

  // Si todo lo demás falla, devolver algunos ejercicios aleatorios
  console.log("Devolviendo ejercicios aleatorios como último recurso")
  const shuffled = [...exerciseDatabase].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, 5)
}
