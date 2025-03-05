const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const db = require('./db');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");

app.use(cors());
// >> Middleware to parse request body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let users = [
    {username: "admin", email: "admin01@gmail.com", password: "123"}
];

// Routing
app.get('/', (req, res) => {
    res.send('<h1>Welcome to my home page.</h1>');
});

app.get('/items/:id', (req, res) => {
    const id = req.params.id;
    res.send(`Received item id: ${id}`);
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/products', (req, res) => {
    res.render('products');
});

app.post('/login', (req, res) => {
    const {email, password} = req.body;
    // res.send(`Received email: ${email}, password: ${password}`);

    // user info check with db
    const sql = "SELECT a_pwd FROM account WHERE a_email=?";
    db.query(sql, [email], async (err, result) => {
        if(err){
            res.send("Error user info:" + email);
        }else if(result.length > 0){
            const user = result[0];
            const match = await bcrypt.compare(password, user.a_pwd);

            if (match){
                res.redirect('/products');
            }else{
                res.send("Invalid email or password!");            
            }
        }
    });
});

app.post('/register', async (req, res) => {
    const {username, email, rpassword, cpassword} = req.body;
    // >> Show user registration info in client side 
    // const newUsers = {username: username, email: email, password: rpassword};
    // res.send(`Received data from register form :: <br/><br/>
    //     username : ${username} <br/>
    //     email : ${email} <br/>
    //     registered password : ${rpassword} <br/>
    //     confirm Password : ${cpassword}`);

    // users.push(newUsers);
    // res.json(users);

    // password encryption
    const saltRounds = 10;
    const hashPassword = await bcrypt.hash(rpassword, saltRounds);

    // insert user info to db
    db.query("INSERT INTO account(a_name,a_email,a_pwd) VALUES(?,?,?)",
        [username,email,hashPassword],
        (err, result) => {
            if(err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json(result[0]);
                res.redirect('/login');
            }
        }
    )
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
