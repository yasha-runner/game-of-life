import React, { useState, useCallback, useRef } from 'react';
import produce from 'immer';

const operations = [
  [0, 1],
  [0, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
  [-1, -1],
  [1, 0],
  [-1, 0]
];

const App: React.FC = () => {
  const [countRows, setCountRows] = useState(25);
  const [countCols, setCountCols] = useState(25);

  const initGrid = (width: number, height: number) => {
    const rows = [];
    for (let i = 0; i < width; i++) {
      rows.push(Array.from(Array(height), () => 0));
    }
    
    return rows;
  }

  const [grid, setGrid] = useState(initGrid(countRows, countCols));

  const [running, setRunning] = useState(false);

  const runningRef = useRef(running);
  runningRef.current = running;

  const runSimulation = useCallback(() => {
    if (!runningRef.current)
      return;

    setGrid(g => {
      return produce(g, gridCopy => {
        for (let x = 0; x < countRows; x++) {
          for (let y = 0; y < countCols; y++) {
            let neighbors = 0; //кол-во соседей
            //проверяем всех соседей
            operations.forEach(([_x, _y]) => {
              //координаты соседа
              let newX = x + _x;
              let newY = y + _y;
              
              //реализация поверхности тора
              if (newX < 0)
                newX = countRows - 1;
              else if (newX > countRows - 1)
                newX = 0;

              if (newY < 0)
                newY = countCols - 1;
              else if (newY > countCols - 1)
                newY = 0;

              neighbors += g[newX][newY]
            });

            if (neighbors < 2 || neighbors > 3) { //если соседей меньше двух или больше трёх, клетка умирает
              gridCopy[x][y] = 0;
            } else if (g[x][y] === 0 && neighbors === 3) {//в пустой (мёртвой) клетке, рядом с которой ровно три живые клетки, зарождается жизнь
              gridCopy[x][y] = 1;
            }
          }
        }
      });
    });
    console.log(1);
    setTimeout(runSimulation, 300)
  }, [countRows, countCols])

  return <>
    <div style={{
        margin: '20px',
        width: '50%'
      }}
    >
      <div className="row">
        <div className="col">
          <input type="number" className="form-control" placeholder="Ширина" value={countRows}
            onChange={(e) => {
              setCountRows(+e.target.value)
              setGrid(initGrid(+e.target.value, countCols));
            }}
          />
        </div>
        <div className="col">
          <input type="number" className="form-control" placeholder="Высота" value={countCols}
            onChange={(e) => {
              setCountCols(+e.target.value)
              setGrid(initGrid(countRows, +e.target.value));
            }}
          />
        </div>
      </div>
    </div>

    <div style={{margin: '20px'}}>
      <button className={running ? 'btn btn-sm btn-danger' : 'btn btn-sm btn-success'} style={{marginRight: '10px'}}
        onClick={() => {
          setRunning(!running);
          if (!running) {
            runningRef.current = true;
            runSimulation();
          }
        }}
      >
        {running ? 'Стоп' : 'Старт'}
      </button>
      <button className='btn btn-sm btn-warning'
        onClick={() => {
          if (running) {
            setRunning(!running);
            runningRef.current = false;
          }

          setGrid(initGrid(countRows, countCols));
        }}
      >
        Очистить
      </button>
    </div>

    <div
      style={{
        margin: '20px',
        display: 'grid',
        gridTemplateColumns: `repeat(${countCols}, 20px)`,
        gridGap: '1px',
        background: '#000000',
        border: 'solid 1px #000000',
        width: `${countCols * 20 + countCols}px`
      }}
    >
      {grid.map((rows, x) =>
        rows.map((col, y) => (
          <div 
            key={`${x}-${y}`}
            onClick={() => {
              const newGrid = produce(grid, gridCopy => {
                gridCopy[x][y] = grid[x][y] ? 0 : 1;
              });

              setGrid(newGrid);
            }}

            style={{
              width: 20,
              height: 20,
              backgroundColor: grid[x][y] ? '#77DD77' : '#404040'
            }}
          />
        ))
      )}
    </div>
  </>
};

export default App;