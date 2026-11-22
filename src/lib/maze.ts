export type Point = { i: number; j: number };

export type Dir = "left" | "right" | "up" | "down";

export interface Maze {
  n: number;
  m: number;
  wallsH: boolean[][];
  wallsV: boolean[][];
}

const DIRS: Dir[] = ["left", "right", "up", "down"];

const DELTAS: Record<Dir, { di: number; dj: number }> = {
  left: { di: 0, dj: -1 },
  right: { di: 0, dj: 1 },
  up: { di: -1, dj: 0 },
  down: { di: 1, dj: 0 },
};

// Лабиринт n x m со стенками по краям.
// wallsH[i][j] - стенка между строками i и i+1 в столбце j.
// wallsV[i][j] - стенка между столбцами j и j+1 в строке i.
export function createMaze(n: number, m: number): Maze {
  const wallsH = Array.from({ length: n + 2 }, () =>
    new Array<boolean>(m + 2).fill(false)
  );
  const wallsV = Array.from({ length: n + 2 }, () =>
    new Array<boolean>(m + 2).fill(false)
  );

  for (let i = 0; i <= n; i += n) {
    for (let j = 1; j <= m; ++j) wallsH[i][j] = true;
  }
  for (let j = 0; j <= m; j += m) {
    for (let i = 1; i <= n; ++i) wallsV[i][j] = true;
  }

  return { n, m, wallsH, wallsV };
}

// Каждая внутренняя стенка ставится с вероятностью prob (0..1).
export function generateRandom(maze: Maze, prob: number, rng: () => number): Maze {
  const { n, m, wallsH, wallsV } = maze;
  for (let i = 1; i <= n; ++i) {
    for (let j = 1; j <= m; ++j) {
      if (j < m && rng() < prob) wallsV[i][j] = true;
      if (i < n && rng() < prob) wallsH[i][j] = true;
    }
  }
  return maze;
}

export function inMaze(maze: Maze, p: Point): boolean {
  return 1 <= p.i && p.i <= maze.n && 1 <= p.j && p.j <= maze.m;
}

export function moveDir(p: Point, dir: Dir): Point {
  const d = DELTAS[dir];
  return { i: p.i + d.di, j: p.j + d.dj };
}

export function canGo(maze: Maze, p: Point, dir: Dir): boolean {
  const q = moveDir(p, dir);
  if (!inMaze(maze, q)) return false;

  const { i, j } = p;
  let wall: boolean;
  switch (dir) {
    case "left":
      wall = maze.wallsV[i][j - 1];
      break;
    case "right":
      wall = maze.wallsV[i][j];
      break;
    case "up":
      wall = maze.wallsH[i - 1][j];
      break;
    case "down":
      wall = maze.wallsH[i][j];
      break;
  }
  return !wall;
}

// Кратчайший путь из пункта a в пункт b (поиск в ширину).
// Возвращает null, если пути нет.
export function findShortestPath(maze: Maze, a: Point, b: Point): Point[] | null {
  const { n, m } = maze;
  const total = n * m;
  const index = (p: Point) => (p.i - 1) * m + (p.j - 1);

  const start = index(a);
  const target = index(b);
  const visited = new Array<boolean>(total).fill(false);
  const source = new Array<number>(total).fill(-1);

  visited[start] = true;
  const queue: number[] = [start];
  let head = 0;

  while (head < queue.length) {
    const u = queue[head++];
    const p: Point = { i: Math.floor(u / m) + 1, j: (u % m) + 1 };
    for (const dir of DIRS) {
      if (!canGo(maze, p, dir)) continue;
      const v = index(moveDir(p, dir));
      if (visited[v]) continue;
      visited[v] = true;
      source[v] = u;
      queue.push(v);
    }
  }

  if (!visited[target]) return null;

  const path: Point[] = [];
  for (let v = target; v !== -1; v = source[v]) {
    path.push({ i: Math.floor(v / m) + 1, j: (v % m) + 1 });
  }
  path.reverse();
  return path;
}

// Небольшой детерминированный генератор случайных чисел (mulberry32).
export function createRng(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildMaze(
  n: number,
  m: number,
  density: number,
  seed: number
): Maze {
  return generateRandom(createMaze(n, m), density / 100, createRng(seed));
}
