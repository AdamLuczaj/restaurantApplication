Program Author:
Adam Luczaj

Base code provided by David McKenney, professor at Carleton University. Specifically, the add.png picture, the remove.png picture, entire database-initializer file, most of the orderform.html file (not the clickable header links), and most of the orderform.js file (not the HTTP request part). I will explicitly state in those files where my code is written.
This project was completed as an assignment for the COMP 2406 course of Carleton University.

Purpose:
Creates a restaurant management system to process the creation and tracking of user orders, order information, and user accounts. Session information is stored in a MongoDB database.
This program supports the functionality of logging in users, creating orders for users, has the ability to set users to private and public, and so on.

To run:
1. cd into the directory where the file is downloaded
2. run: npm install
3. Create a directory called a4 (mkdir a4)
4. Open two terminals
5. run: mongod --dbpath="a4"       in terminal one
6. run: node database-initializer.js in terminal two
7. run: node server.js               in terminal two
8. Open Google Chrome and run http://localhost:3000/