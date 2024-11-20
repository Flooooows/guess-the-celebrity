const WIKIPEDIA_API_URL = "https://en.wikipedia.org/w/api.php";
let currentScore = 0;
let bestScore = 0;
let currentFigure = null;

// Récupérer un personnage historique avec des mots-clés
async function getHistoricalFigure() {
  const url = `${WIKIPEDIA_API_URL}?action=query&format=json&list=search&srsearch=historical figure|biography&srnamespace=0&prop=pageimages|extracts&piprop=original&pilimit=1&exchars=200&exintro&explaintext&origin=*`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data.query.search || data.query.search.length === 0) {
    return getHistoricalFigure(); // Relancer si aucun résultat trouvé
  }

  // Récupérer un article aléatoire parmi les résultats
  const randomIndex = Math.floor(Math.random() * data.query.search.length);
  const searchResult = data.query.search[randomIndex];
  const pageTitle = searchResult.title;

  // Faire une requête pour obtenir les détails de la page
  const detailsUrl = `${WIKIPEDIA_API_URL}?action=query&format=json&titles=${encodeURIComponent(
    pageTitle
  )}&prop=pageimages|extracts&piprop=original&exchars=200&exintro&explaintext&origin=*`;

  const detailsResponse = await fetch(detailsUrl);
  const detailsData = await detailsResponse.json();

  const page = Object.values(detailsData.query.pages)[0];

  // Vérifier si la page contient une image
  if (!page.original || !page.original.source) {
    return getHistoricalFigure(); // Relancer si aucune image trouvée
  }

  return {
    name: page.title,
    image: page.original.source,
    description: page.extract,
  };
}

// Afficher un personnage historique
async function displayHistoricalFigure() {
  try {
    const figure = await getHistoricalFigure();
    currentFigure = figure;

    const photo = document.getElementById("historical-photo");
    const feedback = document.getElementById("feedback");
    const nameInput = document.getElementById("historical-name");

    // Afficher l'image et le résumé du personnage
    photo.src = figure.image;
    photo.alt = `Personnage historique : ${figure.name}`;

    // Réinitialiser l'input et le feedback
    nameInput.value = "";
    feedback.textContent = "";

    // Associer les événements de clics aux boutons
    document.getElementById("validate-historical").onclick = () =>
      validateHistoricalFigure(figure);
    document.getElementById("skip-historical").onclick = () =>
      skipHistoricalFigure(figure);
  } catch (error) {
    console.error("Erreur lors de l'affichage du personnage :", error);
    displayHistoricalFigure(); // Relancer si une erreur survient
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

// Passer le personnage
function skipHistoricalFigure(figure) {
  const feedback = document.getElementById("feedback");
  feedback.textContent = `Raté ! C'était : ${figure.name}`;
  feedback.style.color = "red";

  currentScore = 0;
  document.getElementById("current-score").textContent = currentScore;

  setTimeout(displayHistoricalFigure, 1000);
}

// Normaliser les chaînes pour comparer les réponses
function normalizeString(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Supprimer les accents
    .replace(/[^a-zA-Z0-9 ]/g, "") // Supprimer les caractères spéciaux
    .toLowerCase();
}

// Initialiser la page
window.onload = displayHistoricalFigure;
