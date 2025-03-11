import SnakeGame from "@/components/game/SnakeGame";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 bg-gradient-to-b from-gray-900 via-purple-950 to-black">
      <div className="z-10 max-w-5xl w-full flex flex-col items-center justify-center">
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-4 text-center">
          Snake Game
        </h1>
        <p className="text-gray-300 text-center max-w-lg mb-8">
          Klasická hra Snake s moderní grafikou. Použijte šipky pro ovládání hada a sbírejte jablka pro získání bodů!
        </p>
        
        <SnakeGame />

        <footer className="mt-12 text-center text-gray-400 text-sm">
          <p>© 2024 Snake Game | Vytvořeno s Next.js, React a ❤️</p>
        </footer>
      </div>
    </main>
  );
}
