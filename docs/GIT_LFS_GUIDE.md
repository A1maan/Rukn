# Git LFS Setup Guide for Rukn

## Why Git LFS?

The Rukn project uses **Git Large File Storage (LFS)** to manage large model weight files efficiently:

- `backend/models/emotion_model/best_emotion.pt` (~500MB)
- `backend/models/urgency_model/best_urgency.pt` (~500MB)

Without Git LFS, these files would bloat the repository and slow down cloning/pulling.

## Quick Setup

### 1. Install Git LFS

**macOS (Homebrew):**
```bash
brew install git-lfs
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install git-lfs
```

**Windows:**
1. Download from https://git-lfs.github.com/
2. Run the installer
3. Open Git Bash or Command Prompt

**Arch Linux:**
```bash
sudo pacman -S git-lfs
```

**Fedora/RHEL:**
```bash
sudo dnf install git-lfs
```

### 2. Initialize Git LFS

```bash
git lfs install
```

This only needs to be done once per user account.

### 3. Clone the Repository

```bash
git clone https://github.com/A1maan/Rukn.git
cd Rukn
```

Git LFS will automatically download the large files during clone.

### 4. Verify Model Files

```bash
# List LFS-tracked files
git lfs ls-files

# Check file sizes (should be hundreds of MBs, not KBs)
ls -lh backend/models/emotion_model/best_emotion.pt
ls -lh backend/models/urgency_model/best_urgency.pt
```

**Expected output:**
```
-rw-r--r-- 1 user staff 512M Oct  8 12:00 best_emotion.pt
-rw-r--r-- 1 user staff 487M Oct  8 12:00 best_urgency.pt
```

## Troubleshooting

### Issue: Files are tiny (<1KB) pointer files

**Symptoms:**
- `best_emotion.pt` is only a few hundred bytes
- Opening the file shows text like `version https://git-lfs.github.com/spec/v1`
- Backend crashes with "model loading" errors

**Solution:**
```bash
# Pull the actual LFS files
git lfs pull

# Verify
file backend/models/emotion_model/best_emotion.pt
# Should output: "data" or "PyTorch model" (binary), not "ASCII text"
```

### Issue: "This repository is over its data quota"

**Cause:** GitHub LFS has bandwidth limits (1GB/month for free accounts)

**Solutions:**
1. **Wait:** Quota resets monthly
2. **Alternative download:** Check repository releases for direct model downloads
3. **Contact maintainers:** Request alternative hosting (Google Drive, Hugging Face, etc.)

### Issue: Git LFS commands not found

**Cause:** Git LFS not installed or not in PATH

**Solution:**
```bash
# Check if installed
which git-lfs

# If not found, install (see above)

# Verify
git lfs version
# Output: git-lfs/3.x.x
```

### Issue: Slow download speeds

**Cause:** GitHub LFS servers or network issues

**Tips:**
```bash
# Download only specific files
git lfs pull --include="backend/models/emotion_model/*"

# Resume interrupted downloads
git lfs fetch
git lfs checkout
```

## For Contributors

### Tracking New Large Files

If you add new model files, they'll automatically be tracked by LFS based on `.gitattributes`:

```bash
# Add your model file
cp my_new_model.pt backend/models/emotion_model/

# Commit normally
git add backend/models/emotion_model/my_new_model.pt
git commit -m "feat(models): add new emotion model"

# Push (LFS upload happens automatically)
git push
```

### Checking LFS Status

```bash
# See what files are tracked by LFS
git lfs ls-files

# See LFS file status
git lfs status

# See LFS storage usage
git lfs env
```

### Updating Tracked Extensions

Edit `.gitattributes` to track additional file types:

```bash
# Example: Track .safetensors files
echo "*.safetensors filter=lfs diff=lfs merge=lfs -text" >> .gitattributes
git add .gitattributes
git commit -m "chore: track .safetensors with LFS"
```

## Manual Model Download (Fallback)

If Git LFS fails, you can download models manually:

1. Check the repository Releases page
2. Download the model archives
3. Extract to correct locations:
   ```bash
   # Extract emotion model
   unzip emotion_model.zip -d backend/models/emotion_model/
   
   # Extract urgency model
   unzip urgency_model.zip -d backend/models/urgency_model/
   ```

## Resources

- **Git LFS Documentation:** https://git-lfs.github.com/
- **GitHub LFS Guide:** https://docs.github.com/en/repositories/working-with-files/managing-large-files
- **Troubleshooting:** https://github.com/git-lfs/git-lfs/wiki/Tutorial

## Summary Checklist

- [ ] Git LFS installed (`git lfs version` works)
- [ ] Git LFS initialized (`git lfs install` run)
- [ ] Repository cloned
- [ ] Model files downloaded (check file sizes)
- [ ] Backend starts without "model not found" errors

---

**Need help?** Open an issue on GitHub with:
- Your OS and Git LFS version
- Output of `git lfs ls-files`
- Output of `ls -lh backend/models/*/best_*.pt`
