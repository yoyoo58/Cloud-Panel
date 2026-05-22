let currentPath = [];
let allFiles = [];

function uploadFile() {
    document.getElementById("fileInput").click();
}
document.getElementById("fileInput").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();

    formData.append("file", file);

    const path = encodeURIComponent(currentPath.join("/"));

    const res = await fetch("/api/upload?path=" + path,
        {
            method: "POST",
            body: formData
        });

    loadFiles();
});

document.getElementById("search").addEventListener("input", (e) =>
{
    const value = e.target.value.toLowerCase();

    const filtered = allFiles.filter(f =>
        f.name.toLowerCase().includes(value)
    );

    renderFiles(filtered);
});

function renderPath() {
    const pathDiv = document.getElementById("path");

    pathDiv.innerHTML = "";

    let full = [];

    const root = document.createElement("span");
    root.textContent = "🏠 home";
    root.onclick = () => {
        currentPath = [];
        loadFiles();
    };

    pathDiv.appendChild(root);

    currentPath.forEach((folder, index) => {
        const sep = document.createTextNode(" / ");
        pathDiv.appendChild(sep);

        const part = document.createElement("span");
        part.textContent = folder;

        part.onclick = () => {
            currentPath = currentPath.slice(0, index + 1);
            loadFiles();
        };

        pathDiv.appendChild(part);
    });
}

async function newFolder() {
    const name = prompt("Nom du dossier");

    if (!name) return;

    const res = await fetch("/api/folder",
        {
            method: "POST",
            headers:
            {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                path: currentPath.join("/")
            })
        });

    const data = await res.json();

    if (data.success) {
        loadFiles();
    }
    else {
        alert(data.error);
    }
}

async function loadFiles()
{
    const path = currentPath.join("/");

    const res = await fetch("/api/files?path=" + path);
    const files = await res.json();

    allFiles = files; // stocke tout

    renderFiles(files);
    renderPath();
}

function renderFiles(files)
{
    const container = document.getElementById("files");
    container.innerHTML = "";

    files.forEach(f =>
    {
        const div = document.createElement("div");

        const isFolder = f.isDirectory;

        div.className = "file " + (isFolder ? "folder" : "");

        div.textContent =
            (isFolder ? "📁 " : "📄 ") + f.name;

        div.onclick = () =>
        {
            if (isFolder)
            {
                currentPath.push(f.name);
                loadFiles();
            }
            else
            {
                openFile(f.name);
            }
        };

        container.appendChild(div);
    });
}

function goBack() {
    currentPath.pop();
    loadFiles();
}

function openFile(name) {
    const path = [...currentPath, name].join("/");

    window.open("/file?path=" + path, "_blank");
}

loadFiles();