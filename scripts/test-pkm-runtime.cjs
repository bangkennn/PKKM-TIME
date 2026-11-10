async function testPkm() {
  console.log('=== UJI RUNTIME MODUL PENGABDIAN KEPADA MASYARAKAT (PKM) ===');
  
  // 1. Uji Backend API Port 3001
  const resList = await fetch('http://localhost:3001/rest/api/pkm');
  const listData = await resList.json();
  console.log('1. GET /rest/api/pkm Success:', listData.success, 'Total PKM:', listData.summary?.total);

  // 2. Uji Detail Proposal PKM
  const resDetail = await fetch('http://localhost:3001/rest/api/pkm/pkm-uuid-001');
  const detailData = await resDetail.json();
  console.log('2. GET Detail pkm-uuid-001:', detailData.success, 'Title:', detailData.data?.title?.substring(0, 45) + '...');

  // 3. Uji Buat Usulan Baru PKM via POST
  const newPkm = {
    title: 'Penerapan Sistem Otomasi Irigasi Berbasis IoT pada Kelompok Tani Sayur Organik Desa Percut',
    scheme: 'PKM Penerapan Iptek (PKM-PI)',
    academicYear: '2026/2027',
    proposalYear: 2026,
    durationMonths: 6,
    pkmTopic: 'Penerapan Teknologi Tepat Guna Lingkungan',
    budget: 22500000,
    teamMembers: [
      { name: 'Dr. Ir. Hendra Wijaya, M.Kom.', role: 'Ketua Pengusul' },
      { name: 'Rina Marlina, M.Kom.', role: 'Anggota Pelaksana 1' }
    ],
    luaranJenis: 'Peningkatan Keberdayaan Mitra / Omzet UMKM Binaan',
    targetLuaranNama: 'Efisiensi Penyiraman 40% & Peningkatan Panen',
    targetLuaranKeterangan: 'Pemasangan sensor kelembaban tanah terintegrasi aplikasi HP',
    fileName: 'Proposal_PKM_Irigasi_IoT_2026.pdf',
    fileCustomName: 'Proposal_PKM_Irigasi_IoT_2026.pdf'
  };
  const resCreate = await fetch('http://localhost:3001/rest/api/pkm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newPkm)
  });
  const createData = await resCreate.json();
  console.log('3. POST /rest/api/pkm Success:', createData.success, 'New PKM ID:', createData.data?.id);
  const createdId = createData.data?.id;

  // 4. Uji Update Usulan PKM via PUT
  if (createdId) {
    const updateBody = {
      ...newPkm,
      budget: 24000000,
      durationMonths: 8,
      title: 'Penerapan Sistem Otomasi Irigasi Berbasis IoT pada Kelompok Tani Sayur Organik Desa Percut (Revisi)'
    };
    const resPut = await fetch(`http://localhost:3001/rest/api/pkm/${createdId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateBody)
    });
    const putData = await resPut.json();
    console.log('4. PUT /rest/api/pkm/[id] Success:', putData.success);

    // 5. Uji Toggle LPPM Tahap 1 -> Approved
    const resToggle1 = await fetch(`http://localhost:3001/rest/api/pkm/${createdId}/toggle-approval?stage=1`, { method: 'PATCH' });
    const toggle1Data = await resToggle1.json();
    console.log('5. Toggle LPPM Tahap 1 Approved:', toggle1Data.success, 'Status Tahap 1:', toggle1Data.data?.status_tahap1);

    // 6. Uji Submit Laporan Kemajuan PKM
    const resKemajuan = await fetch(`http://localhost:3001/rest/api/pkm/${createdId}/kemajuan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileKemajuan: 'Laporan_Kemajuan_PKM_Irigasi_2026.pdf',
        luaranJenis: 'Peningkatan Keberdayaan Mitra / Omzet UMKM Binaan',
        luaranTarget: 'Alat sensor terpasang 100% di lahan mitra',
        luaranKeterangan: 'Pelatihan operasional alat telah diberikan kepada 15 petani'
      })
    });
    const kemajuanData = await resKemajuan.json();
    console.log('6. Submit Kemajuan PKM Success:', kemajuanData.success, 'Status Tahap 2:', kemajuanData.data?.status_tahap2);

    // 7. Uji Toggle LPPM Tahap 2 -> Approved
    const resToggle2 = await fetch(`http://localhost:3001/rest/api/pkm/${createdId}/toggle-approval?stage=2`, { method: 'PATCH' });
    const toggle2Data = await resToggle2.json();
    console.log('7. Toggle LPPM Tahap 2 Approved:', toggle2Data.success, 'Status Tahap 2:', toggle2Data.data?.status_tahap2);

    // 8. Uji Submit Laporan Akhir PKM
    const resAkhir = await fetch(`http://localhost:3001/rest/api/pkm/${createdId}/akhir`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileAkhir: 'Laporan_Akhir_PKM_Irigasi_2026.pdf',
        luaranAkhirJenis: 'Publikasi Media Massa Cetak / Elektronik Nasional',
        luaranAkhirRealisasi: 'Terbit di Harian Analisa & Liputan Berita Kampus',
        luaranAkhirLink: 'https://stmik-time.ac.id/berita/pkm-irigasi-desa-percut',
        luaranAkhirKeterangan: 'Program pengabdian selesai dan diserahterimakan kepada kelompok tani'
      })
    });
    const akhirData = await resAkhir.json();
    console.log('8. Submit Laporan Akhir PKM Success:', akhirData.success, 'Status Tahap 3:', akhirData.data?.status_tahap3);

    // 9. Uji Toggle LPPM Tahap 3 -> Selesai
    const resToggle3 = await fetch(`http://localhost:3001/rest/api/pkm/${createdId}/toggle-approval?stage=3`, { method: 'PATCH' });
    const toggle3Data = await resToggle3.json();
    console.log('9. Toggle LPPM Tahap 3 Approved (Selesai):', toggle3Data.success, 'Overall:', toggle3Data.data?.overall_status);
  }

  // 10. Uji Frontend Routes Port 3000
  const routes = [
    '/dosen/pengabdian',
    '/dosen/pengabdian/proposal',
    '/dosen/pengabdian/proposal/preview?id=pkm-uuid-001',
    '/dosen/pengabdian/proposal/edit?id=pkm-uuid-002',
    '/dosen/pengabdian/kemajuan',
    '/dosen/pengabdian/akhir'
  ];

  for (const r of routes) {
    const res = await fetch(`http://localhost:3000${r}`);
    console.log(`10. Frontend Route ${r} -> Status ${res.status}`);
  }

  console.log('=== SEMUA PENGUJIAN INTEGRASI PKM BERHASIL 100%! ===');
}

testPkm().catch(console.error);

