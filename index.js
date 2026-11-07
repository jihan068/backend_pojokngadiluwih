const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Konfigurasi koneksi database
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'db_pojokngadiluwih',
  password: 'jeje3011',
  port: 5432,
});

// ==========================================
// ENDPOINT TABEL UMKM
// ==========================================

app.get('/umkm', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM umkm ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.get('/umkm/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ message: 'ID harus berupa angka valid.' });
    }

    const result = await pool.query('SELECT * FROM umkm WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: `Data UMKM dengan ID ${id} tidak ditemukan.` });
    }

    return res.status(200).json(result.rows[0]);

  } catch (error) {
    console.error('Database Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Terdapat kesalahan pada server.'
    });
  }
});

app.post('/umkm', async (req, res) => {
  try {
    const { user_id, nama_produk, jumlah, harga } = req.body;
    const newUmkm = await pool.query(
      "INSERT INTO umkm (user_id, nama_produk, jumlah, harga) VALUES ($1, $2, $3, $4) RETURNING *",
      [user_id, nama_produk, jumlah, harga]
    );
    res.status(201).json(newUmkm.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.put('/umkm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, nama_produk, jumlah, harga } = req.body; 
    
    const updateData = await pool.query(
      'UPDATE umkm SET user_id = $1, nama_produk = $2, jumlah = $3, harga = $4 WHERE id = $5 RETURNING *',
      [user_id, nama_produk, jumlah, harga, id]
    );
    
    if (updateData.rows.length === 0) {
      return res.status(404).json({ message: 'Data UMKM tidak ditemukan' });
    }
    res.json(updateData.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.delete('/umkm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleteData = await pool.query('DELETE FROM umkm WHERE id = $1 RETURNING *', [id]);
    if (deleteData.rows.length === 0) {
      return res.status(404).json({ message: 'Data UMKM tidak ditemukan' });
    }
    res.json({ message: 'Data UMKM berhasil dihapus' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ==========================================
// ENDPOINT TABEL BERITA
// ==========================================

app.get('/berita', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM berita ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.get('/berita/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM berita WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Berita tidak ditemukan' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.post('/berita', async (req, res) => {
  try {
    const { admin_id, kategori, penerbit, judul_berita, konten, gambar_thumbnail, tanggal_terbit } = req.body;
    
    const newData = await pool.query(
      'INSERT INTO berita (admin_id, kategori, penerbit, judul_berita, konten, gambar_thumbnail, tanggal_terbit) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [admin_id, kategori, penerbit, judul_berita, konten, gambar_thumbnail, tanggal_terbit]
    );
    res.status(201).json(newData.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.put('/berita/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { kategori, penerbit, judul_berita, konten, gambar_thumbnail, tanggal_terbit } = req.body;
    
    const updateData = await pool.query(
      'UPDATE berita SET kategori = $1, penerbit = $2, judul_berita = $3, konten = $4, gambar_thumbnail = $5, tanggal_terbit = $6 WHERE id = $7 RETURNING *',
      [kategori, penerbit, judul_berita, konten, gambar_thumbnail, tanggal_terbit, id]
    );
    
    if (updateData.rows.length === 0) {
      return res.status(404).json({ message: 'Berita tidak ditemukan' });
    }
    res.json(updateData.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.delete('/berita/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleteData = await pool.query('DELETE FROM berita WHERE id = $1 RETURNING *', [id]);
    if (deleteData.rows.length === 0) {
      return res.status(404).json({ message: 'Berita tidak ditemukan' });
    }
    res.json({ message: 'Berita berhasil dihapus' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

async function startServer() {
  try {
    await pool.query(
      `INSERT INTO umkm (id, user_id, nama_produk, jumlah, harga)
       VALUES (5, 2, 'Bumbu Pecel Kacang', 10, 25000)
       ON CONFLICT (id) DO NOTHING`
    );
    await pool.query(
      `SELECT setval(pg_get_serial_sequence('umkm', 'id'), (SELECT MAX(id) FROM umkm))`
    );

    app.listen(port, () => {
      console.log(`Server berjalan di http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Gagal menyiapkan data UMKM atau menjalankan server:', error.message);
    await pool.end();
    process.exitCode = 1;
  }
}

startServer();