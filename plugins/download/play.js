const axios = require("axios")
const yts = require("yt-search")

module.exports = {
  name: "Play Music",
  desc: "Cari lagu dari YouTube dan download MP3",
  category: "Download",
  method: "GET",
  path: "/play",
  params: ["q"],
  example: "/download/play?q=dj aku bukan boneka",

  async run(req, res) {
    try {
      const { q } = req.query

      if (!q) {
        return res.status(400).json({
          status: false,
          message: "Parameter q (judul lagu) wajib diisi"
        })
      }

      const search = await yts(q)

      if (!search.videos || !search.videos.length) {
        return res.status(404).json({
          status: false,
          message: "Lagu tidak ditemukan"
        })
      }

      const vid = search.videos[0]

      const { data } = await axios.get(
        "https://host.optikl.ink/download/youtube",
        {
          params: {
            url: vid.url,
            format: "mp3"
          },
          timeout: 60000,
          headers: {
            "User-Agent": "Mozilla/5.0"
          }
        }
      )

      if (!data.status || !data.result?.download) {
        return res.status(502).json({
          status: false,
          message: "Gagal mengambil audio"
        })
      }

      const r = data.result

      res.status(200).json({
        status: true,
        data: {
          title: r.title,
          author: vid.author?.name || null,
          duration: vid.timestamp,
          thumbnail: vid.thumbnail,
          source: vid.url,
          download: r.download
        },
        metadata: {
          source: "YouTube",
          timestamp: new Date().toISOString()
        }
      })

    } catch (err) {
      console.error("[Plugin Play]", err.message)

      res.status(500).json({
        status: false,
        message: "Gagal memproses play",
        error: err.message,
        timestamp: new Date().toISOString()
      })
    }
  }
}
