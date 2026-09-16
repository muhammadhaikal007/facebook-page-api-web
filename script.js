const postsContainer = document.getElementById("postsContainer");
const loadingMessage = document.getElementById("loadingMessage");
const errorMessage = document.getElementById("errorMessage");
const refreshButton = document.getElementById("refreshButton");


async function loadFacebookPosts() {
    // Tampilkan status loading
    loadingMessage.classList.remove("hidden");
    errorMessage.classList.add("hidden");

    // Kosongkan posting lama
    postsContainer.innerHTML = "";

    // Nonaktifkan tombol selama proses mengambil data
    refreshButton.disabled = true;
    refreshButton.textContent = "Memuat...";

    try {
        // Mengambil data dari API server kita
        const response = await fetch("/api/facebook");

        const contentType =
            response.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
            throw new Error(
                "API backend belum berjalan. Jalankan website melalui Vercel."
            );
        }

        const result = await response.json();

        // Jika response dari server gagal
        if (!response.ok) {
            throw new Error(
                result.error || "Gagal mengambil data dari server."
            );
        }

        // Hilangkan tulisan loading
        loadingMessage.classList.add("hidden");

        // Pastikan data posting tersedia
        if (!result.data || result.data.length === 0) {
            postsContainer.innerHTML = `
                <div class="post-card">
                    <p>Belum ada posting yang tersedia.</p>
                </div>
            `;
            return;
        }

        // Menampilkan setiap posting Facebook
        result.data.forEach(post => {
            const postCard = document.createElement("article");
            postCard.classList.add("post-card");

            // Tidak semua posting Facebook mempunyai field message
            const message = post.message
                ? escapeHTML(post.message)
                : "Posting ini tidak memiliki teks.";

            const date = formatDate(post.created_time);

            const link = post.permalink_url
                ? post.permalink_url
                : "#";

            postCard.innerHTML = `
                <p class="post-message">${message}</p>

                <p class="post-date">
                    ${date}
                </p>

                ${
                    post.permalink_url
                        ? `
                            <a
                                href="${link}"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="post-link"
                            >
                                Lihat di Facebook
                            </a>
                        `
                        : ""
                }
            `;

            postsContainer.appendChild(postCard);
        });

    } catch (error) {
        loadingMessage.classList.add("hidden");

        errorMessage.textContent =
            "Terjadi kesalahan: " + error.message;

        errorMessage.classList.remove("hidden");

        console.error("Facebook API Error:", error);

    } finally {
        refreshButton.disabled = false;
        refreshButton.textContent = "Refresh";
    }
}


// Mengubah waktu API Facebook menjadi format Indonesia
function formatDate(dateString) {
    if (!dateString) {
        return "Waktu tidak tersedia";
    }

    const date = new Date(dateString);

    return new Intl.DateTimeFormat("id-ID", {
        dateStyle: "long",
        timeStyle: "short",
        timeZone: "Asia/Jakarta"
    }).format(date);
}


// Mencegah teks posting dianggap sebagai kode HTML
function escapeHTML(text) {
    const element = document.createElement("div");

    element.textContent = text;

    return element.innerHTML;
}


// Tombol Refresh
refreshButton.addEventListener("click", loadFacebookPosts);


// Ambil posting otomatis saat halaman pertama dibuka
document.addEventListener("DOMContentLoaded", loadFacebookPosts);