## Autocomplete App Deployment

### Frontend (Vercel)
- Deploy the root directory to Vercel.
- Runs on React + Vite + TypeScript.
- No extra config needed for static frontend.

### Backend (Heroku)
- Deploy the `backend/` folder to Heroku as a Python app.
- Uses FastAPI, loads datasets from `backend/datasets/`.
- Procfile and requirements.txt are ready.
- App will run on the port provided by Heroku.

---

For local development:
- `npm run dev` (frontend)
- `cd backend && uvicorn main:app --reload --port 8000` (backend)
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
