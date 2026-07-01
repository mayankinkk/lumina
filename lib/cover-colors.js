const coverColors = [
  "from-rose-500 to-pink-600",
  "from-violet-500 to-purple-600",
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-cyan-500 to-sky-600",
];

export function getCoverColor(title) {
  let hash = 0;
  for (let i = 0; i < (title || "").length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  return coverColors[Math.abs(hash) % coverColors.length];
}
