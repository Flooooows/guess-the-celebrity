const API_KEY = '3b83d7e84184de7b5a516f19e3b7ba22';
const BASE_URL = 'https://api.themoviedb.org/3';

let currentScore = 0;
let bestScore = 0;
let currentActor = null;

// Récupérer un acteur français aléatoire
async function getRandomFrenchActor() {
  const response = await fetch(
    `${TMDB_API_URL}?api_key=${API_KEY}&language=en-US`
  );
  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error("Aucun acteur trouvé");
  }

  // Filtrer les acteurs français en fonction de leur biographie
  const frenchActors = await Promise.all(
    data.results.map(async (actor) => {
      const actorDetailsResponse = await fetch(
        `https://api.themoviedb.org/3/person/${actor.id}?api_key=${API_KEY}&language=en-US`
      );
      const actorDetails = await actorDetailsResponse.json();

      // Vérifier si la biographie mentionne "French"
      if (
        actorDetails.biography &&
        actorDetails.biography.toLowerCase().includes("french")
      ) {
        return {
          name: actorDetails.name,
          image: actorDetails.profile_path
            ? `https://image.tmdb.org/t/p/w500${actorDetails.profile_path}`
            : null,
        };
      }
      return null;
    })
  );

  const validFrenchActors = frenchActors.filter(Boolean);

  if (validFrenchActors.length === 0) {
    throw new Error("Aucun acteur français trouvé");
  }

  // Sélectionner un acteur aléatoire
  const randomIndex = Math.floor(Math.random() * validFrenchActors.length);
  return validFrenchActors[randomIndex];
}

// Afficher un acteur français aléatoire
async function displayFrenchActor() {
  try {
    const actor = await getRandomFrenchActor();
    currentActor = actor;

    const photo = document.getElementById("actor-photo");
    const feedback = document.getElementById("feedback");
    const nameInput = document.getElementById("actor-name");

    // Afficher l'image et le nom de l'acteur
    photo.src = actor.image || "default-image.jpg"; // Image par défaut si aucune image disponible
    photo.alt = `Acteur : ${actor.name}`;

    // Réinitialiser l'input et le feedback
    nameInput.value = "";
    feedback.textContent = "";

    // Associer les événements de clics aux boutons
    document.getElementById("validate-actor").onclick = () =>
      validateFrenchActor(actor);
    document.getElementById("skip-actor").onclick = () =>
      skipFrenchActor(actor);
  } catch (error) {
    const feedback = document.getElementById("feedback");
    feedback.textContent = "Erreur : Impossible de charger un acteur.";
    feedback.style.color = "red";
    console.error("Erreur lors de l'affichage de l'acteur :", error);
  }
}

// Valider la réponse
function validateFrenchActor(actor) {
  const nameInput = document
    .getElementById("actor-name")
    .value.trim()
    .toLowerCase();
  const feedback = document.getElementById("feedback");

  if (normalizeString(nameInput) === normalizeString(actor.name)) {
    feedback.textContent = "Bonne réponse !";
    feedback.style.color = "green";

    currentScore++;
    if (currentScore > bestScore) {
      bestScore = currentScore;
    }
    document.getElementById("current-score").textContent = currentScore;
    document.getElementById("best-score").textContent = bestScore;

    setTimeout(displayFrenchActor, 1000);
  } else {
    feedback.textContent = `Faux ! C'était : ${actor.name}`;
    feedback.style.color = "red";

    currentScore = 0;
    document.getElementById("current-score").textContent = currentScore;

    setTimeout(displayFrenchActor, 1000);
  }
}

// Passer l'acteur
function skipFrenchActor(actor) {
  const feedback = document.getElementById("feedback");
  feedback.textContent = `Raté ! C'était : ${actor.name}`;
  feedback.style.color = "red";

  currentScore = 0;
  document.getElementById("current-score").textContent = currentScore;

  setTimeout(displayFrenchActor, 1000);
}

// Normaliser les chaînes pour comparer les réponses
function normalizeString(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .toLowerCase();
}

// Initialiser la page
window.onload = displayFrenchActor;
