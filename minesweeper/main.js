/// ///////////////////////////////////////////////////////////////////////////
/// CONFIG
/// ///////////////////////////////////////////////////////////////////////////

const DEFAULT_CELLS_COUNT = 10;
const DEFAULT_CELLS_SIZE_X = 15;
const DEFAULT_CELLS_SIZE_Y = 20;
const CELL_SIZE = 5;

const UNOPENED_CELL_COLOR = 'rgb(192,192,192)';
const UNOPENED_CELL_BORDER_COLOR = 'black';
const OPEND_CELL_COLOR = '#17B169';
const OPEND_CELL_BORDER_COLOR = '#006400';

const CELL_STATE = {
  UNOPENED: 'UNOPENED',
  OPENED: 'OPENED',
  FLAGGED: 'FLAGGED'
};
const FLAGGED_SYMBOL = '🏴';
const BOMB_SYMBOL = '💣';
const CELL_COLORS = {
  1: 'red',
  2: 'orange',
  3: 'yellow',
  4: 'green',
  5: 'blue',
  6: 'indigo',
  7: 'violet',
  8: 'white'
};
const CELL_OFFSETS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1], [0, 1],
  [1, -1], [1, 0], [1, 1]
];

/// ///////////////////////////////////////////////////////////////////////////
/// GAME
/// ///////////////////////////////////////////////////////////////////////////

drawEmptyBoard();
drawCells();

let cells = createCells();
const minesPotions = generateMinesPositions(
  DEFAULT_CELLS_SIZE_X * DEFAULT_CELLS_SIZE_Y,
  DEFAULT_CELLS_COUNT
);
cells = populateCellsWithMines(cells, minesPotions);
console.log(cells);

startListeningLeftClick(cells);
startListeningRightClick(cells);

/// ///////////////////////////////////////////////////////////////////////////
/// FUNCTIONS
/// ///////////////////////////////////////////////////////////////////////////
function drawEmptyBoard() {
  const bodyHtmlEl = document.createElement('div');

  const boardWidth = DEFAULT_CELLS_SIZE_X * CELL_SIZE;
  const boardHeight = DEFAULT_CELLS_SIZE_Y * CELL_SIZE;
  bodyHtmlEl.innerHTML = `
    <div>
      <canvas
        id="canvas"
        width="${boardWidth}"
        height="${boardHeight}">
      </canvas>
    </div>
  `;
  document.body.appendChild(bodyHtmlEl);
}

function getCanvas() {
  const canvasEl = document.getElementById('canvas');
  const canvasCtx = canvasEl.getContext('2d');
  return {
    canvasEl,
    canvasCtx
  };
}

function drawDefaultCell(x, y) {
  const { canvasCtx } = getCanvas();

  canvasCtx.fillStyle = UNOPENED_CELL_COLOR;
  canvasCtx.fillRect(x, y, CELL_SIZE, CELL_SIZE);

  canvasCtx.strokeStyle = UNOPENED_CELL_BORDER_COLOR;
  canvasCtx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
}

function drawCells() {
  /**
   * Draws all cells within the canvas.
   */
  for (let x = 0; x < DEFAULT_CELLS_SIZE_X; x++) {
    for (let y = 0; y < DEFAULT_CELLS_SIZE_Y; y++) {
      drawDefaultCell(x * CELL_SIZE, y * CELL_SIZE);
    }
  }
}

function generateMinesPositions(cellsCount, minesCount) {
  /**
   * Generate a list of random mines potition.
   *
   * return Ex: [26, 44, 50, 23, 52, 35, 96, 83, 7, 5]
   */

  let minesPotions = [];
  while (minesPotions.length !== minesCount) {
    minesPotions = [...Array(cellsCount).keys()]
      .sort(() => Math.random() - 0.5)
      .slice(0, minesCount);
  }
  return minesPotions;
}

function createCells(rowCount = DEFAULT_CELLS_SIZE_Y, columnCount = DEFAULT_CELLS_SIZE_X, defaultState = CELL_STATE.UNOPENED) {
  /**
   * Example for 2x2:
   * [
   *   [
   *     { isMine: false, state: '<STATE>', around: null },
   *     { isMine: false, state: '<STATE>', around: null },
   *   ],
   *   [
   *     { isMine: false, state: '<STATE>', around: null },
   *     { isMine: false, state: '<STATE>', around: null },
   *   ],
   * ]
   */
  const cells = [];
  for (let m = 0; m < rowCount; m++) {
    cells.push([]);
    for (let n = 0; n < columnCount; n++) {
      cells[m][n] = {
        isMine: false,
        state: defaultState,
        around: null,
        m,
        n
      };
    }
  }
  return cells;
}

