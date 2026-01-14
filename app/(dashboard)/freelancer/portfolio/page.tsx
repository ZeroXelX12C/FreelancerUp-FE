"use client"

import PortfolioForm from "@/components/portfolio/PortfolioForm"

export default function Page() {
  const sample = {
    title: "Demo: Landing Page Redesign",
    description: "Một project demo trình bày thiết kế landing page responsive và UI components.",
    tags: ["react", "tailwind", "ui-design"],
    projectUrl: "https://example.com/project-demo",
    images: [
      "https://picsum.photos/seed/1/800/600",
      "https://picsum.photos/seed/2/800/600",
      "https://picsum.photos/seed/3/800/600",
    ],
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Demo Portfolio Form</h1>
      <PortfolioForm initial={sample} />
    </div>
  )
}
