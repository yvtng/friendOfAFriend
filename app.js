/* -----------------------------
   Person Class
----------------------------- */
class Person {
  constructor(name, username, profile_link, referrers) {
    this.name = name;
    this.username = username;
    this.profile_link = profile_link;

    // Clean up referrer URLs
    this.referrers = referrers.map(r =>
      r.replace("https://instagram.com/", "")
    );
  }
}


/* -----------------------------
   Parse backend response into people[]
----------------------------- */
function parsePeople(text) {
  const parts = text.split("&&&");
  if (parts.length < 4) {
    console.error("Invalid server response");
    return [];
  }

  const [namesStr, usernamesStr, linksStr, referrersStr] = parts;

  const names = namesStr.split(",");
  const usernames = usernamesStr.split(",");
  const links = linksStr.split(",");
  const referrersRaw = referrersStr.split(",");

  const people = [];

  for (let i = 0; i < names.length; i++) {
    const refList = referrersRaw[i]
      ? referrersRaw[i].split(" | ").map(s => s.trim())
      : [];

    people.push(
      new Person(
        names[i] || "",
        usernames[i] || "",
        links[i] || "",
        refList
      )
    );
  }

  return people;
}


/* -----------------------------
   Render Person Cards
----------------------------- */
function renderPeople(people) {
  const container = document.getElementById("people-container");
  container.innerHTML = ""; // clear old cards

  people.forEach(person => {
    const card = document.createElement("div");
    card.className = "person-card";

    // basic details
    card.innerHTML = `
      <h3>${person.name}</h3>
      <p>@${person.username}</p>
      <div class="person-card-details" style="display:none;">
        <p><strong>Profile:</strong> <a href="${person.profile_link}" target="_blank">${person.profile_link}</a></p>
        <p><strong>Referrers:</strong> ${person.referrers.join(", ")}</p>
      </div>
    `;

    // toggle expand/collapse
    card.addEventListener("click", () => {
      const details = card.querySelector(".person-card-details");
      details.style.display =
        details.style.display === "block" ? "none" : "block";
    });

    container.appendChild(card);
  });
}


/* -----------------------------
   Sleep helper
----------------------------- */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


/* -----------------------------
   Fetch + assign to cards
----------------------------- */
document.getElementById("runBtn").addEventListener("click", async () => {
  const username = document.getElementById("session").value.trim();
  const loading = document.getElementById("loading");

  if (!username) {
    alert("Please enter a handle!");
    return;
  }

  // Show spinner
  loading.style.display = "block";

  // Optional: smoother UX delay
  await sleep(400);

  const url = "https://shmokey.pythonanywhere.com/get_picks/" + username;

  fetch(url)
    .then(res => res.text())
    .then(async text => {
      await sleep(400); // delay to keep spinner visible

      if (text.includes("Internal Server Error")) {
        alert("Server error — check backend logs.");
        return;
      }

      const people = parsePeople(text);
      renderPeople(people);
    })
    .catch(err => {
      console.error(err);
      alert("Error fetching data.");
    })
    .finally(() => {
      loading.style.display = "none"; // Hide spinner
    });
});
