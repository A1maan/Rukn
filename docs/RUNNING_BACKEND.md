# Running the Backend

This guide explains how to set up and run the Rukn backend API server.

## Prerequisites

- **Python**: Version 3.10 or higher
- **pip**: Python package installer
- **Git LFS**: For downloading model weights (see [GIT_LFS_GUIDE.md](GIT_LFS_GUIDE.md))
- **Supabase Account**: For database access
- **~2GB free disk space**: For model files

## Environment Setup

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Create Virtual Environment

**Using venv:**
```bash
python -m venv venv
```

**Activate the virtual environment:**

macOS/Linux:
```bash
source venv/bin/activate
```

Windows:
```bash
venv\Scripts\activate
```

**Using conda:**
```bash
conda create -n rukn python=3.12
conda activate rukn
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- FastAPI 0.115.0
- PyTorch 2.8.0
- Transformers (Hugging Face)
- Supabase Python client
- Other required packages

### 4. Download Model Weights

**Using Git LFS (recommended):**

If you haven't already, install Git LFS:
```bash
# macOS
brew install git-lfs

# Ubuntu/Debian
sudo apt-get install git-lfs

# Windows
# Download from: https://git-lfs.github.com
```

Pull the model files:
```bash
cd /path/to/Rukn  # Navigate to project root
git lfs pull
```

**Verify model files:**
```bash
ls -lh backend/models/emotion_model/best_emotion.pt
ls -lh backend/models/urgency_model/best_urgency.pt
```

Both files should be ~500MB each (not a few KB).

**Manual Download (if LFS fails):**
See [GIT_LFS_GUIDE.md](GIT_LFS_GUIDE.md) for manual download instructions.

### 5. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
touch .env
```

Add your configuration:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key
```

**Where to find these:**
1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy the Project URL
4. Copy the **service_role** key (not the anon key)

⚠️ **Security Warning:** Never commit `.env` to version control. It should be in `.gitignore`.

## Running the Application

### Development Mode

Start the FastAPI server with auto-reload:

```bash
uvicorn app.main:app --reload
```

The API will be available at:
- **API Server**: http://localhost:8000
- **API Docs (Swagger)**: http://localhost:8000/docs
- **Alternative Docs (ReDoc)**: http://localhost:8000/redoc

### Production Mode

Run with optimized settings:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

**Parameters:**
- `--host 0.0.0.0`: Allow external connections
- `--port 8000`: Specify port
- `--workers 4`: Number of worker processes (adjust based on CPU cores)

### Custom Port

If port 8000 is in use:

```bash
uvicorn app.main:app --reload --port 8001
```

## API Endpoints

### Health Check
```bash
GET http://localhost:8000/
```

Returns: `{"message": "Rukn Backend API"}`

### Text Prediction
```bash
POST http://localhost:8000/api/v1/predict
```

**Request Body:**
```json
{
  "text": "أشعر بالقلق الشديد",
  "region": "Riyadh"
}
```

**Response:**
```json
{
  "emotion": "قلق",
  "urgency": "high",
  "urgency_score": 0.85,
  "text": "أشعر بالقلق الشديد"
}
```

### API Documentation

Visit http://localhost:8000/docs for interactive API documentation where you can:
- View all endpoints
- See request/response schemas
- Test endpoints directly in the browser

## Common Issues & Solutions

### Issue: Model Files Not Found

**Symptoms:**
```
FileNotFoundError: [Errno 2] No such file or directory: '.../best_emotion.pt'
```

**Solutions:**

1. **Check if files are LFS pointers:**
```bash
head -n 5 backend/models/emotion_model/best_emotion.pt
```

If you see `version https://git-lfs.github.com/spec/v1`, it's a pointer file.

2. **Pull actual files:**
```bash
git lfs pull
```

3. **Verify file sizes:**
```bash
ls -lh backend/models/*/best_*.pt
```

Should show ~500MB, not a few KB.

4. **Manual download:** See [GIT_LFS_GUIDE.md](GIT_LFS_GUIDE.md)

### Issue: Port Already in Use

**Solution 1:** Find and kill the process
```bash
lsof -ti:8000 | xargs kill -9
```

**Solution 2:** Use a different port
```bash
uvicorn app.main:app --reload --port 8001
```

### Issue: Module Import Errors

**Symptoms:**
```
ModuleNotFoundError: No module named 'fastapi'
```

**Solutions:**

1. **Ensure virtual environment is activated:**
```bash
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate     # Windows
```

2. **Reinstall dependencies:**
```bash
pip install -r requirements.txt
```

3. **Verify Python version:**
```bash
python --version  # Should be 3.10+
```

### Issue: CUDA/GPU Errors

**Symptoms:**
```
RuntimeError: CUDA out of memory
```

**Solutions:**

1. **Use CPU mode:** Edit `app/main.py` to force CPU:
```python
device = torch.device("cpu")
```

2. **Reduce batch size** (if processing multiple requests)

3. **Clear GPU cache:**
```python
import torch
torch.cuda.empty_cache()
```

### Issue: Supabase Connection Failed

**Check:**

1. **Verify credentials in `.env`:**
```bash
cat .env
```

2. **Test connection:**
```bash
python -c "from app.supabase_client import supabase; print(supabase.table('feedback_requests').select('*').limit(1).execute())"
```

3. **Ensure service_role key is used** (not anon key)

4. **Check Supabase project status** (not paused)

### Issue: Slow Model Loading

**Symptoms:**
- First request takes 30+ seconds
- Model loads every time server restarts

**Solutions:**

