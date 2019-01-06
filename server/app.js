const express = require("express");
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const nodemailer = require("nodemailer");
const app = express();
const jsonParser = bodyParser.json();
const config = require("../etc/config");
const mongoClient = new MongoClient(config.apiDB, {useNewUrlParser: true});

const directWebPage = "verifyUserEmail.html";
const randNumber = Math.floor((Math.random() * 100) + 54);

const dir = `${process.env.INIT_CWD}/docs/`;
app.use(express.static(dir));


let dbClient;
mongoClient.connect(function (err, client) {
    if (err) {
        return console.log(err);
    }

    dbClient = client;
    app.locals.collection = client.db(config.db.name).collection(config.db.collection);
});


app.get(config.api, function (req, res) {

    const collection = req.app.locals.collection;
    collection.find({}).toArray(function (err, users) {

        if (err) {
            console.log(err);
            return null;
        }

        res.send(users);
    });

});


app.post(config.api, jsonParser, function (req, res) {

    if (!req.body) {
        return res.sendStatus(400);
    }

    let user = {
        login: req.body.login,
        password: req.body.password,
        email: req.body.email,
        actionMail: false
    };

    const col = req.app.locals.collection;


    //add user
    col.insertOne(user, function (err, result) {
        if (err) {
            return res.status(400).send();
        }

        res.send(user);
    });

    const host = req.get("host");
    const linkConfirmationOfRegistration = `http://${host}/${directWebPage}?email=${user.email}&id=${randNumber}`;
    console.log(linkConfirmationOfRegistration);


    //send letter on email
    nodemailer.createTestAccount((err) => {
        if (err) {
            console.error("Failed to create a testing account. " + err.message);
            return process.exit(1);
        }

        const transporter = nodemailer.createTransport({
            service: config.service,
            auth: {
                user: config.userEmail,
                pass: config.userPassword
            }
        });

        const message = {
            from: config.message.from,
            to: user.email,
            subject: config.message.subject,
            text: config.message.text,
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


app.get(config.verify, function (req, res) {

    console.log("Check mail confirmation");

    if ((`${req.protocol}://${req.get("host")}`) === (config.localhost)) {
        if (parseInt(req.query.id) === randNumber) {
            console.log("email is verified");
            res.end("<h1>Email is been Successfully verified</h1>");

            const mongoClient = new MongoClient(config.apiDB, {useNewUrlParser: true});

            mongoClient.connect(function (err, client) {
                if (err) {
                    return console.log(err);
                }

                dbClient = client;
                app.locals.collection = client.db(config.db.name).collection(config.db.collection);
                const col = req.app.locals.collection;

                col.findOneAndUpdate(
                    {email: req.query.email}, // критерий выборки
                    {$set: {actionMail: true}}, // параметр обновления
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

app.listen(config.serverPort, function () {
    console.log(`Server start on ${config.serverPort}`);
});


