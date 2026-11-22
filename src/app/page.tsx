import { MazeStudio } from "@/components/maze/maze-studio";

export default function IndexPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Введение в алгоритмы и структуры данных
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Лабиринт со стенками
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Сгенерируйте лабиринт, отметьте старт и финиш и найдите кратчайший
            путь. Поиск выполняется обходом в ширину и показывается по шагам.
          </p>
        </header>

        <MazeStudio />
      </div>
    </div>
  );
}
