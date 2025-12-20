const axios = require("axios")

const BASE_URL = "https://host.optikl.ink"
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"

module.exports = {
  name: "Story Generator",
  desc: "Generate cerita AI berdasarkan prompt dan opsi",
  category: "AI",
  method: "POST",
  path: "/story",
  params: ["prompt", "mode", "length", "creative", "language"],

  async run(req, res) {
    try {
      const {
        prompt,
        mode = "Any genre",
        length = "Short",
        creative = "Medium",
        language = "en",
      } = req.body || {}

      if (!prompt) {
        return res.status(400).json({
          status: false,
          message: "Prompt tidak boleh kosong",
          example: {
            prompt: "cerita tentang hacker jenius",
            mode: "Sci-Fi",
            length: "Long",
            creative: "High",
            language: "id",
          },
        })
      }

      const { data } = await axios.post(
        `${BASE_URL}/ai/storygenerator`,
        {
          text: prompt,
          client: "web_client",
          mode,
          length,
          creative,
          language,
        },
        {
          headers: {
            "content-type": "application/json",
            "user-agent": UA,
          },
          timeout: 60000,
        }
      )

      if (!data || !data.success || !data.text) {
        return res.status(502).json({
          status: false,
          message: "Gagal generate story",
          error: data?.error || "Unknown error",
        })
      }

      res.status(200).json({
        status: true,
        data: {
          text: data.text.trim(),
          options: {
            mode,
            length,
            creative,
            language,
          },
        },
        metadata: {
          source: "optikl.ai.storygenerator",
          timestamp: new Date().toISOString(),
        },
      })
    } catch (err) {
      console.error("[Story Plugin]", err.message)

      res.status(500).json({
        status: false,
        message: "Terjadi kesalahan saat generate story",
        error: err.message,
        timestamp: new Date().toISOString(),
      })
    }
  },
}
