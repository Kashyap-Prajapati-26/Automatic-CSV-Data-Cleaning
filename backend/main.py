from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import pandas as pd
import os
import io

app = FastAPI(title="Data Cleaning & Reporting API")

# Enable CORS (Cross-Origin Resource Sharing)
# This allows our React frontend (running on port 3000) to communicate with this FastAPI backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the actual frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# File path to store the cleaned CSV file temporarily
CLEANED_FILE_PATH = "cleaned_data.csv"

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    # Verify that the uploaded file is indeed a CSV file
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")
    
    try:
        # Read the uploaded CSV file content into a Pandas DataFrame
        contents = await file.read()
        df_raw = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading CSV file: {str(e)}")
    
    # --- STEP 1: Gather raw stats before cleaning ---
    rows_before = len(df_raw)
    cols_count = len(df_raw.columns)
    
    # Calculate missing values count per column before cleaning (for chart data)
    missing_before_series = df_raw.isnull().sum()
    total_missing_before = int(missing_before_series.sum())
    
    # Prepare chart data for missing values (only include columns that had missing values)
    chart_data = []
    for col, count in missing_before_series.items():
        chart_data.append({
            "column": col,
            "missing_count": int(count)
        })
        
    # --- STEP 2: Automate Data Cleaning ---
    df_clean = df_raw.copy()
    
    # A. Fill numeric missing values with their mean
    numeric_cols = df_clean.select_dtypes(include=['number']).columns
    for col in numeric_cols:
        mean_val = df_clean[col].mean()
        if pd.notnull(mean_val):
            df_clean[col] = df_clean[col].fillna(mean_val)
        else:
            # If the column is entirely null, fill with 0
            df_clean[col] = df_clean[col].fillna(0)
            
    # B. Fill text missing values with "Unknown"
    text_cols = df_clean.select_dtypes(include=['object', 'category']).columns
    for col in text_cols:
        df_clean[col] = df_clean[col].fillna("Unknown")
        
    # C. Standardize text columns to Title Case (e.g. "john doe" -> "John Doe")
    for col in text_cols:
        df_clean[col] = df_clean[col].astype(str).str.strip().str.title()
        
    # D. Remove duplicate rows
    # We find how many duplicate rows exist before dropping
    duplicates_count = int(df_clean.duplicated().sum())
    df_clean = df_clean.drop_duplicates()
    
    # --- STEP 3: Gather stats after cleaning ---
    rows_after = len(df_clean)
    missing_after_series = df_clean.isnull().sum()
    total_missing_after = int(missing_after_series.sum())
    missing_values_fixed = total_missing_before - total_missing_after
    
    # Column Summary (data types and current null counts)
    column_summary = []
    for col in df_clean.columns:
        column_summary.append({
            "name": col,
            "type": str(df_clean[col].dtype),
            "null_count": int(df_clean[col].isnull().sum())
        })
        
    # --- STEP 4: Save cleaned file for downloading ---
    try:
        df_clean.to_csv(CLEANED_FILE_PATH, index=False)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save cleaned CSV: {str(e)}")
        
    # --- STEP 5: Prepare preview data ---
    # Show first 10 rows of the cleaned data
    preview_df = df_clean.head(10)
    # Replace NaN values with None (JSON serializable)
    preview_df = preview_df.replace({pd.NA: None})
    preview_data = preview_df.to_dict(orient="records")
    headers = list(df_clean.columns)
    
    return {
        "rows_before": rows_before,
        "rows_after": rows_after,
        "missing_values_fixed": missing_values_fixed,
        "duplicates_removed": duplicates_count,
        "column_summary": column_summary,
        "chart_data": chart_data,
        "preview_data": preview_data,
        "headers": headers
    }

@app.get("/download")
async def download_file():
    # Check if the cleaned file exists
    if not os.path.exists(CLEANED_FILE_PATH):
        raise HTTPException(status_code=404, detail="No cleaned file found. Please upload a file first.")
    
    # Return the file as a downloadable response
    return FileResponse(
        path=CLEANED_FILE_PATH,
        media_type="text/csv",
        filename="cleaned_data.csv"
    )

if __name__ == "__main__":
    import uvicorn
    # Run the server on localhost:8080
    uvicorn.run("main:app", host="127.0.0.1", port=8080, reload=True)
