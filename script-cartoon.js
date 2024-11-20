const TMDB_API_KEY = '3b83d7e84184de7b5a516f19e3b7ba22'; // Remplacez par votre clé API TMDb
const BASE_URL = 'https://api.themoviedb.org/3';

let currentScore = 0;
let bestScore = 0;

// Rechercher un personnage de film d'animation aléatoire
async function getRandomCartoonCharacter() {
  const randomPage = Math.floor(Math.random() * 10) + 1; // Pages 1 à 10
  const response = await fetch(
    `${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=16&language=fr&page=${randomPage}`
  );

  if (!response.ok) {
    console.error('Erreur API TMDb :', response.statusText);
    throw new Error('Impossible de récupérer les données de TMDb.');
  }

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    console.error('Aucun résultat trouvé pour cette page.');
    return getRandomCartoonCharacter(); // Relancer si aucun résultat
  }

  // Choisir un film d'animation aléatoire
  const randomIndex = Math.floor(Math.random() * data.results.length);
  return data.results[randomIndex];
}

// Afficher un personnage aléatoire
async function displayCartoonCharacter() {
  try {
    const character = await getRandomCartoonCharacter();
    const photo = document.getElementById('cartoon-photo');
    const nameInput = document.getElementById('cartoon-name');
    const feedback = document.getElementById('feedback');

    // Vérifier si le personnage est valide
    if (!character || !character.title) {
      console.error('Données de personnage invalides :', character);
      return displayCartoonCharacter(); // Charger un nouveau personnage
    }

    // Afficher l'affiche du film
    if (character.poster_path) {
      photo.src = `https://image.tmdb.org/t/p/w500${character.poster_path}`;
      photo.alt = `Film : ${character.title}`;
    } else {
      photo.src = 'default-image.jpg'; // Image par défaut
      photo.alt = 'Image non disponible';
    }

    // Réinitialiser l'input et le feedback
    nameInput.value = '';
    feedback.textContent = '';

    // Gérer la validation
    document.getElementById('validate-cartoon').onclick = () => validateCartoonCharacter(character);
    document.getElementById('skip-cartoon').onclick = () => skipCartoonCharacter(character);

  } catch (error) {
    console.error('Erreur lors de l\'affichage du personnage :', error);
  }
}

// Valider la réponse
function validateCartoonCharacter(character) {
  const nameInput = document.getElementById('cartoon-name').value.trim().toLowerCase();
  const feedback = document.getElementById('feedback');

  if (normalizeString(nameInput) === normalizeString(character.title)) {
    feedback.textContent = 'Bonne réponse !';
    feedback.style.color = 'green';

    currentScore++;
    if (currentScore > bestScore) {
      bestScore = currentScore;
    }
    document.getElementById('current-score').textContent = currentScore;
    document.getElementById('best-score').textContent = bestScore;

    setTimeout(displayCartoonCharacter, 1000);
  } else {
    feedback.textContent = `Faux ! C'était : ${character.title}`;
    feedback.style.color = 'red';

    currentScore = 0;
    document.getElementById('current-score').textContent = currentScore;

    setTimeout(displayCartoonCharacter, 1000);
  }
}

// Passer le personnage
function skipCartoonCharacter(character) {
  const feedback = document.getElementById('feedback');
  feedback.textContent = `Raté ! C'était : ${character.title}`;
  feedback.style.color = 'red';

  currentScore = 0;
  document.getElementById('current-score').textContent = currentScore;

  setTimeout(displayCartoonCharacter, 1000);
}

// Normaliser les chaînes pour comparer les réponses
function normalizeString(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-zA-Z0-9 ]/g, '') // Supprimer les caractères spéciaux
    .toLowerCase();
}

// Initialisation
window.onload = displayCartoonCharacter;
