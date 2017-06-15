(function (global) {
	console.log('Executed main');
	var homeurl = "snippets/home-snippet.html";
	var listrecipesurl = "../resources/recipes/listrecipes.json";
	var recipeBaseUrl = "../resources/recipes/";
	var recipeTileSnippet = "snippets/recipetile.html";
	var recipeItemSnippet = "snippets/recipe.html";
	
	// namespace
	var recipes = {};

	/* Insert the html as selector.innerHtml */
	var insertHtml = function(selector, html) {
		var elem = document.querySelector(selector);
		elem.innerHTML = html;
	}

	/* Replace occurences of propName with propValue in the input String */
	var insertProperty = function (string, propName, propValue) {
	  var propToReplace = "{{" + propName + "}}";
	  string = string
	    .replace(new RegExp(propToReplace, "g"), propValue);
	  return string;
	}

	/* Show the loading icon in the given html selector*/
	var showLoading = function(selector) {
		var loadingIcon = "images/ajax-loader.gif";
		var loadingHtml = "<div class='text-center'>"
		loadingHtml +="<img src='" + loadingIcon+"'/></div>";
		insertHtml(selector, loadingHtml);
	}

	var displayRecipes = function(recipes, recipeHtml) {
		var finalHtml = "<section class='row'>";
		for (var i = 0; i < recipes.length; i++) {
			console.log('recipe: ' + i);
			var name = recipes[i].name;
			var image = recipes[i].img_name;
			var recipeId = recipes[i].id;
			var tmpRecipeHtml = recipeHtml;
			tmpRecipeHtml = insertProperty(tmpRecipeHtml, "name", name);
			tmpRecipeHtml = insertProperty(tmpRecipeHtml, "img_name", image);
			tmpRecipeHtml = insertProperty(tmpRecipeHtml, "id", recipeId);
			finalHtml += tmpRecipeHtml;
		}
		finalHtml += "</section>";
		console.log(finalHtml);
		insertHtml("#main-content", finalHtml);
	}

	var buildAndShowRecipes = function(recipes) {
		$.ajax(
			{
				url: recipeTileSnippet,
				dataType: "html",
				success: function(result, status) {
					console.log('got recipe tile snippet');
					displayRecipes(recipes, result);
				}
			});
	}

	// ------- Recipe Item html display functions ------ 
	var buildAndShowRecipeDetails = function(recipe) {
		console.log('making request to:'+ recipeItemSnippet + ' for recipe:');
		console.log(recipe);
		$.ajax({
			url:recipeItemSnippet,
			dataType: "html",
			success: function(result, status) {
				console.log('got recipe item html: ' + result);
				displayRecipe(recipe, result);
			}
		});
	}
	var displayRecipe = function(recipe, recipeSnippet) {
		var ingredients = recipe.ingredients;
		var directions = recipe.directions;
		var ingredientsHtml = buildIngredientsHtml(ingredients);
		console.log(ingredientsHtml);
		var directionsHtml = buildDirectionsHtml(directions);
		console.log(directionsHtml);
		var tmpRecipeHtml = recipeSnippet;
		tmpRecipeHtml = insertProperty(tmpRecipeHtml, "name", recipe.name);
		tmpRecipeHtml = insertProperty(tmpRecipeHtml, "img_name", recipe.img_name);
		tmpRecipeHtml = insertProperty(tmpRecipeHtml, "ingredients", ingredientsHtml);
		tmpRecipeHtml = insertProperty(tmpRecipeHtml, "directions", directionsHtml);
		console.log('Final html for recipe');
		console.log(tmpRecipeHtml);
		insertHtml("#main-content", tmpRecipeHtml);
	}
	var buildIngredientsHtml = function(ingredients) {
		var ingredientsHtml = "<ul>";
		for(var i = 0 ; i < ingredients.length; i++) {
			var ingredientFormatted = "<b>"+ingredients[i].quantity + "</b>   " + ingredients[i].name;
			ingredientsHtml += "<li>" + ingredientFormatted + "</li>";
		}	
		ingredientsHtml += "</ul>"
		return ingredientsHtml;
	}
	var buildDirectionsHtml = function(directions) {
		var directionsHtml = "<ol>";
		for(var i = 0 ; i < directions.length; i++) {
			directionsHtml += "<li>" + directions[i].description + "</li>"
		}	
		directionsHtml += "</ol>"
		return directionsHtml;
	}

	recipes.loadRecipe = function(recipeid) {
		showLoading("#main-content");
		var requestUrl = recipeBaseUrl + recipeid + ".json";
		console.log('getting recipe from url: ' + requestUrl);
		$.ajax({
			url: requestUrl,
			dataType: "json",
			success: function(result, status) {
				console.log('got recipe: ' + result);
				buildAndShowRecipeDetails(result);
			},
			error: function(xhr, status, error) {
				console.log('Error: ' + error);
				console.log('--- most likely, recipe does not exist: ' + requestUrl);
			}
		});
	}

	// Main function to be executed on load (before images or css loads)
	document.addEventListener("DOMContentLoaded", function(event){
		console.log('showing loading icon');
		showLoading("#main-content");

		$.ajax({
			url: listrecipesurl,
			dataType: "json",
			success: function(result, status) {
				console.log('done loading list of recipes');
				console.log(result);
				buildAndShowRecipes(result);
			},
			error: function(xhr, options, error) {
				console.log('error loading list of recipes');
				var errorHtml = "<div class='bg-danger'>There was an error loading recipes</div>"
				insertHtml("#main-content", errorHtml)
				console.log(error);
			}
		});
	});

	global.$recipes = recipes;

})(window);