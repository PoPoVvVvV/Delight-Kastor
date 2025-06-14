// --- Login System Logic (Client-side, NON-SECURE) ---
// *** WARNING: This login system is for visual gating only. ***
// *** Credentials are hardcoded and exposed in the source code. ***
// *** DO NOT use this for sensitive applications. ***

// <<< DÉFINISSEZ VOS NOMS D'UTILISATEUR ET MOTS DE PASSE VALIDES ICI >>>
const validCredentials = [
    { username: 'SerenAtkins', password: 'SA3009' } // Utilisateur fourni
    // Ajoutez autant d'objets { username: '...', password: '...' } que nécessaire
];
// ********************************************************

// --- Configuration pour les Webhooks ---
// <<< REMPLACEZ CECI PAR L'URL DE VOTRE WEBHOOK DISCORD >>>
const discordWebhookUrl = 'https://discord.com/api/webhooks/1373953368371888139/t3WltwjGOvaaN1F50YL35-_UtNgF6TTveryQyaeMCC2NDT1YG71rhqNYhkxI9wbmUuaD'; // URL Discord fournie
// ****************************************

const loginScreen = document.getElementById('login-screen');
const salesBookContent = document.getElementById('sales-book-content');
const loginForm = document.getElementById('login-form');
const loginErrorMessage = document.getElementById('login-error-message');

// Nous retirons l'utilisation de sessionStorage, donc pas besoin de vérifier 'isLoggedIn' au chargement.
// const isLoggedIn = sessionStorage.getItem('isLoggedIn'); // Ligne retirée


// Function to show the sales book and hide the login screen
function showSalesBook() {
    // Vérifier si l'écran de login existe avant de manipuler son style
    if (loginScreen) {
        loginScreen.style.display = 'none';
    }
    salesBookContent.style.display = 'block'; // Show the content
    // Reset body centering styles applied for the login screen
    document.body.style.justifyContent = 'flex-start';
    document.body.style.alignItems = 'flex-start';
    document.body.style.minHeight = 'auto';
    // sessionStorage.setItem('isLoggedIn', 'true'); // Ligne retirée : ne mémorise plus la connexion
}

// Variable to store the calculated total profit (still needed for display on page)
let currentTotalProfit = 0;
let currentTotalAmount = 0; // Also keep track of total amount


// --- Début de la logique de connexion (actuellement désactivée au démarrage de la page) ---
// NOTE: Ce gestionnaire reste dans le code, mais l'écran de vente est maintenant affiché
// initialement, quelle que soit la connexion. Si vous souhaitez réactiver la connexion,
// vous devrez modifier la logique dans `DOMContentLoaded`.
if (loginForm) { // Check if the form exists
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent the default form submission (page reload)

        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');

        const enteredUsername = usernameInput.value;
        const enteredPassword = passwordInput.value;

        // Check credentials against the list
        const isAuthenticated = validCredentials.some(credentials => {
            return credentials.username === enteredUsername && credentials.password === enteredPassword;
        });

        if (isAuthenticated) {
            // Successful login - this path can still be used if you navigate back
            loginErrorMessage.textContent = ''; // Clear any previous error message
            showSalesBook(); // Show the main content
            // initializeSalesBook(); // No need to re-initialize if it's done on load
        } else {
            // Failed login
            loginErrorMessage.textContent = 'Nom d\'utilisateur ou mot de passe incorrect.';
            passwordInput.value = ''; // Clear password field
            usernameInput.focus(); // Put focus back on username
        }
    });
}
// --- Fin de la logique de connexion ---


