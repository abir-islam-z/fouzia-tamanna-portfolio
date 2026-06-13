import { skillsQuery } from "@/lib/queries"
import { RiCodeSSlashLine } from "@remixicon/react"
import { useSuspenseQuery } from "@tanstack/react-query"

interface SkillItem {
  id: string
  name: string
  category: string
  level: string | null
  order: number
}

interface SkillsProps {
  sectionConfig?: {
    badge?: string | null
    heading?: string | null
    subtext?: string | null
  }
}

const LEVEL_STYLES: Record<string, string> = {
  expert: "bg-primary",
  advanced: "bg-primary/75",
  intermediate: "bg-primary/50",
  beginner: "bg-primary/25",
}

export default function Skills({ sectionConfig }: SkillsProps = {}) {
  const { data: rawSkills } = useSuspenseQuery(skillsQuery)
  const skills = (rawSkills ?? []) as unknown as SkillItem[]

  if (skills.length === 0) return null

  // Group by category
  const grouped = skills.reduce<Record<string, SkillItem[]>>((acc, skill) => {
    const cat = skill.category || "General"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(skill)
    return acc
  }, {})

  const badge = sectionConfig?.badge ?? "// SKILLS.SEC"
  const heading = sectionConfig?.heading ?? (
    <>
      Technical
      <br />
      <span className="text-gradient-neon-bg">Arsenal</span>
    </>
  )
  const subtext =
    sectionConfig?.subtext ?? "Tools, technologies, and competencies."

  return (
    <section
      id="skills"
      className="tech-grid relative px-4 py-16 md:px-6 md:py-24"
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 flex items-center gap-4 md:mb-14">
          <div className="cyber-chamfer relative flex h-12 w-12 items-center justify-center border border-primary text-primary md:h-14 md:w-14">
            <RiCodeSSlashLine className="text-glow-sm size-6 md:size-7" />
            <span className="status-dot absolute -top-1 -right-1" />
          </div>
          <div>
            <div className="label-mono mb-1">{badge}</div>
            <h2 className="font-display text-2xl leading-none font-bold tracking-wide uppercase md:text-3xl">
              {heading}
            </h2>
            <p className="mt-1 font-mono text-xs text-muted-foreground md:text-sm">
              {subtext}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {Object.entries(grouped).map(([category, items]) => (
            <div
              key={category}
              className="cyber-chamfer space-y-3 border border-border p-5 md:p-6"
            >
              <h3 className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
                ▸ {category}
              </h3>
              <div className="space-y-2.5">
                {items.map((skill) => (
                  <div key={skill.id} className="group flex items-center gap-3">
                    <span className="flex-1 font-display text-sm font-bold tracking-wide uppercase transition-colors group-hover:text-primary md:text-base">
                      {skill.name}
                    </span>
                    {skill.level && (
                      <span
                        className={`cyber-chamfer-sm h-1.5 w-16 border border-primary/20 ${
                          LEVEL_STYLES[skill.level.toLowerCase()] ??
                          "bg-primary/50"
                        }`}
                        title={skill.level}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
