var inquirer = require("inquirer");
var mysql = require("mysql"); 
var Table = require("cli-table3");  

// Connecting to the database //
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root", 
    password: "root",
    database: "bamazon"
});

connection.connect(function(err) {
    if (err) throw err; 
    showUserOptions();
}); 

function showUserOptions () {
    inquirer.prompt([
        {
            type: "list",
            name: "options",
            message: "What would you like to do?",
            choices: [
                {
                    name:'View Products for Sale',
                    value: 'view_products'
                },
                {
                    name:'View Low Inventory', 
                    value: 'view_inventory'
                },
                {
                    name:'Add to Inventory', 
                    value: 'add_inventory'
                },
                {
                    name: 'Add New Product',
                    value: 'add_product'
                }
            ]
        }
    ])
    .then(function (userResponse) {
       if (userResponse.options === 'view_products') {
           displayProducts(); 
       }
       else if (userResponse.options === 'view_inventory') {
           displayLowInventory();
       }
       else if (userResponse.options === 'add_inventory') {
           addInventory();
       }
       else if (userResponse.options === 'add_product') {
           addProduct(); 
       }
    });
}

// ========== Defining the Functions ========== //

// If a manager selects `View Products for Sale`, the app should list every available item: the item IDs, names, prices, and quantities. //
function displayProducts() {
   connection.query("SELECT * FROM products", function (err, results) {
       if (err) throw err; 
       var table = new Table ({
        chars: {'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗'
                , 'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚', 'bottom-right': '╝'
                , 'left': '║', 'left-mid': '╟', 'mid': '─', 'mid-mid': '┼'
                , 'right': '║', 'right-mid': '╢', 'middle': '│'
            },
            head: ["Id", "Product Name", "Price", "Quantity"]
        });
        for (var i = 0; i < results.length; i++) {
            table.push([results[i].item_id, results[i].product_name, '$' + results[i].price, results[i].stock_quantity]);
        }
        console.log("Current Products for Sale");
        console.log(table.toString());
        connection.end();
        });
   }

// If a manager selects `View Low Inventory`, then it should list all items with an inventory count lower than five. //
   function displayLowInventory() {
      connection.query("SELECT * FROM products WHERE  stock_quantity< 5", function (err, results) {
        if (err) throw err; 
        var table = new Table ({
         chars: {'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗'
                 , 'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚', 'bottom-right': '╝'
                 , 'left': '║', 'left-mid': '╟', 'mid': '─', 'mid-mid': '┼'
                 , 'right': '║', 'right-mid': '╢', 'middle': '│'
             },
             head: ["Id", "Product Name", "Price", "Quantity"]
         });
         for (var i = 0; i < results.length; i++) {
             table.push([results[i].item_id, results[i].product_name, '$' + results[i].price, results[i].stock_quantity]);
         }
         console.log("Low Inventory Products");
         console.log(table.toString());
         connection.end();
         });
    }

// If a manager selects `Add to Inventory`, your app should display a prompt that will let the manager "add more" of any item currently in the store. //
   function addInventory() {
       inquirer.prompt ([ 
           {
               type: "input",
               name: "addInventory",
               message: "Which product would you like to update the quantity of?"
           },
           {
               type: "input", 
               name: "howMuch",
               message: "How many units would you like to add?",
           }
       ]).then(function(userResponse) {
           connection.query("SELECT * FROM products WHERE ?",
        {
            item_id: userResponse.addInventory
        }, function(err, results) {
            if (err) throw err; 
            
            if (typeof results != "undefined" && results != null && results.length > 0) {
                var newQuantity = results[0].stock_quantity + parseInt(userResponse.howMuch);
                connection.query("UPDATE products SET ? WHERE ?",
                    [
                        {
                            stock_quantity: newQuantity
                        },
                        {
                            item_id: userResponse.addInventory
                        }
                    ], function (err, results) {
                        console.log("Added " + userResponse.howMuch);
                    });
                } else {
                    console.log("Sorry" + " " + userResponse.addInventory + " is not a valid ID.");
                }
                connection.end(); 
            });
        });
    }
    
    // If a manager selects `Add New Product`, it should allow the manager to add a completely new product to the store.
    function addProduct() {
        inquirer.prompt ([
           {
               type: "input",
               name: "productName",
               message: "What is the name of the product you would like to add to Bamazon?"
           },
           {
               type: "input",
               name: "department", 
               message: "Which department will this product go in?"   
           },
           {
              type: "input",
              name: "price",
              message: "What is the cost of the product?"
           },
           {
              type: "input", 
              name: "quantity", 
              message: "How many units would you like to add?"
           }
        ])
        .then(function(userResponse) {
            connection.query("INSERT INTO products SET ?",
            {
                product_name: userResponse.productName, 
                department_name: userResponse.department, 
                price: userResponse.price, 
                stock_quantity: userResponse.quantity
            },
                function(err, results) {
                    console.log("Your new product has been added!");
                    connection.end(); 
                });
          
        });
    }