// --- Existing Sales Book Logic ---
// This function sets up event listeners and performs initial calculations/display updates
function initializeSalesBook() {
    // No need to check display here as it's called after showSalesBook() on load
    /* if (salesBookContent.style.display === 'none') {
        return;
    } */

    // Get elements needed for calculations and display
    const productSelects = document.querySelectorAll('.product-select');
    const quantityInputs = document.querySelectorAll('.quantity-input');
    const totalAmountDisplay = document.getElementById('total-amount');
    const totalProfitDisplay = document.getElementById('total-profit'); // Keep this to update display
    const discountCheckbox = document.getElementById('discount-checkbox');


    function calculateRowAmount(row) {
        const productSelect = row.querySelector('.product-select');
        const quantityInput = row.querySelector('.quantity-input');
        const rowAmountDisplay = row.querySelector('.row-amount');
        const rowProfitDisplay = row.querySelector('.row-profit'); // Keep this to update display
        const productProdPriceDisplay = row.querySelector('.product-prod-price');
        const productSellPriceDisplay = row.querySelector('.product-sell-price');

        const selectedOption = productSelect.options[productSelect.selectedIndex];
        // Ensure selectedOption is valid before accessing attributes
        const prodPrice = selectedOption ? parseFloat(selectedOption.getAttribute('data-prod-price')) || 0 : 0;
        const sellPrice = selectedOption ? parseFloat(selectedOption.getAttribute('data-sell-price')) || 0 : 0;

        const quantity = parseInt(quantityInput.value) || 0;

        const amount = sellPrice * quantity;
        const profit = (sellPrice - prodPrice) * quantity;

        // --- DÉBUT DES MODIFICATIONS POUR MASQUER LES PRIX DE PRODUCTION ET DE VENTE UNITAIRE ---

        // Masque le prix de production
        if (productProdPriceDisplay) {
            productProdPriceDisplay.textContent = ''; // Vide le contenu de l'affichage du prix de production
            // Si tu souhaites masquer complètement la cellule (<td>) dans le tableau, tu peux ajouter :
            // productProdPriceDisplay.style.display = 'none';
        }

        // Masque le prix de vente unitaire
        if (productSellPriceDisplay) {
            productSellPriceDisplay.textContent = ''; // Vide le contenu de l'affichage du prix de vente unitaire
            // Si tu souhaites masquer complètement la cellule (<td>) dans le tableau, tu peux ajouter :
            // productSellPriceDisplay.style.display = 'none';
        }

        // --- FIN DES MODIFICATIONS ---

        rowAmountDisplay.textContent = `$${amount.toFixed(2)}`;
        rowProfitDisplay.textContent = `$${profit.toFixed(2)}`; // KEEP: Update row profit display
    }

    function calculateTotal() {
        let totalAmount = 0; // Variable pour le total brut avant réduction
        let totalProfit = 0; // Variable pour le profit total (pas affecté par la réduction)

        // Boucle sur chaque ligne du tableau pour additionner les montants et profits
        document.querySelectorAll('tbody tr').forEach(row => {
            const rowAmountDisplay = row.querySelector('.row-amount');
            const rowProfitDisplay = row.querySelector('.row-profit');

            // Récupère les valeurs affichées et les convertit en nombres
            const rowAmount = rowAmountDisplay ? parseFloat(rowAmountDisplay.textContent.replace('$', '')) || 0 : 0;
            const rowProfit = rowProfitDisplay ? parseFloat(rowProfitDisplay.textContent.replace('$', '')) || 0 : 0;

            totalAmount += rowAmount; // Ajoute au total brut
            totalProfit += rowProfit; // Ajoute au profit total
        });

        // --- SECTION POUR LA RÉDUCTION ---
        let discountedAmount = totalAmount; // Initialise le montant facturable avec le total brut
        // Récupère la case à cocher
        const discountCheckbox = document.getElementById('discount-checkbox');
        // Applique 10% de réduction si la case à cocher existe et EST cochée
        if (discountCheckbox && discountCheckbox.checked) {
            discountedAmount = totalAmount * 0.9; // Applique la réduction
        }
        // --- FIN SECTION ---

        // --- NOUVEL AJOUT : Arrondir le montant facturable au supérieur ---
        const roundedAmount = Math.ceil(discountedAmount); // Arrondit toujours à l'entier supérieur
        // --- FIN NOUVEL AJOUT ---


        // Met à jour l'affichage des totaux sur la page
        const totalAmountDisplay = document.getElementById('total-amount'); // Récupère l'élément d'affichage du total à facturer
        const totalProfitDisplay = document.getElementById('total-profit'); // Récupère l'élément d'affichage du profit total

        if(totalAmountDisplay) totalAmountDisplay.textContent = `$${roundedAmount.toFixed(0)}`; // Affiche le montant arrondi avec 0 décimale
        if(totalProfitDisplay) totalProfitDisplay.textContent = `$${totalProfit.toFixed(2)}`; // Affiche le profit total (pas réduit ni arrondi)

        // Stocke les totaux dans des variables globales pour qu'ils soient accessibles par la fonction d'envoi
        currentTotalAmount = roundedAmount; // IMPORTANT : Stocke le montant final facturable (arrondi au supérieur)
        currentTotalProfit = totalProfit; // IMPORTANT : Stocke le profit total (pas réduit ni arrondi)
    }

    // Add event listeners for select and input changes (only once per element)
    const handleSalesBookChange = (event) => {
        calculateRowAmount(event.target.closest('tr'));
        calculateTotal();
    };

    const checkboxForListener = document.getElementById('discount-checkbox');
    if (checkboxForListener) {
        checkboxForListener.addEventListener('change', calculateTotal);
    }

    document.querySelectorAll('.product-select, .quantity-input').forEach(element => {
        // Add listeners only if not added before
        if (!element.dataset.listenersAdded) {
            const eventType = element.tagName === 'SELECT' ? 'change' : 'input';
            element.addEventListener(eventType, handleSalesBookChange);
            element.dataset.listenersAdded = 'true';
            // Also trigger an initial calculation for each row on load
            calculateRowAmount(element.closest('tr'));
        }
    });


    // --- Integration Logic ---

    // This version gets salesperson name from an element, not a select dropdown
    const salespersonNameElement = document.getElementById('salesperson-name');
    const currentDateElement = document.getElementById('current-date');
    const currentTimeElement = document.getElementById('current-time');
    const validateButton = document.getElementById('validate-button'); // Ensure button is accessible

    if (validateButton) {
        validateButton.addEventListener('click', () => {
            // Disable the button immediately upon click
            validateButton.disabled = true;
            validateButton.textContent = 'Envoi en cours...'; // Optional: Give visual feedback

            // Get salesperson name from the designated element
            const salesperson = salespersonNameElement ? salespersonNameElement.textContent.trim() : 'Inconnu'; // Added check

            const saleDate = currentDateElement.textContent.trim();
            const saleTime = currentTimeElement.textContent.trim();

            // Recalculate totals just before sending to ensure accuracy and update currentTotalAmount/currentTotalProfit
            calculateTotal();

            const totalAmount = currentTotalAmount; // Use the value stored in the variable
            const totalProfit = currentTotalProfit; // Use the total profit value


            // Check if there are any items selected with quantity > 0 or if total amount > 0
            const hasSelectedItems = Array.from(document.querySelectorAll('tbody tr')).some(row => {
                const productSelect = row.querySelector('.product-select');
                const quantityInput = row.querySelector('.quantity-input');
                // Ensure both elements exist before checking values
                return productSelect && quantityInput && productSelect.value && parseInt(quantityInput.value) > 0;
            });

            // Also check if total amount is 0, even if items are selected (e.g. free items)
            if (!hasSelectedItems && totalAmount <= 0) {
                alert("Aucun article sélectionné avec une quantité supérieure à 0 ou le total à facturer est de $0.00.");
                validateButton.disabled = false; // Re-enable button on validation failure
                validateButton.textContent = 'Valider la Sélection'; // Restore button text
                return;
            }


            // Créer un objet avec les données de résumé
            const summaryData = {
                Date: saleDate,
                Heure: saleTime,
                Vendeur: salesperson,
                Chiffre_Affaire: totalAmount,
                Marge_Totale: totalProfit
            };

            console.log('Données sommaires à envoyer :', summaryData);


            // --- Envoi à Google Sheets ---
            const googleSheetsUrl = 'https://script.google.com/macros/s/AKfycbx2GH5yt3t89TOdeBXNnae08UFtmmQDtSMaPcX9tXkasLSmb-Pq0K7Te5tUNxL-ZZcQNA/exec'; // <<< REMPLACEZ CECI PAR VOTRE URL Apps Script

            if (googleSheetsUrl === 'YOUR_APPS_SCRIPT_WEB_APP_URL' || !googleSheetsUrl) { // Added check for the placeholder URL
                alert("Erreur de configuration : L'URL Google Sheets n'est pas configurée correctement.");
                console.error("Google Sheets URL not configured.");
                validateButton.disabled = false; // Re-enable button on configuration error
                validateButton.textContent = 'Valider la Sélection'; // Restore button text
                // Optionally return here if Google Sheets is mandatory,
                // but for now, we'll just log and proceed to Discord if configured.
            } else {
                fetch(googleSheetsUrl, {
                    method: 'POST',
                    mode: 'no-cors', // Use 'no-cors' for Google Apps Script Web App
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(summaryData) // Envoyez l'objet JSON résumé
                })
                .then(response => {
                    console.log('Réponse Google Sheets reçue (mode no-cors, réponse opaque):', response);
                    alert('Sélection validée. Données envoyées à Google Sheets (vérifiez la feuille pour confirmation) !');

                    // Optional: Clear the form after assumed successful submission
                    document.querySelectorAll('.quantity-input').forEach(input => input.value = 0);
                    document.querySelectorAll('.product-select').forEach(select => select.value = '');
                    document.querySelectorAll('tbody tr').forEach(row => calculateRowAmount(row)); // Recalculate to reset displays
                    calculateTotal(); // Recalculate totals to show $0.00
                    // Update date and time for the next transaction
                    updateDateTime();

                    // Re-enable the button after successful Sheets submission (or opaque response)
                    validateButton.disabled = false;
                    validateButton.textContent = 'Valider la Sélection'; // Restore button text

                })
                .catch((error) => {
                    console.error('Erreur lors de l\'envoi des données à Google Sheets:', error);
                    alert('Échec de l\'envoi des données à Google Sheets. Vérifiez la console, la configuration Apps Script et l\'URL.');

                    // Re-enable the button on Sheets submission failure
                    validateButton.disabled = false;
                    validateButton.textContent = 'Valider la Sélection'; // Restore button text
                });
            }


            // --- Envoi à Discord via Webhook ---
            // MODIFICATION ICI : La condition a été ajustée pour ne plus bloquer
            // si votre URL est l'exemple fourni.
            if (!discordWebhookUrl || discordWebhookUrl === 'YOUR_DISCORD_WEBHOOK_URL') {
                console.warn("Discord Webhook URL not configured or is placeholder. Skipping Discord notification.");
            } else {
                // --- NOUVEAU : Récupération des détails des produits ---
                const productDetails = [];
                document.querySelectorAll('tbody tr').forEach(row => {
                    const productSelect = row.querySelector('.product-select');
                    const quantityInput = row.querySelector('.quantity-input');

                    // S'assurer qu'un produit est sélectionné et qu'une quantité > 0 est entrée
                    if (productSelect && productSelect.value && parseInt(quantityInput.value) > 0) {
                        const productName = productSelect.options[productSelect.selectedIndex].textContent;
                        const quantity = parseInt(quantityInput.value);
                        productDetails.push(`> - ${productName} x ${quantity}`);
                    }
                });

                // Crée la chaîne de caractères pour les détails des produits
                const productListString = productDetails.length > 0 ?
                    `\n**Détails des Articles:**\n${productDetails.join('\n')}` :
                    '\n**Aucun article vendu.**';
                // --- FIN NOUVEAU ---

                const discordPayload = {
                    // Vous pouvez personnaliser le format du message ici en utilisant le Markdown
                    content: `**Nouvelle Vente Validée**:\n` +
                                        `> **Date:** ${summaryData.Date}\n` +
                                        `> **Heure:** ${summaryData.Heure}\n` +
                                        `> **Vendeur:** ${summaryData.Vendeur}\n` +
                                        `> **Chiffre d'Affaire:** $${summaryData.Chiffre_Affaire.toFixed(2)}\n` +
                                        `> **Marge Totale:** $${summaryData.Marge_Totale.toFixed(2)}` +
                                        productListString, // AJOUT : Les détails des produits ici
                    // Optional: customize the username and avatar
                    // username: 'Sales Bot',
                    // avatar_url: 'URL_DE_VOTRE_ICONE'
                };

                console.log('Données à envoyer à Discord :', discordPayload);

                fetch(discordWebhookUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(discordPayload)
                })
                .then(response => {
                    if (response.ok) { // Discord webhook success returns 204 No Content, which response.ok handles
                        console.log('Données envoyées à Discord avec succès !');
                        // No alert needed for Discord success typically
                    } else {
                        console.error('Erreur lors de l\'envoi des données à Discord. Statut :', response.status);
                        // Attempt to read response body for more info, but Discord might return empty
                        response.text().then(text => console.error('Corps de l\'erreur Discord (si disponible) :', text || 'Empty response body'));
                        // No alert needed for Discord failure, just console log
                    }
                })
                .catch((error) => {
                    console.error('Erreur réseau lors de l\'envoi à Discord:', error);
                    // No alert needed for Discord failure, just console log
                });
            }
            // Note: The Sheets fetch includes UI updates (clearing form, updating time)
            // so let's keep that as the primary success indicator for the user.
            // The Discord fetch runs in parallel or slightly after the Sheets fetch is initiated.

        });
    } else {
        console.error("Validation button not found!");
    }


    // Function to update date and time
    function updateDateTime() {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
        const year = now.getFullYear();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, 0);
        const seconds = String(now.getSeconds()).padStart(2, 0);

        if(currentDateElement) currentDateElement.textContent = `${day}/${month}/${year}`;
        if(currentTimeElement) currentTimeElement.textContent = `${hours}:${minutes}:${seconds}`;
    }

    // Initial calculation and date/time set
    // Calculate initial row amounts and total amounts/profits on load
    document.querySelectorAll('tbody tr').forEach(row => {
        calculateRowAmount(row);
    });
    calculateTotal();
    updateDateTime();

}


// --- Initial logic on page load ---
document.addEventListener('DOMContentLoaded', () => {
    // --- MODIFICATION : Afficher directement le carnet de vente et l'initialiser ---
    // Ces deux lignes remplacent la logique de l'écran de connexion initiale,
    // rendant le carnet de vente accessible sans identifiants au chargement de la page.
    showSalesBook(); // Appel pour masquer l'écran de login et afficher le carnet de vente
    initializeSalesBook(); // Appel pour configurer les écouteurs et les calculs du carnet

    // --- L'ancienne logique de login est commentée ou retirée ci-dessous ---
    // Si vous souhaitez réactiver la connexion, décommentez la section suivante
    // et commentez les deux lignes `showSalesBook()` et `initializeSalesBook()` ci-dessus.
    /*
    // Retirons la vérification de sessionStorage. La page montrera toujours l'écran de login au départ.
    if (isLoggedIn === 'true') {
        showSalesBook();
        initializeSalesBook();
    } else {
        // Afficher l'écran de login (il est déjà affiché par défaut via CSS)
        // Mettre le focus sur le champ nom d'utilisateur
        const usernameInput = document.getElementById('username');
        if(usernameInput) usernameInput.focus();
    }
    */
});
