const url = "https://pocketbase.tameraktas.de/"
const client = new PocketBase(url);
var currentKey;
var ownKeys;

async function checkLoginStatus() {
    if (!client.authStore.isValid) {
        location.href = "index.html";
    }
}

async function checkAlreadyLoggedIn() {
    if (client.authStore.isValid) {
        location.href = "overview.html";
    }
}

async function validateLogin() {
    var nutzername = document.getElementById("nutzername").value;
    var passwort = document.getElementById("passwort").value;
    if (!nutzername || !passwort) {
        console.log("Login invalid! Test");
    } else {
        const authData = await client.collection('users').authWithPassword(nutzername, passwort);
        location.href = "overview.html";
    }
}

async function setMitarbeiterName() {
    document.getElementById("welcomeMessage").innerHTML = "Hey " + client.authStore.model.firstName;
}

async function getKeyInformation() {
    let searchValue = document.getElementById("searchValue").value;
    let searchQuery = "keyNumber=" + searchValue;
    let data = await client.collection("keys").getFirstListItem(searchQuery);
    currentKey = data;
    displaySearchedKey();
}

async function displaySearchedKey() {
    checkOwnerKey();
    document.getElementById("keyID").innerHTML = "Schlüssel-Nr: " + currentKey.keyNumber;
    document.getElementById("hersteller").innerHTML = "Hersteller: " + currentKey.autohersteller;
    document.getElementById("modell").innerHTML = "Modell: " + currentKey.automodell;
    document.getElementById("FIN").innerHTML = "FIN: " + currentKey.fin;
}

async function checkOwnerKey() {
    for (let i = 0; i < ownKeys.length; i++) {
        if (ownKeys[i].keyNumber == currentKey.keyNumber) {
            document.getElementById("besitzerKey").innerHTML = "Du bist Besitzer dieses Schlüssels!";
            break;
        } else {
            document.getElementById("besitzerKey").innerHTML = "Der Schlüssel gehört nicht dir!"
        }
    }
}

function displayOwnKeys() {
    const parentElement = document.getElementById("myKeys");
    parentElement.innerHTML = "";
    for (let i = 0; i < ownKeys.length; i++) {
        const newDiv = document.createElement("div");
        newDiv.classList.add("box", "has-background-grey-lighter");
        const newP1 = document.createElement("p");
        const newP2 = document.createElement("p");
        const newP3 = document.createElement("p");
        const newP4 = document.createElement("p");
        newP1.textContent = "Schlüssel-Nr: " + ownKeys[i].keyNumber;
        newP2.textContent = "Hersteller: " + ownKeys[i].autohersteller;
        newP3.textContent = "Modell: " + ownKeys[i].automodell;
        newP4.textContent = "FIN: " + ownKeys[i].fin;
        newDiv.appendChild(newP1);
        newDiv.appendChild(newP2);
        newDiv.appendChild(newP3);
        newDiv.appendChild(newP4);
        parentElement.appendChild(newDiv);
    }
}

async function getOwnerKeys() {
    let searchQuery = "keyOwner = '" + client.authStore.model.id + "'";
    let data = await client.collection("keys").getFullList(200, {
        filter: searchQuery,
    });
    ownKeys = data;
    displayOwnKeys()
}

function switchView() {
    if (document.getElementById("keysView").classList.contains("is-hidden")) {
        document.getElementById("infoView").classList.add("is-hidden");
        document.getElementById("keysView").classList.remove("is-hidden");
    }
    else if (document.getElementById("infoView").classList.contains("is-hidden")) {
        document.getElementById("keysView").classList.add("is-hidden");
        document.getElementById("infoView").classList.remove("is-hidden");
    }
}


