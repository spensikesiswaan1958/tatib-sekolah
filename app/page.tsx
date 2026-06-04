import { supabase } from '../lib/supabase'

export default async function Home() {
  // Mengambil 1 baris data dari tabel kategori_pelanggaran untuk tes
  const { data, error } = await supabase.from('kategori_pelanggaran').select('*').limit(1)

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>Status Koneksi Proyek Tata Tertib</h1>
      <hr style={{ margin: '20px 0' }} />
      
      {error ? (
        <div style={{ color: 'red', backgroundColor: '#fde8e8', padding: '15px', borderRadius: '5px' }}>
          ❌ <strong>Koneksi Gagal!</strong> <br />
          Pesan Error: {error.message}
        </div>
      ) : (
        <div style={{ color: 'green', backgroundColor: '#def7ec', padding: '15px', borderRadius: '5px' }}>
          ✅ <strong>Koneksi Sukses!</strong> Next.js berhasil tersambung ke Supabase. <br />
          <p style={{ color: '#333', marginTop: '10px' }}>
            Contoh data yang berhasil ditarik: <strong>{data && data[0] ? data[0].jenis_pelanggaran : 'Data kosong'}</strong>
          </p>
        </div>
      )}
    </div>
  )
}
```[cite: 1]

Jangan lupa tekan **Ctrl + S** untuk menyimpan file `app/page.tsx`[cite: 1].

### 2. Jalankan Aplikasi di Terminal
Sekarang jalankan server lokal proyek kamu.
1. Klik area **Terminal** di bagian bawah VS Code[cite: 1].
2. Ketik perintah berikut lalu tekan **Enter**:
   ```bash
npm run dev
```[cite: 1]
3. Tunggu sampai muncul tulisan `ready - started server on http://localhost:3000`.

### 3. Cek Hasilnya di Browser
* Buka browser kamu (Chrome/Edge), lalu buka alamat: **`http://localhost:3000`**[cite: 1]
* Lihat kotak yang muncul di layar:

<blockquote>
  💚 <strong>Jika Muncul Kotak Hijau ("Koneksi Sukses!"):</strong><br />
  Selamat! Berarti file <code>.env.local</code> dan file <code>lib/supabase.ts</code> kamu sudah bekerja 100% dengan benar. Target Hari 13 <strong>Selesai!</strong> Kamu bisa menandai centang hijau di tracker milikmu.
</blockquote>

<blockquote>
  ❤️ <strong>Jika Muncul Kotak Merah ("Koneksi Gagal!"):</strong><br />
  Artinya ada kesalahan ketik (typo) saat kamu memasukkan URL atau Anon Key di file <code>.env.local</code>. Periksa kembali isi file tersebut dan pastikan tidak ada spasi di antara tanda sama dengan (<code>=</code>).
</blockquote>

---

Jika kotak hijau sudah menyala di browser, kamu bisa mengembalikan isi `app/page.tsx` ke tampilan awal kamu atau membiarkannya begitu saja untuk bersiap lanjut ke **Hari 14 (Menampilkan daftar siswa)** besok[cite: 1]!