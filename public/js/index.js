// Making Connection
const socket = io.connect("http://localhost:3000");
socket.emit("joined");
const msgwrap=document.getElementById('msgwrap');
const sendform=document.getElementById('sender');
const msgadd=document.getElementById('msgadd');

function messenger(message){
  const msgg=document.createElement('div');
  msgg.innerText=message;
  msgwrap.append(msgg);

  //var content = document.createTextNode(message);
  //msgwrap.appendChild(content);

}

socket.on('cmsg',msg=>{
  messenger(msg);
  console.log(msg)
})

sendform.addEventListener('submit',e=>{
  e.preventDefault();
  const msg=msgadd.value
  socket.emit('msg',msg)
  msgadd.value=''
})



let players = []; // All players in the game
let currentPlayer; // Player object for individual players

let canvas = document.getElementById("canvas");
canvas.width = document.documentElement.clientHeight * 0.9;
canvas.height = document.documentElement.clientHeight * 0.9;
let ctx = canvas.getContext("2d");

const redPieceImg = "../images/red_piece.png";
const bluePieceImg = "../images/blue_piece.png";

const side = canvas.width / 10;
const offsetX = side / 2;
const offsetY = side / 2 + 20;


const images = [redPieceImg, bluePieceImg];

/*const ladders = [
];
const snakes = [
];*/

class Player {
  constructor(id, name, pos, img) {
    this.id = id;
    this.name = name;
    this.pos = pos;
    this.img = img;
  }

  /*draw() {
    let xPos =
      Math.floor(this.pos / 10) % 2 == 0
        ? (this.pos % 10) * side - 15 + offsetX
        : canvas.width - ((this.pos % 10) * side + offsetX + 15);
    let yPos = canvas.height - (Math.floor(this.pos / 10) * side + offsetY);

    let image = new Image();
    image.src = this.img;
    ctx.drawImage(image, xPos, yPos, 30, 40);
  }*/

  updatePos(num) {
    if (this.pos + num <= 99) {
      this.pos += num;
      //this.pos = this.isLadderOrSnake(this.pos + 1) - 1;
    }
  }

  /*isLadderOrSnake(pos) {
    let newPos = pos;

    for (let i = 0; i < ladders.length; i++) {
      if (ladders[i][0] == pos) {
        newPos = ladders[i][1];
        break;
      }
    }

    for (let i = 0; i < snakes.length; i++) {
      if (snakes[i][0] == pos) {
        newPos = snakes[i][1];
        break;
      }
    }

    return newPos;
  }*/
}

document.getElementById("start-btn").addEventListener("click", () => {
  const name = document.getElementById("name").value;
  document.getElementById("name").disabled = true;
  document.getElementById("start-btn").hidden = true;
  document.getElementById("roll-button").hidden = false;
  currentPlayer = new Player(players.length, name, 0, images[players.length]);
  document.getElementById(
    "current-player"
  ).innerHTML = `<p>Anyone can roll</p>`;
  socket.emit("join", currentPlayer);
});

document.getElementById("roll-button").addEventListener("click", () => {
  const num = rollDice();
  currentPlayer.updatePos(num);
  socket.emit("rollDice", {
    num: num,
    id: currentPlayer.id,
    pos: currentPlayer.pos,
  });
});

function rollDice() {
  const number = Math.ceil(Math.random() * 6);
  return number;
}

/*function drawPins() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  players.forEach((player) => {
    player.draw();
  });
}*/

// Listen for events
socket.on("join", (data) => {
  
  if(players.length>1){document.getElementById("start-btn").setAttribute("disabled")
  document.getElementById("start-btn").setAttribute("disabled")}
  else {document.getElementById("start-btn").disabled=false
  players.push(new Player(players.length, data.name, data.pos, data.img));
  //drawPins();

  document.getElementById(
    "players-table"
  ).innerHTML += `<tr><td>${data.name}</td><td><img src=${data.img} height=50 width=40></td></tr>`;
  const player1name=document.getElementById('player1')
  player1name.innerText=players[0].name
  const player2name=document.getElementById('player2')
  player2name.innerText=players[1].name
}
});

socket.on("joined", (data) => {
  data.forEach((player, index) => {
    players.push(new Player(index, player.name, player.pos, player.img));
    console.log(player);
    document.getElementById(
      "players-table"
    ).innerHTML += `<tr><td>${player.name}</td><td><img src=${player.img}></td></tr>`;
  });
  //drawPins();
});

socket.on("rollDice", (data, turn) => {
  players[data.id].updatePos(data.num);
  //console.log(data.num)
  document.getElementById("dice").src = `./images/dice/dice${data.num}.png`;

  //drawPins();
  if (turn != currentPlayer.id) {
    document.getElementById("roll-button").hidden = true;
    document.getElementById(
      "current-player"
    ).innerHTML = `<p>It's ${players[turn].name}'s turn</p>`;
  } else {
    document.getElementById("roll-button").hidden = false;
    document.getElementById(
      "current-player"
    ).innerHTML = `<p>It's your turn</p>`;
  }

  let winner;
  for (let i = 0; i < players.length; i++) {
    document.getElementById("score-0").innerHTML= players[0].pos;
    document.getElementById("score-1").innerHTML= players[1].pos;
    console.log(i)
    //var maxscore = document.getElementById("maxscore").value;
    if (players[i].pos >= 30) {
      winner = players[i];
      break;
    }
  }

  if (winner) {
    document.getElementById(
      "current-player"
    ).innerHTML = `<p>${winner.name} has won!</p>`;
    document.getElementById("roll-button").hidden = true;
    document.getElementById("dice").hidden = true;
    document.getElementById("restart-btn").hidden = false;
  }
});

// Logic to restart the game
document.getElementById("restart-btn").addEventListener("click", () => {
  socket.emit("restart");
});

socket.on("restart", () => {
  window.location.reload();
});

function myFunction() {
  var x = document.getElementById("myTopnav");
  if (x.className === "topnav") {
    x.className += " responsive";
  } else {
    x.className = "topnav";
  }
}

module.exports.rollDice = rollDice