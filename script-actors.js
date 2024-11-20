const API_KEY = '3b83d7e84184de7b5a516f19e3b7ba22';
const BASE_URL = 'https://api.themoviedb.org/3';

let currentScore = 0;
let bestScore = 0;

// Récupérer un acteur aléatoire
async function getRandomActor() {
  const randomPage = Math.floor(Math.random() * 150) + 1; // Pages 1 à 10
  const response = await fetch(`${BASE_URL}/person/popular?api_key=${API_KEY}&language=fr&page=${randomPage}`);
  const data = await response.json();
  const actors = data.results;

  // Filtrer les acteurs pour éviter ceux sans photo ou sans données connues
  const popularActors = actors.filter(actor => actor.profile_path && actor.known_for.length > 0);

  if (popularActors.length === 0) {
    return getRandomActor(); // Relancer si aucun acteur populaire trouvé
  }

  const randomIndex = Math.floor(Math.random() * popularActors.length);
  return popularActors[randomIndex];
}


window.onload = () => {
  const nameInput = document.getElementById('celebrity-name'); // Champ de saisie pour les acteurs
  const validateButton = document.getElementById('validate'); // Bouton "Valider" pour les acteurs

  // Écouteur pour activer "Valider" avec la touche Enter
  nameInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      validateButton.click(); // Simule un clic sur le bouton "Valider"
    }
  });

  displayActor(); // Charger le premier acteur
};


// Afficher un acteur aléatoire
async function displayActor() {
  const actor = await getRandomActor();
  const photo = document.getElementById('celebrity-photo');
  const nameInput = document.getElementById('celebrity-name');
  const feedback = document.getElementById('feedback');
  const validateButton = document.getElementById('validate');

  // Afficher la photo de l'acteur
  if (actor.profile_path) {
    photo.src = `https://image.tmdb.org/t/p/w500${actor.profile_path}`;
  } else {
    photo.alt = 'Aucune photo disponible';
  }

  // Réinitialiser l'input et le feedback
  nameInput.value = '';
  feedback.textContent = '';

  // Valider la réponse
  validateButton.onclick = () => {
    const userInput = normalizeString(nameInput.value.trim());
    const correctName = normalizeString(actor.name);
  
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
  
      // Charger un nouvel acteur après 2 secondes
      setTimeout(displayActor, 1000);
    } else {
      feedback.textContent = `Faux ! C'était : ${actor.name}`;
      feedback.style.color = 'red';
  
      // Réinitialiser le score
      currentScore = 0;
      document.getElementById('current-score').textContent = currentScore;
  
      // Charger un nouvel acteur après 2 secondes
      setTimeout(displayActor, 1000);
    }
  };
  

  
  const skipButton = document.getElementById('skip');

  // Action lorsque l'utilisateur clique sur "Passer"
  skipButton.onclick = () => {
    const feedback = document.getElementById('feedback');

    // Afficher un message avec le nom de l'acteur que l'utilisateur a passé
    feedback.textContent = `Raté ! C'était : ${actor.name}`;
    feedback.style.color = 'red';

    // Réinitialiser le score
    currentScore = 0;
    document.getElementById('current-score').textContent = currentScore;

    // Charger un nouvel acteur après 2 secondes
    setTimeout(displayActor, 1000);
  };

}

function normalizeString(str) {
  return str
    .normalize("NFD") // Décompose les caractères accentués (é → e + ´)
    .replace(/[\u0300-\u036f]/g, "") // Supprime les marques diacritiques (accents)
    .replace(/[^a-zA-Z]/g, "") // Supprime tous les caractères non alphabétiques
    .toLowerCase(); // Convertit en minuscule
}



// Démarrer le jeu
displayActor();
