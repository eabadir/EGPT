/* Copyright 2023-2025 by Essam Abadir */

/*
Electronic Graph Paper Theory of the Everything
- Space and time are absolute, quanta move on a grid (like graph paper).
- Only one quantum
- Randomness is fundamental ("stochastic" processes).
- The universe is fundamentally "fractal" in nature - it abhors extra calculations and complex rules. Numerical Linear Algebra and video game render engine efficiency techniques are then of a kind with the fundamental calculation techniques of an efficiently calculating universe.
- The core fractal operations are: 1) Grouping "quanta" into much larger "frames" (like putting a frame around an n x n region of a graph), 2) Repeating the process where the frames in 1 are the quanta in this step 2, 3) When all quanta are in tree structure where the root Frame is the universal grid, quanta are moved as follows. Moving quanta 1 pixel per tick in the direction of their velocity vector where newvx = oldvx + 1 pixel in a random X direction + 1 pixel per tick in the Y towards the center of their parent frame, newvy = oldvy + 1 pixel in a random Y direction + 1 pixel per tick in the Y towards the center of their parent frame. For a frame oldvx and oldvy are the average of the velocities of the children. Aside from their individual move, child quanta maintain their relative position to their parent's center when the parent is moved. The randomness is a random walk in the direction of the velocity vector.

I've wrestled with the idea of a discrete space and unidirectional time since college. Also, it has seemed to me that continuous math is less versatile than discrete mathematics. 
Industry work in video and compression has underscored the importance of efficiency (working towards Shannon limits of N*log(N) calculations as opposed to settling for N^2 calculations). It seems to me that the universe would tend towards "efficiency" - it not be "dumb" and would use the same or better techniques to reduce calculations.

Inspirations and Credits:
- My daughter, Jolie, for her constant encouragement and support. Also her patience while I was her home school teacher for Calculus, Physics, and Comp Sci. I started building all this code, and eventually formalized this theory, for her ...when I first explained it to her, she immediately summarized as "Wait, you think we live on graph paper?!?"
- My college roomamate and friend, Victor Owuor, a special brain in Electrical Engineering and Aerospace Engineering, who first introduced me to the way of thinking that "If it is true, it is simple. But, if you can't explain it simply then you really don't understand it yet."
- Einstein's book "Relativity: The Special and the General Theory--A Clear Explanation that Anyone Can Understand". I read it countless times in college and since ... but, damn Victor, I really didn't undersand it because I couldn't explain it simply :) The first few times I read it was around the time I was taking Linear Algebra and Non-linear Dynamics and Chaos Theory. My personal thought experiment at the time was how to give an alternate explanation using absolute space and time. Little did I know that Einstein himself had tried to do the same thing as evidenced by his 1917 letter to Hans Walter Dällenbach.
- Professor Steven Strogatz, his the way he teaches intuitively. His course on chaos theory and non-linear dynamics when I was at MIT was inspiring. I wanted to teach Jolie the same way.
- Grant Snderson and 3Blue1Brown's videos on calculus and linear algebra. Especially the Essence of Calculus series and the Essence of Linear Algebra series - they helped incredibly in how to describe the relationships between the continuous and the discrete.
- Stephen Wolfram & Lex Fridman's interviews of him. Especially discussions of discrete space not continuous space.
- Sabine Hossenfelder's especially the Einstein letter to Dallenbach which she unearthed describing his frustration with continous mathematics and his desire for discrete mathematical solutions which he could not find. Likewise her YouTube series and book "Lost in Math" - especially the chapter on the "Unreasonable Effectiveness of Mathematics". All made me think about the assumptions of continuous space and time.
- Neil Gershenfeld & Lex Fridman's interviews of him. Especially discussions of calculus as a tool for paper and pencil calculations, and the problem with how much informaion is in a quantum in space.
- Wolfram's cellular automata and Gershenfeld's discussion of Turing machines getting it wrong (the storage and the tape are one). These inspired the notion that quantum movement on the grid are the storage and the tape (i.e. space and time) are related in the same way the number of movements per clock cycle are related to accessing storage addresses - if you think of one clock cycle to traverse one fundamental storage unit then space and time are measured in the same units (i.e. they are one thing).
of the universe as a computing machine where the emergent behavior is the standard model of physics and relativity.
- Daniel Shiffman's Coding Train videos on p5.js and physics engines. Especially the videos on quad trees and collision detection.
- ChatGPT & Gemini as my tireless and often mistake prone research assistants: describing past physics experiments / data results , 24/7 coding help, formatting, reviewing drafts, and transcribing my proofs.

*/