function populateCellsWithMines(cells, minesPotions) {
  /**
   * Get cells and change the 'isMine' attribute to true if it's the mine.
   * return updated cells.
   */
  for (const minePosition of minesPotions) {
    const m = Math.floor(minePosition / DEFAULT_CELLS_SIZE_X);
    const n = minePosition % DEFAULT_CELLS_SIZE_X;
    cells[m][n].isMine = true;
  }

  for (let m = 0; m < DEFAULT_CELLS_SIZE_Y; m++) {
    for (let n = 0; n < DEFAULT_CELLS_SIZE_X; n++) {
      const cell = cells[m][n];
      if (cell.isMine) continue;

      let counter = 0;
      for (const [mOffset, nOffset] of CELL_OFFSETS) {
        const newM = m + mOffset;
        const newN = n + nOffset;
        if (
          (newM < 0) || (newM > DEFAULT_CELLS_SIZE_Y - 1) ||
          (newN < 0) || (newN > DEFAULT_CELLS_SIZE_X - 1)
        ) continue;

        if (cells[newM][newN].isMine) {
          counter++;
        }
      }
      cell.around = counter;
    }
  }

  return cells;
}

function drawMine(x, y) {
  const { canvasCtx } = getCanvas();

  canvasCtx.fillStyle = 'black';
  canvasCtx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
}

function markCellAsMine(x, y) {
  const { canvasCtx } = getCanvas();

  const magicRatio = 0.75;
  canvasCtx.font = `${CELL_SIZE * magicRatio}px Arial`;
  canvasCtx.fillText(FLAGGED_SYMBOL, x, y + CELL_SIZE * magicRatio);
}

function getCell(event, cells) {
  /*
  * Gets canvas click event.
  * Return cell position in the cells list. Example:
  * {
  *  cell: <object>,
  *  m: 4,
  *  n: 2,
  * }
  */
  const { canvasEl } = getCanvas();
  const elemLeft = canvasEl.offsetLeft;
  const elemTop = canvasEl.offsetTop;
  const xVal = event.pageX - elemLeft;
  const yVal = event.pageY - elemTop;

  const m = Math.floor(yVal / CELL_SIZE);
  const n = Math.floor(xVal / CELL_SIZE);
  const cell = cells[m][n];
  return { cell, m, n };
}

function startListeningLeftClick(cells) {
  const { canvasEl } = getCanvas();
  canvasEl.addEventListener('click', function (event) {
    const { cell, m, n } = getCell(event, cells);

    if (cell.isMine) {
      drawMine(n * CELL_SIZE, m * CELL_SIZE);
    } else if (cell.around === 0) {
      cell.state = CELL_STATE.OPENED;
      drawOpenedCell(n, m);

      console.log(cell);
      checkCellsAraound(cell);
    } else if (cell.around > 0) {
      cell.state = CELL_STATE.OPENED;
      drawOpenedCell(n, m, cell.around);
      console.log(cell);
    }
  });
}

function startListeningRightClick(cells) {
  const { canvasEl } = getCanvas();
  canvasEl.addEventListener('contextmenu', function (event) {
    event.preventDefault();
    const { cell, m, n } = getCell(event, cells);

    if (cell.state === CELL_STATE.UNOPENED) {
      markCellAsMine(n * CELL_SIZE, m * CELL_SIZE);
      cell.state = CELL_STATE.FLAGGED;
    } else if (cell.state === CELL_STATE.FLAGGED) {
      drawDefaultCell(n * CELL_SIZE, m * CELL_SIZE);
      cell.state = CELL_STATE.UNOPENED;
    }
  });
}

function drawOpenedCell(x, y, number) {
  const { canvasCtx } = getCanvas();
  canvasCtx.fillStyle = OPEND_CELL_COLOR;
  canvasCtx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

  canvasCtx.strokeStyle = OPEND_CELL_BORDER_COLOR;
  canvasCtx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

  if (number) {
    canvasCtx.fillStyle = CELL_COLORS[number];
    canvasCtx.font = `${CELL_SIZE}px Arial`;
    canvasCtx.fillText(number, x * CELL_SIZE + CELL_SIZE / 5, (y + 1) * CELL_SIZE - CELL_SIZE / 5);
  }
}

function checkCellsAraound(cell) {
  for (const [mOffset, nOffset] of CELL_OFFSETS) {
    const newM = cell.m + mOffset;
    const newN = cell.n + nOffset;
    if (
      (newM < 0) || (newM > DEFAULT_CELLS_SIZE_Y - 1) ||
      (newN < 0) || (newN > DEFAULT_CELLS_SIZE_X - 1)
    ) continue;

    const offsetCell = cells[newM][newN];
    if (offsetCell.state !== CELL_STATE.UNOPENED) {
      continue;
    }

    if (offsetCell.around === 0) {
      offsetCell.state = CELL_STATE.OPENED;
      drawOpenedCell(newN, newM);
      checkCellsAraound(offsetCell);
    } else if (offsetCell.around > 0) {
      offsetCell.state = CELL_STATE.OPENED;
      drawOpenedCell(newN, newM, offsetCell.around);
    }
  }
}
