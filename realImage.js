var permissions = require('./permissions.js')
var fs = require('fs');
const readline = require('readline');

var contents = fs.readFileSync("cities.csv").toString();
contents = contents.toLowerCase();
const reader = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});
var newRule = {};
var distributorName = "";
var superdist = "";
var rule = [];
console.log(permissions);
var promptSelection = function(){
reader.question("\nSelect:\n 1) Give permission\n 2) Check Permission\n 3) Show Current Permissions \n", function(response){
	var selection = response;
	if(selection === '1'){
		givePermission();
	} else if(selection === "2"){
		checkPermission();
	}else if(selection === "3"){
		console.log(permissions);
		promptSelection();
	}else{
		console.log("invalid selection");
		promptSelection();
	}
});
}
var checkPermission = function(){
	var distributor = "";
	var region = "";
	reader.question("\nEnter distributor name?", function(response){
		distributor = response;
		if(permissions[distributor] === undefined){
			console.log("No Such distributor");
			checkPermission();
		}else{
			reader.question("\nEnter the region to check permissions for\n", function(regionResponse){
				region = regionResponse;
				var includeResponse = checkInIncludeArray(region, distributor, "INCLUDE");
				var excludeResponse = checkExcludeArray(region, distributor, "EXCLUDE");
				if(includeResponse && excludeResponse){
					console.log("YES", distributor, "is Authozized")
				}else{
					console.log("NO", distributor, "is Not Authozized")

				}
				promptSelection();
			})
		}
	});	
}
var givePermission = function(){
	reader.question("\nEnter distributor name?", function(response){
		var distributors = response.split("<");
		var superdist = "";
		distributorName = distributors[0];
		permissions[distributorName] = {
			INCLUDE:[],
			EXCLUDE: []
		}
		if(distributors.length> 2){
			console.log("Please Enter Only One Super Distributor");
			givePermission();
			return;
		} else if(distributors.length> 1 && distributors[1] === distributors[0]){
			console.log("Sub distributor and super distributor cannot be same");
			givePermission();
			return;
		} else if(distributors.length> 1 && permissions[distributors[1]] === undefined){
			console.log("Super user", distributors[1], "does not exist");
			givePermission();
			return;
		} else if(distributors.length > 1){
				superdist = distributors[1];
				permissions[distributorName].superDistributor = superdist;
		} else{
				superdist = "";
				permissions[distributorName].superDistributor = false;
		}
		if(distributors.length> 1) console.log("\nEnter New Permission for", distributors[0]+"<"+superdist,"(leave the permission empty and press enter to view main menu)");
		else console.log("Enter New Permission for ", distributors[0]);
		reader.on("line", function(command){
			if(command === ""){
				promptSelection();
			}else{
				validateRule(command, distributorName, superdist);
				if(distributors.length> 1) console.log("\nEnter New Permission for", distributors[0]+"<"+superdist,"(leave the permission empty and press enter to view main menu)");
				else console.log("\nEnter New Permission for ", distributors[0],"(leave the permission empty and press enter to view main menu)");
			}
		})
	});
}

var validateRule = function(rule, distName, superdist){
	var typeOfRule = rule.split(":")[0];
	var region = rule.split(":")[1];
	if(region === undefined){
		console.log("Invalid Permission Format\n Follow Below Format:\n include:city,state,country \n exclude:city,state,country ");
		return;
	}
	if(contents.indexOf(region.trim().toLowerCase())<0){
		console.log(region, " is not a Valid Region");
		return;
	}
	if(typeOfRule.toLowerCase() === "include"){
		// include permission
		if(superdist !== ""){
			if(checkInSuper(region, distName)){
				(permissions[distName][typeOfRule.toUpperCase()]).push(region.toLowerCase());
				console.log("Incude Permission added successfully");
			}else{
				console.log("Permission not added")
			}
		} else{
			(permissions[distName][typeOfRule.toUpperCase()]).push(region.toLowerCase());
			console.log("Include Permission added successfully");
		}
	} else if(typeOfRule.toLowerCase() === "exclude"){
		if(checkInIncludeArray(region.split(',').slice(1, region.length).join(','), distName, 'include')){
			(permissions[distName][typeOfRule.toUpperCase()]).push(region.toLowerCase())
			console.log("Exclude Permission added successfully");
		}else{
			console.log("Distributor is already not Authorized for this location")
		}
	}else{
		console.log("Invalid Permission");
	}
		// console.log(permissions)
}
 
var checkInSuper = function(region, dist){
	// console.log("region->", region, "distributor", dist);
	var includecheck = checkInIncludeArray(region, permissions[dist].superDistributor, "INCLUDE");
	// console.log("permission for including ",includecheck);
	var excludecheck = checkExcludeArray(region, dist, "EXCLUDE");
	// console.log("permission for excluding ",excludecheck);
	

	if(includecheck && excludecheck){
		return true;
	}else{
		console.log("")
	}
	return false;
}
var checkInIncludeArray = function(region, superdist, typeOfRule){
	regionReceved = region;
	region = region.split(",");
	for(var i=region.length-1; i>=0; i--){
		var ruleToCheck = region.slice(i, region.length).join(",");
		// console.log("-----------------checking for include","in diist-", superdist,  ruleToCheck,  permissions[superdist][typeOfRule.toUpperCase()] );
		if(permissions[superdist][typeOfRule.toUpperCase()].indexOf(ruleToCheck.toLowerCase()) >= 0){
			// console.log("---------result in loop", "true");
			return true;
		} else{
			// console.log("continue")
			continue;
		}
	}
	// if(permissions[superdist].superDistributor !== false){
	// 	console.log("going to super dist")
	// 	return checkInIncludeArray(regionReceved, permissions[superdist].superDistributor, typeOfRule)
	// 	// return true;
	// }else{
	// 	console.log("---------result in loop", "false");
	// 	return false;
	// }
		return false;
}
var checkExcludeArray = function(region, superdist, typeOfRule){
	// console.log("exclude array", region)
	region = region.split(",");

	for(var i=0; i< region.length; i++){
		var ruleToCheck = region.slice(i, region.length).join(",");
		// console.log("-----------------checking for exclude", ruleToCheck,permissions[superdist][typeOfRule.toUpperCase()] );
		if(permissions[superdist][typeOfRule.toUpperCase()].indexOf(ruleToCheck.toLowerCase()) >= 0){
			// console.log("---------result in loop", "excuded");
			return false;
		} else{
			// console.log("---------result in loop", "NOT excluded");
			continue;
		}
	}
	if(permissions[superdist].superDistributor !== false){
		// console.log("going to super dist")
		return checkExcludeArray(regionReceved, permissions[superdist].superDistributor, typeOfRule)
		// return true;
	}else{
		// console.log("---------result in loop", "false");
		return true;
	}
	return true;
}



promptSelection();