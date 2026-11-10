
import express from "express";
import fs from "fs";
import path from "path";

const app = express();
const PORT = 3000;
const FILE = "complaints.json";

app.use(express.json());
app.use(express.static("public"));

// Read complaints from file
function getComplaints() {
    if (!fs.existsSync(FILE)) {
        fs.writeFileSync(FILE, "[]");
    }
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
}

// Save complaints
function saveComplaints(data) {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

// Get all complaints
app.get("/api/complaints", (req, res) => {
    res.json(getComplaints());
});

// Add complaint
app.post("/api/complaints", (req, res) => {
    const { name, category, description } = req.body;

    if (!name?.trim() || !category || !description?.trim()) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const complaints = getComplaints();

    const complaint = {
        id: Date.now().toString(),
        name,
        category,
        description,
        status: "Pending"
    };

    complaints.push(complaint);
    saveComplaints(complaints);

    res.status(201).json(complaint);
});

// Update complaint status
app.put("/api/complaints/:id", (req, res) => {
    const complaints = getComplaints();
    const item = complaints.find(c => c.id === req.params.id);
    const { status } = req.body;

    if (!item) {
        return res.status(404).json({ message: "Complaint not found" });
    }

    if (!["Pending", "In Progress", "Resolved"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
    }

    item.status = status;
    saveComplaints(complaints);
    res.json(item);
});

// Delete complaint
app.delete("/api/complaints/:id", (req, res) => {
    const complaints = getComplaints();
    const updated = complaints.filter(c => c.id !== req.params.id);

    if (updated.length === complaints.length) {
        return res.status(404).json({ message: "Complaint not found" });
    }

    saveComplaints(updated);
    res.json({ message: "Complaint deleted" });
});

app.listen(PORT, () => {
    console.log(`CampusCare running at http://localhost:${PORT}`);
});
