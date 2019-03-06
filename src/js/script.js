
(() => {
  const bubbles = document.getElementsByClassName("bubble");
  const explosion = document.getElementById("explosion");
  const mainPotion = document.getElementById("main-potion");
  const addWord = document.querySelector("#add-words form");
  const addGenre = document.querySelectorAll("#add-genres li[data-genre]");
  const randomColors = ["#00a0e4", "#38ad6a", "#e9532a", "#ffee00", "#d72157"];


  for (let i = 0; i < bubbles.length; i++) {
    bubbles[i].style.setProperty("--bubble-delay", randomTime(1, 3, true));
  }

  function randomTime(min, max, negative) {
    let n = Math.random() * ( max - min + 1) + min;

    n = negative ? n * -1 : n;

    return `${n.toFixed(2)}s`;
  }

  const queryComposer = {
    words: [],
    genres: [],
    makeQuery: function() {
      return new Promise((resolve, reject) => {
        const queryWords = this.words.join("+") || "a" // "a" is the default word;
        const queryGenres = this.genres.map(g => `facet=Genre(${g})`).join("&");
        const query = (queryGenres) ? [queryWords, queryGenres].join("&") : queryWords;

        resolve(query)
      })
    },
    makeCall: async function(query) {
      const api = new API({
    		key: "1e19898c87464e239192c8bfe422f280"
    	});

      // const query = await this.makeQuery();
      console.log("query", query)
    	const stream = await api.createStream(`search/${query}&facet=Doelgroep(ageYouth)`);
      //
    	stream
    		.pipe(handleData)
    		.catch(console.error);
    }
  }

  function handleData(data) {
    console.log(data)
  }

  // After holding the mainPotion down after 2 seconds
  // Make the mainPotion explode and trigger the API call
  function holdMouse() {
    let milis = 0;
    window.mouseHoldDown = setInterval(() => {
      milis++;

      if (milis >= 10) {
        explosion.classList.add("explode");

        clearInterval(window.mouseHoldDown)
        // API call
        queryComposer.makeQuery().then(queryComposer.makeCall)
      }
    }, 100)

    window.addEventListener("mouseup", () => clearInterval(window.mouseHoldDown));
  }

  mainPotion.addEventListener("mousedown", holdMouse);


  function updatePotionContent(color) {
    let currentContents = Number(getComputedStyle(mainPotion).getPropertyValue("--potion-filled"));
    let newContents = currentContents + .05;
    // console.log(currentColor)
    mainPotion.style.setProperty("--potion-filled", newContents)
    mainPotion.style.setProperty("--potion-color", color)
  }

  // Add word
  function submitWord(e) {
    e.preventDefault();

    const word = e.target.querySelector("input[type=text]");

    if (!word.value) return;



    queryComposer.words.push(word.value);

    word.value = ""; // Reset the input

    const ingredient = document.createElement("span");
    ingredient.classList.add("ingredient");

    let color = randomColors[Math.floor(Math.random() * randomColors.length)];
    ingredient.style.setProperty("--ingredient-color", color)

    updatePotionContent(color);
    // console.log(randomColor)


    e.target.parentElement.appendChild(ingredient);

    setTimeout(() => {
      ingredient.remove();
    }, 5000);

    console.log(queryComposer.words)
  }

  addWord.addEventListener("submit", submitWord);


  // Add genre
  function submitGenre(e) {
    // e.preventDefault();
    const genre = e.currentTarget.dataset["genre"];
    queryComposer.genres.push(genre);
    console.log(genre)
  }

  for (let i = 0; i < addGenre.length; i++) {
    addGenre[i].addEventListener("click", submitGenre);
  }
})();
