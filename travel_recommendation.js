let travelData = null;

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");
  const clearButton = document.getElementById("clearButton");
  const resultsContainer = document.getElementById("searchResults");

  if (!searchInput || !searchButton || !clearButton || !resultsContainer) {
    return;
  }

  fetch("travel_recommendation_api.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load recommendations data.");
      }
      return response.json();
    })
    .then((data) => {
      travelData = data;
    })
    .catch((error) => {
      console.error(error);
      resultsContainer.innerHTML =
        "<p>Could not load destination data. Open this site from a local server (not file://).</p>";
    });

  function runSearch() {
    const query = searchInput.value.trim().toLowerCase();

    if (!query) {
      resultsContainer.innerHTML = "<p>Please type a destination.</p>";
      return;
    }

    if (!travelData) {
      resultsContainer.innerHTML = "<p>Data is still loading. Try again in a moment.</p>";
      return;
    }

    const results = [];
    const added = new Set();

    const includeItem = (item) => {
      const key = `${item.name}|${item.imageUrl}`;
      if (!added.has(key)) {
        added.add(key);
        results.push(item);
      }
    };

    const queryTerms = query.split(/\s+/).filter(Boolean);
    const hasTerm = (text, term) => text.toLowerCase().includes(term);
    const hasAnyTerm = (text) => queryTerms.some((term) => hasTerm(text, term));

    (travelData.countries || []).forEach((country) => {
      const countryMatches =
        hasTerm(country.name, query) ||
        hasAnyTerm(country.name) ||
        ["country", "countries"].includes(query);

      (country.cities || []).forEach((city) => {
        if (
          countryMatches ||
          hasTerm(city.name, query) ||
          hasAnyTerm(city.name) ||
          hasTerm(city.description, query) ||
          hasAnyTerm(city.description) ||
          ["city", "cities"].includes(query)
        ) {
          includeItem(city);
        }
      });
    });

    (travelData.temples || []).forEach((temple) => {
      if (
        hasTerm(temple.name, query) ||
        hasAnyTerm(temple.name) ||
        hasTerm(temple.description, query) ||
        hasAnyTerm(temple.description) ||
        ["temple", "temples"].includes(query)
      ) {
        includeItem(temple);
      }
    });

    (travelData.beaches || []).forEach((beach) => {
      if (
        hasTerm(beach.name, query) ||
        hasAnyTerm(beach.name) ||
        hasTerm(beach.description, query) ||
        hasAnyTerm(beach.description) ||
        ["beach", "beaches"].includes(query)
      ) {
        includeItem(beach);
      }
    });

    displayResults(results, resultsContainer);
  }

  searchButton.addEventListener("click", runSearch);
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      runSearch();
    }
  });

  clearButton.addEventListener("click", () => {
    searchInput.value = "";
    resultsContainer.innerHTML = "";
  });
});

function displayResults(results, container) {
  container.innerHTML = "";

  if (results.length === 0) {
    container.innerHTML = "<p>No destinations found.</p>";
    return;
  }

  results.forEach((item) => {
    const card = document.createElement("div");
    card.style.cssText =
      "border: 1px solid #ccc; margin: 10px; padding: 10px; border-radius: 8px;";

    card.innerHTML = `
      <h3>${item.name}</h3>
      <img src="${item.imageUrl}" alt="${item.name}" style="width: 200px; height: 140px; object-fit: cover;">
      <p>${item.description}</p>
    `;

    container.appendChild(card);
  });
}