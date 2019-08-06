const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cons = require('consolidate');
const dust = require('dustjs-helpers');
const { Pool, Client } = require('pg')

const app = express();


//DB Connect
// const connect = 'postgresql://recipebook:pg@ren01@localhost/recipebookdb';

// const client = new Client({
//     connect: connect,
// })

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'recipebookdb',
    password: 'pg@ren01',
    port: 5432,
})

//Dust engine
app.engine('dust', cons.dust);

//Set default ext .dust
app.set('view engine', 'dust');
app.set('views', __dirname + '/views');

//Set public folder
app.use(express.static(path.join(__dirname, 'public')));


//Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.get('/', async (req, res) => {
    //PG CONNECT
    try {
        await pool.connect();
        const result = await pool.query('select * from recipes')
        res.render('index', { recipes: result.rows })
    } catch (error) {
        console.error(error.message);
    }
});

app.post('/add', async (req, res) => {
    try {
        await pool.connect();
        await pool.query('insert into recipes(name, ingredients, directions) values($1, $2, $3)', [req.body.name, req.body.ingredients, req.body.directions]);
        res.redirect('/');
    } catch (error) {
        console.error(error.message);
    }
});

app.delete('/delete/:id', async (req, res) => {
    try {
        await pool.connect();
        await pool.query('delete from recipes where id = $1', [req.params.id]);
        res.sendStatus(200);
    } catch (error) {
        console.error(error.message);
    }
});

app.post('/edit', async (req, res) => {
    try {
        await pool.connect();
        await pool.query('update recipes set name=$1, ingredients=$2, directions=$3 where id=$4', [req.body.name, req.body.ingredients, req.body.directions, req.body.id]);
        res.redirect('/');
    } catch (error) {
        console.error(error.message);
    }
});


//Server
app.listen(3000, () => {
    console.log('Server started on port 3000');
})