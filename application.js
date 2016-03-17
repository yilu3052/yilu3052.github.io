//Document ready
document.addEventListener('DOMContentLoaded', function(){
  game = new Game(generateBoard());
  view = new View();
  controller = new Controller(game, view);
  view.controller = controller;
  view.drawGame(game.board);
  view.eventHandling();
});

//Model
function Game(startingBoard) {
  self = this;
  this.board = startingBoard;
  this.lost = false;

  this.won = function() {
    if (
    self.board.filter(function(cell){
      return cell.number == 256
    }).length == 0 ) {
      return false
    }
    return true
  };

  this.play = function(direction) {
    originalBoardArray = self.board.map(function(cell){return cell.number})
    switch (direction) {
      //up
      case 38:
        for (var column = 1; column <=4; column ++) {
          array = self.board.filter(function(cell){
            return cell.column == column;
          }).sort(function(a, b){return a.row - b.row});
          modify(array)
        }
      break;
      //down
      case 40:
        for (var column = 1; column <=4; column ++) {
          array = self.board.filter(function(cell){
            return cell.column == column;
          }).sort(function(a, b){return b.row - a.row});
          modify(array)
        }
      break;
      //right
      case 39:
        for (var row = 1; row <=4; row ++) {
          array = self.board.filter(function(cell){
            return cell.row == row;
          }).sort(function(a, b){return b.column - a.column});
          modify(array);
        }
      break;
      //left
      case 37:
        for (var row = 1; row <=4; row ++) {
          array = self.board.filter(function(cell){
            return cell.row == row;
          }).sort(function(a, b){return a.column - b.column});
          modify(array)
        }
      break;
    }

    currentBoardArray = self.board.map(function(cell){return cell.number})

    if (isThereNextMove(self.board)) {
      if (JSON.stringify(originalBoardArray) != JSON.stringify(currentBoardArray)){
        cellsOfZero = self.board.filter(function(cell){
          return cell.number == 0;
        });
        if (cellsOfZero.length != 0) {
          cellsOfZero[Math.floor(Math.random() * cellsOfZero.length)].number = 2;
          if (!isThereNextMove(self.board)) {
            self.lost = true
          }
        }
      }
    } else {
      self.lost = true
    }

  };
}

function Cell(x, y, number) {
  this.row = x;
  this.column = y;
  this.number = number;
}

//View
function View() {
  var self = this;
  this.drawGame = function(board) {
    board.forEach(function(cell){
      $(".row" + cell.row + " .column" + cell.column + "").html(cell.number);
      $(".row" + cell.row + " .column" + cell.column + "").attr('number', cell.number)
    });
  };
  this.eventHandling = function() {
      $('body').keyup(function(event) {
          self.controller.play(event.keyCode);
      });
      $('button').click(function(event) {
          self.controller.reset();
          $('#message').html('');
      });
  };
  this.displayMessage = function(result) {
    if (result == "win") {

      $('#message').html('You Won!')
    } else {
      $('#message').html('Game Over!')
    }
  }
}

//Controller
function Controller(game, view) {
  var self = this;
  this.game = game;
  this.view = view;
  this.reset = function() {
    self.game.board = generateBoard();
    self.game.lost = false;
    self.view.drawGame(self.game.board);
  };
  this.play = function(direction) {
    if ((direction == 37 || direction == 38 || direction == 39 || direction == 40) && !self.game.won() && !self.game.lost) {
          self.game.play(direction);
          this.view.drawGame(self.game.board);
          if (self.game.lost) {
            self.view.displayMessage('lose');
          } else if (self.game.won()) {
            self.view.displayMessage('win');
          }
    }
  };
}

//Generate Initial Board
function generateBoard() {
  newBoard = [];
  for (var row = 1; row <= 4; row ++) {
    for (var column = 1; column <=4; column ++) {
      newBoard.push(new Cell(row, column, 0));
    }
}
  newBoard = assignTwoStartingCells(newBoard);
  return newBoard;
}

function assignTwoStartingCells(newBoard) {
  var firstIndex = Math.floor(Math.random() * 16);
  var secondIndex = Math.floor(Math.random() * 16);
  while (firstIndex == secondIndex) {
    secondIndex = Math.floor(Math.random() * 16);
  }
  newBoard[firstIndex].number = 2;
  newBoard[secondIndex].number = 2;
  return newBoard;
}

function modify(array) {
    arrayNumbers = array.map(function(cell){
      return cell.number;
    });
    newArrayNumbers = consolidate(arrayNumbers);
    for (var index = 0; index <=3; index ++) {
      array[index].number = newArrayNumbers[index];
    }
}

function consolidate(array) {
  if (array.length == 1) {
    return array
  }
  newArray = array.filter(function(number){
    return number > 0
  });
  while (newArray.length != array.length) {
    newArray.push(0)
  };
  if (newArray[0] == newArray[1]) {
   newArray[0] = newArray[0] + newArray[1]
   newArray[1] = 0
  }
  newArray = [newArray[0]].concat(consolidate(newArray.slice(1,newArray.length)))
  return newArray
}

function isThereNextMove(board) {
  if (board.filter(function(cell) {
    return cell.number == 0
  }).length > 0) {
    return true
  }
  var avaialbleCell = [];
  for (var row = 1; row <=4; row++) {
    for (var column = 1; column <=4; column++) {
      cell = board.filter(function(cell){
        return cell.row == row && cell.column == column
      })[0]
      rightCell = board.filter(function(cell){
        return cell.row == row && cell.column == column + 1
      })[0] || null
      downCell = board.filter(function(cell){
        return cell.row == row+1 && cell.column == column
      })[0] || null
      if (compareCell(cell, rightCell) || compareCell(cell, downCell)) {
        avaialbleCell.push(cell)
      }
    }
  }

  if (avaialbleCell.length == 0) {
    return false
  } else {
    return true
  }
}

function compareCell(cell, nextCell) {
  if (nextCell == null) {
    return false
  } else if (cell.number == nextCell.number) {
    return true
  } else {
    return false
  }
}