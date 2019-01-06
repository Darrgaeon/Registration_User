const express = require("express");
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const nodemailer = require("nodemailer");
const app = express();
const jsonParser = bodyParser.json();
// const config = require("./etc/config");
const directWebPage = "verifyUserEmail.html";
const randNumber = Math.floor((Math.random() * 100) + 54);
const mongoClient = new MongoClient("mongodb://localhost:27017/", {useNewUrlParser: true});
// const MD5 = require("./components/md5");

let dbClient;

const dir = `${process.env.INIT_CWD}/docs/`;
app.use(express.static(dir));

mongoClient.connect(function (err, client) {
    if (err) {
        return console.log(err);
    }

    dbClient = client;
    app.locals.collection = client.db("usersdb").collection("users");
});


app.get("/api/users", function (req, res) {

    console.log("get");

    const collection = req.app.locals.collection;
    collection.find({}).toArray(function (err, users) {

        if (err) {
            console.log(err);
            return null;
        }

        res.send(users);
    });

});


app.post("/api/users", jsonParser, function (req, res) {

    if (!req.body) {
        return res.sendStatus(400);
    }

    console.log("req.body.password", req.body.password);

    let user = {
        login: req.body.login,
        password: req.body.password,
        email: req.body.email,
        checkMail: 0
    };

    const col = req.app.locals.collection;


    //добавление пользователя
    col.insertOne(user, function (err, result) {
        if (err) {
            return res.status(400).send();
        }

        res.send(user);
    });

    const host = req.get("host");
    const linkConfirmationOfRegistration = `http://${host}/${directWebPage}?email=${user.email}&id=${randNumber}`;
    console.log(linkConfirmationOfRegistration);


    //отправка письма на почту
    nodemailer.createTestAccount((err) => {
        if (err) {
            console.error("Failed to create a testing account. " + err.message);
            return process.exit(1);
        }

        const transporter = nodemailer.createTransport({
            service: "yandex",
            auth: {
                user: "testdarg", // generated ethereal user
                pass: "runesofmagic" // generated ethereal password
            }
        });

        let message = {
            from: "Server <testdarg@yandex.ru>", // sender address
            to: user.email,
            subject: "Registration account",
            text: "Confirm registration",
            html: `<b>Login:</b>${user.login}<br>
                   <b>Password:</b>${user.password}<br>
                   <b>Email:</b>${user.email}<br>
                   Hello,<br>Please Click on the link to verify your email.<br><a href=${linkConfirmationOfRegistration}>Click here to verify</a>`
        };

        transporter.sendMail(message, (err, info) => {
            if (err) {
                console.log("Error occurred. " + err.message);
                return process.exit(1);
            }

            console.log("Message sent: %s", info.messageId);
        });
    });
});


app.get("/verifyUserEmail.html", function (req, res) {

    console.log("Check mail confirmation");

    if ((`${req.protocol}://${req.get("host")}`) === ("http://localhost:3000")) {
        if (parseInt(req.query.id) === randNumber) {
            console.log("email is verified");
            res.end("<h1>Email is been Successfully verified</h1>");

            const mongoClient = new MongoClient("mongodb://localhost:27017/", {useNewUrlParser: true});

            mongoClient.connect(function (err, client) {
                if (err) {
                    return console.log(err);
                }

                dbClient = client;
                app.locals.collection = client.db("usersdb").collection("users");
                const col = req.app.locals.collection;

                col.findOneAndUpdate(
                    {email: req.query.email}, // критерий выборки
                    {$set: {checkMail: 1}}, // параметр обновления
                    function (err, result) {
                        console.log(result);
                    }
                );
            });
        }
    } else {
        res.end("<h1>Mail not registered</h1>");
    }
});

app.listen(3000, function () {
    console.log("Сервер подключен");
});


