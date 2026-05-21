# CleanFlow - Data Cleaning & Reporting Automation Web App

CleanFlow is a professional and lightweight automated data cleaning and reporting application. It enables users to upload a raw CSV file, automatically clean it (handling missing numbers, missing text, text casing, and duplicate rows), view key metrics and visualizations in a dashboard, and download the standardized cleaned CSV.

## Project Structure
```text
Project/
├── backend/
│   ├── main.py              # FastAPI server containing API endpoints
│   └── requirements.txt     # Python libraries (pandas, fastapi, uvicorn, python-multipart)
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # React single page dashboard (Tailwind + Recharts)
│   │   ├── index.css        # Tailwind styling & Google Font setup
│   │   └── main.jsx         # React application mounting
│   ├── vite.config.js       # Vite configuration with Tailwind plugin
│   └── package.json         # Frontend packages (recharts, axios, lucide-react)
└── README.md                # Running instructions (this file)
```

---

## Getting Started

### 1. Run the Backend (FastAPI)
Open a terminal in the root directory:

```bash
# 1. Navigate to the backend folder
cd backend

# 2. Install the required Python packages
pip install -r requirements.txt

# 3. Start the FastAPI server
python main.py
```
The backend server will start on `http://127.0.0.1:8080`. You can visit `http://127.0.0.1:8080/docs` to view the interactive Swagger API documentation.

### 2. Run the Frontend (React + Vite)
Open a new, separate terminal in the root directory:

```bash
# 1. Navigate to the frontend folder
cd frontend

# 2. Install dependencies (if not already done)
npm install

# 3. Start the Vite development server
npm run dev
```
The frontend will start on `http://localhost:3000`. Open this URL in your web browser to view the application dashboard.

---

## How to Test: Sample Dataset

To test the application, copy the following text and save it as a file named `dirty_data.csv` on your computer.

```csv
Name,Age,Salary,City,Joined Date
john doe,28,50000,New York,2021-05-10
jane smith,,62000,los angeles,2020-03-15
john doe,28,50000,New York,2021-05-10
ALICE BROWN,34,,boston,2019-11-01
BOB JOHNSON,45,85000,,2018-06-25
jane smith,,62000,los angeles,2020-03-15
charlie green,22,40000,Chicago,2022-01-20
```

### Applied Data Cleaning Operations:
1. **Deduplication**: Automatically detects and removes duplicate records.
2. **Missing Numbers Handling**: Automatically fills numeric missing values with the column mean to preserve metrics.
3. **Missing Text Handling**: Fills blank text/categorical cells with `"Unknown"`.
4. **Casing Standardization**: Strips leading/trailing spaces and converts text strings to proper `Title Case` (e.g. `john doe` -> `John Doe`).
