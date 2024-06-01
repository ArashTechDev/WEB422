let page = 1;
const perPage = 10;
let searchName = null;
 
function handleEmptyData() {
    const tableBody = document.querySelector("#listingsTable tbody");
    tableBody.innerHTML = "";
 
    if (page > 1) {
        page--;
    } else {
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="4"><strong>No data available</strong></td>`;
        tableBody.appendChild(row);
    }
}
 
async function loadListingsData() {
    let url = `http://localhost:8000/api/listings?page=${page}&perPage=${perPage}`;
    if (searchName) {
        url += `&name=${searchName}`;
    }
 
    try {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        // I AM STILL WONDERING HOW REMOVING THIS LINE FIXED MY CODE
       /// console.log(res.json());
        const data = await res.json();
        if (data.length) {
            const tableBody = document.querySelector("#listingsTable tbody");
    tableBody.innerHTML = "";

    data.forEach(listing => {
        const row = document.createElement("tr");
        row.dataset.id = listing._id;
        row.innerHTML = `
            <td>${listing.name}</td>
            <td>${listing.room_type || 'undefined'}</td>
            <td>${listing.address?.street || 'undefined'}</td>
            <td>${listing.summary || 'undefined'}<br><br><strong>Accomodation: </strong>${listing.accommodates}<br><strong>Ratings: </strong>${listing.review_scores?.review_scores_value}</td>
        `;
        row.addEventListener("click", async () => {
            await showListingDetails(listing._id);
        });
        tableBody.appendChild(row);
    });
            const currentPageElement = document.getElementById('current-page');
         if (currentPageElement) {
              currentPageElement.textContent = page;
             }
        } else {
            handleEmptyData();
        }
    } catch (err) {
        handleEmptyData();
    }
}

async function showListingDetails(id) {
    try {
        const res = await fetch(`http://localhost:8000/api/listings/${id}`);
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const listing = await res.json();
        const modalTitle = document.querySelector("#detailsModal .modal-title");
        const modalBody = document.querySelector("#detailsModal .modal-body");

        modalTitle.textContent = listing.name;
        modalBody.innerHTML = `
            <img id="photo" onerror="this.onerror=null;this.src='https://placehold.co/600x400?text=Photo+Not+Available'" class="img-fluid w-100" src="${listing.images?.picture_url || 'https://placehold.co/600x400?text=Photo+Not+Available'}"><br><br>
            ${listing.neighborhood_overview || ''}<br><br>
            <strong>Price:</strong> $${listing.price?.toFixed(2) || 'N/A'}<br>
            <strong>Room:</strong> ${listing.room_type || 'N/A'}<br>
            <strong>Bed:</strong> ${listing.bed_type} (${listing.beds})<br>
        `;

        const modal = new bootstrap.Modal(document.getElementById('detailsModal'));
        modal.show();
    } catch (err) {
        console.error(err);
    }
}
document.getElementById("previous-page").addEventListener("click", () => {
    if (page > 1) {
        page--;
        loadListingsData();
    }
});
 
document.getElementById("next-page").addEventListener("click", () => {
    page++;
    loadListingsData();
});
 
document.getElementById("searchForm").addEventListener("submit", (event) => {
    event.preventDefault();
    searchName = document.getElementById("name").value;
    page = 1;
    loadListingsData();
});
 
document.getElementById("clearForm").addEventListener("click", () => {
    searchName = null;
    document.getElementById("name").value = "";
    page = 1;
    loadListingsData();
});
 
document.addEventListener("DOMContentLoaded", () => {
    loadListingsData();
});