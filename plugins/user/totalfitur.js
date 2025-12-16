const fs = require("fs");
const path = require("path");

module.exports = {
  name: "Total Fitur",
  desc: "Menampilkan total semua plugin yang terdaftar di semua kategori",
  category: "User",
  method: "GET",
  path: "/total",

  async run(req, res) {
    try {
      const showDetail = req.query.detail === 'true';
      const pluginsDir = path.join(__dirname, "..", "..", "plugins");
      
      if (!fs.existsSync(pluginsDir)) {
        return res.status(200).json({
          status: true,
          total: 0,
          message: "Tidak ada plugin yang terdaftar"
        });
      }

      const categories = fs.readdirSync(pluginsDir).filter(file => {
        const fullPath = path.join(pluginsDir, file);
        return fs.statSync(fullPath).isDirectory();
      });

      let total = 0;
      const detail = {};
      const semuaFitur = [];

      for (const category of categories) {
        const categoryDir = path.join(pluginsDir, category);
        const files = fs.readdirSync(categoryDir).filter(f => f.endsWith(".js"));
        
        for (const file of files) {
          const filePath = path.join(categoryDir, file);
          try {
            const plugin = require(filePath);
            if (plugin.name) {
              semuaFitur.push({
                nama_fitur: plugin.name,
                kategori: plugin.category || category,
                deskripsi: plugin.desc || "Tidak ada deskripsi",
                endpoint: `/${category.toLowerCase()}${plugin.path.startsWith('/') ? plugin.path : '/' + plugin.path}`
              });
            }
          } catch (err) {
            console.error(`Error membaca plugin ${file}:`, err.message);
          }
        }
        
        total += files.length;
        detail[category] = files.length;
      }

      const response = {
        status: true,
        total_fitur: total,
        timestamp: new Date().toISOString()
      };

      if (showDetail) {
        // Format lengkap dengan semua detail
        response.detail = {
          per_kategori: detail,
          total_kategori: Object.keys(detail).length,
          semua_fitur: semuaFitur
        };
      } else {
        // Format sederhana: hanya nama fitur
        response.nama_fitur = semuaFitur.map(fitur => fitur.nama_fitur);
      }

      res.status(200).json(response);
    } catch (err) {
      console.error("Error in /user/total:", err);
      res.status(500).json({
        status: false,
        message: "Terjadi kesalahan: " + err.message,
        timestamp: new Date().toISOString()
      });
    }
  }
};
