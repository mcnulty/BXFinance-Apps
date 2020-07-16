
    var relatedPerson = "";
    var accessToken = getAccessToken();
    
    // Set Username
    var usernameSub = parseJwt(accessToken);
    var usernameVal = usernameSub.Username;
    document.getElementById("username").innerHTML = usernameVal;
        var html = "<h1>My Related Person(s) Data</h1><table class=\"minimalistBlack\">";
  		// ----------- GET AT --------------------
        function getAccessToken() {
        let urlValue = window.location.href;
            let accessTokenPosition = urlValue.search("access_token");
            let tokenTypePosition = urlValue.search("&token_type");
            let accessTokenVal = urlValue.substring(accessTokenPosition + 13, tokenTypePosition);
            return accessTokenVal;
        }
        // ------- PARSE JWT ------ (thank you MDeller)
        function parseJwt(token) {
  			var base64Url = token.split('.')[1];
 			var base64 = base64Url.replace('-', '+').replace('_', '/');
  			return JSON.parse(window.atob(base64));
		}
       // ----------- MAKE API CALLS -------------- (modified code from MDeller)
         function exJax(method, url, callback, contenttype, payload) {
        console.log('@@@@@ Making AJAX call (' + url + ')');
            var authzHeader = "Bearer ".concat(accessToken);
            console.log('@@@@ url');
            $.ajax({
        url: url,
                method: method,
                dataType: 'json',
                contentType: contenttype,
                data: payload,
                beforeSend: function(xhr){
        xhr.setRequestHeader('Authorization', authzHeader);
                						},
                xhrFields: {
        withCredentials: false
                }
            })
                .done(function (data) {
        console.log('AJAX call succeeded');
                    console.log(data);
                    parseMyData(data);
                    //$(remyDiv).show();
                })
                .fail(function (data) {
        console.log('AJAX call failed');
					//$(remyDiv).hide();
                });
        }
        // ------ PARSE MY DATA -----
        function getMyOwnData() {
        console.log('@@@@@@@ inside of Get My Data');
            let payload = "";
            let baseURL = "https://authz.anycompany.org/scim/v2/Users?filter=uid%20eq%20%22";
            let accessTokenSub = parseJwt(accessToken);
            baseURL = baseURL.concat(accessTokenSub.Username);
            let baseURLMyData = baseURL.concat("%22");
            let checkNextStep = "";
            let contenttype = "";
            return exJax('GET', baseURLMyData, checkNextStep, contenttype, payload);
        }
        function parseMyData(myOwnData) {
        	var data = myOwnData;
        	var html = "<h1>My Data</h1><table class=\"minimalistBlack\">";
        	myArray = data.Resources[0];
        	Object.keys(myArray).forEach(function(key){
   				 var value = myArray[key];
   				 html += "<tr><td>";
    html += key;
   				 html += "</td>";
   				 html += "<td>";
        html += value;
   				 html += "</td></tr>";
				});
        	html += "</table>";
document.getElementById("myData").innerHTML = html;
// See if there are Related Persons Data to pull
if (myArray.anycompanyMyRelatedPersons) {
    console.log(myArray.anycompanyMyRelatedPersons.length);
    var numRelatedPersons = myArray.anycompanyMyRelatedPersons.length;
    for (var i = 0; i < numRelatedPersons; i++) {
        relatedPerson = myArray.anycompanyMyRelatedPersons[i].toString();
        var splitDN = relatedPerson.toString().split(",");
        var splitUID = splitDN[0].toString().split("=");
        relatedPerson = splitUID[1];
        if (relatedPerson) {
            getOthersData();
        }
        html += "</table>";
    }
}
        }
// ----------- MAKE OTHERS API CALLS --------------------
function exJaxOthersData(method, url, callback, contenttype, payload) {
    console.log('@@@@@ Making AJAX call (' + url + ')');
    var authzHeader = "Bearer ".concat(accessToken);
    console.log('@@@@ url');
    $.ajax({
        url: url,
        method: method,
        dataType: 'json',
        contentType: contenttype,
        data: payload,
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', authzHeader);
        },
        xhrFields: {
            withCredentials: false
        }
    })
        .done(function (data) {
            console.log('AJAX call succeeded');
            console.log(data);
            parseOthersData(data);
            //$(remyDiv).show();
        })
        .fail(function (data) {
            console.log('AJAX call failed');
            //$(remyDiv).hide();
        });
}
function getOthersData() {
    console.log('@@@@@@@ inside of Get Others Data::::::');
    let payload = "";
    let baseURL = "https://authz.anycompany.org/scim/v2/Users?filter=uid%20eq%20%22";
    let accessTokenSub = parseJwt(accessToken);
    baseURL = baseURL.concat(relatedPerson);
    let baseURLData = baseURL.concat("%22");
    let checkNextStep = "";
    let contenttype = "";
    return exJaxOthersData('GET', baseURLData, checkNextStep, contenttype, payload);
}
function parseOthersData(othersData) {
    var data = othersData;
    myArray = data.Resources[0];
    html += "<tr><td span=\"2\">##################################</td></tr>";
    Object.keys(myArray).forEach(function (key) {
        var value = myArray[key];
        html += "<tr><td>";
        html += key;
        html += "</td>";
        html += "<td>";
        html += value;
        html += "</td></tr>";
    });
    html += "<tr><td span=\"2\">##################################</td></tr>";
    document.getElementById("othersData").innerHTML = html;
}
$(document).ready(function () {
    getMyOwnData();
})