let experiments;
let SCREEN_SCALE_FACTOR = 1;

function setup() {
  // Clear all children of the quantum element
  //document.body.innerHTML = '';
  // Create a wrapper container for the start screen and interstitial screen
  //see if the wrapper already exists
  let wrapper = document.getElementById('wrapper');
  if (wrapper) {
    wrapper.innerHTML = '';
  }
  wrapper = document.createElement('div');
  wrapper.id = 'wrapper';
  wrapper.style.position = 'absolute';
  wrapper.style.top = '0';
  wrapper.style.left = '0';
  wrapper.style.width = '100%';
  wrapper.style.height = '100%';
  document.body.appendChild(wrapper);

  // Calculate the scaling factor
  resetScale();
  showIntroScreen();

  noLoop();
}


function resetScale(scaleFactor = 1) {
  screen_width = 1920 * scaleFactor;
  screen_height = 1080;
  SCREEN_SCALE_FACTOR = window.innerWidth / screen_width;

  // Set the root font size
  document.documentElement.style.fontSize = (16 * SCREEN_SCALE_FACTOR) + 'px';
}

function showIntroScreen() {
  resetScale(1);
  let wrapper = document.getElementById('wrapper');
  wrapper.innerHTML = '';
  wrapper.style.zIndex = 10000;
  wrapper.style.display = 'block';
  let introScreen = document.createElement('div');
  introScreen.id = 'introScreen';
  introScreen.classList.add('d-flex', 'flex-row', 'flex-wrap', 'justify-content-center', 'align-items-center', 'vh-100');
  introScreen.style.position = 'absolute';
  introScreen.style.top = '0';
  introScreen.style.left = '0';
  introScreen.style.width = '100%';
  introScreen.style.height = '100%';
  introScreen.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
  introScreen.style.backgroundImage = 'url("images/early_universe.png")';
  wrapper.appendChild(introScreen);

  // Create a title row
  let titleRow = document.createElement('div');
  titleRow.classList.add('d-flex', 'justify-content-center', 'w-100');
  let title = document.createElement('h1');
  title.textContent = 'Electronic Graph Paper Theory & EGPT FRAQTL';
  title.style.color = 'white';
  titleRow.appendChild(title);
  let subTitleRow = document.createElement('div');
  subTitleRow.classList.add('d-flex', 'justify-content-center', 'w-100');
  let subTitle = document.createElement('h2');
  subTitle.innerHTML = 'Quantum Supercomputing Engine';
  subTitle.style.color = 'white';
  subTitleRow.appendChild(subTitle);
  introScreen.appendChild(titleRow);
  introScreen.appendChild(subTitleRow);

  let carousel = new Carousel();
  let cardContainer = document.createElement('div');
  cardContainer.classList.add('d-flex', 'flex-row', 'flex-wrap', 'h-100');

  // Create a separate container for the carousel
  let carouselContainer = document.createElement('div');
  let includedCardsIndex = 0;
  let cards = GAME_CARDS.filter(card => card.includeInMenu)
    .map(card => {
      let cardElement = createCard(card.title, card.imageSrc, card.text, () => startSimulation(card.id), false, card.intersticial);
      includedCardsIndex++;
      return cardElement;
    });
  let carouselCards = GAME_CARDS.filter(card => card.includeInMenu)
    .map(card => {
      let cardElement = createCard(card.title, card.imageSrc, card.text, () => startSimulation(card.id), true, card.intersticial);
      includedCardsIndex++;
      return cardElement;
    });

  cards.forEach(card => cardContainer.appendChild(card));
  carouselCards.forEach(card => carousel.addCard(card));
  introScreen.appendChild(carouselContainer);
  carousel.addCarouselWidget(carouselContainer);
  introScreen.appendChild(cardContainer);
}
function createCard(title, imgSrc, description, onClick, isHorizontal = false, intersticial = null, backgroundColor = 'card-background') {
  const card = document.createElement('div');
  card.classList.add('card', 'm-2', 'clickable', 'rounded', 'shadow-sm', backgroundColor); // Default to vertical card styles
  card.style.height = `${window.innerHeight / 3}px`; // Shared height


  if (isHorizontal) {
    card.classList.remove('m-2'); // Remove vertical margins
    card.classList.add('container');
    card.style.aspectRatio = '4/1'; // Use aspect ratio instead of fixed width
  } else {
      card.style.width = '18rem';  // Set fixed width for vertical cards
  }
  card.addEventListener('click', () => {
    if (intersticial) {
      showInterstitialScreen(intersticial.title, intersticial.imageSrc, intersticial.text, onClick);
    } else {
      //no interstitial screen, just start the simulation
      onClick();
    }
  });

  if (isHorizontal) {
    let row = document.createElement('div');
    row.classList.add('row', 'g-0');
    row.style.display = 'flex';
    row.style.justifyContent = 'center';
    row.style.alignItems = 'center';

    let imgCol = document.createElement('div');
    imgCol.classList.add('col-md-4');
    imgCol.style.display = 'flex';
    imgCol.style.justifyContent = 'center';
    imgCol.style.alignItems = 'center';
    let img = document.createElement('img');
    img.src = imgSrc;
    img.classList.add('img-fluid', 'rounded-start');
    img.alt = title;
    imgCol.appendChild(img);

    let textCol = document.createElement('div');
    textCol.classList.add('col-md-8', 'p-3');
    let cardBody = document.createElement('div');
    cardBody.classList.add('card-body');
    let cardTitle = document.createElement('h5');
    cardTitle.classList.add('card-title');
    cardTitle.textContent = title;
    let cardText = document.createElement('p');
    cardText.classList.add('card-text');
    cardText.innerHTML = description;
    cardText.style.overflow = 'hidden';
    cardText.style.textOverflow = 'ellipsis';
    cardText.style.whiteSpace = 'nowrap';
    cardText.style.padding = '0 10px'; // Add padding to prevent overflow
    cardBody.appendChild(cardTitle);
    cardBody.appendChild(cardText);
    textCol.appendChild(cardBody);
    row.appendChild(imgCol);
    row.appendChild(textCol);
    card.appendChild(row);
  } else {
    let img = document.createElement('img');
    img.src = imgSrc;
    img.classList.add('card-img-top', 'rounded-top');
    img.alt = title;
    img.style.height = `60%`;
    img.style.objectFit = 'cover';

    let cardBody = document.createElement('div');
    cardBody.classList.add('card-body', 'p-3');
    let cardTitle = document.createElement('h5');
    cardTitle.classList.add('card-title');
    cardTitle.textContent = title;
    let cardText = document.createElement('p');
    cardText.classList.add('card-text', 'fs-6');
    cardText.textContent = description.length > 70 ? description.substring(0, 70) + '...' : description;
    cardText.style.overflow = 'hidden';
    cardText.style.textOverflow = 'ellipsis';
    cardText.style.whiteSpace = 'nowrap';
    cardText.style.padding = '0 10px'; // Add padding to prevent overflow
    cardBody.appendChild(cardTitle);
    cardBody.appendChild(cardText);
    card.appendChild(img);
    card.appendChild(cardBody);
  }

  return card;
}

