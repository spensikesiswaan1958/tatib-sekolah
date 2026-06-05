import { supabase } from '../../lib/supabase'

export default async function DaftarSiswaPage() {
  // Mengambil semua data dari tabel 'siswa' di database Supabase
  const { data: siswa, error } = await supabase
    .from('siswa')
    .select('nis, nama, kelas, total_poin')

  if (error) {
    return (
      <div style={{ padding: '40px', color: 'red', fontFamily: 'sans-serif' }}>
        <h2>Gagal mengambil data siswa</h2>
        <p>Pesan Error: {error.message}</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1 style={{ marginBottom: '5px' }}>Daftar Siswa</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>Sistem Tata Tertib Digital</p>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f4f4f4', textAlign: 'left' }}>
            <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>NIS</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Nama Lengkap</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Kelas</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Total Poin</th>
          </tr>
        </thead>
        <tbody>
          {siswa && siswa.length > 0 ? (
            siswa.map((item) => (
              <tr key={item.nis} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{item.nis}</td>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{item.nama}</td>
                <td style={{ padding: '12px' }}>{item.kelas}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    backgroundColor: item.total_poin > 0 ? '#ffebe9' : '#e6f4ea',
                    color: item.total_poin > 0 ? '#ce1515' : '#137333',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}>
                    {item.total_poin} Poin
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                Belum ada data siswa di database.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}