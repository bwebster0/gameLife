var rows = 50;
var cols = 50

var playing = false;

var grid = new Array(rows);
var nextgrid = new Array(rows);

var timer;
var reproductionTime = 100;

function initializeGrids() {
    for (var i = 0; i < rows; i++) {
        grid[i] = new Array(cols);
        nextgrid[i] = new Array(cols);
    }
}

function resetGrids() {
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            grid[i][j] = 0;
            nextgrid[i][j] = 0;
        }
    }
}

function copyAndReset() {
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            grid[i][j] = nextgrid[i][j];
            nextgrid[i][j] = 0;
        }
    }
}

// initialize
function initialize() {
    createTable();
    initializeGrids();
    resetGrids();
    setupControlButtons();
}

// lay out the board
function createTable() {
    var gridContainer = document.getElementById("gridContainer");
    if (!gridContainer) {
        // throw error
        console.error("Problem: no div for the grid table!");
    }
    var table = document.createElement("table");
    for (var i = 0; i < rows; i++) {
        var tr = document.createElement("tr");
        for (j = 0; j < cols; j++) {
            var cell = document.createElement("td");
            cell.setAttribute("id", i + "_" + j);
            cell.setAttribute("class", "dead");
            cell.onclick = cellClickHandler;
            tr.appendChild(cell);
        }
        table.appendChild(tr);
    }
    gridContainer.appendChild(table);
}

function cellClickHandler() {
    // this is cell id
    var rowcol = this.id.split("_");
    var row = rowcol[0];
    var col = rowcol[1];
    var classes = this.getAttribute("class");
    if (classes.indexOf("live") > -1) {
        this.setAttribute("class", "dead");
        grid[row][col] = 0;
    }
    else {
        this.setAttribute("class", "live");
        grid[row][col] = 1;
    }
}

function updateView() {
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            var cell = document.getElementById(i + "_" + j);
            if (grid[i][j] == 0) {
                cell.setAttribute("class", "dead");
            } else {
                cell.setAttribute("class", "live");
            }
        }
    }
}

function setupControlButtons() {
    // start
    var startButton = document.getElementById("start");
    startButton.onclick = startButtonHandler;
    // clear
    var clearButton = document.getElementById("clear");
    clearButton.onclick = clearButtonHandler;
    var randomButton = document.getElementById("random");
    randomButton.onclick = randomButtonHandler;
}

function startButtonHandler() {
    if (playing) {
        console.log("Pause the game");
        playing = false;
        this.innerHTML = "continue";
        clearTimeout(timer);
    } else {
        console.log("continue the game");
        playing = true;
        this.innerHTML = "pause";
        play();
    }
}
function clearButtonHandler() {
    console.log("Clear the game and stop play");
    playing = false;
    var startButton = document.getElementById("start");
    startButton.innerHTML = "start";
    clearTimeout(timer);
    if (0) {  // one way to updateview to a cleared state
        var cellList = document.getElementsByClassName("live");  // returns nodeList: a node list is dynamic
        for (var i = 0; i < cellList.length; i++) {
            cellList[i].setAttribute("class", "dead");  // when we change state it modifies the list - so this fails
        }
    } else {
        // need to copy nodeList to array before we change values
        var cellList = document.getElementsByClassName("live"); 
        var cells = [];
        for (var i = 0; i < cellList.length; i++) {
            cells.push(cellList[i]);
        }
        for (var i = 0; i < cells.length; i++) {
            cells[i].setAttribute("class", "dead");
        }
    }
    resetGrids();
    if (0) {
        updateView();
    }
}
function randomButtonHandler() {
    if (playing) return;
    resetGrids();
    updateView();
    console.log("Generate random grid");
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            var isLive = Math.round(Math.random());
            if (isLive == 1) {
                //var cell = document.getElementById(i + "_" + j);
                //cell.setAttribute("class", "live");
                grid[i][j] = 1;
            }
        }
    }
    updateView();
}

function play() {
    //console.log("Play");
    computeNextGen();

    if (playing) {
        timer = setTimeout(play, reproductionTime);
    }
}

function computeNextGen() {
    // iterate thru grid and call apply rules for each cell, given row,col
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            applyRules(i,j);
        }
    }
    copyAndReset();  // update to current grid
    updateView();    // update the grid view
}

function applyRules(row, col) {
    // calls count neighbors, row, col
    var numNeighbors = countNeighbors(row, col);
    if (grid[row][col] == 1) {
        if (numNeighbors < 2) {
            nextgrid[row][col] = 0;
        } else if (numNeighbors == 2 || numNeighbors == 3) {
            nextgrid[row][col] = 1;
        } else if (numNeighbors > 3) {
            nextgrid[row][col] = 0;
        }
    } else if (grid[row][col] == 0) {
        if (numNeighbors == 3) {
            nextgrid[row][col] = 1;
        } else {
            nextgrid[row][col] = 0;
        }
    }
}

function countNeighbors(row, col) {
    var count = 0;

    if (row > 0 && row < rows - 1 && col > 0 && col < cols - 1) {
        for (var i = -1; i < 2; i++) {
            for (var j = -1; j < 2; j++) {
                if (i == 0 && j == 0) {
                    //skip
                }  else {
                    if (grid[row + i][col + j] == 1) {
                        count = count + 1;
                     }
                }

            }
        }
    } else if (row == 0 && col == 0) {
        count = count + grid[0][1] + grid[1][1] + grid[1][0];
    } else if (row == rows-1 && col == 0) {
        count = count + grid[row][1] + grid[row - 1][1] + grid[row - 1][0];
    } else if (row == 0 && col == cols-1) {
        count = count + grid[0][col - 1] + grid[1][col - 1] + grid[1][col];
    } else if (row == rows-1 && col == cols-1) {
        count = count + grid[row][col-1] + grid[row-1][col-1] + grid[row-1][col];
    } else if (row == 0) {
        count = count + grid[0][col - 1] + grid[0][col + 1] + grid[1][col - 1] + grid[1][col] + grid[1][col + 1];
    } else if (row == rows-1) {
        count = count + grid[row][col - 1] + grid[row][col + 1] + grid[row-1][col - 1] + grid[row-1][col] + grid[rows - 2][col + 1];
    } else if (col == 0) {
        count = count + grid[row-1][0] + grid[row+1][0] + grid[row-1][1] + grid[row][1] + grid[row+1][1];
    } else if (col == cols - 1) {
        count = count + grid[row - 1][col] + grid[row + 1][col] + grid[row - 1][col - 1] + grid[row][col - 1] + grid[row + 1][col - 1];
    }
    return count;
}

// start everything
window.onload = initialize;
