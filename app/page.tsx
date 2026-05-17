export default function Home() {
  return (
    <div style={{minHeight:'100vh', backgroundColor:'#f0f4f8', fontFamily:'sans-serif'}}>
      
      <div style={{backgroundColor:'#332ddc', padding:'16px 32px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h1 style={{color:'white', margin:0, fontSize:'20px'}}>SISTEM TATA TERTIB DIGITAL SPENSI TAHUN PELAJARAN 2026/2027</h1>
        <span style={{color:'white', fontSize:'14px'}}>UPT SMP NEGERI 1 WLINGI</span>
      </div>

      <div style={{padding:'32px'}}>
        <p style={{color:'#555', marginBottom:'24px'}}>Selamat datang, Admin Kesiswaan</p>

        <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'16px', marginBottom:'32px'}}>
          
          <div style={{backgroundColor:'white', borderRadius:'8px', padding:'20px', borderLeft:'4px solid #3b82f6'}}>
            <p style={{color:'#888', fontSize:'12px', margin:'0 0 8px'}}>TOTAL SISWA</p>
            <p style={{fontSize:'32px', fontWeight:'bold', color:'#1e40af', margin:0}}>960</p>
          </div>

          <div style={{backgroundColor:'white', borderRadius:'8px', padding:'20px', borderLeft:'4px solid #16a34a'}}>
            <p style={{color:'#888', fontSize:'12px', margin:'0 0 8px'}}>GURU & KARYAWAN</p>
            <p style={{fontSize:'32px', fontWeight:'bold', color:'#15803d', margin:0}}>75</p>
          </div>

          <div style={{backgroundColor:'white', borderRadius:'8px', padding:'20px', borderLeft:'4px solid #f59e0b'}}>
            <p style={{color:'#888', fontSize:'12px', margin:'0 0 8px'}}>WALI MURID</p>
            <p style={{fontSize:'32px', fontWeight:'bold', color:'#b45309', margin:0}}>960</p>
          </div>

          <div style={{backgroundColor:'white', borderRadius:'8px', padding:'20px', borderLeft:'4px solid #ef4444'}}>
            <p style={{color:'#888', fontSize:'12px', margin:'0 0 8px'}}>PELANGGARAN</p>
            <p style={{fontSize:'32px', fontWeight:'bold', color:'#b91c1c', margin:0}}>0</p>
          </div>

        </div>

        <div style={{backgroundColor:'white', borderRadius:'8px', padding:'24px'}}>
          <h2 style={{fontSize:'16px', marginBottom:'16px', color:'#333'}}>Menu Utama</h2>
          <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'12px'}}>
            
            <div style={{backgroundColor:'#eff6ff', borderRadius:'8px', padding:'16px', textAlign:'center', cursor:'pointer'}}>
              <p style={{fontSize:'24px', margin:'0 0 8px'}}>👥</p>
              <p style={{fontWeight:'bold', color:'#1e40af', margin:0}}>Data Siswa</p>
            </div>

            <div style={{backgroundColor:'#f0fdf4', borderRadius:'8px', padding:'16px', textAlign:'center', cursor:'pointer'}}>
              <p style={{fontSize:'24px', margin:'0 0 8px'}}>📋</p>
              <p style={{fontWeight:'bold', color:'#15803d', margin:0}}>Input Pelanggaran</p>
            </div>

            <div style={{backgroundColor:'#fefce8', borderRadius:'8px', padding:'16px', textAlign:'center', cursor:'pointer'}}>
              <p style={{fontSize:'24px', margin:'0 0 8px'}}>📊</p>
              <p style={{fontWeight:'bold', color:'#b45309', margin:0}}>Laporan</p>
            </div>

            <div style={{backgroundColor:'#fff7ed', borderRadius:'8px', padding:'16px', textAlign:'center', cursor:'pointer'}}>
              <p style={{fontSize:'24px', margin:'0 0 8px'}}>📱</p>
              <p style={{fontWeight:'bold', color:'#c2410c', margin:0}}>Scan Absensi</p>
            </div>

            <div style={{backgroundColor:'#fdf4ff', borderRadius:'8px', padding:'16px', textAlign:'center', cursor:'pointer'}}>
              <p style={{fontSize:'24px', margin:'0 0 8px'}}>👨‍👩‍👧</p>
              <p style={{fontWeight:'bold', color:'#7e22ce', margin:0}}>Portal Orang Tua</p>
            </div>

            <div style={{backgroundColor:'#f0f9ff', borderRadius:'8px', padding:'16px', textAlign:'center', cursor:'pointer'}}>
              <p style={{fontSize:'24px', margin:'0 0 8px'}}>⚙️</p>
              <p style={{fontWeight:'bold', color:'#0369a1', margin:0}}>Pengaturan</p>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}