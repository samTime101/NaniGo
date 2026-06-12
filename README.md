# NaniGo

Full-stack application with FastAPI backend and React (Vite) frontend.

## Project Structure

```
NaniGo/
├── Backend/          # FastAPI backend
│   ├── main.py      # Main application entry point
│   └── requirements.txt
└── Frontend/         # React + Vite frontend
    ├── src/
    └── package.json
```

## Getting Started

### Backend Setup

1. Navigate to the Backend directory:
```bash
cd Backend
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at http://localhost:8000

### Frontend Setup

1. Navigate to the Frontend directory:
```bash
cd Frontend
```

2. Install dependencies (if not already done):
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The app will be available at http://localhost:5173

## API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Development

- Backend hot-reloads on file changes
- Frontend hot-reloads on file changes
- API proxy configured in Vite for `/api` routes
