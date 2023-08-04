// 全局变量，用来记录当前的难度等级
var currentLevel = {rows: 9, cols: 9};  // 默认是初级
var gameEnded = false; // 标记游戏是否已经结束
let hasStarted = false; // 添加一个标识符，来标记游戏是否已经开始
/**
 * 创建棋盘
 * @param {*} rows 
 * @param {*} cols 
 */
function createBoard(rows, cols){
    var gameBoard = document.getElementById('gameBoard');
    
    gameBoard.innerHTML = '';
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            let cell = document.createElement('div');
            cell.className = 'cell';
            // 给每个单元格添加左键点击事件
            cell.addEventListener('click', function() {
                handleCellClick(cell);
            });
            
            // 给每个单元格添加右键点击事件
            cell.addEventListener('contextmenu', function(event) {
                event.preventDefault();  // 阻止默认的右键点击菜单
                handleRightClick(cell);
            });

            gameBoard.appendChild(cell);
        }
    }
    
    gameBoard.style.gridTemplateRows = `repeat(${rows}, 30px)`;
    gameBoard.style.gridTemplateColumns = `repeat(${cols}, 30px)`;
}
/**
 * 右键点击
 * @param {*} cell 
 */
function handleRightClick(cell) {
    if (!hasStarted) {
        hasStarted = true;
        startTimer();  // 在开始点击第一个格子时开始计时
    }
    if (cell.classList.contains('clicked') || cell.classList.contains('disabled')) {
        // 如果单元格已经被点击，或者已经被禁用，那么不允许插旗
        return;
    }
    if (cell.classList.contains('flagged')) {
        // 如果单元格已经被标记为旗子，那么移除旗子
        cell.classList.remove('flagged');
        cell.textContent = '';  // 清空单元格的内容
        updateMineCounter(1);
    } else {
        // 如果单元格还没有被标记为旗子，那么添加旗子
        cell.classList.add('flagged');
        cell.textContent = '🚩';  // 将单元格的内容设置为旗子图标
        updateMineCounter(-1);
    }
    // 用户操作之后，检查是否胜利
    setTimeout(() => { // 在setTimeout内部进行检查，保证更改已完成
        if (checkWin()) {
            // 延迟弹出胜利提示
            alert('You win!');
            winGame();
        }
    }, 0);
}
/**
 * 初始化雷
 * @param {*} rows 
 * @param {*} cols 
 */
function initializeMines(rows,cols){
    //判断初始化地雷个数
    var mineNumber;
    if(rows === 9){
        mineNumber = 10;
    } else if(rows === 16 && rows === cols){
        mineNumber = 40;
    } else mineNumber = 99;

    var cells = Array.from(document.querySelectorAll('.cell'));
    var cellMatrix = []; // 存放二维数组的变量

    // 把 cells 转换为二维数组
    for(var i = 0; i < rows; i++) {
        cellMatrix.push(cells.slice(i * cols, i * cols + cols));
    }

    var mines = []; // 用于存储已放置雷的位置

    for(var i = 0; i < mineNumber; i++){
        var minePosition;
        do{
            minePosition = {
                row: Math.floor(Math.random() * rows),
                col: Math.floor(Math.random() * cols)
            };
        } while(mines.some(mine => mine.row === minePosition.row && mine.col === minePosition.col));

        cellMatrix[minePosition.row][minePosition.col].dataset.mine = 'true'; // 在选择的位置放置雷
        mines.push(minePosition); // 将雷的位置存储在雷的数组中
    }

    //在选择的位置放置雷，然后为每个单元格设置它周围的雷数
    for(var i = 0; i < cellMatrix.length; i++){
        for(var j = 0; j < cellMatrix[i].length; j++){
            var cell = cellMatrix[i][j];
            if(cell.dataset.mine !== 'true'){
                var count = countMinesAround(cellMatrix, { row: i, col: j });
                cell.dataset.count = count > 0 ? count : '';
            }
        }
    }
    return mineNumber;
}
/**
 *  数字提示
 * @param {*} cellMatrix 
 * @param {*} position 
 * @returns 
 */
function countMinesAround(cellMatrix, position){
    var count = 0;

    // 计算8个相邻位置的坐标
    var neighbors = [
        { row: position.row - 1, col: position.col - 1 },
        { row: position.row - 1, col: position.col },
        { row: position.row - 1, col: position.col + 1 },
        { row: position.row, col: position.col - 1 },
        { row: position.row, col: position.col + 1 },
        { row: position.row + 1, col: position.col - 1 },
        { row: position.row + 1, col: position.col },
        { row: position.row + 1, col: position.col + 1 }
    ];

    // 对每个相邻位置进行检查
    for(var i = 0; i < neighbors.length; i++){
        var neighbor = neighbors[i];

        // 检查位置是否在棋盘范围内
        if(neighbor.row >= 0 && neighbor.row < cellMatrix.length && neighbor.col >= 0 && neighbor.col < cellMatrix[0].length){
            // 检查该位置是否有雷
            if(cellMatrix[neighbor.row][neighbor.col].dataset.mine === 'true'){
                count++;
            }
        }
    }

    // 返回雷的数量
    return count;
}
/**
 * 点击交互
 * @param {*} cell 
 */
