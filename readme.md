# Panduan Struktur JSON untuk Kuis

Compatible:
Choice
True/False
Fill

## Struktur Dasar
```json
{
  "title": "Kuis Python Dasar",
  "questions": [
    {
      "type": "choice",
      "question": "Apa itu function di Python?",
      "options": [
        "Blok kode yang dapat dipanggil berulang kali",
        "Tempat menyimpan data",
        "Jenis data khusus Python", 
        "Perintah untuk menampilkan output"
      ],
      "correct": 0,
      "explanation": "Function adalah blok kode yang dapat dipanggil berulang kali dengan nama tertentu."
    },
    {
      "type": "dragdrop",
      "question": "Pasangkan bagian-bagian function dengan definisinya:",
      "pairs": [
        {
          "term": "def",
          "definition": "Keyword untuk mendefinisikan function"
        },
        {
          "term": "parameter",
          "definition": "Variabel yang menerima nilai input"
        },
        {
          "term": "print()",
          "definition": "Menampilkan output ke layar"
        },
        {
          "term": "argumen",
          "definition": "Nilai aktual yang dikirim ke function"
        }
      ],
      "explanation": "def untuk definisi, parameter menerima input, print() menampilkan output, argumen adalah nilai input."
    },
    {
      "type": "truefalse",
      "question": "Function di Python harus selalu menggunakan perintah return.",
      "correct": 1,
      "explanation": "Salah! Function tidak harus menggunakan return. Banyak function hanya menampilkan output dengan print()."
    },
    {
      "type": "fill",
      "question": "Lengkapi function untuk menyapa nama:\ndef sapa(nama):\n    print(\"Halo, \" + _____)",
      "correct": "nama",
      "explanation": "Parameter 'nama' digunakan untuk menyapa orang yang berbeda-beda."
    }
  ]
}


"# Quiz-Azhar" 
