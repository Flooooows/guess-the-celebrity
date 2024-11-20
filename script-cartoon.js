const ANILIST_API_URL = "https://graphql.anilist.co";

let currentScore = 0;
let bestScore = 0;
let currentCharacter = null;

// Récupérer un personnage aléatoire
async function getRandomCartoonCharacter() {
  const randomPage = Math.floor(Math.random() * 300) + 1; // Pages 1 à 10

  // Requête GraphQL
  const query = `
    query ($page: Int) {
      Page(page: $page, perPage: 1) {
        characters {
          name {
            full
          }
          image {
            large
          }
        }
      }
    }
  `;

  const variables = {
    page: randomPage,
  };

  const response = await fetch(ANILIST_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: query,
      variables: variables,
    }),
  });

  const data = await response.json();

  if (!data.data.Page.characters || data.data.Page.characters.length === 0) {
    return getRandomCartoonCharacter(); // Relancer si aucun personnage trouvé
  }

  // Retourner un personnage aléatoire
  return data.data.Page.characters[0];
}

// Afficher un personnage aléatoire
async function displayCartoonCharacter() {
  try {
    const character = await getRandomCartoonCharacter();
    currentCharacter = character;

    const photo = document.getElementById("cartoon-photo");
    const feedback = document.getElementById("feedback");
    const nameInput = document.getElementById("cartoon-name");

    // Afficher l'image du personnage
    if (character.image && character.image.large) {
      photo.src = character.image.large;
      photo.alt = `Personnage : ${character.name.full}`;
    } else {
      photo.src = "default-image.jpg"; // Image par défaut si aucune image n'est disponible
      photo.alt = "Image non disponible";
    }

    // Réinitialiser l'input et le feedback
    nameInput.value = "";
    feedback.textContent = "";

    // Gérer les clics sur "Valider" et "Passer"
    document.getElementById("validate-cartoon").onclick = () =>
      validateCartoonCharacter(character);
    document.getElementById("skip-cartoon").onclick = () =>
      skipCartoonCharacter(character);
  } catch (error) {
    console.error("Erreur lors de l'affichage du personnage :", error);
  }
}

// Valider la réponse
function validateCartoonCharacter(character) {
  const nameInput = document
    .getElementById("cartoon-name")
    .value.trim()
    .toLowerCase();
  const feedback = document.getElementById("feedback");

  if (normalizeString(nameInput) === normalizeString(character.name.full)) {
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
    feedback.textContent = `Faux ! C'était : ${character.name.full}`;
    feedback.style.color = "red";

    currentScore = 0;
    document.getElementById("current-score").textContent = currentScore;

    setTimeout(displayCartoonCharacter, 1000);
  }
}

// Passer le personnage
function skipCartoonCharacter(character) {
  const feedback = document.getElementById("feedback");
  feedback.textContent = `Raté ! C'était : ${character.name.full}`;
  feedback.style.color = "red";

  currentScore = 0;
  document.getElementById("current-score").textContent = currentScore;

  setTimeout(displayCartoonCharacter, 1000);
}

// Normaliser les chaînes pour comparer les réponses
function normalizeString(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Supprimer les accents
    .replace(/[^a-zA-Z0-9 ]/g, "") // Supprimer les caractères spéciaux
    .toLowerCase();
}

// Initialisation
window.onload = displayCartoonCharacter;
