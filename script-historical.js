const WIKIPEDIA_API_URL = "https://en.wikipedia.org/w/api.php";
let currentScore = 0;
let bestScore = 0;
let currentFigure = null;

// Récupérer un personnage historique aléatoire
async function getHistoricalFigure() {
  const url = `${WIKIPEDIA_API_URL}?action=query&format=json&generator=random&grnnamespace=0&prop=pageimages|extracts&exchars=200&exintro&explaintext&piprop=original&origin=*`;

  const response = await fetch(url);
  const data = await response.json();

  const pages = data.query.pages;
  const pageId = Object.keys(pages)[0];
  const figure = pages[pageId];

  // Vérifier si le personnage a une image
  if (!figure.original || !figure.original.source) {
    return getHistoricalFigure(); // Relancer si aucune image disponible
  }

  return {
    name: figure.title,
    image: figure.original.source,
    description: figure.extract,
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
