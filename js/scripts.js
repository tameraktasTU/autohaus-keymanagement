const url = "https://pocketbase.tameraktas.de/"
const client = new PocketBase(url);
var transferButton = document.getElementById("transferButton");
var currentKey;
var ownKeys;
var ownFahrten;

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

async function getOwnerKeys() {
    let searchQuery = "keyOwner = '" + client.authStore.model.id + "'";
    let data = await client.collection("keys").getFullList({
        filter: searchQuery,
    });
    ownKeys = data;
    displayOwnKeys()
}

async function getKeyInformation() {
    let searchValue = document.getElementById("searchValue").value;
    let searchQuery = "keyNumber=" + searchValue;
    try {
        let data = await client.collection("keys").getFirstListItem(searchQuery);
        currentKey = data;
        displaySearchedKey();
        showTransferButtons()
    } catch (error) {
        console.log("Fehler bei Keysuche");
    }
}

async function showTransferButtons() {
    for (let i = 0; i < ownKeys.length; i++) {
        if (ownKeys[i].keyNumber == currentKey.keyNumber) {
            transferButton.innerHTML = "Rückgabe";
            transferButton.classList.remove("is-hidden");
            transferButton.onclick = function () { updateKeyOwner("k1cc8v1cu2measz"); };
            break;
        } else {
            transferButton.innerHTML = "Zuweisen";
            transferButton.classList.remove("is-hidden");
            transferButton.onclick = function () { updateKeyOwner(client.authStore.model.id); };
        }
    }
}

async function updateKeyOwner(newOwner) {
    let data = {
        "keyOwner": newOwner
    }
    await client.collection("keys").update(currentKey.id, data);
    await getOwnerKeys();
    displaySearchedKey();
    showTransferButtons();
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

async function getOwnFahrten() {
    let searchQuery = "fahrer = '" + client.authStore.model.id + "'";
    let data = await client.collection('fahrten').getFullList(200, {
        searchQuery
    });
    ownFahrten = data;
    displayOwnFahrten();
}

function displayOwnFahrten() {
    const parentElement = document.getElementById("myFahrten");
    parentElement.innerHTML = "";
    for (let i = 0; i < ownFahrten.length; i++) {

        const datum = new Date(ownFahrten[i].datum);

        const newDiv = document.createElement("div");
        newDiv.classList.add("box", "has-background-grey-lighter");

        const newP1 = document.createElement("p");
        newP1.classList.add("is-size-6")
        const newP2 = document.createElement("p");
        newP2.classList.add("is-size-5", "has-text-weight-bold");
        const newP3 = document.createElement("p");
        newP3.classList.add("is-size-5");

        const newP4 = document.createElement("p");
        newP1.textContent = datum.toLocaleDateString("de-DE");
        newP2.textContent = ownFahrten[i].abfahrtsOrt + " > " + ownFahrten[i].ankunftsOrt;
        newP3.textContent = ownFahrten[i].kennzeichen + " | " + ownFahrten[i].distanz + "km";
        //newP4.textContent = "FIN: " + ownFahrten[i].fin;
        newDiv.appendChild(newP1);
        newDiv.appendChild(newP2);
        newDiv.appendChild(newP3);
        //newDiv.appendChild(newP4);
        parentElement.appendChild(newDiv);
    }
}

// Display functions for App-Bar

var keysTab = document.getElementById("keysTab");
var keysView = document.getElementById("keysView");
var infoTab = document.getElementById("infoTab")
var infoView = document.getElementById("infoView");
var fahrtenTab = document.getElementById("fahrtenTab");
var fahrtenView = document.getElementById("fahrtenView");

function displayKeysPage() {
    if (keysView.classList.contains("is-hidden")) {
        checkLoginStatus();
        getOwnerKeys();
        keysTab.classList.add("is-active");
        fahrtenView.classList.add("is-hidden");
        infoView.classList.add("is-hidden");
        keysView.classList.remove("is-hidden");
        infoTab.classList.remove("is-active");
        fahrtenTab.classList.remove("is-active");
    }
}

function displayInfoPage() {
    if (infoView.classList.contains("is-hidden")) {
        checkLoginStatus();
        infoTab.classList.add("is-active");
        fahrtenView.classList.add("is-hidden");
        keysView.classList.add("is-hidden");
        infoView.classList.remove("is-hidden");
        keysTab.classList.remove("is-active");
        fahrtenTab.classList.remove("is-active");
    }
}

function displayFahrtenPage() {
    if (fahrtenView.classList.contains("is-hidden")) {
        checkLoginStatus();
        getOwnFahrten();
        fahrtenTab.classList.add("is-active");
        infoView.classList.add("is-hidden");
        keysView.classList.add("is-hidden");
        fahrtenView.classList.remove("is-hidden");
        infoTab.classList.remove("is-active");
        keysTab.classList.remove("is-active");
    }
}