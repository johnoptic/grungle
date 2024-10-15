//----------
//Globals
//----------

//Dice
const diceArray = ['assets/dice/dice1.png', 'assets/dice/dice2.png', 'assets/dice/dice3.png', 'assets/dice/dice4.png', 'assets/dice/dice5.png', 'assets/dice/dice6.png'];

const diceButton = document.getElementById('rollDice'); // Roll dice
const diceOne = document.getElementById('diceOne');
const diceTwo = document.getElementById('diceTwo');

let diceValues = { diceOne: 1, diceTwo: 1 };
let diceUsed = { diceOne: false, diceTwo: false };

//Deck & Cards
const deckStackContainer = document.querySelector('.deckStack');
const suits = [
    { name: 'Dragon', img: 'assets/cards/DragonCard.png', reverse: 'assets/cards/CardReverse.png'},
    { name: 'Kraken', img: 'assets/cards/KrakenCard.png', reverse: 'assets/cards/CardReverse.png'},
    { name: 'Unicorn', img: 'assets/cards/UnicornCard.png', reverse: 'assets/cards/CardReverse.png'},
    { name: 'Fairy', img: 'assets/cards/FairyCard.png', reverse: 'assets/cards/CardReverse.png'},
    { name: 'Gargoyle', img: 'assets/cards/GargoyleCard.png', reverse: 'assets/cards/CardReverse.png'},
    { name: 'Gryphon', img: 'assets/cards/GryphonCard.png', reverse: 'assets/cards/CardReverse.png'},
    { name: 'Joker', img: 'assets/cards/JokerCard.png', reverse: 'assets/cards/CardReverse.png'},
    { name: 'Mermaid', img: 'assets/cards/MermaidCard.png', reverse: 'assets/cards/CardReverse.png'}
];

const values = ['1', '2', '3', '4', '5', '6'];

//Create Deck
let deck = [];
for (let i = 0; i < suits.length; i++) {
    for (let j = 0; j < values.length; j++) {
        const uniqueId = `${suits[i].name[0]}-${values[j]}-${i * values.length + j}`;
        deck.push({
            id: uniqueId,
            suit: suits[i].name,
            value: values[j],
            img: suits[i].img,
            reverse: suits[i].reverse
        });
    }
}

//Board
const gridSquares = document.querySelectorAll('.gridSquare');
const cardContainer = document.createElement('div');


// Track selected cards
let selectedCards = [];
let totalCards = 48;
const cardsLeft = document.getElementById('cardsLeft');

// Start Again?
const reshuffle = document.getElementById('startAgain');


//--------------------
// Sounds
//--------------------
let cardGrab, cardPlace, select, poof, diceRoll, buff, crystalHum;

let soundInitialized = false;

function initializeSounds() {
    if (!soundInitialized) {
        cardGrab = createSound('./assets/sfx/cardGrab.mp3', 0.2);
        cardPlace = createSound('./assets/sfx/cardPlace.mp3', 0.1);
        select = createSound('./assets/sfx/select.mp3', 0.2);
        poof = createSound('./assets/sfx/poof.mp3', 0.8);
        diceRoll = createSound('./assets/sfx/diceRoll.mp3', 0.2);
        buff = createSound('./assets/sfx/buff.mp3', 0.1);
        crystalHum = createSound('./assets/sfx/crystalHum.mp3', 0.4);

        soundInitialized = true;
    }
}

//Initialize Sounds// Function to create a Howl object
function createSound(src, volume) {
    return new Howl({
      src: [src],
      volume: volume,
    });
  }

//----------------
// Event Listeners
//----------------

$(document).ready(function() {

    initializeSounds();
    alert('Grungle is a prototype proof of concept and a work in progress. Bugs are expected. There is a known issue with card duplication. If this happens, please refresh the page.');

    reshuffle.addEventListener('click', resetGame);

    gridSquares.forEach(gridSquare => {
        gridSquare.addEventListener('dragover', handleDragOver);
        gridSquare.addEventListener('drop', handleDrop);

    });

    // Add event listeners to the dice elements
    diceButton.addEventListener('click', rollDice);

    diceOne.addEventListener('dragstart', (event) => {
        event.dataTransfer.setData('type', 'dice');
        event.dataTransfer.setData('text/plain', 'diceOne');
        crystalHum.play();
        gridSquares.forEach(square => square.classList.add('pulsing-glow'));

    });
    diceTwo.addEventListener('dragstart', (event) => {
        event.dataTransfer.setData('type', 'dice');
        event.dataTransfer.setData('text/plain', 'diceTwo');
        crystalHum.play();
        gridSquares.forEach(square => square.classList.add('pulsing-glow'));
    });

    diceOne.addEventListener('dragend', () => {
        crystalHum.stop();
        gridSquares.forEach(square => square.classList.remove('pulsing-glow'));
    });
    diceTwo.addEventListener('dragend', () => {
        crystalHum.stop();
        gridSquares.forEach(square => square.classList.remove('pulsing-glow'));
    });


});

