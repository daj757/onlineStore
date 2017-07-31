const mysql = require("mysql");
const inquirer = require("inquirer");
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon"
});
let price = 0;
let itemsArray = [];
let stock = 0;

function start() {
    let myFirstPromise = new Promise((resolve, reject) => {
        connection.connect(function(err) {
            console.log("connected " + connection.threadId);
            connection.query("SELECT * FROM products", function(err, res) {

                for (let i = 0; i < res.length; i++) {
                    if (res[i].departmentName === null) {
                        res[i].departmentName = ''
                    }
                    itemsArray.push("ID: " + res[i].id + " " + res[i].departmentName + " " + res[i].productName + " Price: $ " + res[i].price)
                }
                resolve(itemsArray)
            })

        });
    });

    myFirstPromise.then((successMessage) => {
        question();

    });
}
start();


const question = () => {

    inquirer.prompt([{
        type: 'list',
        choices: itemsArray,
        name: 'choices',
        message: 'Welcome to the Tech Store front. Browse our available products... '




    }]).then(function(answers) {
        console.log("You have selected " + answers.choices);
        howMany(answers.choices);
    });
}


const howMany = (choice) => {
    let id = choice.substring(3, 6).trim();
    connection.query("SELECT StockQuantity, price FROM products WHERE Id =" + id, function(err, res) {
        stock = res[0].StockQuantity;
        price = res[0].price;
    })
    inquirer.prompt([{
        type: 'input',
        name: 'number',
        message: 'How many of ' + choice + " would you like to buy?",
        validate: function(input) {
            if (isNaN(input) === true) {
                console.log("\r\n 		Please enter a number");
                return false
            } else if (input > stock) {
                console.log("\r\nSorry, we only have " + stock + " in stock")
                return false
            } else {

                connection.query("UPDATE products SET StockQuantity = StockQuantity -" + input + " WHERE Id =" + id, function(err, res) {
                    if (!err) {
                        connection.query("SELECT StockQuantity FROM products WHERE Id =" + id, function(err, res) {
                            stock = res[0].StockQuantity;

                        })
                    }

                });
                return true
            }

        }


    }]).then(function(answers) {

        let totalprice = price * answers.number;
        setTimeout(function() { console.log("You have bought " + answers.number + ", there are " + stock + " left. Your total price is $ " + totalprice + "\r\n Thank you :)") }, 500);
         setTimeout(function() {process.exit()  }, 1000);

    });
}