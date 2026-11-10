
const form = document.getElementById("complaintForm");
const list = document.getElementById("complaintList");

// Submit complaint
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const complaint = {
        name: document.getElementById("name").value.trim(),
        category: document.getElementById("category").value,
        description: document.getElementById("description").value.trim()
    };

    const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(complaint)
    });

    if (!res.ok) {
        alert("Please enter valid details");
        return;
    }

    alert("Complaint submitted successfully!");
    form.reset();
    loadComplaints();
});

// Display complaints
async function loadComplaints() {
    const res = await fetch("/api/complaints");
    const complaints = await res.json();

    list.replaceChildren();

    complaints.forEach(c => {
        const card = document.createElement("div");
        card.className = "complaint";

        const title = document.createElement("h3");
        title.textContent = c.name;

        const category = document.createElement("p");
        category.textContent = "Category: " + c.category;

        const description = document.createElement("p");
        description.textContent = c.description;

        const status = document.createElement("select");

        ["Pending", "In Progress", "Resolved"].forEach(value => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            status.appendChild(option);
        });

        status.value = c.status;

        status.addEventListener("change", async () => {
            await fetch("/api/complaints/" + c.id, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: status.value })
            });
            loadComplaints();
        });

        const del = document.createElement("button");
        del.textContent = "Delete";
        del.className = "delete";

        del.addEventListener("click", async () => {
            await fetch("/api/complaints/" + c.id, {
                method: "DELETE"
            });
            loadComplaints();
        });

        card.append(title, category, description, status, del);
        list.appendChild(card);
    });
}

loadComplaints();