let USE_INTERSTICIAL_SCREEN = true;

function showInterstitialScreen(title, imgSrc, description, onClick) {
  let wrapper = document.getElementById('wrapper');
  let introscreen = document.getElementById('introScreen');
  if (introscreen) {
    introscreen.remove();
  }

  if (!USE_INTERSTICIAL_SCREEN) {
      // hide the wrapper
    wrapper.style.display = 'none';
    onClick();
    return;
  }

  let interstitialScreen = document.createElement('div');
  interstitialScreen.id = 'interstitialScreen';
  interstitialScreen.classList.add('d-flex', 'justify-content-center', 'vh-100');
  interstitialScreen.style.paddingTop = '5%';
  interstitialScreen.style.position = 'absolute';
  interstitialScreen.style.top = '0';
  interstitialScreen.style.left = '0';
  interstitialScreen.style.width = '100%';
  interstitialScreen.style.height = '100%';
  wrapper.appendChild(interstitialScreen);

  let card = document.createElement('div');
  card.classList.add('card', 'mb-3', 'interstitial-card');

  let row = document.createElement('div');
  row.classList.add('row', 'g-0');

  let imgCol = document.createElement('div');
  imgCol.classList.add('col-md-4');
  let img = document.createElement('img');
  img.src = imgSrc;
  img.alt = title;
  img.classList.add('img-fluid', 'rounded-start');
  imgCol.appendChild(img);

  let textCol = document.createElement('div');
  textCol.classList.add('col-md-8');
  let cardBody = document.createElement('div');
  cardBody.classList.add('card-body');
  
  let titleElement = document.createElement('h5');
  titleElement.textContent = title;
  titleElement.classList.add('card-title');
  cardBody.appendChild(titleElement);

  let startButton = document.createElement('button');
  startButton.textContent = 'Start Simulation';
  startButton.classList.add('btn', 'btn-primary');
  startButton.addEventListener('click', () => {
    interstitialScreen.remove();
    onClick();
  });
  cardBody.appendChild(startButton);
  
  let descriptionElement = document.createElement('p');
  descriptionElement.innerHTML = description;
  descriptionElement.classList.add('card-text');
  cardBody.appendChild(descriptionElement);
 
 
  textCol.appendChild(cardBody);
  row.appendChild(imgCol);
  row.appendChild(textCol);
  card.appendChild(row);
  interstitialScreen.appendChild(card);
}

