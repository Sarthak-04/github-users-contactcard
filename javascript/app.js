
var users = [],
	userNameArray = [];

/* add user to the list if the user doesn't already exist */
var addUserToList = function(gitUserName){
	var newUser;
	userNameArray = localStorage.getItem("ids");
	userNameArray = JSON.parse(userNameArray);
	if(userNameArray === undefined || userNameArray === null ) {
		userNameArray = new Array();
	}
	/*to check that user already doesn't exist*/
	if(userNameArray.indexOf(gitUserName) === -1) { 
		fetchUser(gitUserName);
	}
	else {
		console.log("user already listed");
	}
}

var addUser = function() {
	var userName = document.getElementById("search");
	userName = userName.value.toLowerCase().trim();
	addUserToList(userName);
	document.getElementById("search").value = "";
}

var iterateUsers = function() {
	var ids = localStorage.getItem("ids");
	if(ids === undefined || ids === null ) {
		return;
	}
	ids = JSON.parse("ids");
	for(var id = 0; id<ids.length; id++) {
		fetchUser(ids[id]);
	}
}

var fetchUser = function(userName) {
	var url;
	if (userName.length>0) {
		url = 'https://api.github.com/users/' + userName;
		fetch(url,{
			method: 'get'
		}).then(function(response) {
			if(!response.ok) {
				if(response.state === 404) {
					console.log("No such user found");
					return;
				}
				console.log("problem with reponse");
				return;
			}
			response.json().then(function(data) {
				if(data){
					userNameArray = localStorage.getItem("ids");
					userNameArray = JSON.parse(userNameArray);
					if(userNameArray === null) {
						userNameArray = new Array();
					}
					if(userNameArray.indexOf(userName) === -1) {
						userNameArray.push(userName.toLowerCase());
						localStorage.setItem("ids",JSON.stringify(userNameArray));
						
					}
					users.push(data);
					// check is table already exists ,if it exists append data to table else create table and add to it
					var text = "<td><a class=\"card\" href="+data.html_url+"><div class=\"container\"><div class=\"img-wrap\"><span class=\"close\" data-userName =\"" + data.login +" \" onclick=\"removeCard(event)\">&#10006;</span><img src="+ data.avatar_url+"></div><div class=\"content\"><h3><b>" + data.name +"</b></h3><li><label class=\"lab\"><b>Location:</b>" + data.location +"</label></li><li><label class=\"lab\"><b> Followers: </b>"+ data.followers+"</label></li></div></div></a></td>"
					$(".tableRow").append(text);
					return data;
				}
			});
		})
	}
}

var init = function() {
	userNameArray = localStorage.getItem("ids");
	userNameArray = JSON.parse(userNameArray); 
	if (userNameArray === null || userNameArray === undefined) {
		addUserToList("darkwing");
		addUserToList("codepo8");
		addUserToList("jeresig");
		addUserToList("nzakas");
		return;
	}
	for(var i = 0; i < userNameArray.length; i++){
		fetchUser(userNameArray[i]);
	}

}

/* sort users based on the property passes to sort in descending order send "-property" like "name" or "-name" */
var dynamicSort = function (property) {
	var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }

    return function (a,b) {
    	if(a[property] === null){
      		return 1;
    	}
	    else if(b[property] === null){
	      return -1;
	    }
	    else if(a[property] === b[property]){
	      return 0;
	    }
	    else {
	      return a[property] < b[property] ? -1*sortOrder : 1*sortOrder;
		}
    }
}

/* sorting used with select tag, when sort options are displayed in dropdown*/
var sortBy = function(value) {
	if(value === "1" ) {
		users = users.sort(dynamicSort("name"));

	}
	else if(value === "2") {
		users = users.sort(dynamicSort("-name"));

	}
	else if(value === "3") {
		users = users.sort(dynamicSort("location"));
	}
	else {
		users = users.sort(dynamicSort("-followers"));
	}
	displayUsers();
}

var sortByLocation = function() {
	users = users.sort(dynamicSort("location"));
	$("#sel")[0][0].selected = true; 
	displayUsers();
}

var sortByFollowers = function() {
	users = users.sort(dynamicSort("-followers"));
	$("#sel")[0][0].selected = true;
	displayUsers();
}

/* remove the existing table and append new users*/
var displayUsers = function() {
	$(".tableRow td").remove();
	for(var i = 0; i < users.length; i++) {
		var text = "<td><a class=\"card\" href="+users[i].html_url+"><div class=\"container\"><div class=\"img-wrap\"><span class=\"close\" data-userName =\"" + users[i].login +" \" onclick=\"removeCard(event)\">&#10006;</span><img src="+ users[i].avatar_url+"></div><div class=\"content\"><h3><b>" + users[i].name +"</b></h3><li><label class=\"lab\"><b>Location:</b>" + users[i].location +"</label></li><li><label class=\"lab\"><b> Followers: </b>"+ users[i].followers+"</label></li></div></div></a></td>";
		$(".tableRow").append(text);
	}
}

$('.followers').click(sortByFollowers);

$('.location').click(sortByLocation);

/*add user on Enter key press*/
$('#search').keypress(function (e) {
 var key = e.which;
 if(key == 13) {
    addUser();
    return false;  
  }
});  

function removeCard(e) {
	var login = e.currentTarget.getAttribute('data-username').trim(),
	index = userNameArray.indexOf(login.toLowerCase());
	if(index !== -1) { 
		userNameArray.splice(index,1);
		for(var i = 0; i < users.length; i++) {
			if(users[i].login === login) {
				users.splice(i,1);
				break;
			}
		}
	}

	localStorage.setItem("ids",JSON.stringify(userNameArray));
	displayUsers();
	e.preventDefault();
}