const bouton = document.querySelector("#rechercher");
const nomVille = document.querySelector("#ville");
const temperature = document.querySelector("#temperature");
const description = document.querySelector("#description");
const humidite = document.querySelector("#humidite");
const vent = document.querySelector("#vent");
const messageErreur = document.querySelector("#message-erreur");

const champRecherche = document.querySelector("#entree");
const iconMeteo = document.querySelector("#icone-meteo");
const historiqueVilles = document.querySelector("#historique-villes");
const cartesPrevisions = document.querySelector("#cartes-previsions");

const API_cle="66b8aca338969de4c98cc98c4cc7728c";
const historique = JSON.parse(localStorage.getItem("historique")) || [];


bouton.addEventListener("click", async () => {
        rechercherMeteo(champRecherche.value.trim());

});

function afficherHistorique(){
    historiqueVilles.innerHTML = "";
    historique.forEach(ville => {
        const btnTags=document.createElement("button");
        btnTags.textContent=ville;

        btnTags.addEventListener("click",()=>{
            champRecherche.value=ville;
            rechercherMeteo(ville);
        });
        historiqueVilles.append(btnTags);
    });
}
afficherHistorique();
async function rechercherMeteo(ville) {
    try {
        messageErreur.textContent = "";

        if (ville === "") {
            throw new Error("Veuillez entrer une ville.");
        }

        const url = `https://api.openweathermap.org/data/2.5/weather?q=${ville}&appid=${API_cle}&units=metric&lang=fr`;

        const reponse = await fetch(url);

        if (!reponse.ok) {
            if (reponse.status === 404) {
                throw new Error("Ville introuvable.");
            }

            throw new Error("Une erreur est survenue.");
        }

        const data = await reponse.json();

        historique.push(data.name);

        if (historique.length > 5) {
            historique.shift();
        }

        localStorage.setItem("historique", JSON.stringify(historique));

        nomVille.textContent = data.name;
        temperature.textContent = `${Math.round(data.main.temp)} °C`;
        description.textContent = data.weather[0].description;
        humidite.textContent = `${data.main.humidity} %`;
        vent.textContent = `${data.wind.speed} m/s`;

        iconMeteo.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        iconMeteo.alt = data.weather[0].description;

        const urlPrevision = `https://api.openweathermap.org/data/2.5/forecast?q=${ville}&appid=${API_cle}&units=metric&lang=fr`;

        const reponsePrevision = await fetch(urlPrevision);

        if (!reponsePrevision.ok) {
            throw new Error("Impossible de récupérer les prévisions.");
        }

        const dataPrevision = await reponsePrevision.json();
       

const jours = [];

const previsions = dataPrevision.list.filter(prevision => {
    const date = new Date(prevision.dt * 1000);
    const jour = date.toLocaleDateString("fr-FR");
    if (!jours.includes(jour)) {
        jours.push(jour);
        return true;
    }
    return false;});

        afficherPrevisions(previsions);
        afficherHistorique();

    } catch (erreur) {
        messageErreur.textContent = erreur.message;
    }
}
function afficherPrevisions(previsions) {
    cartesPrevisions.innerHTML = "";

    previsions.forEach(prevision => {
        const date = new Date(prevision.dt * 1000);

        const carte = document.createElement("article");

        carte.innerHTML = `
            <h3>${date.toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long"
            })}</h3>

            <img src="https://openweathermap.org/img/wn/${prevision.weather[0].icon}@2x.png"alt="${prevision.weather[0].description}">

            <p>${Math.round(prevision.main.temp)} °C</p>

            <p>${prevision.weather[0].description}</p>

            <p>${prevision.main.humidity}%</p>
        `;

        cartesPrevisions.append(carte);
    });
}



