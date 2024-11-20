const API_KEY = "VOTRE_CLE_API_TMDB"; // Remplacez par votre clé API TMDb
const BASE_URL = "https://api.themoviedb.org/3";

let currentScore = 0;
let bestScore = 0;
let currentCharacter = null;

// Récupère un personnage aléatoire de dessins animés
async function getRandomCartoonCharacter() {
  const randomPage = Math.floor(Math.random() * 10) + 1; // Pages 1 à 10 pour plus de diversité
  const response = await fetch(
    `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=16&language=fr&page=${randomPage}`
  ); // Genre 16 = Animation
  const data = await response.json();

  if (data.results.length === 0) {
    return getRandomCartoonCharacter(); // Relancer si aucun résultat
  }

  // Choisir un film d'animation au hasard
  const randomIndex = Math.floor(Math.random() * data.results.length);
  return data.results[randomIndex];
}

// Affiche un personnage aléatoire
async function displayCartoonCharacter() {
  const character = await getRandomCartoonCharacter();
  currentCharacter = character;

  const photo = document.getElementById("cartoon-photo");
  const feedback = document.getElementById("feedback");
  const nameInput = document.getElementById("cartoon-name");

  // Afficher la photo du film
  if (character.poster_path) {
    photo.src = `https://image.tmdb.org/t/p/w500${character.poster_path}`;
    photo.alt = `Film : ${character.title}`;
  } else {
    photo.src = "default-character.jpg"; // Image par défaut si aucune image n'est disponible
    photo.alt = "Image non disponible";
  }

  // Réinitialiser l'input et le feedback
  nameInput.value = "";
  feedback.textContent = "";
}

// Gère la validation de la réponse
function validateCartoonCharacter() {
  const nameInput = document.getElementById("cartoon-name").value.trim().toLowerCase();
  const feedback = document.getElementById("feedback");

  if (nameInput === currentCharacter.title.toLowerCase()) {
    feedback.textContent = "Bonne réponse !";
    feedback.style.color = "green";

    currentScore++;
    if (currentScore > bestScore) {
      bestScore = currentScore;
    }

    document.getElementById("current-score").textContent = currentScore;
    document.getElementById("best-score").textContent = bestScore;

    setTimeout(displayCartoonCharacter, 1000);
  } else {
    feedback.textContent = `Faux ! C'était : ${currentCharacter.title}`;
    feedback.style.color = "red";

    currentScore = 0;
    document.getElementById("current-score").textContent = currentScore;

    setTimeout(displayCartoonCharacter, 1000);
  }
}

// Gère le bouton "Passer"
function skipCartoonCharacter() {
  const feedback = document.getElementById("feedback");

  feedback.textContent = `Raté ! C'était : ${currentCharacter.title}`;
  feedback.style.color = "red";

  currentScore = 0;
  document.getElementById("current-score").textContent = currentScore;

  setTimeout(displayCartoonCharacter, 1000);
}

// Initialisation des événements
document.getElementById("validate-cartoon").onclick = validateCartoonCharacter;
document.getElementById("skip-cartoon").onclick = skipCartoonCharacter;

// Charger le premier personnage
displayCartoonCharacter();
