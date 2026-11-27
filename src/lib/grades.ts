export type GradeLetter = "A" | "B" | "C" | "D" | "F";

type GradeStyle = {
  text: string;
  border: string;
  surface: string;
  dot: string;
  label: string;
};

/** Brand palette for trust grades: A mint, B cyan, C slate, D amber, F red. */
export const GRADE_STYLES: Record<GradeLetter, GradeStyle> = {
  A: {
    text: "text-mint",
    border: "border-mint/30",
    surface: "bg-mint/10",
    dot: "bg-mint",
    label: "Trusted",
  },
  B: {
    text: "text-cyan",
    border: "border-cyan/30",
    surface: "bg-cyan/10",
    dot: "bg-cyan",
    label: "Healthy",
  },
  C: {
    text: "text-slate",
    border: "border-slate/30",
    surface: "bg-slate/10",
    dot: "bg-slate",
    label: "Watch",
  },
  D: {
    text: "text-amber",
    border: "border-amber/30",
    surface: "bg-amber/10",
    dot: "bg-amber",
    label: "Risky",
  },
  F: {
    text: "text-danger",
    border: "border-danger/30",
    surface: "bg-danger/10",
    dot: "bg-danger",
    label: "Blocked",
  },
};

export function toGradeLetter(grade: string, numeric?: number): GradeLetter {
  const letter = grade?.trim().toUpperCase() as GradeLetter;
  if (letter in GRADE_STYLES) return letter;
  return gradeFromNumeric(numeric ?? 0);
}

export function gradeFromNumeric(numeric: number): GradeLetter {
  if (numeric >= 5) return "A";
  if (numeric === 4) return "B";
  if (numeric === 3) return "C";
  if (numeric === 2) return "D";
  return "F";
}

export const MIN_GRADE_OPTIONS: { value: GradeLetter; label: string }[] = [
  { value: "A", label: "Grade A - strictest" },
  { value: "B", label: "Grade B - recommended" },
  { value: "C", label: "Grade C - permissive" },
];