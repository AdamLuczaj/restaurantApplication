function registerUser() {

    //Get the values in the textboxes.
    let usernameGiven = document.getElementById("username").value;
    let passwordGiven = document.getElementById("password").value;

    if (usernameGiven === "" || passwordGiven === "") {
        alert("You must enter values into all fields in order to register user.");
    }

    else {

        usernameGiven = usernameGiven.toLowerCase();
        passwordGiven = passwordGiven.toLowerCase();

        const requestBody = {
            username: usernameGiven,
            password: passwordGiven
        }

        let request = new XMLHttpRequest();

        request.onreadystatechange = function() {
            if(this.readyState==4 && this.status==200){
               
                alert("User Succesfully Added! Redirecting...");

                let templink = "/users/";
                let newlink = templink.concat(this.responseText);
                window.location.href = newlink;

            }
            if(this.readyState==4 && this.status==401){
                alert("User already exists.");
            }
        }

        request.open("POST", "/register", true);
        request.setRequestHeader("Content-Type", "application/json");
        request.send(JSON.stringify(requestBody));

    }

}

function login() {

    //Get the values in the textboxes.
    let usernameGiven = document.getElementById("username").value;
    let passwordGiven = document.getElementById("password").value;

    if (usernameGiven === "" || passwordGiven === "") {
        alert("You must enter values into all fields in order to log in.");
    }

    else {

        usernameGiven = usernameGiven.toLowerCase();
        passwordGiven = passwordGiven.toLowerCase();

        const requestBody = {
            username: usernameGiven,
            password: passwordGiven
        }

        let request = new XMLHttpRequest();

        request.onreadystatechange = function() {
            if(this.readyState==4 && this.status==200){
                
                alert("User Logged in! Redirecting...");

                let templink = "/users/";
                let newlink = templink.concat(this.responseText);
                window.location.href = newlink;

            }
            if(this.readyState==4 && this.status==401){
                alert("Invalid Credentials");
            }
        }

        request.open("POST", "/login", true);
        request.setRequestHeader("Content-Type", "application/json");
        request.send(JSON.stringify(requestBody));

    }

}

function updatePrivacy() {

    let privacyOption = document.getElementsByName("radio_selected");
    let privacyResult;

    //Used for the radio buttons.
    for (let element of privacyOption) {
        if (element.value === "1") {
            if (element.checked) {
                privacyResult = "Yes";
            }
        }
        if (element.value === "2") {
            if (element.checked) {
                privacyResult = "No";
            }
        }
    }

    if (privacyResult != "Yes" && privacyResult != "No") {
        alert("Was not able to update privacy because an option was not selected.")
    }

    else{

        const requestBody = {
            privacy: privacyResult
        }
        
        let request = new XMLHttpRequest();
    
        request.onreadystatechange = function() {
            if(this.readyState==4 && this.status==200){
                alert("Successfully updated user privacy!");
            }
        }
    
        request.open("PUT", "/user", true);
        request.setRequestHeader("Content-Type", "application/json");
        request.send(JSON.stringify(requestBody));

    }
    
}