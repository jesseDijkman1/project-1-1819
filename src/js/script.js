
(() => {
  const app = {
    // First called function when page is loaded, checks the current hash and changes it if needed
    init: () => {
      let hash = window.location.hash || undefined;

      // If there's no hash, change it to default (#home/characters/1)
      if (!hash) {
        window.location.hash = "#search";
      }
    },
    // Quicker way to change the window location with javascript
    changeHash: newHash => window.location.hash = newHash,
    // Loader for the users, takes CSS display value as parameter ("none" and "flex")
    loader: display => {
      document.getElementById("loader").style.display = display;
    }
  }
  app.init()

  const bubbles = document.getElementsByClassName("bubble");
  const explosion = document.getElementById("explosion");
  const mainPotion = document.getElementById("main-potion");
  const addWord = document.querySelector("#add-words form");
  const addGenre = document.querySelectorAll("#add-genres li[data-genre]");
  const randomColors = ["#00a0e4", "#38ad6a", "#e9532a", "#ffee00", "#d72157"];
  const changeSectionBtn = document.getElementsByClassName("change-section");

  for (let i = 0; i < changeSectionBtn.length; i++) {
    changeSectionBtn[i].addEventListener("click", changeSection);
  }

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

  function changeSection(e) {
    if (e.target.classList.contains("right")) {
      document.body.classList.add("genres");
    } else {
      document.body.classList.remove("genres")
    }
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
    // const potion = mainPotion.querySelector(".potion");
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


    e.target.appendChild(ingredient);

    setTimeout(() => {
      ingredient.remove();
    }, 5000);

    console.log(queryComposer.words)
  }

  addWord.addEventListener("submit", submitWord);


  // Add genre
  function submitGenre(e) {
    let hiddenEl = document.querySelector(".is-hidden");

    if (hiddenEl) {
      hiddenEl.remove()
    }

    // e.preventDefault();
    console.log(e.currentTarget)
    const el = e.currentTarget;
    const time = 500;
    const clone = el.cloneNode(true);
    const cloneLeft = el.getBoundingClientRect().left;
    const cloneTop = el.getBoundingClientRect().top;
    const cloneWidth = el.offsetWidth;
    const cloneColor = getComputedStyle(el).getPropertyValue("--card-color");


    console.log(cloneLeft, cloneWidth)
    clone.style.position = "fixed";
    clone.style.setProperty("--clone-width", `${cloneWidth}px`)
    clone.style.setProperty("--clone-left", `${cloneLeft}px`)
    clone.style.setProperty("--clone-top", `${cloneTop}px`)
    clone.style.setProperty("--fly-speed", `${time / 1000}s`)
    clone.style.setProperty("--card-color", cloneColor);
    clone.style.background = cloneColor;
    clone.classList.add("flyInBottle");

    setTimeout(() => {
      clone.style.setProperty("--clone-left", `calc(50vw - var(--clone-width) / 2)`)
      clone.style.setProperty("--clone-top", `100vh`)
    }, 1)

    setTimeout(() => {

      el.remove()
      console.log("remove")
    }, time * 5)

    document.body.appendChild(clone)

    updatePotionContent(cloneColor)

    const genre = el.dataset["genre"];
    queryComposer.genres.push(genre);
    console.log(genre)

    const previousEl = el.previousElementSibling;
    const nextEl = el.nextElementSibling;

    if (!previousEl || el.classList.contains("is-first")) {
      el.nextElementSibling.style.marginLeft = "0px"
      el.nextElementSibling.classList.add("is-first")
    }

    if (!nextEl || el.classList.contains("is-last")) {
      el.previousElementSibling.style.marginRight = "0px"
      el.previousElementSibling.classList.add("is-last")
    }

    el.classList.add("is-hidden")
  }

  for (let i = 0; i < addGenre.length; i++) {
    addGenre[i].addEventListener("click", submitGenre);
  }

  const router = {
    search: function() {

    }
  }
  routie({
    "search": (category, page) => {
      router.home(category, page);
    }
  });

})();
