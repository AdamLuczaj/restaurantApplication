const pug = require("pug");
const express = require("express");
const session = require("express-session");
let app = express();
const MongoDBStore = require('connect-mongodb-session')(session);
const path = require('path');


let mongoStore = new MongoDBStore({
    uri: 'mongodb://localhost:27017/a4',
    collection: 'sessiondata'
});

app.use(express.static("public"));
app.use(express.json()); 

//Database variables.
let mongo = require("mongodb");
let MongoClient = mongo.MongoClient;
let db;

//View engine
app.set("view engine", "pug");

app.use(
    session({
    secret: 'some secret here',
    resave: true,
    saveUninitialized: false,
    store: mongoStore
    })
); 

app.get("/", getHomePage);

app.get("/register", getRegisterPage);
app.post("/register", postRegisterPage);

app.get("/login", getLoginPage);
app.post("/login", loginServer);

app.get("/logout", logout);

app.get("/users", getUsers);
app.get("/users/:userID", getUserProfile);
app.put("/user", updateUserStatus); 

app.get("/profile", getSignedInProfile);

app.get("/order", getOrderForm);
app.post("/orders", postOrder);

app.get("/orders/:orderID", getOrderSummary);

function getHomePage(request, response) {

    let isLoggedIn = false;
    let result;

    
    if(request.session.loggedin){
        isLoggedIn = true;
        result = request.session;
        
        response.send(
            pug.renderFile("./views/pages/home.pug", {isLoggedIn: isLoggedIn, result: result})
        );
    }
    else {
        response.send(
            pug.renderFile("./views/pages/home.pug", {isLoggedIn: isLoggedIn, result: result})
        );
    }

}

function getRegisterPage(request, response) {

    if(request.session.loggedin) {
        response.status(200).send("You cannot register a new user if you are logged in.");
        return;
    }

    response.send(
        pug.renderFile("./views/pages/register.pug") 
    );

}

function postRegisterPage(request, response) {

    //Don't add users that already exist.
    let userExists = false;

    //Check to see if the user exists.
    db.collection("users").find()
    .toArray((err, results) => {

        //contains statement to see if the username exists in the array passed in
        results.forEach(user => {
            if (user.username === request.body.username) {
                userExists = true;
            }
        });

        if (userExists) {
            response.statusCode = 401;
            response.send();
            response.end();

        }

        else {

            let idToSend;

            db.collection("users").insertOne({username: request.body.username, password: request.body.password, privacy: false}, function(err, result) {
                if(err) throw err;
                
                request.session.loggedin = true;
                request.session.username = request.body.username;
                request.session.userID = result.insertedId;

                idToSend = result.insertedId.toString();
              
                response.statusCode = 200;
                response.send(idToSend);
                response.end();
    
            });
    
        }

    })

}

function getLoginPage(request, response) {

    if(request.session.loggedin) {
        response.status(200).send("Already logged in.");
        return;
    }

    response.send(
        pug.renderFile("./views/pages/login.pug", {})
    );

}

function loginServer(request, response) {

    if(request.session.loggedin) {
        response.status(200).send("Already logged in.");
        return;
    }

    let username = request.body.username;
    let password = request.body.password;

    let userExists = false; //We can not log in to a user that does not exist.
    let idToSend = "";

    //Check to see if the user exists.
    db.collection("users").find()
    .toArray((err, results) => {

        results.forEach(user => {
            if (user.username === username) {
                userExists = true;
                idToSend = user._id.toString();
            }
        });

        if (!userExists) {

            response.statusCode = 401;
            response.send();
            response.end();
            return;

        }

        else {

            let samePassword = false;

            results.forEach(user => {
                if (user.password === password) {
                    samePassword = true;
                }
            });

            if (!samePassword) {
                response.statusCode = 401;
                response.send();
                response.end();
            }
            else {
                request.session.loggedin = true;
                request.session.username = username;
                request.session.userID = idToSend;

                response.statusCode = 200;
                response.send(idToSend);
                response.end();
            }
            
    
        }

    })

}

function logout(request, response) {
    if (request.session.loggedin) {
        request.session.loggedin = false;
        request.session.username = undefined;
        request.session.userID = undefined;

        let isLoggedIn = false;

        //This will redirect to the home page, was a design decision for it to be easier to click around fast.
        response.send(
            pug.renderFile("./views/pages/home.pug", {isLoggedIn: isLoggedIn})
        );
        
    } else {
        response.status(200).send("You cannot log out because you aren't logged in.");
    }
}

function getUsers(request, response) {

    let usersToSend = [];

    db.collection("users").find()
    .toArray((err, results) => {

        results.forEach(user => {
            if (user.privacy === false || user.username === request.session.username) {
                usersToSend.push(user);
            }
        });

        let isLoggedIn = false;

        if(request.session.loggedin){
            isLoggedIn = true;
        }

        if (request.session.loggedin) {
            response.send(
                pug.renderFile("./views/pages/users.pug", {result: request.session, usersToSend: usersToSend, isLoggedIn: isLoggedIn})
            );
            return;
        }

        response.send(
            pug.renderFile("./views/pages/users.pug", {usersToSend: usersToSend, isLoggedIn: isLoggedIn})
        );
        return;

    })

}

