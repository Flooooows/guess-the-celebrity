const WIKIDATA_SPARQL_URL = "https://query.wikidata.org/sparql";

let currentScore = 0;
let bestScore = 0;
let currentFigure = null;

// Récupérer une personnalité célèbre depuis WikiData
async function getHistoricalFigure() {
  const query = `
    SELECT ?person ?personLabel ?image
    WHERE {
      ?person wdt:P31 wd:Q5;  # Filtrer pour les êtres humains
              wdt:P106 wd:Q901;  # Occupation : scientifique
              wdt:P18 ?image.    # Avec une image disponible
      SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
    }
    LIMIT 500
  `;

  const url = `${WIKIDATA_SPARQL_URL}?query=${encodeURIComponent(query)}&format=json`;

  const response = await fetch(url);
  const data = await response.json();

  const results = data.results.bindings;

  if (!results || results.length === 0) {
    throw new Error("Aucune personnalité trouvée");
  }

  const randomIndex = Math.floor(Math.random() * results.length);
  const person = results[randomIndex];

  return {
    name: person.personLabel.value,
    image: person.image.value,
  };
}

// Afficher une personnalité célèbre
async function displayHistoricalFigure() {
  try {
    const figure = await getHistoricalFigure();
    currentFigure = figure;

    const photo = document.getElementById("historical-photo");
    const feedback = document.getElementById("feedback");
    const nameInput = document.getElementById("historical-name");

    photo.src = figure.image;
    photo.alt = `Personnalité : ${figure.name}`;

    nameInput.value = "";
    feedback.textContent = "";

    document.getElementById("validate-historical").onclick = () =>
      validateHistoricalFigure(figure);
    document.getElementById("skip-historical").onclick = () =>
      skipHistoricalFigure(figure);
  } catch (error) {
    const feedback = document.getElementById("feedback");
    feedback.textContent = "Erreur : Impossible de charger une personnalité.";
    feedback.style.color = "red";
    console.error("Erreur lors de l'affichage de la personnalité :", error);
  }
}

// Valider la réponse
function validateHistoricalFigure(figure) {
  const nameInput = document
    .getElementById("historical-name")
    .value.trim()
    .toLowerCase();
  const feedback = document.getElementById("feedback");

  if (normalizeString(nameInput) === normalizeString(figure.name)) {
    feedback.textContent = "Bonne réponse !";
    feedback.style.color = "green";

    currentScore++;
    if (currentScore > bestScore) {
      bestScore = currentScore;
    }
    document.getElementById("current-score").textContent = currentScore;
    document.getElementById("best-score").textContent = bestScore;

    setTimeout(displayHistoricalFigure, 1000);
  } else {
    feedback.textContent = `Faux ! C'était : ${figure.name}`;
    feedback.style.color = "red";

    currentScore = 0;
    document.getElementById("current-score").textContent = currentScore;

    setTimeout(displayHistoricalFigure, 1000);
  }
}

// Passer la personnalité
function skipHistoricalFigure(figure) {
  const feedback = document.getElementById("feedback");
  feedback.textContent = `Raté ! C'était : ${figure.name}`;
  feedback.style.color = "red";

  currentScore = 0;
  document.getElementById("current-score").textContent = currentScore;

  setTimeout(displayHistoricalFigure, 1000);
}

// Normaliser les chaînes
function normalizeString(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .toLowerCase();
}

// Initialiser la page
window.onload = displayHistoricalFigure;
