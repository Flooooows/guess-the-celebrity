const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = '3b83d7e84184de7b5a516f19e3b7ba22'; // Remplacez par votre clé API
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Fonction pour récupérer une célébrité aléatoire (recherche globale)
async function getRandomCelebrity() {
    const randomPage = Math.floor(Math.random() * 10) + 1; // Pages 1 à 10
    const response = await fetch(`${BASE_URL}/person/popular?api_key=${API_KEY}&language=fr&page=${randomPage}`);
    const data = await response.json();
    return data.results[Math.floor(Math.random() * data.results.length)];
}

async function getRandomMusicalArtist() {
    const randomPage = Math.floor(Math.random() * 10) + 1;
    const response = await fetch(`${BASE_URL}/person/popular?api_key=${API_KEY}&language=fr&page=${randomPage}`);
    const data = await response.json();
    const musicians = data.results.filter(person => person.known_for_department === "Sound");

    if (musicians.length === 0) {
        console.log("Aucun artiste musical trouvé. Essayez une autre page...");
        return { name: "Pas d'artiste trouvé", profile_path: null }; // Renvoie un résultat par défaut
    }

    return musicians[Math.floor(Math.random() * musicians.length)];
}


// Fonction pour afficher la célébrité dans le jeu
async function loadGame(getCelebrityFunc) {
    const celebrity = await getCelebrityFunc();

    // Vérifier si une image est disponible
    if (!celebrity.profile_path) {
        console.log("Célébrité sans photo, relancer...");
        return loadGame(getCelebrityFunc);
    }

    // Afficher l'image et enregistrer le nom de la célébrité
    const photo = document.getElementById('celebrity-photo');
    photo.src = `${IMAGE_BASE_URL}${celebrity.profile_path}`;
    photo.dataset.name = celebrity.name;
    document.getElementById('result').textContent = '';
}

// Vérifier la réponse de l'utilisateur
document.getElementById('name-input').addEventListener('input', (event) => {
    const userInput = event.target.value.trim().toLowerCase();
    const correctName = document.getElementById('celebrity-photo').dataset.name?.toLowerCase();

    if (userInput && userInput === correctName) {
        document.getElementById('result').textContent = 'Bravo, vous avez trouvé ! 🎉';
    }
});

// Gestion des boutons
document.getElementById('global-search').addEventListener('click', () => {
    loadGame(getRandomCelebrity);
});

document.getElementById('music-search').addEventListener('click', () => {
    loadGame(getRandomMusicalArtist);
});
