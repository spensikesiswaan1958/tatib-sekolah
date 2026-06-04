import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(url, key)
```[cite: 1]

Setelah kodenya ditempel, jangan lupa tekan **Ctrl + S** pada keyboard untuk menyimpan file tersebut[cite: 1].

---

## Hasil Akhir yang Benar

Jika langkah ini berhasil, struktur file kamu di panel sebelah kiri akan terlihat rapi seperti ini:

* 📁 `tatib-sekolah`
  * 📁 `app` (folder bawaan Next.js)[cite: 1]
  * 📁 **`lib`** (folder yang baru kamu buat)[cite: 1]
    * 📄 **`supabase.ts`** (file tempat kode penghubung berada)[cite: 1]
  * 📄 `.env.local` (file berisi URL & Anon Key Supabase yang kamu buat sebelumnya)[cite: 1]

Dengan begini, Terminal kamu akan bersih dari error, dan file jembatan menuju database Supabase sudah resmi terpasang dengan aman[cite: 1]!