1. **Use model caching** (already implemented in code)
2. **Keep server running** (don't restart frequently)
3. **Use production mode with workers:**
```bash
uvicorn app.main:app --workers 2
```

Each worker loads models once at startup.

### Issue: Arabic Text Not Processing

**Check:**

1. **Encoding in request:**
```python
import requests
response = requests.post(
    "http://localhost:8000/api/v1/predict",
    json={"text": "أشعر بالقلق", "region": "Riyadh"},
    headers={"Content-Type": "application/json; charset=utf-8"}
)
```

2. **Terminal encoding:**
```bash
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
```

## Model Information

### Emotion Classification Model
- **Location:** `backend/models/emotion_model/`
- **Architecture:** MARBERT (Arabic BERT)
- **Size:** ~500MB
- **Classes:** Arabic emotions (قلق, حزن, غضب, etc.)
- **Input:** Arabic text
- **Output:** Emotion label + confidence scores

### Urgency Classification Model
- **Location:** `backend/models/urgency_model/`
- **Architecture:** MARBERT (Arabic BERT)
- **Size:** ~500MB
- **Classes:** low, medium, high
- **Input:** Arabic text
- **Output:** Urgency level + score (0-1)

### Model Loading

Models are loaded once at server startup and cached in memory:

```python
# Automatic loading on first request
emotion_model = load_emotion_model()  # ~10-15 seconds
urgency_model = load_urgency_model()  # ~10-15 seconds
```

## Project Structure

```
backend/
├── app/
│   ├── __init__.py          # App initialization
│   ├── main.py              # FastAPI application & routes
│   ├── config.py            # Configuration settings
│   ├── supabase_client.py   # Supabase connection
│   └── routes/
│       ├── __init__.py
│       └── predict.py       # Prediction endpoints
├── models/
│   ├── emotion_model/       # Emotion classification
│   │   ├── best_emotion.pt  # Model weights (~500MB)
│   │   ├── emotion_meta.json
│   │   └── tokenizer files
│   └── urgency_model/       # Urgency classification
│       ├── best_urgency.pt  # Model weights (~500MB)
│       ├── inference_meta.json
│       └── tokenizer files
├── requirements.txt         # Python dependencies
└── .env                     # Environment variables (create this)
```

## Performance Optimization

### For Development
- Use `--reload` for auto-reload on code changes
- Keep models in memory (don't restart frequently)
- Use single worker for debugging

### For Production
- Use multiple workers: `--workers 4`
- Disable reload: Remove `--reload` flag
- Enable logging: `--log-level info`
- Use process manager (PM2, Supervisor, systemd)

### Resource Usage
- **RAM:** ~2-3GB per worker (models loaded in memory)
- **CPU:** Model inference benefits from multiple cores
- **GPU:** Optional (CUDA-enabled PyTorch)

## Testing the API

### Using curl

**Health check:**
```bash
curl http://localhost:8000/
```

**Text prediction:**
```bash
curl -X POST http://localhost:8000/api/v1/predict \
  -H "Content-Type: application/json" \
  -d '{"text": "أشعر بالقلق الشديد", "region": "Riyadh"}'
```

### Using Python

```python
import requests

# Test prediction
response = requests.post(
    "http://localhost:8000/api/v1/predict",
    json={
        "text": "أشعر بالسعادة اليوم",
        "region": "Jeddah"
    }
)

print(response.json())
# Output: {"emotion": "سعادة", "urgency": "low", ...}
```

### Using API Docs UI

1. Navigate to http://localhost:8000/docs
2. Click on `/api/v1/predict` endpoint
3. Click "Try it out"
4. Enter test data
5. Click "Execute"

## Logging

### Enable Debug Logging

Edit `app/main.py` or run with:

```bash
uvicorn app.main:app --reload --log-level debug
```

### Log Levels
- `critical`: Critical errors only
- `error`: Errors only
- `warning`: Warnings and errors
- `info`: General information (recommended for production)
- `debug`: Detailed debugging information

### Custom Logging

```python
import logging

logger = logging.getLogger(__name__)
logger.info("Processing prediction request")
```

## Dependencies

### Core Dependencies
- **FastAPI**: Web framework
- **Uvicorn**: ASGI server
- **PyTorch**: Deep learning framework
- **Transformers**: Hugging Face model library
- **Supabase**: Database client

### Full List
See `requirements.txt` for all dependencies and versions.

## Security Best Practices

1. **Never commit `.env` file**
2. **Use service_role key only on backend** (never expose to frontend)
3. **Enable CORS only for trusted origins**
4. **Use HTTPS in production**
5. **Keep dependencies updated:**
```bash
pip list --outdated
```

## Deployment Considerations

### Environment Variables (Production)
- Set via platform (Heroku Config Vars, AWS Secrets Manager, etc.)
- Never hardcode in source code

### Process Management
Use a process manager to keep the server running:

**PM2:**
```bash
pm2 start "uvicorn app.main:app --host 0.0.0.0" --name rukn-backend
```

**Systemd:**
Create a service file for automatic startup.

### Monitoring
- Set up health check endpoint monitoring
- Log aggregation (CloudWatch, Datadog, etc.)
- Error tracking (Sentry, Rollbar, etc.)

## Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [PyTorch Documentation](https://pytorch.org/docs)
- [Hugging Face Transformers](https://huggingface.co/docs/transformers)
- [Supabase Python Client](https://supabase.com/docs/reference/python)

## Support

For issues or questions:
1. Check this documentation
2. Review [GIT_LFS_GUIDE.md](GIT_LFS_GUIDE.md) for model issues
3. Review [CONTRIBUTING.md](../CONTRIBUTING.md)
4. Open an issue on GitHub
5. Contact the development team

---
