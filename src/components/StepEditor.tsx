import type { Step, StepType } from '../utils/stepParsing'

const TYPE_LABELS: Record<StepType, string> = {
  step: 'Step',
  title: 'Section',
  note: 'Note',
}

const PLACEHOLDERS: Record<StepType, string> = {
  step: 'Preheat the oven to 350°F',
  title: 'Prep',
  note: 'Chill dough overnight',
}

interface Props {
  lines: Step[]
  onChange: (index: number, line: Step) => void
  onAdd: () => void
  onRemove: (index: number) => void
}

export default function StepEditor({ lines, onChange, onAdd, onRemove }: Props) {
  return (
    <div className="field">
      <label>Instructions</label>
      <div className="list-editor">
        {lines.map((line, i) => (
          <div className="step-editor-row" key={i}>
            <select
              className="step-editor-row__type"
              value={line.type}
              onChange={(e) => onChange(i, { type: e.target.value as StepType, text: line.text })}
            >
              {(Object.keys(TYPE_LABELS) as StepType[]).map((t) => (
                <option key={t} value={t}>
                  {TYPE_LABELS[t]}
                </option>
              ))}
            </select>
            <textarea
              rows={line.type === 'step' ? 2 : 1}
              placeholder={PLACEHOLDERS[line.type]}
              value={line.text}
              onChange={(e) => onChange(i, { type: line.type, text: e.target.value })}
            />
            <button
              type="button"
              className="icon-btn"
              onClick={() => onRemove(i)}
              disabled={lines.length === 1}
              aria-label={`Remove instruction ${i + 1}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="btn btn--ghost" onClick={onAdd} style={{ alignSelf: 'flex-start' }}>
        + Add line
      </button>
    </div>
  )
}