function getSignedInProfile(request, response) {

    db.collection("users").findOne({"username":request.session.username}, function(err, result){

        if(err){
            response.status(500).send("Error reading database.");
            return;
        }
        if(!result){
            response.status(404).send("Unknown ID");
            return;
        }

        //Find all orders that the user found has made.
        db.collection("orders").find({username: request.session.username}).toArray(function(err2, ordersByUser) {
            if (err2) throw err2;

            let isLoggedIn = false;
    
            if(request.session.loggedin){
                isLoggedIn = true;
            }
        
            let isOwner = true;
        
            response.status(200);
		    response.send(
                pug.renderFile("./views/pages/user.pug", {userFound: request.session, result: request.session, ordersByUser: ordersByUser, isLoggedIn: isLoggedIn, isOwner: isOwner})
            );

        });

    });
}

function getUserProfile(request, response) {

    let oid;
    try {
        oid = new mongo.ObjectId(request.params.userID);
    } catch {
        response.status(404).send("Unknown ID");
        return;
    }


    //Find the user with the corresponding id.
    db.collection("users").findOne({"_id":oid}, function(err, userFound){
		if(err){
			response.status(500).send("Error reading database.");
			return;
		}
		if(!userFound){
			response.status(404).send("Unknown ID");
			return;
		}

        if (userFound.privacy === true && !(request.session.username === userFound.username)) {
            response.status(404).send("Unknown ID");
			return;
        }

        //Find all orders that the user found has made.
        db.collection("orders").find({username: userFound.username}).toArray(function(err2, ordersByUser) {
            if (err2) throw err2;

            let isLoggedIn = false;
    
            if(request.session.loggedin){
                isLoggedIn = true;
            }
        
            let isOwner = false;

            if (request.session.username === userFound.username) {
                isOwner = true;
            }
        
            response.status(200);
		    response.send(
                pug.renderFile("./views/pages/user.pug", {userFound: userFound, result: request.session, ordersByUser: ordersByUser, isLoggedIn: isLoggedIn, isOwner: isOwner})
            );

        });

	});
}


function updateUserStatus(request, response) {

    //This should only be possible via postman or something of the such.
    if (!request.session.loggedin) {
        response.status(401).send("Cannot update the user's profile if not logged in..");
        return;
    }

    if (request.body.privacy === "Yes") {

        db.collection("users").updateOne({"username":request.session.username},{$set: {privacy: true}}, function(err, result) {
            if(err) throw err;
    
            response.statusCode = 200;
            response.send();
            response.end();
            return;
    
        });
    }

    if (request.body.privacy === "No") {

        db.collection("users").updateOne({"username":request.session.username},{$set: {privacy: false}}, function(err, result) {
            if(err) throw err;
    
            response.statusCode = 200;
            response.send();
            response.end();
            return;
    
        });
    }

}

function getOrderForm(request, response) {

    if(!request.session.loggedin) {
        response.status(200).send("Cannot order if not logged in.");
        return;
    }

    //Send the html file, has to be done in this format.
    response.sendFile(path.join(__dirname+'/public/orderform.html'));

}

function postOrder(request, response) {
    
    let userOrder = {};
    userOrder.username = request.session.username;
    userOrder.restaurant = request.body.restaurantName;
    userOrder.subtotal = request.body.subtotal;
    userOrder.total = request.body.total;
    userOrder.fee = request.body.fee;
    userOrder.tax = request.body.tax;
    userOrder.order = request.body.order;
    
    db.collection("orders").insertOne(userOrder, function(err, result) {
        if(err) throw err;

        response.statusCode = 200;
        response.send();
        response.end();

    });

}

function getOrderSummary(request, response) {

    let oid;
    try {
        oid = new mongo.ObjectId(request.params.orderID);
    } catch {
        response.status(404).send("Unknown ID");
    }

    db.collection("orders").findOne({"_id":oid}, function(err, oneOrder){
		if(err){
			response.status(500).send("Error reading database.");
			return;
		}
		if(!oneOrder){
			response.status(404).send("Unknown ID");
			return;
		}
        
        let isLoggedIn = false;
    
        if(request.session.loggedin){
            isLoggedIn = true;
        }
        
        response.status(200);
		response.send(
            pug.renderFile("./views/pages/order.pug", {result: request.session, oneOrder: oneOrder,isLoggedIn: isLoggedIn})
        );

	});
    
}

MongoClient.connect("mongodb://localhost:27017/", (err, client) => {
    if(err) throw err;

    db = client.db("a4");
    app.listen(3000);

    console.log("Server listening at http://localhost:3000");

});

