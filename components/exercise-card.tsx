"use client"

import { useState } from "react"

interface ExerciseCardProps {
  exercise: {
    title: string
    description: string
    url: string
    razonamiento?: string
  }
  index: number
}

function getYouTubeVideoId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

export function ExerciseCard({ exercise, index }: ExerciseCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <div className="bg-gray-50 p-4 flex justify-between items-start">
        <h3 className="text-lg font-medium text-gray-800">
          {index + 1}. {exercise.title}
        </h3>
        <button onClick={() => setExpanded(!expanded)} className="p-1 rounded-full hover:bg-gray-200 transition-colors">
          {expanded ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>
      </div>

      {expanded && (
        <div className="p-4">
          <div className="space-y-4">
            {exercise.razonamiento && (
              <div className="bg-emerald-50 p-3 rounded-md border border-emerald-100">
                <div className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-emerald-600 mt-0.5 mr-2 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm text-emerald-800">{exercise.razonamiento}</p>
                </div>
              </div>
            )}

            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-1">Descripción:</h4>
              <div className="text-sm text-gray-600 whitespace-pre-line">{exercise.description}</div>
            </div>

            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-1">Video demostrativo:</h4>
              <div className="aspect-video w-full rounded-md overflow-hidden bg-gray-100">
                {getYouTubeVideoId(exercise.url) ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeVideoId(exercise.url)}`}
                    title={exercise.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                ) : (
                  <a
                    href={exercise.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-emerald-600 hover:text-emerald-700 text-sm"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="mr-1">Ver video en YouTube</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
