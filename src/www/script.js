const pages = {
    "home":document.getElementById("homePage"),
    "logIn":document.getElementById("logInPage"),
    "signUp":document.getElementById("signUpPage"),
    "game":document.getElementById("gamePage")
}
var currentPage = "game"
function displayCurrentPage(){
    for(const page in pages){
        if(page == currentPage){
            pages[page].style.display = "block";
        }
        else{
            pages[page].style.display = "none"
        }
    };
    return currentPage
}
displayCurrentPage()

function homePage(){
    currentPage = "home"
    displayCurrentPage()
}
function signUpPage(){
    currentPage = "signUp"
    displayCurrentPage()
}
function logInPage(){
    currentPage = "logIn"
    displayCurrentPage()
}
function gamePage(){
    currentPage = "game"
    displayCurrentPage()
    window.restart()
}









async function signUp(){
    const firstName = document.getElementById("firstName").value
    const lastName = document.getElementById("lastName").value
    const email = document.getElementById("email").value
    const password = document.getElementById("password").value
    const user = await fetch("/users", {
        method: "post",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password
        }),
        credentials:"include"
    })
    .then(r => r.json())
    .then(data => data.user)

    console.log(user)
    gamePage()
}

async function logIn(){
    const email = document.getElementById("loginEmail").value
    const password = document.getElementById("loginPassword").value
    const session = await fetch("/sessions", {
        method: "post",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email,
            password
        }),
        credentials:"include"
    })
    .then(r => r.json())
    .then(data => data.user)

    console.log(session)
    gamePage()
}