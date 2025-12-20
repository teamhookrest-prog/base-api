const axios = require("axios")

const BASE_API = "https://host.optikl.ink/soundcloud"
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"

module.exports = {
  name: "SoundCloud",
  desc: "Cari lagu SoundCloud dari query dan langsung download audio",
  category: "Search",
  method: "GET",
  path: "/soundcloud",
  params: ["q"],

  async run(req, res) {
    try {
      const { q } = req.query

      if (!q) {
        return res.status(400).json({
          status: false,
          message: "Query tidak boleh kosong",
          example: "/download/soundcloud?q=dewa 19 kangen",
        })
      }

      const search = await axios.get(`${BASE_API}/search`, {
        params: { query: q },
        headers: { "user-agent": UA },
        timeout: 15000,
      })

      if (!Array.isArray(search.data) || !search.data.length) {
        return res.status(404).json({
          status: false,
          message: "Lagu tidak ditemukan",
        })
      }

      const track = search.data[0]

      if (!track.url) {
        return res.status(502).json({
          status: false,
          message: "URL track tidak tersedia",
        })
      }

      const dl = await axios.get(`${BASE_API}/download`, {
        params: { url: track.url },
        headers: { "user-agent": UA },
        timeout: 15000,
      })

      if (!dl.data || !dl.data.audio_url) {
        return res.status(502).json({
          status: false,
          message: "Gagal mendapatkan audio",
        })
      }

      res.status(200).json({
        status: true,
        data: {
          title: dl.data.title || track.title || "Unknown",
          author: dl.data.author || track.author?.name || "Unknown",
          duration: dl.data.duration || track.duration || null,
          thumbnail: dl.data.thumbnail || track.thumbnail || null,
          audio: dl.data.audio_url,
          source: "soundcloud",
        },
        metadata: {
          query: q,
          auto: true,
          timestamp: new Date().toISOString(),
        },
      })
    } catch (err) {
      console.error("[SoundCloud Plugin]", err.message)

      res.status(500).json({
        status: false,
        message: "Gagal memproses SoundCloud",
        error: err.message,
        timestamp: new Date().toISOString(),
      })
    }
  },
}
