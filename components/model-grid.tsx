import * as React from "react"
import { ModelCard } from "@/components/model-card"

interface ModelGridProps {
  title: string
  models: Array<{
    id: string
    title: string
    author: string
    downloads: number
    likes: number
    imageUrl?: string
  }>
}

export function ModelGrid({ title, models }: ModelGridProps) {
  return (
    <section className="space-y-[18px] mx-[52px] my-[92px]">
      <h2 className="text-[24px] font-semibold">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-max gap-y-[18px]">
        {models.map((model) => (
          <ModelCard
            key={model.id}
            title={model.title}
            author={model.author}
            downloads={model.downloads}
            likes={model.likes}
            imageUrl={model.imageUrl}
          />
        ))}
      </div>
    </section>
  )
}