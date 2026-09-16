export default async function handler(req, res) {

    if (req.method !== "GET") {
        return res.status(405).json({
            error: "Method tidak diizinkan."
        });
    }

    const pageId = process.env.FB_PAGE_ID;
    const accessToken = process.env.FB_PAGE_ACCESS_TOKEN;

    if (!pageId || !accessToken) {
        return res.status(500).json({
            error: "Konfigurasi Facebook API belum tersedia."
        });
    }

    try {

        const fields =
            "id,message,created_time,permalink_url";

        const url =
            `https://graph.facebook.com/v26.0/${pageId}/posts` +
            `?fields=${fields}` +
            `&access_token=${encodeURIComponent(accessToken)}`;

        const facebookResponse = await fetch(url);

        const data = await facebookResponse.json();

        if (!facebookResponse.ok) {
            return res.status(facebookResponse.status).json({
                error:
                    data.error?.message ||
                    "Gagal mengambil data dari Facebook."
            });
        }

        return res.status(200).json(data);

    } catch (error) {

        console.error("Facebook API Error:", error);

        return res.status(500).json({
            error: "Terjadi kesalahan pada server."
        });
    }
}
