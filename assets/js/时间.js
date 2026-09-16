setup.normLayer = function (v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

function formatWorldTime() {
  const t = State.variables.time;
  if (!t) return "Day ??:??";

  const day = t.day ?? 1;
  const hour = String(t.hour ?? 0).padStart(2, "0");
  const minute = String(t.minute ?? 0).padStart(2, "0");

  return `Day ${day} ${hour}:${minute}`;
}