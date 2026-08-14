export type StepType = 'step' | 'title' | 'note'

export interface Step {
  type: StepType
  text: string
}

const TITLE_RE = /^\((.+)\)$/
const NOTE_RE = /^!(.+)$/

export function parseStep(raw: string): Step {
  const line = raw.trim()

  const title = line.match(TITLE_RE)
  if (title) return { type: 'title', text: title[1].trim() }

  const note = line.match(NOTE_RE)
  if (note) return { type: 'note', text: note[1].trim() }

  return { type: 'step', text: line }
}

// Inverse of parseInstructionLine — used when saving from the form.
export function formatStep(line: Step): string {
  switch (line.type) {
    case 'title':
      return `(${line.text})`
    case 'note':
      return `!${line.text}!`
    case 'step':
      return line.text
  }
}
