"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { MazeCanvas } from "@/components/maze/maze-canvas";
import {
  buildMaze,
  findShortestPath,
  type Maze,
  type Point,
} from "@/lib/maze";

const DEFAULT_ROWS = 8;
const DEFAULT_COLS = 12;
const DEFAULT_DENSITY = 30;
const INITIAL_SEED = 20240517;

const MIN_ROWS = 4;
const MAX_ROWS = 16;
const MIN_COLS = 4;
const MAX_COLS = 20;
const MAX_DENSITY = 60;

type Mode = "start" | "finish";

function randomSeed() {
  return Math.floor(Math.random() * 2 ** 31);
}

export function MazeStudio() {
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [cols, setCols] = useState(DEFAULT_COLS);
  const [density, setDensity] = useState(DEFAULT_DENSITY);
  const [mode, setMode] = useState<Mode>("start");

  const [maze, setMaze] = useState<Maze>(() =>
    buildMaze(DEFAULT_ROWS, DEFAULT_COLS, DEFAULT_DENSITY, INITIAL_SEED)
  );
  const [start, setStart] = useState<Point>({ i: 1, j: 1 });
  const [finish, setFinish] = useState<Point>({
    i: DEFAULT_ROWS,
    j: DEFAULT_COLS,
  });

  const [path, setPath] = useState<Point[] | null>(null);
  const [step, setStep] = useState(0);
  const [searched, setSearched] = useState(false);
  const timerRef = useRef<number | null>(null);

  function stopAnimation() {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
    };
  }, []);

  function regenerate(n: number, m: number, d: number) {
    stopAnimation();
    setMaze(buildMaze(n, m, d, randomSeed()));
    setStart({ i: 1, j: 1 });
    setFinish({ i: n, j: m });
    setPath(null);
    setStep(0);
    setSearched(false);
  }

  function handleCellClick(point: Point) {
    stopAnimation();
    if (mode === "start") setStart(point);
    else setFinish(point);
    setPath(null);
    setStep(0);
    setSearched(false);
  }

  function handleSearch() {
    stopAnimation();
    const result = findShortestPath(maze, start, finish);
    setSearched(true);
    setPath(result);

    if (!result) {
      setStep(0);
      return;
    }

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce || result.length <= 1) {
      setStep(result.length);
      return;
    }

    setStep(1);
    let current = 1;
    timerRef.current = window.setInterval(() => {
      current += 1;
      setStep(current);
      if (current >= result.length) stopAnimation();
    }, 70);
  }

  const length = path ? path.length - 1 : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="space-y-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Лабиринт
          </h2>

          <div className="mt-4 space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="rows">Строки</Label>
                <span className="text-sm tabular-nums text-slate-500">
                  {rows}
                </span>
              </div>
              <Slider
                id="rows"
                min={MIN_ROWS}
                max={MAX_ROWS}
                step={1}
                value={[rows]}
                onValueChange={([v]) => setRows(v)}
                onValueCommit={([v]) => regenerate(v, cols, density)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="cols">Столбцы</Label>
                <span className="text-sm tabular-nums text-slate-500">
                  {cols}
                </span>
              </div>
              <Slider
                id="cols"
                min={MIN_COLS}
                max={MAX_COLS}
                step={1}
                value={[cols]}
                onValueChange={([v]) => setCols(v)}
                onValueCommit={([v]) => regenerate(rows, v, density)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="density">Плотность стен</Label>
                <span className="text-sm tabular-nums text-slate-500">
                  {density}%
                </span>
              </div>
              <Slider
                id="density"
                min={0}
                max={MAX_DENSITY}
                step={1}
                value={[density]}
                onValueChange={([v]) => setDensity(v)}
                onValueCommit={([v]) => regenerate(rows, cols, v)}
              />
            </div>

            <Button
              className="w-full"
              onClick={() => regenerate(rows, cols, density)}
            >
              Сгенерировать лабиринт
            </Button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Пункты
          </h2>

          <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setMode("start")}
              aria-pressed={mode === "start"}
              className={
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors " +
                (mode === "start"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900")
              }
            >
              Старт
            </button>
            <button
              type="button"
              onClick={() => setMode("finish")}
              aria-pressed={mode === "finish"}
              className={
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors " +
                (mode === "finish"
                  ? "bg-white text-rose-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900")
              }
            >
              Финиш
            </button>
          </div>

          <p className="mt-3 text-sm text-slate-500">
            Выберите пункт и щёлкните по клетке на поле: так задаются старт и
            финиш.
          </p>

          <Button
            variant="secondary"
            className="mt-4 w-full"
            onClick={handleSearch}
          >
            Найти кратчайший путь
          </Button>
        </section>

        <section
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          aria-live="polite"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Результат
          </h2>

          {!searched && (
            <p className="mt-3 text-sm text-slate-500">
              Нажмите «Найти кратчайший путь», чтобы проложить маршрут по
              лабиринту.
            </p>
          )}

          {searched && path && (
            <div className="mt-3 space-y-1">
              <p className="text-sm text-slate-600">Кратчайший путь найден</p>
              <p className="text-2xl font-bold tabular-nums text-indigo-600">
                Длина: {length}
              </p>
              <p className="text-xs text-slate-400">
                Длина — число шагов между стартом и финишем.
              </p>
            </div>
          )}

          {searched && !path && (
            <div className="mt-3 space-y-1">
              <p className="text-sm font-medium text-rose-600">
                Путь не найден
              </p>
              <p className="text-sm text-slate-500">
                Старт и финиш разделены стенками. Попробуйте сгенерировать
                лабиринт с меньшей плотностью стен.
              </p>
            </div>
          )}
        </section>
      </aside>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <MazeCanvas
          maze={maze}
          start={start}
          finish={finish}
          path={path}
          step={step}
          onCellClick={handleCellClick}
        />

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500" />
            старт
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-500" />
            финиш
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-indigo-100 ring-1 ring-inset ring-indigo-500" />
            путь
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-0.5 w-4 bg-slate-800" />
            стенка
          </span>
        </div>
      </section>
    </div>
  );
}
