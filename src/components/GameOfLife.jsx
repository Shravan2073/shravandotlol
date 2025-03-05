import React, { useState, useEffect, useCallback, useRef } from 'react';

const GameOfLife = () => {
  const [gridSize] = useState({ width: 60, height: 40 });
  const [grid, setGrid] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [speed, setSpeed] = useState(100);
  const runningRef = useRef(isRunning);
  const generationRef = useRef(generation);

  // Create more dynamic initial grid
  const createInitialGrid = useCallback(() => {
    const rows = Array(gridSize.height).fill().map(() => 
      Array(gridSize.width).fill(false)
    );

    // Multiple interesting patterns
    const patterns = [
      // Gosper's Glider Gun
      [[1, 25], [2, 25], [1, 26], [2, 26]],
      
      // Additional interesting patterns
      [[10, 10], [11, 11], [12, 11], [12, 10], [12, 9]],
      
      // Random noise
      ...Array(100).fill().map(() => [
        Math.floor(Math.random() * gridSize.width), 
        Math.floor(Math.random() * gridSize.height)
      ])
    ];

    // Mark cells in patterns
    patterns.forEach(pattern => {
      pattern.forEach(([x, y]) => {
        if (x >= 0 && x < gridSize.width && y >= 0 && y < gridSize.height) {
          rows[y][x] = true;
        }
      });
    });

    return rows;
  }, [gridSize]);

  // Initialize grid
  useEffect(() => {
    setGrid(createInitialGrid());
  }, [createInitialGrid]);

  // More complex next generation computation
  const computeNextGeneration = useCallback((grid) => {
    return grid.map((row, y) => 
      row.map((cell, x) => {
        let liveNeighbors = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const newY = y + dy;
            const newX = x + dx;
            if (
              newY >= 0 && 
              newY < gridSize.height && 
              newX >= 0 && 
              newX < gridSize.width
            ) {
              liveNeighbors += grid[newY][newX] ? 1 : 0;
            }
          }
        }

        // More dynamic survival rules
        if (cell) {
          return (
            liveNeighbors === 2 || 
            liveNeighbors === 3 || 
            (Math.random() < 0.05 && liveNeighbors > 1)
          );
        } else {
          return (
            liveNeighbors === 3 || 
            (Math.random() < 0.01 && liveNeighbors > 1)
          );
        }
      })
    );
  }, [gridSize]);

  // Simulation loop with more dynamics
  const runSimulation = useCallback(() => {
    if (!runningRef.current) return;

    setGrid(prevGrid => {
      const nextGrid = computeNextGeneration(prevGrid);
      
      // Update generation
      setGeneration(prev => prev + 1);
      generationRef.current += 1;

      // Dynamically adjust speed based on grid activity
      const aliveCells = nextGrid.flat().filter(cell => cell).length;
      const newSpeed = Math.max(50, 200 - (aliveCells / (gridSize.width * gridSize.height) * 150));
      setSpeed(newSpeed);

      return nextGrid;
    });

    setTimeout(runSimulation, speed);
  }, [computeNextGeneration, speed, gridSize]);

  // Toggle simulation
  const toggleSimulation = () => {
    const nextRunningState = !isRunning;
    setIsRunning(nextRunningState);
    runningRef.current = nextRunningState;
    
    if (nextRunningState) {
      runSimulation();
    }
  };

  // Reset with random variation
  const resetSimulation = () => {
    setIsRunning(false);
    runningRef.current = false;
    setGeneration(0);
    setGrid(createInitialGrid());
  };

  // Mutation function to add randomness
  const mutateGrid = () => {
    setGrid(prevGrid => 
      prevGrid.map(row => 
        row.map(cell => 
          Math.random() < 0.1 ? !cell : cell
        )
      )
    );
  };

  return (
    <div className="p-4 bg-gray-100 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">
        Conway's Game of Life
        <span className="ml-4 text-sm text-gray-600">
          Generation: {generation}
        </span>
      </h1>
      <div 
        className="grid gap-0 border border-gray-300 shadow-lg"
        style={{
          gridTemplateColumns: `repeat(${gridSize.width}, 10px)`,
          gridTemplateRows: `repeat(${gridSize.height}, 10px)`
        }}
      >
        {grid.map((row, y) => 
          row.map((cell, x) => (
            <div 
              key={`${x}-${y}`}
              className={`w-[10px] h-[10px] transition-colors duration-200 ${
                cell 
                  ? 'bg-blue-500 hover:bg-blue-700' 
                  : 'bg-white hover:bg-gray-200'
              } border border-gray-200`}
            />
          ))
        )}
      </div>
      <div className="mt-4 flex space-x-4">
        <button 
          onClick={toggleSimulation}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button 
          onClick={resetSimulation}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Reset
        </button>
        <button 
          onClick={mutateGrid}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
        >
          Mutate
        </button>
      </div>
      <div className="mt-2 text-sm text-gray-600">
        Speed: {Math.round(200 - speed)} | 
        Active Cells: {grid.flat().filter(cell => cell).length}
      </div>
    </div>
  );
};

export default GameOfLife;