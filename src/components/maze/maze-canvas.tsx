import type { Maze, Point } from "@/lib/maze";

interface MazeCanvasProps {
  maze: Maze;
  start: Point;
  finish: Point;
  path: Point[] | null;
  step: number;
  onCellClick?: (point: Point) => void;
}

const CELL = 34;
const PAD = 12;

export function MazeCanvas({
  maze,
  start,
  finish,
  path,
  step,
  onCellClick,
}: MazeCanvasProps) {
  const { n, m, wallsH, wallsV } = maze;
  const width = m * CELL + PAD * 2;
  const height = n * CELL + PAD * 2;

  const center = (p: Point) => ({
    x: (p.j - 1) * CELL + CELL / 2,
    y: (p.i - 1) * CELL + CELL / 2,
  });

  const visible = path ? path.slice(0, Math.max(step, 0)) : [];
  const visibleKeys = new Set(visible.map((p) => `${p.i}:${p.j}`));
  const polyline = visible.map((p) => {
    const c = center(p);
    return `${c.x},${c.y}`;
  });

  const cells: React.ReactNode[] = [];
  for (let i = 1; i <= n; ++i) {
    for (let j = 1; j <= m; ++j) {
      const isStart = start.i === i && start.j === j;
      const isFinish = finish.i === i && finish.j === j;
      const onPath = visibleKeys.has(`${i}:${j}`);

      let fill = "#f8fafc";
      if (onPath) fill = "#e0e7ff";
      if (isStart) fill = "#d1fae5";
      if (isFinish) fill = "#ffe4e6";
      if (isStart && isFinish) fill = "#ede9fe";

      cells.push(
        <rect
          key={`c-${i}-${j}`}
          x={(j - 1) * CELL}
          y={(i - 1) * CELL}
          width={CELL}
          height={CELL}
          fill={fill}
        />
      );
    }
  }

  const wallLines: React.ReactNode[] = [];
  for (let i = 1; i <= n; ++i) {
    for (let j = 0; j <= m; ++j) {
      if (!wallsV[i][j]) continue;
      wallLines.push(
        <line
          key={`v-${i}-${j}`}
          x1={j * CELL}
          y1={(i - 1) * CELL}
          x2={j * CELL}
          y2={i * CELL}
        />
      );
    }
  }
  for (let i = 0; i <= n; ++i) {
    for (let j = 1; j <= m; ++j) {
      if (!wallsH[i][j]) continue;
      wallLines.push(
        <line
          key={`h-${i}-${j}`}
          x1={(j - 1) * CELL}
          y1={i * CELL}
          x2={j * CELL}
          y2={i * CELL}
        />
      );
    }
  }

  const overlays: React.ReactNode[] = [];
  if (onCellClick) {
    for (let i = 1; i <= n; ++i) {
      for (let j = 1; j <= m; ++j) {
        overlays.push(
          <rect
            key={`o-${i}-${j}`}
            x={(j - 1) * CELL}
            y={(i - 1) * CELL}
            width={CELL}
            height={CELL}
            className="cursor-crosshair fill-transparent transition-colors hover:fill-indigo-500/15"
            onClick={() => onCellClick({ i, j })}
          />
        );
      }
    }
  }

  const startCenter = center(start);
  const finishCenter = center(finish);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto block h-auto w-full max-w-3xl"
      role="img"
      aria-label={`Лабиринт ${n} на ${m}`}
    >
      <g transform={`translate(${PAD},${PAD})`}>
        {cells}

        {polyline.length > 1 && (
          <polyline
            points={polyline.join(" ")}
            fill="none"
            stroke="#4f46e5"
            strokeWidth={CELL * 0.24}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity={0.85}
          />
        )}

        <g stroke="#1e293b" strokeWidth={2.5} strokeLinecap="round">
          {wallLines}
        </g>

        <g>
          <circle
            cx={startCenter.x}
            cy={startCenter.y}
            r={CELL * 0.3}
            fill="#10b981"
          />
          <text
            x={startCenter.x}
            y={startCenter.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={CELL * 0.42}
            fontWeight={700}
            fill="#ffffff"
          >
            S
          </text>
          <circle
            cx={finishCenter.x}
            cy={finishCenter.y}
            r={CELL * 0.3}
            fill="#f43f5e"
          />
          <text
            x={finishCenter.x}
            y={finishCenter.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={CELL * 0.42}
            fontWeight={700}
            fill="#ffffff"
          >
            F
          </text>
        </g>

        {overlays}
      </g>
    </svg>
  );
}
