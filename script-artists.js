const CLIENT_ID = '3a108c362d6d4bde89bd3de9db845a22';
const CLIENT_SECRET = 'e3384a37ed9444039788adab38e201e1';

let currentScore = 0;
let bestScore = 0;

// Récupérer un token d'accès Spotify
async function getSpotifyToken() {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET),
    },
    body: 'grant_type=client_credentials',
  });
  const data = await response.json();
  return data.access_token;
}

// Rechercher un artiste aléatoire parmi les plus populaires
async function getRandomArtist() {
  const token = await getSpotifyToken();
  const randomLetter = String.fromCharCode(97 + Math.floor(Math.random() * 26)); // Lettres 'a' à 'z'
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${randomLetter}&type=artist&limit=50`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  const data = await response.json();

  // Filtrer les artistes pour exclure ceux sans image et non populaires
  const artistsWithImages = data.artists.items.filter(
    artist =>
      artist.images &&
      artist.images.length > 0 &&
      artist.popularity > 80 // Popularité minimale
  );

  if (artistsWithImages.length === 0) {
    return getRandomArtist(); // Relancer si aucun artiste valide trouvé
  }

  // Sélectionner un artiste avec une image valide
  const randomIndex = Math.floor(Math.random() * artistsWithImages.length);
  return artistsWithImages[randomIndex];
}

// Afficher un artiste aléatoire
async function displayArtist() {
  const artist = await getRandomArtist();
  const photo = document.getElementById('artist-photo');
  const nameInput = document.getElementById('artist-name');
  const feedback = document.getElementById('feedback');
  const validateButton = document.getElementById('validate-artist');

  // Afficher la photo de l'artiste
  if (artist.images && artist.images.length > 0) {
    photo.src = artist.images[0].url;
  } else {
    photo.alt = 'Aucune photo disponible';
  }

  // Réinitialiser l'input et le feedback
  nameInput.value = '';
  feedback.textContent = '';

  // Valider la réponse
  validateButton.onclick = () => {
    const userInput = normalizeString(nameInput.value.trim());
    const correctName = normalizeString(artist.name);

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

      // Charger un nouvel artiste après 1 seconde
      setTimeout(displayArtist, 1000);
    } else {
      feedback.textContent = `Faux ! C'était : ${artist.name}`;
      feedback.style.color = 'red';

      // Réinitialiser le score
      currentScore = 0;
      document.getElementById('current-score').textContent = currentScore;

      // Charger un nouvel artiste après 1 seconde
      setTimeout(displayArtist, 1000);
    }
  };

  const skipButton = document.getElementById('skip');

  // Action lorsque l'utilisateur clique sur "Passer"
  skipButton.onclick = () => {
    const feedback = document.getElementById('feedback');

    // Afficher un message avec le nom de l'artiste que l'utilisateur a passé
    feedback.textContent = `Raté ! C'était : ${artist.name}`;
    feedback.style.color = 'red';

    // Réinitialiser le score
    currentScore = 0;
    document.getElementById('current-score').textContent = currentScore;

    // Charger un nouvel artiste après 1 seconde
    setTimeout(displayArtist, 1000);
  };
}

// Normaliser les chaînes pour comparer les réponses
function normalizeString(str) {
  return str
    .normalize("NFD") // Décompose les caractères accentués (é → e + ´)
    .replace(/[\u0300-\u036f]/g, "") // Supprime les marques diacritiques (accents)
    .replace(/[^a-zA-Z]/g, "") // Supprime tous les caractères non alphabétiques
    .toLowerCase(); // Convertit en minuscule
}

// Initialiser la page
window.onload = () => {
  const nameInput = document.getElementById('artist-name');
  const validateButton = document.getElementById('validate-artist');

  nameInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      validateButton.click(); // Simule un clic sur le bouton "Valider"
    }
  });

  displayArtist(); // Charger le premier artiste
};
