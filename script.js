// script.js

document.addEventListener("DOMContentLoaded", () => {
  const searchBtn = document.getElementById("searchBtn");
  const searchQueryInput = document.getElementById("searchQuery");
  const resultsContainer = document.getElementById("resultsContainer");

  searchBtn.addEventListener("click", async () => {
    const query = searchQueryInput.value.trim();
    if (!query) {
      alert("Please enter a search query.");
      return;
    }

    // Clear old results
    resultsContainer.innerHTML = "";

    // Optionally show a loading message
    const loadingMessage = document.createElement("p");
    loadingMessage.textContent = "Searching...";
    resultsContainer.appendChild(loadingMessage);

    try {
      // Example endpoint (Adjust to your actual Deepseek API route)
      const apiUrl = `https://api.deepseek.com/search?query=${encodeURIComponent(query)}`;

      // Perform the fetch
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          // If Deepseek requires an API key or any other headers, add them here.
          // 'Authorization': 'Bearer YOUR_API_KEY'
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // Example result shape -> adapt to your API
      const data = await response.json();

      // Clear loading message
      resultsContainer.innerHTML = "";

      // If the API returns an array of results:
      data.forEach(item => {
        // Create a wrapper for each item
        const itemDiv = document.createElement("div");
        itemDiv.classList.add("result-item");

        // Title
        const titleEl = document.createElement("div");
        titleEl.classList.add("result-title");
        titleEl.textContent = item.title || "No Title";

        // Description
        const descriptionEl = document.createElement("div");
        descriptionEl.classList.add("result-description");
        descriptionEl.textContent = item.description || "No Description";

        // Append children
        itemDiv.appendChild(titleEl);
        itemDiv.appendChild(descriptionEl);

        // Add item to results container
        resultsContainer.appendChild(itemDiv);
      });

      // If there were zero results, notify the user
      if (data.length === 0) {
        resultsContainer.textContent = "No results found.";
      }

    } catch (error) {
      console.error("Fetch error:", error);
      resultsContainer.innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
    }
  });
});
