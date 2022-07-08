let dealerHand=[];
let playerHand=[];
let playerSum=0;
let dealerSum=0;
let playerBust=false;
let gamePlayed=false;
let playerAce=false;
let dealerAce=false;
let playerNat=false;
let dealerNat=false;
let ulDH = document.getElementById("dealerHand");
let ulPH = document.getElementById("playerHand");
let startButton= document.getElementById("start");
let hitButton= document.getElementById("draw");
let standButton= document.getElementById("show");

function reset(){
  if(gamePlayed==true){
    location.reload();
  }
}


document.getElementById('start').addEventListener('click', startGame);
document.getElementById('draw').addEventListener('click', playerHit);
document.getElementById('show').addEventListener('click', show);

  //Get the deck
  let deckId = ''
  fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6')
  .then(res => res.json()) // parse response as JSON
  .then(data => {
    deckId = data.deck_id
    
  })
  .catch(err => {
      console.log(`error ${err}`)
  });


function startGame(){
//reinitialize game
  reset();
  gamePlayed=true;
  const url = `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=4`
  fetch(url)
  .then(res => res.json()) // parse response as JSON
  .then(data => {
    console.log(data)
//deal cards at start of game
    playerHand.push(data.cards[0]);
    playerHand.push(data.cards[2]);
    dealerHand.push(data.cards[1]);
    dealerHand.push(data.cards[3]);
    console.log(playerHand);
    if (dealerHand.filter(x => x.value === 'ACE').length > 0) {
      console.log("ACE");
      dealerAce=true;
    }
    // if (dealerHand.filter(x => x.value === 'KING'||x.value === 'QUEEN'||x.value === 'JACK').length > 0) {
    //   console.log("ACE");
    //   dealerRoyal=true;
    // }
    if (playerHand.filter(x => x.value === 'ACE').length > 0) {
      playerAce=true;
    }

    // if (playerHand.filter(x => x.value === 'KING'||x.value === 'QUEEN'||x.value === 'JACK').length > 0) {
    //   playerRoyal=true;
    // }
    dealerSum=dealerHand.reduce((prev,current)=> Number(cardValue(prev.value)) + Number(cardValue(current.value)));
    playerSum=playerHand.reduce((prev,current)=> Number(cardValue(prev.value)) + Number(cardValue(current.value)));

//show hand
    dealerHand.forEach(x=>{
      addToHand(ulDH,x.image);
    })
    playerHand.forEach(x=>{
      addToHand(ulPH,x.image);
    })
//hide second card
    var lItems = document.getElementById("dealerHand").getElementsByTagName("li");
    lItems[1].style.opacity="0";


    startButton.style.display="none";
    if(dealerSum==21 && dealerHand.length==2){
      dealerNat=true;
    }
    if(playerSum==21 && playerHand.length==2){
      playerNat=true;
      show();
    }
//show buttons
    hitButton.removeAttribute("hidden");
    standButton.removeAttribute("hidden");
  })
  .catch(err => {
      console.log(`error ${err}`)
  });
}

function getFetch(){
  
  const url = `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`

  return fetch(url)
      .then(res => { return res.json()
        .then(data => {
          return data;
        }).catch(err => {
          console.log(`error ${err}`)
        })
      });
}


function addToHand(hand,image){
  let li = document.createElement("li");
  let img = document.createElement("img");
  img.src=image;
  li.appendChild(img);
  hand.appendChild(li);
}

function show(){
  var lItems = document.getElementById("dealerHand").getElementsByTagName("li");
  lItems[1].style.opacity="1";
  
  hitButton.setAttribute("hidden","hidden");
  standButton.setAttribute("hidden","hidden");
  

  async function check(){
    if(dealerSum<17){
      await dealerHit();
      check();
    }
  }
  //dealer draws cards if player hand does not bust
  if(playerBust==false){
    
    check();
    setTimeout(function(){
      console.log("dealer: "+dealerSum);
      console.log("player: "+playerSum);
      if(dealerSum>21){
        document.querySelector('h1').innerHTML="You Win";
        document.querySelector('span').innerText="Dealer Bust!";
      }else if(dealerSum<playerSum){
        document.querySelector('h1').innerHTML="You Win";
        document.querySelector('span').innerText="Player has higher value!";
      }else if(dealerSum==playerSum){
        if(playerNat&&!dealerNat){
          document.querySelector('h1').innerHTML="You Win";
          document.querySelector('span').innerText="Player has Blackjack!";
        }else if(!playerNat&&dealerNat){
          document.querySelector('h1').innerHTML="You Lose";
          document.querySelector('span').innerText="Dealer has Blackjack!";
        }else{
          document.querySelector('h1').innerHTML="You Tied";
          document.querySelector('span').innerText="Player and Dealer has same value!";
        }

      }else{
        document.querySelector('h1').innerHTML="You Lose";
        document.querySelector('span').innerText="Dealer has higher value!";
      }
    },1000);
  //if player is over 21 dealer does not have to draw
  }else{
    document.querySelector('h1').innerHTML="You Lose";
    document.querySelector('span').innerText="Player Bust";
  }
  setTimeout(function(){
    startButton.style.display=null;
    startButton.innerText="Continue";
  },1500);

}

//Dealer
function dealerHit(){
  return getFetch().then((data) => {
    dealerHand.push(data.cards[0]);
    addToHand(ulDH,data.cards[0].image);
    dealerSum+=Number(cardValue(data.cards[0].value,dealerSum));
    if(dealerSum>21&&dealerAce==true){
      dealerSum-=10;
      dealerAce=false;
    }
    return dealerSum;
  })

}

//Player
function playerHit(){
  return getFetch().then((data) => {
    playerHand.push(data.cards[0]);
    addToHand(ulPH,data.cards[0].image);
    playerSum+=Number(cardValue(data.cards[0].value,playerSum));
    if(playerSum>21&&playerAce==true){
      playerSum-=10;
      playerAce=false;
    }
    if(playerSum>=21){
      playerBust= playerSum>21;
      show();
      console.log(playerSum==21? "blackJack!": "BUST!");
    }
  })
}


function cardValue(val,sum){
  if(val === "ACE"){
    if(sum+11>21){}
    return sum+11>21 ? 1 : 11;
  }else if (val === "KING" || val === "QUEEN" || val === "JACK"){
    return 10
  }else{
    return val
  }
}