function startSimulation(simulationId) {
  let wrapper = document.getElementById('wrapper');
  wrapper.style.display = 'none';

  // create and run the selected experiment
  let experiments = new Experiments(simulationId);

}


class Carousel {
  constructor() {
    this.carouselCards = [];
    this.carouselId = 'carousel';
    this.carouselItemsId = 'carouselitems';
    this.interval = 10000; // Default interval of 5 seconds
  }

  addCard(card) {
    card.classList.add('carousel-item');
    this.carouselCards.push(card);
    if (this.carouselCards.length === 1) {
      card.classList.add('active');
    }
  }

  addCarouselWidget(elmContainer) {
    let carouselHtml = `<div id="{egptcarousel}" class="carousel slide carousel-background" data-bs-ride="carousel" data-bs-interval="${this.interval}">
    <div id="carouselitems" class="carousel-inner">
    </div>
    <button class="carousel-control-prev" type="button" data-bs-target="#{egptcarousel}" data-bs-slide="prev">
      <span class="carousel-control-prev-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Previous</span>
    </button>
    <button class="carousel-control-next" type="button" data-bs-target="#{egptcarousel}" data-bs-slide="next">
      <span class="carousel-control-next-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Next</span>
    </button>
  </div>`;
    carouselHtml = carouselHtml.replace(/{egptcarousel}/g, this.carouselId);
    elmContainer.innerHTML = carouselHtml;
    let carouselItems = document.getElementById(this.carouselItemsId);
    this.carouselCards.forEach(card => carouselItems.appendChild(card));
  }

  setInterval(interval) {
    this.interval = interval;
  }
}