// Shuffle and render the deck stack
shuffleDeck(deck);
renderDeckStack();

//---------------
// Functions
//---------------

function updateCardsLeft() {
    cardsLeft.textContent = totalCards; 
}

// Drag handlers
function handleDragStart(event) {
    event.dataTransfer.setData('text/plain', event.target.getAttribute('data-index'));
    event.target.classList.add('dragging');
}

function handleDragEnd(event) {
    event.target.classList.remove('dragging');
}

function handleDragOver(event) {
    event.preventDefault();
}

function handleDrop(event) {
    event.preventDefault();
    
    const itemType = event.dataTransfer.getData('type'); // Get the type of item being dragged ('card' or 'dice')
    const gridSquare = event.currentTarget;

    // Handle dropping cards
    if (itemType === 'card') {
        const cardIndex = event.dataTransfer.getData('text/plain');
        const cardData = deck[cardIndex];

        // Check if the grid square already has a card
        if (gridSquare.querySelector('.card-container')) {
            // Grid square already occupied, do nothing
            return;
        }

        // Create a new card container for this card
        const cardContainer = document.createElement('div');
        cardContainer.classList.add('card-container');
        cardContainer.setAttribute('data-card-index', cardIndex); // Store index for reference
        cardContainer.addEventListener('click', handleCardClick); // Add click handler
        
        const cardImg = document.createElement('img');
        cardImg.setAttribute('src', cardData.img);
        cardImg.setAttribute('data-card-id', cardIndex); 
        cardImg.setAttribute('draggable', 'false'); // Prevent dragging

        const cardValue = document.createElement('div');
        cardValue.classList.add('card-value');
        cardValue.textContent = cardData.value;

        // Append card image and value to the card container
        cardContainer.appendChild(cardImg);
        cardContainer.appendChild(cardValue);

        // Append the card container to the grid square
        gridSquare.appendChild(cardContainer);

        // Remove the card from the deck stack
        const deckCard = deckStackContainer.querySelector(`img[data-index='${cardIndex}']`);
        if (deckCard) deckStackContainer.removeChild(deckCard);

        // Play sound when the card is placed
        cardPlace.play();
    }

    // Handle dropping dice
    else if (itemType === 'dice') {
        const diceId = event.dataTransfer.getData('text/plain');
    
        // Check if the dice is already used
        if (diceUsed[diceId]) {
            return; // Prevent using the dice again
        }
    
        diceUsed[diceId] = true;
    
        // Hide the dice image
        const diceElement = document.getElementById(diceId);
        if (diceElement) {
            diceElement.style.display = 'none';
        }
    
        // Check if there's a card on the gridSquare to update its value
        const cardContainer = gridSquare.querySelector('.card-container');
        if (cardContainer) {
            const cardValueElement = cardContainer.querySelector('.card-value');
            if (cardValueElement) {
                const diceValue = diceValues[diceId];
                cardValueElement.textContent = diceValue; // Update the card value with the dice value
                buff.play();
            }
        }
    }
}

