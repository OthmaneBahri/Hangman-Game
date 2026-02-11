// Config
const FICHIER = 'lesmiserables.txt';
const MAX_LOOSE = 6; // y'a 6 images dans le dossier img/

// Var globales
let motMystere = "";
let motCache = [];
let erreurs = 0;
let partieFinie = false;

// Au cas ou le fetch marche pas (genre si on lance en local sans serveur)
const LISTE_SECOURS = ["GAVROCHE", "COSETTE", "VALJEAN", "JAVERT", "LIBERTE", "REVOLUTION", "MISERABLES", "BARRICADE", "MARIUS", "FANTINE"];

// go
document.addEventListener('DOMContentLoaded', lancerJeu);

// bouton rejouer
document.getElementById('btn_rejouer').addEventListener('click', () => {
    document.getElementById('btn_rejouer').style.display = 'none';
    lancerJeu();
});

async function lancerJeu() {
    resetTout();
    
    try {
        motMystere = await choperMot();
    } catch (e) {
        // bon bah ça a planté, surement un souci de CORS en local
        // on prend la liste de secours
        console.log("Erreur chargement fichier, on passe sur la liste en dur");
        motMystere = LISTE_SECOURS[Math.floor(Math.random() * LISTE_SECOURS.length)];
    }
    
    // on nettoie le mot (pas d'accents, tout en maj)
    motMystere = cleanString(motMystere);
    
    console.log("Chut faut pas le dire : " + motMystere); 
    
    setupBoard();
}

async function choperMot() {
    // on va lire le gros fichier texte
    const rep = await fetch(FICHIER);
    if (!rep.ok) throw new Error("Fichier introuvable");
    
    const text = await rep.text();
    
    // regex trouvée sur le net pour chopper les mots de + de 5 lettres
    // ça vire la ponctuation et les trucs chelous
    const mots = text.match(/\b[a-zA-Zà-ÿ]{5,}\b/g);
    
    if (!mots || mots.length === 0) return "VICTOR"; // au pire
    
    // un mot au pif
    return mots[Math.floor(Math.random() * mots.length)];
}

function cleanString(str) {
    // virer les accents c'est chiant sinon
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
}

function resetTout() {
    partieFinie = false;
    erreurs = 0;
    document.getElementById('image_pendu').src = `img/pendu0.png`; 
    document.getElementById('messages').innerText = "";
    document.getElementById('messages').className = "";
}

function setupBoard() {
    // on remplit le tableau de tirets
    motCache = Array(motMystere.length).fill('_');
    updateAffichageMot();
    creerClavier();
}

function updateAffichageMot() {
    // on met des espaces entre les lettres/tirets pour faire joli
    document.getElementById('mot_a_deviner').innerText = motCache.join(' ');
}

function creerClavier() {
    const divClavier = document.getElementById('clavier');
    divClavier.innerHTML = ''; // reset
    const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    
    // boucle pour créer les boutons A-Z
    alpha.split('').forEach(lettre => {
        const btn = document.createElement('button');
        btn.innerText = lettre;
        btn.classList.add('btn-lettre');
        btn.addEventListener('click', () => checkLettre(lettre, btn));
        divClavier.appendChild(btn);
    });
}

function checkLettre(lettre, btn) {
    if (partieFinie) return; // on stop si c fini
    
    btn.disabled = true; // on peut pas recliquer dessus
    
    if (motMystere.includes(lettre)) {
        btn.classList.add('good');
        
        // on révèle la lettre partout ou elle est
        for (let i = 0; i < motMystere.length; i++) {
            if (motMystere[i] === lettre) {
                motCache[i] = lettre;
            }
        }
        updateAffichageMot();
        checkWin();
    } else {
        btn.classList.add('bad');
        erreurs++;
        updateImage();
        checkLoose();
    }
}

function updateImage() {
    // change l'image du pendu
    if(erreurs <= MAX_LOOSE) {
        document.getElementById('image_pendu').src = `img/pendu${erreurs}.png`;
    }
}

function checkWin() {
    // si y'a plus de tirets c gagné
    if (!motCache.includes('_')) {
        finGame("Bien joué ! C'était bien " + motMystere, "win");
    }
}

function checkLoose() {
    if (erreurs >= MAX_LOOSE) {
        finGame("Perdu... Le mot était " + motMystere, "loose");
    }
}

function finGame(msg, type) {
    partieFinie = true;
    const divMsg = document.getElementById('messages');
    divMsg.innerText = msg;
    divMsg.className = type; // pour mettre en rouge ou vert css
    
    // on bloque tout le clavier
    document.querySelectorAll('.btn-lettre').forEach(b => b.disabled = true);
    
    // affiche le btn pour rejouer
    document.getElementById('btn_rejouer').style.display = 'block';
}