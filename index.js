const express = require('express')
const app = express()
app.use(express.static('public'));

var fs = require('fs');

function readJSONFile(filename, callback) {
  fs.readFile(filename, function (err, data) {
    if(err) {
      callback(err);
      return;
    }
    try {
      callback(null, JSON.parse(data));
    } catch(exception) {
      callback(exception);
    }
  });
}

function displayRecipe(RECIPE){



	// RECIPE[0] is the title
	// RECIPE[1] is a list of the ingredients
		// RECIPE[1][0] is the first ingredient
		// RECIPE[1][1] is the second ingredient
	// RECIPE[2] is a list of the steps
		// RECIPE[2][0] is the first step
	//RECIPE[3] is an additional string
	var header = '<!doctype html><html style="font-family:helvetica;"><head></head><body>';
	
	// Title here
	var title = '<h1>' + RECIPE[0] + '</h1>'; // The title
	
	// Loop through the list of ingredients (RECIPE[1])
	var ingredients = '<ul>';

	for (i = 0; i < RECIPE[1].length; i++) { // Thru ingredients
		ingredients = ingredients + '<li>' + String(RECIPE[1][i]) + '</li>';
	}
	
	ingredients = ingredients + '</ul>';

	var memo = '<p>'+ RECIPE[0] +' changed my life. Thank god for ' + RECIPE[0]+'</p>'
	var footer = '</body></html>';
	var whole = header + title + ingredients + memo + footer;
	return whole
}

function isOpen(json) {
	var now = new Date();
	var day = now.getDay();
	var hour = now.getHours();
	var minute = now.getMinutes();


	if (json[day] == false) { // Closed all day today

		return false;

	}

	if (hour > json[day][0] && hour < json[day][1]) {
		return true;
	}

	return false;
}

function getClosingTime(json) {
	var now = new Date();
	var day = now.getDay();
	var hour = now.getHours();
	var minute = now.getMinutes();

	if (json[day] == false) { // Closed all day today

		return false;

	}

	if (hour > json[day][0] && hour < json[day][1]) {
		return json[day][1];
	}

	return false;
}




// Recipes page

function recipeList(json){
	var html = '<!doctype html><html style="font-family:helvetica;"><head></head><body><h1>List of our recipes!</h1><ul>';

	for (i = 0; i < Object.keys(json).length; i++){
		var recipeID = String(Object.keys(json)[i])
		var recipeTitle = json[recipeID][0];
		var href = '"/recipes/' + recipeID + '"';
		html += '<li><a href=' + href + '>' + recipeTitle + '</a></li>';
	}
	html += '</ul></body></html>'
	return html;
}

function sellingToday(foods) {
	var now = new Date();
	var day = now.getDay();
	var hour = now.getHours();
	var minute = now.getMinutes();

	var foodsToday = foods[day];
	var html = '<ul>';
	for (i = 0; i < foodsToday.length; i++) {
		var food = foodsToday[i];
		html += '<li>' + String(food) + '</li>'
	}
	html += '</ul>';
	return html;
}

function ulOfHours(hours) {
	
	var html = '<h3>These are our hours:</h3><ul>';

	if(hours[0]!==false){html += '<li> Sunday:' + hours[0][0] + ' to ' + hours[0][1] + '</li>';} else{html += '<li> Sunday: closed</li>';}
	if(hours[1]!==false){html += '<li> Monday:' + hours[1][0] + ' to ' + hours[1][1] + '</li>';} else{html += '<li> Monday: closed</li>';}
	if(hours[2]!==false){html += '<li> Tuesday:' + hours[2][0] + ' to ' + hours[2][1] + '</li>';} else{html += '<li> Tuesday: closed</li>';}
	if(hours[3]!==false){html += '<li> Wednesday:' + hours[3][0] + ' to ' + hours[3][1] + '</li>';} else{html += '<li> Wednesday: closed</li>';}
	if(hours[4]!==false){html += '<li> Thursday:' + hours[4][0] + ' to ' + hours[4][1] + '</li>';} else{html += '<li> Thursday: closed</li>';}
	if(hours[5]!==false){html += '<li> Friday:' + hours[5][0] + ' to ' + hours[5][1] + '</li>';} else{html += '<li> Friday: closed</li>';}
	if(hours[6]!==false){html += '<li> Saturday:' + hours[6][0] + ' to ' + hours[6][1] + '</li>';} else{html += '<li> Saturday: closed</li>';}


	html += '</ul>';
	return html;
}

function homePage(json) {
	var hours = json["hours"];
	var foods = json["foods"];
	var closing = getClosingTime(hours);
	if (closing == 12) {
		closing = "NOON";
	}
	if (closing > 12) {
		closing = closing - 12;
		closing = String(closing) + "PM";
	}
	if (closing < 12) {
		closing = String(closing) + "AM";
	}

	html = '<!doctype html><html style="font-family:helvetica;"><head></head><body><link href="https://image.flaticon.com/icons/png/128/714/714161.png" rel="shortcut icon">';
	if (isOpen(hours)) {

		
		html += '<h1>We are <a style="color:green;">OPEN</a> right now</h1>';
		html += '<h2>And we are selling: </h2>'
		html += sellingToday(foods);
		html += '<h2>Today we close at ' + closing +'</h2>'
		html += ulOfHours(hours);
	}
	else {
		html += '<h1>We are <a style="color:red;">CLOSED</a> right now</h1>';
		html += '<h2>Check out our hours!</h2>';
		html += ulOfHours(hours);
		// Add complete hours;
	}
	
	html += '<h2>Check out our <a style="color:blue;" href="/recipes">Recipes</a></h2>';
	return html;
}

// HOURS
readJSONFile('public/hours.json', function (err, json) {
  if (err){throw err;};
  
  app.get('/', function(req, res) {
  	res.send(homePage(json));
	var hours = json;

	if (isOpen(json)) {
		res.send("OPEN");
 	}
 	else {
 		res.send("We are closed.");
 	}

	});
});


// RECIPES
readJSONFile('public/data.json', function (err, json) {
  if(err){throw err;};

  app.get('/recipes', function(req, res) {
	// res.send("List of recipes here inside of readJSONfile");
	res.send(recipeList(json))
	});


  app.get('/recipes/:recipeID', function(req, res) {
	
	var recipe = json[req.params.recipeID];
	
	if (recipe == undefined){
		res.send("Recipe is undefined");
	} else {
		res.send(displayRecipe(recipe));
	}
 	

	});
});




app.listen(3000, () => console.log('Example app listening on port 3000!'))