var inquirer = require("inquirer");
var mysql = require("mysql"); 
var Table = require("cli-table3"); 


var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon"
  });
  
  connection.connect( (err) => {
  
      if (err) throw err;
  
      mainMenu();
  });
  
  function mainMenu(){
  
      inquirer.prompt([
      {
          type: "list",
          name: "choice",
          message: "Choose an option:",
          choices: ["View Product Sales by Department",
                    "Create New Department",
                    "Exit"]
      }
      ]).then( function(response) {
  
          // These are the main menu choices
          // and their corresponsing function calls.
          switch (response.choice) {
            case "View Product Sales by Department":
              viewDeptSales();
              break;
            case "Create New Department":
              createDept();
              break;
            case "Exit":
              connection.end();
          }
      });
  }
  
  function viewDeptSales(){
  
      // This query is an OUTER JOIN so that all departments can be viewed
      // regardless of whether products exist in that department. Default value
      // for product_sales and total_profit to 0.
      connection.query(`SELECT d.department_id, d.department_name,
                        d.over_head_costs, IFNULL(SUM(p.product_sales), 0) AS product_sales,
                        IFNULL((SUM(p.product_sales) - d.over_head_costs), 0) AS total_profit
                        FROM products p
                        RIGHT OUTER JOIN departments d ON p.department_name = d.department_name
                        GROUP BY d.department_id`, (err, results) => {
  
          if (err) throw err;
  
          var table = new Table ({
            chars: {'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗'
                    , 'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚', 'bottom-right': '╝'
                    , 'left': '║', 'left-mid': '╟', 'mid': '─', 'mid-mid': '┼'
                    , 'right': '║', 'right-mid': '╢', 'middle': '│'
                },
          head: ["department_id", "department_name",
                        "over_head_costs", "product_sales",
                        "total_profit"],
          data: [head]
            });
  
          // Push each department result into the data array.
          for(var i=0; i < results.length; i++){
              data.push([results[i].department_id,
                         results[i].department_name,
                         results[i].over_head_costs,
                         results[i].product_sales,
                         results[i].total_profit]);
          }
  
          let output = table(data); 
          console.log(output);
          backToMain();
      });
  }
  
  function createDept(){
  
      // Input a department name and overhead cost amount.
      inquirer.prompt([
      {
          type: "input",
          name: "deptName",
          message: "Department name:",
          validate: function(value) {
              if(value.length > 0 && value.length <= 50){
                  return true;
              } else {
                  return false;
              }
          }
      },
      {
          type: "input",
          name: "costs",
          message: "Overhead costs:",
          validate: function(value) {
              return isNaN(value) === true ? false : true;
          }              
      }
      ]).then( function(response) {
  
          let values = {department_name: response.deptName,
                        over_head_costs: parseInt(response.costs)};
  
          // Add department to the database.
          connection.query("INSERT INTO departments SET ?",
                           values, (err, results) => {
  
              if (err) throw err;
  
              console.log("Department has been added.");
              backToMain();
          });
      });
  
  }
  
  function backToMain(){
  
      inquirer.prompt([
      {
          type: "confirm",
          name: "yesNo",
          message: "Would you like to return to the main menu?"
      }
      ]).then( function(response) {
  
          if(response.yesNo){
  
              // Display the main menu.
              mainMenu();
          } else {
  
              // End the connection.
              connection.end();
          }
      });
  }