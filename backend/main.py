from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import trie
import n_gram
import os

app = FastAPI(title="Autocomplete & Prediction API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATASET_PATHS = {
    "english": "datasets/english.txt",
    "hindi": "datasets/hindi_dataset.txt",
    "malayalam": "datasets/malayalam.txt",
    "tamil": "datasets/tamil.txt",
    "telugu": "datasets/telugu.txt",
}

NGRAM_DATASET_PATHS = {
    "english": "datasets/2_gram.txt",
}

@app.on_event("startup")
async def startup_event():
    # Starting dataset load
    base_dir = os.path.dirname(__file__)
    for language, path in DATASET_PATHS.items():
        file_path = os.path.join(base_dir, path)
        if os.path.exists(file_path):
            trie.load_from_file(file_path)
        else:
            pass  # File not found
    # All dictionaries loaded

    for language, path in NGRAM_DATASET_PATHS.items():
        file_path = os.path.join(base_dir, path)
        if os.path.exists(file_path):
            n_gram.load_from_file(file_path)
        else:
            pass  # File not found
    # All n-gram models loaded

@app.get("/autocomplete/{language}/")
async def autocomplete(language: str, prefix: str = Query(...)):
    # API /autocomplete called
    try:
        suggestions = trie.autocomplete(prefix)
        return {"language": language, "suggestions": suggestions}
    except Exception as e:
    # Autocomplete failed
        return {"error": str(e)}

@app.get("/predict/{language}/")
async def predict(language: str, user_input: str = Query(...)):
    # API /predict called
    try:
        predictions = n_gram.hybrid_predict(user_input)
        return {"language": language, "predictions": predictions}
    except Exception as e:
    # Prediction failed
        return {"error": str(e)}
