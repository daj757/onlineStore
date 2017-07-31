const mysql = require("mysql");
const inquirer = require("inquirer");
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon"
});
let itemsArray = [];
let choicesArray = ['View Products for Sale', 'View low Inventory', 'Add to Inventory', 'Add new Product']
const start = () => {
    inquirer.prompt([{
        type: 'list',
        choices: choicesArray,
        name: 'choices',
        message: 'Welcome to the Tech Store management front... Choose an option to continue'

    }]).then(function(answer) {
        let choice = answer.choices;
        switch (choice) {

            case 'View Products for Sale':
                console.log("\r\n-----Products for sale-----\r\n")
                viewProducts();

                break;

            case 'View low Inventory':
                console.log('\r\n-----Low inventory-----\r\n')
                viewLow();

                break;

            case 'Add to Inventory':
                addStock1();
                break;

            case 'Add new Product':
                console.log('new product')
                update();
                break;

        }
    });
}
start();

const viewProducts = () => {
    connection.query("SELECT productName, stockQuantity FROM products", function(err, res) {
        for (let i = 0; i < res.length; i++) {
            console.log(res[i].productName + " In stock: " + res[i].stockQuantity)
        }
        console.log("\r\n")
        process.exit();
    })

}

const viewLow = () => {
    connection.query("SELECT productName, stockQuantity FROM products WHERE stockQuantity < 10", function(err, res) {
        for (let i = 0; i < res.length; i++) {
            console.log(res[i].productName + " has only " + res[i].stockQuantity + " left in stock")
        }
        console.log("\r\n")
        process.exit();
    });
}

const addStock1 = () => {
    let myFirstPromise = new Promise((resolve, reject) => {

        connection.query("SELECT * FROM products", function(err, res) {
           
            for (let i = 0; i < res.length; i++) {
                if (res[i].departmentName === null) {
                    res[i].departmentName = ''
                }
                itemsArray.push("ID: " + res[i].id + " " + res[i].departmentName + " " + res[i].productName + " Price: $ " + res[i].price + " In Stock: " + res[i].stockQuantity)
            }
            resolve(itemsArray)
        })

    });


    myFirstPromise.then((successMessage) => {
        addStockQ();

    });
}

const addStockQ = () => {
    inquirer.prompt([{
        type: 'list',
        choices: itemsArray,
        name: 'choices',
        message: 'Choose the product you would like to add stock to... '

    }]).then(function(answer) {

        howMany(answer.choices)

    });

}

const howMany = (choice) => {

    let id = choice.substring(3, 6);
    console.log(id)
    inquirer.prompt([{
        type: 'input',
        name: 'number',
        message: 'How many of ' + choice + ' would you like to add?',
        validate: function(number) {
            if (isNaN(number) === true) {
                console.log('Please enter a number');
                return false
            } else {
                return true
            }

        }

    }]).then(function(number) {
        connection.query("UPDATE products SET stockQuantity = stockQuantity +" + number.number + " WHERE Id = " + id, function(err, res) {
            if (err) throw err
                else{
            console.log("You have updated stock quantity info.")
            process.exit();
        }
        })
    });
}

const update = () => {
    inquirer.prompt([{
            type: 'input',
            name: 'name',
            message: 'What is the name of the product?'
        },
        {
            type: 'input',
            name: 'maker',
            message: 'Who is the maker of the product'
        },
        {
            type: 'input',
            name: 'price',
            message: "What is the price of the product?",
            validate: function(input) {
                if (isNaN(input) === true) {
                    console.log("Please enter a number")
                    return false
                } else {
                    return true
                }
            }
        },
        {
            type: 'input',
            name: 'quantity',
            message: 'How many are there in stock?',
            validate: function(input) {
                if (isNaN(input) === true) {
                    console.log("Please enter a number")
                    return false
                } else {
                    return true
                }
            }

        }
    ]).then(function(answers) {
    	 let query1 = "INSERT INTO products(productName, departmentName, price, stockQuantity) VALUES (?, ?, ?, ?)"
    	 //query1 += "'" + answers.name + "'" + ', ' + answers.maker + ', ' + answers.price + ', ' + answers.quantity +');';
    	 let query2 = [answers.name, answers.maker, answers.price, answers.quantity]
          
          connection.query(query1, query2, function(err, res){
          	if (err) throw err
          		else{
          			console.log("Product has been added to list")
          			process.exit()
          		}
          
        })
    })
}