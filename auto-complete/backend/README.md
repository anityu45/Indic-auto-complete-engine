# Backend Setup

## Installation

1. Install Python dependencies:
```bash
cd backend
pip install -r requirements.txt
```

## Running the Backend

```bash
cd backend
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

## API Endpoints

- `GET /autocomplete/{language}/?prefix={prefix}` - Autocomplete current word
- `GET /predict/{language}/?user_input={user_input}` - Predict next word

## How it works

1. **While typing a word** (no space): Calls `/autocomplete` to suggest completions
2. **After typing a space**: Calls `/predict` to suggest next words based on context
3. **Tab or Click**: Accept a suggestion

## Features

- Supports multiple languages: English, Hindi, Malayalam, Tamil, Telugu
- Trie-based autocomplete for fast prefix matching
- N-gram model for context-aware next word prediction
- Limit: 3 suggestions shown at a time
