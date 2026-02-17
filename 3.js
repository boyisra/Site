// script.js

/***************************************
 * APPLICATION SAFE-TEXT (Licence 2)
 * Tous les événements et fonctionnalités
 ***************************************/

(function() {
    // --- DOM ÉLÉMENTS ---
    const secretInput = document.getElementById('secretInput');
    const cipherKey = document.getElementById('cipherKey');
    const strengthFill = document.getElementById('strengthFill');
    const secretForm = document.getElementById('secretForm');
    const vaultList = document.getElementById('vaultList');
    const widthSpan = document.getElementById('widthSpan');
    const heightSpan = document.getElementById('heightSpan');
    const scrollBtn = document.getElementById('scrollTopBtn');
    const panicToast = document.getElementById('panicToast');

    // --- VARIABLES GLOBALES ---
    let blurActive = false;          // état du mode flou (Shift+S)

    // ============================================
    // INITIALISATION (DOMContentLoaded)
    // ============================================
    document.addEventListener('DOMContentLoaded', () => {
        console.log('✅ SAFE-TEXT prêt (DOM entièrement chargé)');

        // affichage immédiat de la résolution
        updateResolution();

        // chargement éventuel de données mockées / ou on laisse liste vide
        // (optionnel : ajouter un élément d'exemple)
        addExampleSecret();
    });

    // --- fonction utilitaire pour ajouter un secret exemple (pour tester) ---
    function addExampleSecret() {
        if (vaultList.children.length === 0) {
            // on simule un message déjà présent
            const fakeSecure = secureData('exemple de connexion');
            addSecretToList(fakeSecure);
        }
    }

    // ============================================
    // RESIZE : mise à jour de la résolution
    // ============================================
    window.addEventListener('resize', () => {
        updateResolution();
    });

    function updateResolution() {
        widthSpan.textContent = window.innerWidth;
        heightSpan.textContent = window.innerHeight;
    }

    // ============================================
    // CLAVIER : validation préventive sur cipherKey
    // (input) : compter caractères => bordure & barre
    // ============================================
    cipherKey.addEventListener('input', function(e) {
        const length = this.value.length;
        let color = 'gray';
        let widthPercent = '0%';

        if (length < 6) {
            color = 'gray';
            widthPercent = Math.min(30, (length/6)*30) + '%';   // effet visuel progressif
        } else if (length >= 6 && length <= 10) {
            color = 'orange';
            widthPercent = 60 + '%';
        } else if (length > 10) {
            color = '#2ecc71';  // vert
            widthPercent = 100 + '%';
        }

        // appliquer la bordure au champ cipherKey (optionnel, plus visible)
        cipherKey.style.borderColor = color;
        // changer la barre de force
        strengthFill.style.width = widthPercent;
        strengthFill.style.background = color;
    });

    // ============================================
    // CLAVIER : Panic (Echap) + Combo Shift+S
    // ============================================
    document.addEventListener('keydown', (e) => {
        // --- Panic : touche Echap ---
        if (e.key === 'Escape') {
            e.preventDefault();  // éviter de fermer des modales navigateur
            // vider les champs
            secretInput.value = '';
            cipherKey.value = '';
            // remettre barre de force à zéro
            strengthFill.style.width = '0%';
            strengthFill.style.background = 'gray';
            cipherKey.style.borderColor = '#2f3c57'; // gris par défaut
            // focus sur le premier champ (textarea)
            secretInput.focus();
            // afficher toast "Cleared"
            panicToast.classList.add('show');
            setTimeout(() => {
                panicToast.classList.remove('show');
            }, 1500);
        }

        // --- Combo Shift + S (majuscule 'S') ---
        if (e.shiftKey && (e.key === 'S' || e.key === 's')) {
            e.preventDefault(); // éviter un éventuel comportement par défaut
            // basculer la classe .blur-mode sur vaultList (la zone des archives)
            vaultList.classList.toggle('blur-mode');
            // (optionnel : petit retour visuel)
        }
    });

    // ============================================
    // SOURIS : survol des cartes (cadenas)
    // On utilise la délégation car les cartes sont ajoutées dynamiquement
    // ============================================
    vaultList.addEventListener('mouseenter', (e) => {
        // On veut réagir au survol d'un <li> (carte)
        // La gestion est en réalité faite en CSS : l'icône existe dans chaque li
        // Cependant on doit insérer l'icône lors de la création. Pas besoin d'événement supplémentaire.
        // (c'est purement CSS, mais on peut garder un console.log pour l'exemple)
    }, true);

    // ============================================
    // MENU CONTEXTUEL : désactiver clic droit sur zone de saisie
    // ============================================
    const inputZones = [secretInput, cipherKey];
    inputZones.forEach(el => {
        el.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            // on peut afficher une petite alerte discrète (optionnel)
            console.log('🛑 Clic droit bloqué (simulation anti-copie)');
        });
    });

    // ============================================
    // SOUMISSION DU FORMULAIRE (enregistrement)
    // ============================================
    secretForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const message = secretInput.value.trim();
        if (message === '') {
            alert('Le message secret ne peut pas être vide.');
            return;
        }

        // 1. Transformer le texte via secureData (chiffrement simulé)
        const encrypted = secureData(message);

        // 2. Ajouter à la liste (avec horodatage et bouton supprimer)
        addSecretToList(encrypted);

        // 3. Réinitialiser le champ message (mais on garde la clé)
        secretInput.value = '';
        secretInput.focus();
    });

    // --- Fonction secureData (base64 + inversion) ---
    function secureData(plainText) {
        // Convertir en Base64 (fonctionne avec les caractères Unicode)
        const base64 = btoa(unescape(encodeURIComponent(plainText)));
        // Inverser l'ordre des caractères
        return base64.split('').reverse().join('');
    }

    // --- Fonction qui ajoute un élément <li> dans vaultList ---
    function addSecretToList(encryptedText) {
        const li = document.createElement('li');

        // Icône cadenas (apparaît au survol)
        const lockIcon = document.createElement('i');
        lockIcon.className = 'fas fa-lock lock-icon';

        // Span contenant le texte chiffré
        const secretSpan = document.createElement('span');
        secretSpan.className = 'secret-text';
        secretSpan.textContent = encryptedText;

        // Horodatage (heure actuelle)
        const timeSpan = document.createElement('span');
        timeSpan.className = 'timestamp';
        const now = new Date();
        timeSpan.textContent = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second:'2-digit' });

        // Bouton supprimer
        const delBtn = document.createElement('button');
        delBtn.className = 'btn-delete';
        delBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Supprimer';

        // Assemblage
        li.appendChild(lockIcon);
        li.appendChild(secretSpan);
        li.appendChild(timeSpan);
        li.appendChild(delBtn);

        vaultList.appendChild(li);
    }

    // ============================================
    // DÉLÉGATION D'ÉVÉNEMENTS : suppression des secrets
    // ============================================
    vaultList.addEventListener('click', (e) => {
        const target = e.target;
        // Si on a cliqué sur le bouton ou sur une icône à l'intérieur du bouton
        const deleteButton = target.closest('.btn-delete');
        if (deleteButton) {
            // Remonter jusqu'au <li> parent et le supprimer
            const li = deleteButton.closest('li');
            if (li) {
                li.remove();
            }
        }
    });

    // ============================================
    // GESTION DU SCROLL : bouton retour visible >200px
    // ============================================
    window.addEventListener('scroll', () => {
        if (window.scrollY > 200) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    });

    // Clic sur le bouton pour remonter en haut
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ============================================
    // (Bonus) Nettoyage : si on veut forcer la désactivation du menu contextuel partout
    // ============================================
    // Déjà fait.
})();