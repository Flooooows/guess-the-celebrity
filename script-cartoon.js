const TMDB_API_KEY = '3b83d7e84184de7b5a516f19e3b7ba22'; // Remplacez par votre clé API TMDb
const BASE_URL = 'https://api.themoviedb.org/3';

let currentScore = 0;
let bestScore = 0;

// Rechercher un personnage de film d'animation aléatoire
async function getRandomCartoonCharacter() {
  const randomPage = Math.floor(Math.random() * 10) + 1; // Pages 1 à 10
  const response = await fetch(
    `${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=16&language=fr&page=${randomPage}`
  ); // Genre 16 = Animation
  const data = await response.json();

  if (data.results.length === 0) {
    return getRandomCartoonCharacter(); // Relancer si aucun résultat trouvé
  }

  // Choisir un film d'animation aléatoire
  const randomIndex = Math.floor(Math.random() * data.results.length);
  return data.results[randomIndex];
}

// Afficher un personnage aléatoire
async function displayCartoonCharacter() {
  const character = await getRandomCartoonCharacter();
  const photo = document.getElementById('cartoon-photo');
  const nameInput = document.getElementById('cartoon-name');
  const feedback = document.getElementById('feedback');
  const validateButton = document.getElementById('validate-cartoon');

  // Afficher l'affiche du film
  if (character.poster_path) {
    photo.src = `https://image.tmdb.org/t/p/w500${character.poster_path}`;
    photo.alt = `Film : ${character.title}`;
  } else {
    photo.src = 'default-image.jpg'; // Image par défaut si aucune image n'est disponible
    photo.alt = 'Image non disponible';
  }

  // Réinitialiser l'input et le feedback
  nameInput.value = '';
  feedback.textContent = '';

  // Valider la réponse
  validateButton.onclick = () => {
    const userInput = normalizeString(nameInput.value.trim());
    const correctName = normalizeString(character.title);

    if (userInput === correctName) {
      feedback.textContent = 'Bonne réponse !';
      feedback.style.color = 'green';

      // Mettre à jour le score
      currentScore++;
      if (currentScore > bestScore) {
        bestScore = currentScore;
      }
      document.getElementById('current-score').textContent = currentScore;
      document.getElementById('best-score').textContent = bestScore;

      // Charger un nouveau personnage après 1 seconde
      setTimeout(displayCartoonCharacter, 1000);
    } else {
      feedback.textContent = `Faux ! C'était : ${character.title}`;
      feedback.style.color = 'red';

      // Réinitialiser le score
      currentScore = 0;
      document.getElementById('current-score').textContent = currentScore;

      // Charger un nouveau personnage après 1 seconde
      setTimeout(displayCartoonCharacter, 1000);
    }
  };

  const skipButton = document.getElementById('skip-cartoon');

  // Action lorsque l'utilisateur clique sur "Passer"
  skipButton.onclick = () => {
    const feedback = document.getElementById('feedback');

    // Afficher un message avec le titre du film que l'utilisateur a passé
    feedback.textContent = `Raté ! C'était : ${character.title}`;
    feedback.style.color = 'red';

    // Réinitialiser le score
    currentScore = 0;
    document.getElementById('current-score').textContent = currentScore;

    // Charger un nouveau personnage après 1 seconde
    setTimeout(displayCartoonCharacter, 1000);
  };
}

// Initialiser les événements et charger le premier personnage
window.onload = () => {
  const nameInput = document.getElementById('cartoon-name');
  const validateButton = document.getElementById('validate-cartoon');

  nameInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      validateButton.click(); // Simule un clic sur le bouton "Valider"
    }
  });

  displayCartoonCharacter(); // Charger le premier personnage
};

// Normaliser les chaînes pour comparer les réponses
function normalizeString(str) {
  return str
    .normalize('NFD') // Décompose les caractères accentués (é → e + ´)
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/[^a-zA-Z]/g, '') // Supprime tous les caractères non alphabétiques
    .toLowerCase(); // Convertit en minuscule
}
