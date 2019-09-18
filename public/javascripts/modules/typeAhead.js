const axios = require("axios");
import dompurify from 'dompurify';

function createHtml(stores) {
  return stores
    .map(
      store =>
        `<a href=/store/${store.slug} class="search__result">
        <strong>${store.name}</strong>
        </a>`
    )
    .join("");
}

function typeAhead(search) {
  if (!search) return;

  const searchResults = document.querySelector(".search__results");
  const searchInput = document.querySelector('input[name="search"]');

  searchInput.on("input", function() {
    if (!this.value) {
      searchResults.style.display = "none";
      return;
    }

    searchResults.style.display = "block";
    axios
      .get(`/api/search?q=${this.value}`)
      .then(res => {
        if (res.data.stores.length) {
          const html = createHtml(res.data.stores);
          searchResults.innerHTML = dompurify.sanitize(html);
          return;
        }

        searchResults.innerHTML = dompurify.sanitize(`<div class="search__result">No Results Found for ${this.value}</div>`);
      })
      .catch(e => console.error(e.message));
  });

  searchResults.on("keyup", function(e) {
    if (![13, 38, 40].includes(e.keyCode)) {
      return;
    }

    const activeClass = `search__result--active`;
    const current = document.querySelector(`.${activeClass}`);
    const results = document.querySelectorAll(".search__result");
    let next;

    if (e.keyCode === 40 && current) {
      next = current.nextElementSibling || results[0];
    } else if (e.keyCode === 40) {
      next = results[0];
    } else if (e.keyCode === 38 && current) {
      next = current.previousElementSibling || results[results.length - 1];
    } else if (e.keyCode === 38) {
      next = results[results.length - 1];
    } else if (e.keyCode === 13) {
        window.location = current.href;
        return;
    }

    if(current) {
        current.classList.remove(activeClass);
    }

    next.classList.add(activeClass);

    console.log(next);
  });
}

export default typeAhead;
