const { Client } = require('pg');

const client = new Client({
  connectionString: "postgres://slyodakbbttdhs:968361395e30506915fb61997e79852b3a6f633c110d503411a4fdbc1aea8b9c@ec2-107-21-103-146.compute-1.amazonaws.com:5432/d8inumnm21ppuh",  
  ssl: true,
});
console.log(process.env.DATABASE_URL);
client.connect();

client.query('SELECT angle_id FROM ACCOUNT WHERE angle_nickname=\'友安\';', (err, res) => {
  if (err) throw err;
  console.log(err);
  for (let row of res.rows) {
    console.log(JSON.stringify(row));
  }
  client.end();
});