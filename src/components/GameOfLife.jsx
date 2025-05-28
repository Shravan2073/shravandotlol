import React, { useState, useEffect, useCallback, useRef } from 'react';

const GameOfLife = () => {
  const [gridSize] = useState({ width: 60, height: 40 });
  const [grid, setGrid] = useState(() => createInitialGrid(gridSize));
  const [isRunning, setIsRunning] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [speed, setSpeed] = useState(100);
  const intervalRef = useRef(null);

  // Create initial grid with patterns
  const createGridWithPatterns = useCallback(() => {
    return createInitialGrid(gridSize);
  }, [gridSize]);

  // Compute next generation
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

        // Conway's Game of Life Rules
        if (cell) {
          return liveNeighbors === 2 || liveNeighbors === 3;
        } else {
          return liveNeighbors === 3;
        }
      })
    );
  }, [gridSize]);

  // Handle start/stop simulation with effect
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setGrid(prevGrid => {
          const nextGrid = computeNextGeneration(prevGrid);
          setGeneration(prev => prev + 1);
          return nextGrid;
        });
      }, speed);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, speed, computeNextGeneration]);

  // Toggle simulation running
  const toggleSimulation = () => {
    setIsRunning(prev => !prev);
  };

  // Reset simulation
  const resetSimulation = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    setGeneration(0);
    setGrid(createGridWithPatterns());
  };

  // Randomly mutate grid
  const mutateGrid = () => {
    setGrid(prevGrid =>
      prevGrid.map(row =>
        row.map(cell => (Math.random() < 0.1 ? !cell : cell))
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
        Speed: {speed} ms | Active Cells: {grid.flat().filter(cell => cell).length}
      </div>
    </div>
  );
};

// Helper function to generate initial grid
function createInitialGrid(gridSize) {
  const rows = Array.from({ length: gridSize.height }, () =>
    Array(gridSize.width).fill(false)
  );

  // Define initial patterns
  const patterns = [
    // Block pattern
    [[1, 25], [2, 25], [1, 26], [2, 26]],
    // Glider pattern
    [[10, 10], [11, 11], [12, 11], [12, 10], [12, 9]]
  ];

  // Add random cells
  for (let i = 0; i < 100; i++) {
    const x = Math.floor(Math.random() * gridSize.width);
    const y = Math.floor(Math.random() * gridSize.height);
    patterns.push([x, y]);
  }

  // Apply all patterns to the grid
  patterns.forEach(pattern => {
    if (Array.isArray(pattern[0])) {
      // Handle multi-cell patterns
      pattern.forEach(([x, y]) => {
        if (x >= 0 && x < gridSize.width && y >= 0 && y < gridSize.height) {
          rows[y][x] = true;
        }
      });
    } else {
      // Handle single-cell patterns
      const [x, y] = pattern;
      if (x >= 0 && x < gridSize.width && y >= 0 && y < gridSize.height) {
        rows[y][x] = true;
      }
    }
  });

  return rows;
}

export default GameOfLife;