function handleCellClick(cell) {
    if (!hasStarted) {
        hasStarted = true;
        startTimer();  // 在开始点击第一个格子时开始计时
    }
    if (cell.classList.contains('flagged') || cell.classList.contains('disabled')) {
        // 如果单元格被标记为旗子，或者已经被禁用，那么不响应左键点击事件
        return;
    }
    if (cell.dataset.mine === 'true') {
        // 如果单元格有雷，游戏结束
        alert('Game Over');
        endGame(); // 调用 endGame 函数来显示所有地雷
    } else {
        // 如果单元格没有雷，显示它周围的雷数
        cell.textContent = cell.dataset.count;
        cell.style.backgroundColor = '#ddd'; // 为已点击的单元格改变背景色
        cell.classList.add('clicked'); // 添加一个新的 class 来标记已经被点击的单元格

        // 如果该单元格周围没有雷，则自动打开其所有邻居
        if (cell.dataset.count === '') {
            var cells = Array.from(document.querySelectorAll('.cell'));
            var cellMatrix = [];
            for(var i = 0; i < currentLevel.rows; i++) {
                cellMatrix.push(cells.slice(i * currentLevel.cols, i * currentLevel.cols + currentLevel.cols));
            }

            var position = getPosition(cell, cellMatrix);
            openNeighbors(cellMatrix, position);
        } else {
            // 如果单元格有数字，并且周围的旗帜数量等于这个数字，
            // 那么检查旗帜是否都放在正确的位置，如果是的话，翻开周围所有未被翻开的单元格
            var cells = Array.from(document.querySelectorAll('.cell'));
            var cellMatrix = [];
            for(var i = 0; i < currentLevel.rows; i++) {
                cellMatrix.push(cells.slice(i * currentLevel.cols, i * currentLevel.cols + currentLevel.cols));
            }

            var position = getPosition(cell, cellMatrix);
            var neighbors = getNeighbors(cellMatrix, position);

            var flaggedNeighbors = neighbors.filter(neighbor => neighbor.classList.contains('flagged'));
            var mineNeighbors = neighbors.filter(neighbor => neighbor.dataset.mine === 'true');

            // 检查标记的所有位置是否都有雷
            var allFlagsCorrect = flaggedNeighbors.every(flaggedNeighbor => flaggedNeighbor.dataset.mine === 'true');

            if (flaggedNeighbors.length === Number(cell.dataset.count) && 
                flaggedNeighbors.length === mineNeighbors.length && 
                allFlagsCorrect) {
                openNeighbors(cellMatrix, position);
            } else if (flaggedNeighbors.length === Number(cell.dataset.count)) {
                // 如果插旗数量正确，但旗子位置错误，游戏结束
                alert('Game Over');
                endGame(); // 调用 endGame 函数来显示所有地雷
            }
        }
    }
    // 用户操作之后，检查是否胜利
    setTimeout(() => {
        if (checkWin()) {
            // 延迟弹出胜利提示
            alert('You win!');
            winGame();
        }
    }, 0);
}
/**
 * 获取单元格的所有邻居
 * @param {*} cellMatrix 
 * @param {*} position 
 * @returns 
 */
function getNeighbors(cellMatrix, position) {
    var neighbors = [
        { row: position.row - 1, col: position.col - 1 },
        { row: position.row - 1, col: position.col },
        { row: position.row - 1, col: position.col + 1 },
        { row: position.row, col: position.col - 1 },
        { row: position.row, col: position.col + 1 },
        { row: position.row + 1, col: position.col - 1 },
        { row: position.row + 1, col: position.col },
        { row: position.row + 1, col: position.col + 1 }
    ];

    var validNeighbors = [];
    neighbors.forEach(neighbor => {
        if (neighbor.row >= 0 && neighbor.row < cellMatrix.length &&
            neighbor.col >= 0 && neighbor.col < cellMatrix[0].length) {
            var cell = cellMatrix[neighbor.row][neighbor.col];
            validNeighbors.push(cell);
        }
    });

    return validNeighbors;
}
/**
 * 获取单元格在二维数组中的位置
 * @param {*} cell 
 * @param {*} cellMatrix 
 * @returns 
 */
function getPosition(cell, cellMatrix) {
    for (var i = 0; i < cellMatrix.length; i++) {
        for (var j = 0; j < cellMatrix[i].length; j++) {
            if (cellMatrix[i][j] === cell) {
                return {row: i, col: j};
            }
        }
    }
}
/**
 * 打开单元格的所有邻居
 * @param {*} cellMatrix 
 * @param {*} position 
 */
