var fs = require("fs");

var profile_data = [];
var profile_iterator = 0;

var num_endorsements = 0;
var num_views = 0;

phantom.onError = function(msg, trace) {
  console.error('        PHANTOM ERROR: ' + msg);
};

var page = require('webpage').create();

page.viewportSize = {
  width: 1280,
  height: 800
};

page.onConsoleMessage = function(message){
  console.log(message);
};

page.onError = function(msg, trace){
  console.error('        PHANTOM ERROR: ' + msg);
};

page.onUrlChanged = function(url) {

  //execute the below callback on each DOM completion.
  page.evaluate(function(){
    document.addEventListener('DOMContentLoaded', function() {
      window.callPhantom('DOMContentLoaded');
    }, false);
  });

};

page.onCallback = function(type, extra){

  if(type === "scraped"){
    profile_data = extra;
    fs.write("names.json", JSON.stringify(profile_data), "w");
    console.log("Finished scraping your Contacts. The robot collected data on " + profile_data.length + " contacts.");
    console.log("The data has been saved in names.json, a file in the same folder as this script.");
  }

  if(type === "DOMContentLoaded"){
    //get page title on DOMContentLoaded.
    var title = page.evaluate(function(){
      return document.title;
    });

    console.log("Current page: " + title);

    //5 seconds wait on each page load. give the page some time to get its act together.
    setTimeout(function(){

      if(title.indexOf("Largest") > -1){
        // console.log("Now I'm on the login page...");

        //we're on the login page, so let's log in
        page.evaluate(function(){
          //logging in...
          console.log("Logging in...");

          var login_form = document.querySelector(".login-form");

          var login_email = login_form.querySelector("#login-email");
          var login_password = login_form.querySelector("#login-password");

          login_email.value = "[[LINKEDIN_USER_HERE]]";
          login_password.value = "[[LINKEDIN_PASS_HERE]]";

          login_form.submit.removeAttribute("disabled");
          login_form.submit.click();
        });

      } else if(title.indexOf("Welcome!") > -1){
        // console.log("Now I'm logged in...");

        var names_exists = fs.isFile("names.json");

        if(names_exists){
          console.log("Found names.json. Auto Endorser will now do what it does best... Endorse!");

          var names = fs.read("names.json");
          profile_data = JSON.parse(names);

          //go to the contacts page.
          page.evaluate(function(next_profile_url){
            //We're going to the contacts page now. We need to make sure the contacts are sorted correctly for the next bit to work.
            window.location = "https://www.linkedin.com/" + next_profile_url;
          }, profile_data[profile_iterator].url);

        } else {
          //no profile data. SCRAPE...
          console.log("names.json not found. Auto Endorser will read your contacts list now and generate one...");

          //go to the contacts page.
          page.evaluate(function(){
            //We're going to the contacts page now. We need to make sure the contacts are sorted correctly for the next bit to work.
            window.location = "https://www.linkedin.com/contacts/?sortOrder=first_name&";
          });

        }

      } else if(title.indexOf("Contacts") > -1){
        // console.log("Now I'm on the contacts page.");

        page.evaluate(function(){
          var names = document.querySelectorAll("h3.name a");

          console.log("Collecting links to all profiles in your Contacts... This might take a few minutes.");

          //Now we need to do some scroll magic. The LinkedIn contacts page loads contacts in batches of 10
          //Let's keep scrolling down until LinkedIn stops giving us new contacts.
          var matches = 0;
          var lastMatch = "";
          var expandList = setInterval(function(){

            //forcefully scroll to the bottom of the page. lol
            window.scrollTo(0, 9999999);

            var names = document.querySelectorAll(".contacts-list-view h3.name a");
            var name = names[names.length - 1].innerHTML.toLowerCase();

            //Basically, we continuously scan the last item in the list of contacts.
            //If we get the same contact like 10 times, then we have reached the end of the list (or LinkedIn are angry/internet is dead).
            if(name === lastMatch){
              matches += 1;
            } else {
              matches = 0;
              lastMatch = name;
            }

            //40 matches in a row = kill the loop.
            if(matches > 40){
              clearInterval(expandList);

              console.log("Contacts list scraped. Saving...");

              //forEach magic
              NodeList.prototype.forEach = Array.prototype.forEach;

              var profiles = [];

              //use the above names array (most up to date)
              names.forEach(function(person){
                var hyperlink = person.getAttribute("href").split("&")[0];

                profiles.push({
                  name: person.innerHTML,
                  url: hyperlink
                });
              });

              window.callPhantom("scraped", profiles);
            }

          }, 600);
        });

      } else if(title.indexOf(profile_data[profile_iterator].name > -1)){

        num_views += 1;

        var profile = profile_data[profile_iterator];

        if(profile !== undefined){
          console.log("Endorsing " + profile.name + "...");

          profile_iterator += 1;

          page.evaluate(function(next_profile_url, profile){
            var endorse_buttons = document.querySelectorAll(".endorse-item");

            for(var i = 0; i < endorse_buttons.length; i++){
              var current_skill = endorse_buttons[i];

              if(current_skill.classList.contains("endorsable")){
                console.log("Endorsed for the skill " + current_skill.querySelector(".endorse-item-name-text").innerHTML + ".");

                current_skill.querySelector(".endorse-button").click();
                break;
              }
            }

            setTimeout(function(){
              window.location = "https://www.linkedin.com/" + next_profile_url;
            }, 30000);

          }, profile_data[profile_iterator].url, profile.name);

        } else {
          console.log("Done.");
          console.log(profile_data.length + " profiles got the special treatment!");
        }

      }

    }, 5000);
  }

};

console.log("\n\n\n\nmade by @_F_R_E_E_M_A_N\n\n\n\n");

console.log("_____________________________\n\n\n LinkedIn robot... Activate! \n\n_____________________________\n\n")

page.open('http://linkedin.com', function(status){

});

//Just a little ping to make sure things are still alive.
setInterval(function(){
  console.log(".");
}, 1000);
