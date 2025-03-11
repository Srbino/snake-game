"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GiSnake } from "react-icons/gi";
import { FaAppleAlt } from "react-icons/fa";
import { motion, AnimatePresence } from 'framer-motion';

// Typy pro hru
interface Position {
  x: number;
  y: number;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

interface GameState {
  snake: Position[];
  food: Position;
  direction: Direction;
  nextDirection: Direction;
  score: number;
  isGameOver: boolean;
  isPaused: boolean;
  speed: number;
}

const GRID_SIZE = 20;
const CELL_SIZE = 25;
const INITIAL_SPEED = 150;
const MAX_SPEED = 70;
const SPEED_INCREMENT = 5;

const getRandomPosition = (): Position => {
  return {
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE)
  };
};

const getInitialState = (): GameState => {
  // Vytvořit hada ve středu herní plochy
  const snake = [{ x: 10, y: 10 }];
  let food = getRandomPosition();
  
  // Ujištění, že jídlo není na hadovi
  while (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
    food = getRandomPosition();
  }

  return {
    snake,
    food,
    direction: 'RIGHT',
    nextDirection: 'RIGHT',
    score: 0,
    isGameOver: false,
    isPaused: false,
    speed: INITIAL_SPEED
  };
};

const SnakeGame: React.FC = () => {
  // Použití useRef pro počáteční stav, aby se nevytvářel při každém renderování
  const initialStateRef = useRef<GameState>();
  if (!initialStateRef.current) {
    initialStateRef.current = getInitialState();
  }
  
  const [gameState, setGameState] = useState<GameState>(initialStateRef.current);
  const [showControls, setShowControls] = useState<boolean>(false);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const moveSnake = useCallback(() => {
    if (gameState.isGameOver || gameState.isPaused) return;

    setGameState(prevState => {
      const { snake, food, nextDirection, score, speed } = prevState;
      const head = { ...snake[0] };

      // Aktualizace směru
      const direction = nextDirection;

      // Pohyb hlavy
      switch (direction) {
        case 'UP':
          head.y = (head.y - 1 + GRID_SIZE) % GRID_SIZE;
          break;
        case 'DOWN':
          head.y = (head.y + 1) % GRID_SIZE;
          break;
        case 'LEFT':
          head.x = (head.x - 1 + GRID_SIZE) % GRID_SIZE;
          break;
        case 'RIGHT':
          head.x = (head.x + 1) % GRID_SIZE;
          break;
      }

      // Kontrola kolize s tělem hada
      if (snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)) {
        return { ...prevState, isGameOver: true };
      }

      // Vytvoření nového těla hada
      const newSnake = [head, ...snake];
      
      // Kontrola kolize s jídlem - přesnější detekce kolize
      let newFood = food;
      let newScore = score;
      let newSpeed = speed;
      
      // Přesná kontrola kolize hlavy s jídlem
      if (head.x === food.x && head.y === food.y) {
        // Had snědl jídlo - vytvořím nové jídlo a zvýším skóre
        newFood = getRandomPosition();
        
        // Ujistíme se, že nové jídlo není na hadovi
        while (newSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
          newFood = getRandomPosition();
        }
        
        newScore += 10;
        
        // Zvýšení rychlosti s každým pátým bodem
        if (newScore % 50 === 0 && speed > MAX_SPEED) {
          newSpeed = Math.max(speed - SPEED_INCREMENT, MAX_SPEED);
        }
      } else {
        // Had nesnědl jídlo, odstraníme poslední segment
        newSnake.pop();
      }

      return {
        ...prevState,
        snake: newSnake,
        food: newFood,
        direction,
        score: newScore,
        speed: newSpeed
      };
    });
  }, [gameState]);

  // Nastavení herní smyčky
  useEffect(() => {
    if (gameLoopRef.current) {
      clearTimeout(gameLoopRef.current);
    }
    
    if (!gameState.isGameOver && !gameState.isPaused) {
      gameLoopRef.current = setTimeout(moveSnake, gameState.speed);
    }
    
    return () => {
      if (gameLoopRef.current) {
        clearTimeout(gameLoopRef.current);
      }
    };
  }, [gameState, moveSnake]);

  // Ovládání pomocí klávesnice
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState.isGameOver) return;

      switch (e.key) {
        case ' ':
          // Mezerník - pauza
          setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
          break;
        case 'ArrowUp':
          if (gameState.direction !== 'DOWN') {
            setGameState(prev => ({ ...prev, nextDirection: 'UP' }));
          }
          break;
        case 'ArrowDown':
          if (gameState.direction !== 'UP') {
            setGameState(prev => ({ ...prev, nextDirection: 'DOWN' }));
          }
          break;
        case 'ArrowLeft':
          if (gameState.direction !== 'RIGHT') {
            setGameState(prev => ({ ...prev, nextDirection: 'LEFT' }));
          }
          break;
        case 'ArrowRight':
          if (gameState.direction !== 'LEFT') {
            setGameState(prev => ({ ...prev, nextDirection: 'RIGHT' }));
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [gameState]);

  // Restart hry
  const restartGame = () => {
    const newInitialState = getInitialState();
    initialStateRef.current = newInitialState;
    setGameState(newInitialState);
  };

  const togglePause = () => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const handleDirectionClick = (direction: Direction) => {
    if (gameState.isGameOver) return;

    const { direction: currentDirection } = gameState;
    
    if (
      (direction === 'UP' && currentDirection !== 'DOWN') ||
      (direction === 'DOWN' && currentDirection !== 'UP') ||
      (direction === 'LEFT' && currentDirection !== 'RIGHT') ||
      (direction === 'RIGHT' && currentDirection !== 'LEFT')
    ) {
      setGameState(prev => ({ ...prev, nextDirection: direction }));
    }
  };

  // Generování barev pro segmenty hada
  const getSegmentColor = (index: number) => {
    const hue = (120 + index * 5) % 360;
    return `hsl(${hue}, 80%, 45%)`;
  };

  // Vykreslení hry
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-900 to-purple-900 rounded-xl shadow-2xl max-w-3xl mx-auto">
      <div className="mb-4 w-full flex justify-between items-center">
        <div className="flex items-center">
          <GiSnake className="text-green-400 mr-2 text-2xl" />
          <h1 className="text-2xl font-bold text-white">Snake Game</h1>
        </div>
        <div className="text-xl font-bold text-white">
          Skóre: {gameState.score}
        </div>
      </div>

      <div 
        className="relative bg-black border-4 border-indigo-600 rounded-lg shadow-[0_0_15px_rgba(79,70,229,0.6)]"
        style={{ 
          width: GRID_SIZE * CELL_SIZE, 
          height: GRID_SIZE * CELL_SIZE,
          backgroundImage: 'radial-gradient(circle, rgba(66, 65, 77, 0.3) 1px, transparent 1px)', 
          backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`
        }}
      >
        {/* Jídlo */}
        <div
          className="absolute flex items-center justify-center"
          style={{
            width: CELL_SIZE,
            height: CELL_SIZE,
            left: gameState.food.x * CELL_SIZE,
            top: gameState.food.y * CELL_SIZE,
            zIndex: 10
          }}
        >
          <FaAppleAlt 
            className="text-red-500" 
            style={{ 
              fontSize: CELL_SIZE * 0.8,
              filter: 'drop-shadow(0 0 5px rgba(255, 0, 0, 0.7))'
            }} 
          />
        </div>

        {/* Had */}
        {gameState.snake.map((segment, index) => (
          <motion.div
            key={`${index}-${segment.x}-${segment.y}`}
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="absolute rounded-lg"
            style={{
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
              left: segment.x * CELL_SIZE + 1,
              top: segment.y * CELL_SIZE + 1,
              backgroundColor: index === 0 
                ? 'hsl(120, 100%, 50%)' 
                : getSegmentColor(index),
              boxShadow: index === 0 
                ? '0 0 10px rgba(0, 255, 0, 0.7)' 
                : `0 0 5px ${getSegmentColor(index)}`,
              zIndex: gameState.snake.length - index
            }}
          />
        ))}

        {/* Překrytí při hře */}
        <AnimatePresence>
          {(gameState.isGameOver || gameState.isPaused) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 z-20"
            >
              {gameState.isGameOver ? (
                <>
                  <h2 className="text-3xl font-bold text-red-500 mb-4">Konec hry!</h2>
                  <p className="text-xl text-white mb-6">Konečné skóre: {gameState.score}</p>
                  <button
                    onClick={restartGame}
                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-full text-lg font-semibold hover:from-green-600 hover:to-green-800 transition-all duration-300 shadow-lg"
                  >
                    Hrát znovu
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-bold text-yellow-400 mb-4">Pauza</h2>
                  <button
                    onClick={togglePause}
                    className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-700 text-white rounded-full text-lg font-semibold hover:from-yellow-600 hover:to-yellow-800 transition-all duration-300 shadow-lg"
                  >
                    Pokračovat
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-6 w-full">
        <div className="flex justify-center items-center gap-2">
          <button 
            onClick={togglePause}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg shadow-md hover:bg-yellow-600 transition-colors"
          >
            {gameState.isPaused ? 'Pokračovat' : 'Pauza'}
          </button>
          <button 
            onClick={restartGame}
            className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition-colors"
          >
            Restart
          </button>
          <button 
            onClick={() => setShowControls(!showControls)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors"
          >
            {showControls ? 'Skrýt ovládání' : 'Zobrazit ovládání'}
          </button>
        </div>

        {/* Mobilní ovládání */}
        <AnimatePresence>
          {showControls && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 overflow-hidden"
            >
              <div className="grid grid-cols-3 gap-2 w-44 mx-auto">
                <div></div>
                <button
                  onClick={() => handleDirectionClick('UP')}
                  className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex justify-center"
                >
                  ↑
                </button>
                <div></div>
                <button
                  onClick={() => handleDirectionClick('LEFT')}
                  className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex justify-center"
                >
                  ←
                </button>
                <div></div>
                <button
                  onClick={() => handleDirectionClick('RIGHT')}
                  className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex justify-center"
                >
                  →
                </button>
                <div></div>
                <button
                  onClick={() => handleDirectionClick('DOWN')}
                  className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex justify-center"
                >
                  ↓
                </button>
                <div></div>
              </div>

              <div className="mt-4 text-center text-white text-sm">
                <p>Klávesové zkratky:</p>
                <p>Šipky - pohyb hada</p>
                <p>Mezerník - pauza</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SnakeGame; 