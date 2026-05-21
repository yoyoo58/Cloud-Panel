let currentPath = [];

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

async function newFolder() {
    const name = prompt("Nom du dossier");

    if (!name) return;

    const res = await fetch("/api/folder",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name })
        });

    const data = await res.json();

    if (data.success) {
        loadFiles();
    }
    else {
        alert(data.error);
    }
}

async function loadFiles() {
    const path = currentPath.join("/");

    const res = await fetch("/api/files?path=" + path);
    const files = await res.json();

    const container = document.getElementById("files");
    container.innerHTML = "";

    files.forEach(f => {
        const div = document.createElement("div");

        const isFolder = f.isDirectory;

        div.className = "file " + (isFolder ? "folder" : "");

        /* ===== NOM ===== */

        const name = document.createElement("span");

        name.textContent =
            (isFolder ? "📁 " : "📄 ") + f.name;

        name.style.flex = "1";

        name.onclick = () => {
            if (isFolder) {
                currentPath.push(f.name);
                loadFiles();
            }
            else {
                openFile(f.name);
            }
        };

        /* ===== DELETE BUTTON ===== */

        const del = document.createElement("button");

        del.textContent = "✖";

        del.className = "deleteBtn";

        del.onclick = async (e) => {
            e.stopPropagation();

            if (!confirm("Supprimer " + f.name + " ?"))
                return;

            const fullPath =
                [...currentPath, f.name].join("/");

            const res = await fetch("/api/delete/" + encodeURIComponent(fullPath),
                {
                    method: "DELETE"
                });

            if (!res.ok) {
                const text = await res.text();
                return;
            }

            const data = await res.json();
            loadFiles();
        };

        div.appendChild(name);
        div.appendChild(del);

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