function handleCardClick(event) {
    const cardTarget = event.currentTarget;

    // Deselect if already selected
    if (selectedCards.includes(cardTarget)) {
        cardTarget.classList.remove('selected');
        selectedCards = selectedCards.filter(card => card !== cardTarget);
        return;
    }

    // Select the card
    cardTarget.classList.add('selected');
    selectedCards.push(cardTarget);
    select.play();

    // Check if two cards are selected
    if (selectedCards.length === 2) {
        const [card1, card2] = selectedCards;
        const cardValue1 = card1.querySelector('.card-value').textContent;
        const cardValue2 = card2.querySelector('.card-value').textContent;
        const cardIndex1 = card1.getAttribute('data-card-index');
        const cardIndex2 = card2.getAttribute('data-card-index');
        const cardData1 = deck[cardIndex1];
        const cardData2 = deck[cardIndex2];

        // Compare values and suits
        if (cardValue1 === cardValue2 && cardData1.suit === cardData2.suit) {
            poof.play();

            const smokeCloud1 = document.createElement('div');
            const smokeCloud2 = document.createElement('div');
            smokeCloud1.className = 'smoke-cloud';
            smokeCloud2.className = 'smoke-cloud';

            const rect1 = card1.getBoundingClientRect();
            const rect2 = card2.getBoundingClientRect();

            const centerX1 = rect1.left + (rect1.width / 4);
            const centerY1 = rect1.top + (rect1.height / 4);
            const centerX2 = rect2.left + (rect2.width / 4);
            const centerY2 = rect2.top + (rect2.height / 4);

            smokeCloud1.style.position = 'absolute';
            smokeCloud1.style.left = `${centerX1}px`;
            smokeCloud1.style.top = `${centerY1}px`;
            smokeCloud1.style.transform = 'translate(-50%, -50%)';
            
            smokeCloud2.style.position = 'absolute';
            smokeCloud2.style.left = `${centerX2}px`;
            smokeCloud2.style.top = `${centerY2}px`;
            smokeCloud2.style.transform = 'translate(-50%, -50%)';

            document.body.appendChild(smokeCloud1);
            document.body.appendChild(smokeCloud2);

            card1.parentElement.removeChild(card1);
            card2.parentElement.removeChild(card2);

            totalCards -=2;
            updateCardsLeft();
            //Win condition
            if(totalCards === 0) {
                alert('You win!')
            }

            rollDice();

            setTimeout(() => {
                document.body.removeChild(smokeCloud1);
                document.body.removeChild(smokeCloud2);
            }, 1000);
        } else {
            // Deselect if values or suits don't match
            setTimeout(() => {
                card1.classList.remove('selected');
                card2.classList.remove('selected');
            }, 500);
        }

        selectedCards = [];
    }
}

function resetGame() {

    diceOne.style.display = 'inline-block';
    diceTwo.style.display = 'inline-block';
    diceOne.setAttribute('src', './assets/dice/dice1.png');
    diceTwo.setAttribute('src', './assets/dice/dice1.png');
    diceValues = { diceOne: 1, diceTwo: 1 };
    diceUsed = { diceOne: false, diceTwo: false };

    gridSquares.forEach(square => {
        const cardContainer2 = square.querySelector('.card-container');
        if (cardContainer2) {
            square.removeChild(cardContainer2);
        }
    });
    shuffleDeck(deck);
    renderDeckStack();
    totalCards = 48;
    cardsLeft.textContent = totalCards;
}

function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function renderDeckStack() {
    const deckStackContainer = document.querySelector('.deckStack');

    // Append each card
    deck.forEach((card, index) => {
        const cardElement = document.createElement('img');

        // Set the source to the reverse image
        cardElement.setAttribute('src', card.reverse);
        cardElement.setAttribute('alt', `${card.suit} ${card.value}`);
        cardElement.classList.add('deck-card');

        cardElement.setAttribute('draggable', 'true');
        cardElement.setAttribute('data-index', index);

        // Event listeners
        cardElement.addEventListener('dragstart', (event) => {
            event.dataTransfer.setData('type', 'card');
            event.dataTransfer.setData('text/plain', index.toString());
            cardGrab.play(); 
        });
        cardElement.addEventListener('dragend', handleDragEnd);

        // Offset for stack effect
        cardElement.style.top = `${index * 2}px`;  
        cardElement.style.left = `${index * 2}px`; 

        cardElement.style.zIndex = index; 

        deckStackContainer.appendChild(cardElement);
    });
}

// Dice Functions
function showDice() {
    diceOne.style.display = 'inline-block';
    diceTwo.style.display = 'inline-block'; 
}

function rollDice() {
    showDice();
    diceRoll.play();
    let interval = 0;
    const increment = 12;
    const maxSteps = 16;
    let currentStep = 0;

    function updateDice() {
        diceOne.setAttribute('src', diceArray[Math.floor(Math.random() * diceArray.length)]);
        diceTwo.setAttribute('src', diceArray[Math.floor(Math.random() * diceArray.length)]);
    }

    function roll() {
        if (currentStep < maxSteps) {
            updateDice();
            currentStep++;
            interval += increment;
            setTimeout(roll, interval);
        } else {
            diceValues = {
                diceOne: diceArray.indexOf(diceOne.getAttribute('src')) + 1,
                diceTwo: diceArray.indexOf(diceTwo.getAttribute('src')) + 1
            };
            diceUsed = { diceOne: false, diceTwo: false }; // Reset diceUsed state for new roll
        }
    }
    roll();
}

