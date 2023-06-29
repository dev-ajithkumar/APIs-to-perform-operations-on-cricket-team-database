const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
let db = null;
const port = 3013;
const dbPath = path.join(__dirname, "./cricketTeam.db");
console.log(__dirname);
const connectServerAndDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(port, () => {
      console.log(`Server Started...!`);
    });
  } catch (error) {
    console.log(`Error ${error.message}`);
    process.exit(1);
  }
};

connectServerAndDb();

const convertToStr = (obj) => {
  return {
    playerId: obj.player_id,
    playerName: obj.player_name,
    jerseyNumber: obj.jersey_number,
    role: obj.role,
  };
};

// get All the players
app.get("/players/", async (request, response) => {
  const getAllPlayers = `SELECT * FROM cricket_team;`;
  const playersArray = await db.all(getAllPlayers);
  response.send(playersArray.map((el) => convertToStr(el)));
});

// add a new player
app.post("/players/", async (request, response) => {
  let playerDetails = request.body;
  console.log(playerDetails);
  let { playerName, jerseyNumber, role } = playerDetails;
  let addPersonQuery = `INSERT INTO cricket_team (player_name,jersey_number,role)
                    VALUES('${playerName}','${jerseyNumber}','${role}')`;
  let dbResponse = await db.run(addPersonQuery);
  response.send(`Player Added to Team`);
});

// get a single player by id:
app.get("/players/:playerId/", async (request, response) => {
  let { playerId } = request.params;
  let getPlayer = `SELECT * FROM cricket_team WHERE player_id = '${playerId}';`;
  let player = await db.get(getPlayer);
  response.send(convertToStr(player));
});

// update the current player
app.put("/players/:playerId/", async (request, response) => {
  let { playerId } = request.params;
  let updateDetails = request.body;
  let { playerName, jerseyNumber, role } = updateDetails;
  let updatePlayer = `UPDATE cricket_team SET player_name='${playerName}',jersey_number='${jerseyNumber}',role='${role}'
     WHERE player_id ='${playerId}'`;
  let dbResponse = await db.run(updatePlayer);
  response.send(`Player Details Updated`);
});

//delete the player
app.delete("/players/:playerId/", async (request, response) => {
  let { playerId } = request.params;
  let deleteQuery = `
  DELETE FROM
    cricket_team
  WHERE
    player_id = '${playerId}';`;
  await db.run(deleteQuery);
  response.send(`Player Removed`);
});

module.exports = app;