function openNeighbors(cellMatrix, position) {
    var neighbors = getNeighbors(cellMatrix, position);

    neighbors.forEach(neighbor => {
        if (!neighbor.classList.contains('clicked') && !neighbor.classList.contains('flagged')) {
            neighbor.textContent = neighbor.dataset.count;
            neighbor.style.backgroundColor = '#ddd';
            neighbor.classList.add('clicked');

            if (neighbor.dataset.count === '') {
                var neighborPosition = getPosition(neighbor, cellMatrix);
                openNeighbors(cellMatrix, neighborPosition);
            }
        }
    });
}
/**
 * 重置游戏
 * @param {*} rows 
 * @param {*} cols 
 */
function resetGame() {
    var rows = currentLevel.rows;
    var cols = currentLevel.cols;

    // 清空所有的单元格
    var gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';

    // 重新创建棋盘和雷区
    createBoard(rows, cols);
    // 重新初始化雷区并获取雷的数量
    var mineNumber = initializeMines(rows, cols);
    // 更新显示的地雷数量
    document.getElementById('mineCounter').textContent = 'Mines Remain: ' + mineNumber;

    // 重置游戏变量
    // ...

    // 如果计时器正在运行，清除计时器
    if (timerId) {
        clearInterval(timerId);
        timerId = null;
    }

    // 重置计时器显示
    document.getElementById('timer').textContent = "Time: 0 seconds";

    // 重置游戏开始状态
    hasStarted = false;
    
}
/**
 * 游戏结束
 */
function endGame() {
    // 获取所有的单元格
    var cells = Array.from(document.querySelectorAll('.cell'));
    // 遍历所有的单元格
    cells.forEach(cell => {
        // 如果单元格有雷，那么显示雷
        if (cell.dataset.mine === 'true') {
            cell.textContent = '💣';
            cell.style.backgroundColor = '#f00';  // 可以设置背景颜色以突出显示
        }
        // 禁止再次点击单元格
        cell.classList.add('disabled');  // 禁用单元格
    });
    // 显示游戏结束的消息
    //alert('Game Over');
    clearInterval(timerId);
    timerId = null; // 重置 timerId
    hasStarted = false; // 游戏结束后，将游戏开始标识符重置为false
}
/**
 * 检查是否胜利
 */
function checkWin() {
    var cells = Array.from(document.querySelectorAll('.cell'));
    
    // 检查是否所有没有地雷的单元格都被打开了
    var allSafeCellsOpened = cells.filter(cell => cell.dataset.mine !== 'true').every(cell => cell.classList.contains('clicked'));

    // 检查是否所有的地雷都被标记了
    var allMinesFlagged = cells.filter(cell => cell.dataset.mine === 'true').every(cell => cell.classList.contains('flagged'));

    var win = allSafeCellsOpened && allMinesFlagged;  // 将 || 修改为 &&

    if (win) {
        setTimeout(function() {
            //alert('You win!');
            winGame();
        }, 0);
    }
    return win;
}
/**
 * 游戏胜利
 */
function winGame() {
    // 获取所有的单元格
    var cells = Array.from(document.querySelectorAll('.cell'));
    // 遍历所有的单元格
    cells.forEach(cell => {
        // 禁止再次点击单元格
        cell.classList.add('disabled');  // 禁用单元格
    });
    // 可以在此处添加任何你想要的胜利动画或消息
    //alert('You win!');
    clearInterval(timerId);
    timerId = null; // 重置 timerId
    hasStarted = false; // 游戏结束后，将游戏开始标识符重置为false
}

let timerId = null;
/**
 * 开始计时器
 */
function startTimer() {
    let seconds = 0;
    timerId = setInterval(function() {
        seconds++;
        // 假设你有一个 id 为 timer 的元素用于显示时间
        document.getElementById('timer').textContent = `Time: ${seconds} seconds`;
    }, 1000);
}
/**
 * 计数器更新
 * @param {*} change 
 */
function updateMineCounter(change) {
    var mineCounterElement = document.getElementById('mineCounter');
    var currentCount = Number(mineCounterElement.textContent.split(': ')[1]); // 提取当前数量
    var newCount = currentCount + change; // 更新数量
    mineCounterElement.textContent = 'Mines Remain: ' + newCount; // 显示新数量
}

// 获取难度按钮
var easyButton = document.getElementById('easy');
var mediumButton = document.getElementById('medium');
var hardButton = document.getElementById('hard');

// 为每个难度按钮添加事件监听器
easyButton.addEventListener('click', function() {
    currentLevel = {rows: 9, cols: 9};  // 更新当前难度等级
    resetGame();  // 重置游戏
});

mediumButton.addEventListener('click', function() {
    currentLevel = {rows: 16, cols: 16};  // 更新当前难度等级
    resetGame();  // 重置游戏
});

hardButton.addEventListener('click', function() {
    currentLevel = {rows: 16, cols: 30};  // 更新当前难度等级
    resetGame();  // 重置游戏
});

document.getElementById('instructionsButton').addEventListener('click', function() {
    var instructions = document.getElementById('instructions');
    if (instructions.style.display === 'none') {
        instructions.style.display = 'block';
    } else {
        instructions.style.display = 'none';
    }
});


window.onload = function() {
    resetGame();  // 游戏开始时，初始化游戏
}; 