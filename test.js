const pg = require('pg');

console.log(process.env.DATABASE_URL);
pg.connect(process.env.DATABASE_URL, function(err, client, done) {
  console.log(err+"!!!!!!!!!!!!!!!");
 client.query('SELECT * FROM your_table', function(err, result) {
   done();
   if(err) return console.error(err);
   console.log(result.rows);
   client.end();
 });
});
//'SELECT angle_id FROM ACCOUNT WHERE angle_nickname=\'友安\';'
