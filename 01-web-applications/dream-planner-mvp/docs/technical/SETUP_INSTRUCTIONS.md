# Setup Instructions - Dream Planner MVP (Updated Edition)

## Introduction and Context

This updated setup guide reflects the actual development environment configuration after resolving several compatibility challenges between macOS, external drives, and Python virtual environments. The instructions have been battle-tested on a MacBook Pro using an external SanDisk Extreme Pro drive formatted with ExFAT, revealing important insights about cross-platform development that the original instructions didn't anticipate.

The key discovery during setup was that developing Python projects on external drives requires special consideration due to how macOS handles file metadata on non-native file systems. This guide incorporates those lessons to provide a smoother setup experience.

## Prerequisites

Before beginning the setup process, you'll need to verify and potentially install several development tools. The version requirements have been updated based on actual testing and compatibility verification.

### Required Software

**Node.js and npm (version 18.0 or higher)**

Node.js powers the React frontend of the application. To verify your current installation, run `node --version` in your terminal. The Dream Planner frontend has been tested with Node.js 18 and newer versions. If you need to install or update Node.js, download the LTS version from nodejs.org. The installer automatically includes npm, which manages JavaScript packages for the frontend.

**Python (version 3.10 or higher, Python 3.12.2 tested and verified)**

The backend API runs on Python, and this project has been specifically tested with Python 3.12.2 managed through pyenv. This is a change from the original specification of Python 3.11, as Python 3.12 offers better performance and improved error messages that help during rapid development.

To check your Python setup, run these commands:
```bash
# Check your current Python version
python3 --version

# If using pyenv, see available versions
pyenv versions

# Check which Python version is active in your current directory
pyenv local
```

If you need to install Python 3.12, the recommended approach for Mac users is through pyenv, which allows you to manage multiple Python versions:
```bash
# Install pyenv if you don't have it
brew install pyenv

# Install Python 3.12.2
pyenv install 3.12.2

# Set it for your project
pyenv local 3.12.2
```

**Git**

Git is essential for version control and is already integrated with your GitHub repository. Verify your installation with `git --version`. If needed, install through Homebrew with `brew install git`.

**Important: virtualenv Package**

Due to compatibility issues between Python's built-in `venv` module and external drives, this project requires the `virtualenv` package instead. Install it globally for your user:
```bash
python3 -m pip install --user virtualenv
```

The reason for using virtualenv over venv is critical: when Python's built-in venv module encounters the metadata files that macOS creates on external drives, it can fail with Unicode decoding errors. The virtualenv package handles these edge cases more gracefully.

## Understanding External Drive Development Challenges

When developing on an external drive formatted with ExFAT (for cross-platform compatibility), macOS creates hidden metadata files called AppleDouble files (beginning with "._") to store information that the ExFAT file system cannot natively handle. These files can contain characters that cause Python's UTF-8 decoder to fail, resulting in errors like:
```
UnicodeDecodeError: 'utf-8' codec can't decode byte 0xb0 in position 37: invalid start byte
```

To prevent these issues, run this one-time configuration:
```bash
# Prevent macOS from creating metadata files on USB drives
defaults write com.apple.desktopservices DSDontWriteUSBStores -bool true

# Restart Finder to apply the change
killall Finder
```

This configuration change tells macOS not to create these problematic metadata files on external drives, preventing the Unicode errors from occurring in the first place.

## Project Structure Setup

Since you already have the project structure created and connected to GitHub, you can skip the directory creation steps from the original instructions. Your project already exists at:
```
/Volumes/Extreme Pro/Programming/Python/Portfolio-Projects/01-web-applications/dream-planner-mvp
```

The project is already initialized as a Git repository and connected to:
```
https://github.com/chidoski/portfolio-projects
```

## Frontend Setup

The frontend setup remains largely the same as the original instructions, with some clarifications based on the actual development experience.

### Frontend Dependencies Installation

Navigate to your frontend directory and ensure all dependencies are properly installed:

```bash
cd /Volumes/Extreme\ Pro/Programming/Python/Portfolio-Projects/01-web-applications/dream-planner-mvp/frontend

# Install dependencies if not already done
npm install

# If you encounter any issues, clear the cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Running the Frontend

The frontend development server runs on port 3000 by default:
```bash
npm run dev
```

The Vite development server provides hot module replacement, meaning changes to your React components will instantly reflect in the browser without requiring a manual refresh.

## Backend Setup (Critical Updates)

The backend setup has several important changes from the original instructions based on the actual challenges encountered and resolved.

### Creating the Virtual Environment with virtualenv

This is the most critical change from the original instructions. Due to Unicode encoding issues with Python's built-in venv module on external drives, you must use virtualenv instead:

```bash
# Navigate to the backend directory
cd /Volumes/Extreme\ Pro/Programming/Python/Portfolio-Projects/01-web-applications/dream-planner-mvp/backend

# Remove any existing venv directory from previous attempts
rm -rf venv

# Create virtual environment using virtualenv (NOT venv)
python3 -m virtualenv venv

# Activate the virtual environment
source venv/bin/activate

# Verify activation - you should see (venv) in your prompt
# and this should show the path to your venv Python
which python
```

### Installing Backend Dependencies

When installing packages with brackets in their names (like uvicorn[standard]), zsh requires special handling. The square brackets are interpreted as shell glob patterns, so they must be quoted:

```bash
# Install FastAPI and core dependencies
# Note the quotes around "uvicorn[standard]"
pip install fastapi "uvicorn[standard]" pydantic sqlalchemy python-dotenv

# Install additional packages
pip install httpx python-multipart psycopg2-binary

# Verify installation
pip list
```

You should see approximately 25-30 packages installed, including:
- fastapi (0.116.1 or newer)
- pydantic (2.11.9 or newer)
- sqlalchemy (2.0.43 or newer)
- uvicorn (0.35.0 or newer)

### Cleaning Up Metadata Files (If Needed)

If you encounter Unicode errors even after using virtualenv, you may need to clean up existing AppleDouble files:

```bash
# Find all AppleDouble files in your virtual environment
find venv -name "._*" -type f

# Remove them if found
find venv -name "._*" -delete
find venv -name ".DS_Store" -delete

# Create a reusable cleanup script
cat > clean_metadata.sh << 'EOF'
#!/bin/bash
echo "Cleaning macOS metadata files from virtual environment..."
find venv -name "._*" -delete 2>/dev/null
find venv -name ".DS_Store" -delete 2>/dev/null
echo "Cleanup complete!"
source venv/bin/activate
pip --version && echo "✓ pip is working correctly!"
EOF

chmod +x clean_metadata.sh
```

### Database Configuration

The project supports both SQLite (for local development) and Supabase (for production-ready PostgreSQL). The configuration in `app/core/config.py` automatically detects which to use based on environment variables.

For local development with SQLite:
```bash
# Create the database directory if it doesn't exist
mkdir -p database

# Initialize the database
python scripts/init_db.py
```

For Supabase (if you prefer):
1. Create a project at supabase.com
2. Create a `.env` file in your backend directory:
```bash
cat > .env << 'EOF'
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT].supabase.co:5432/postgres
SUPABASE_URL=https://[YOUR-PROJECT].supabase.co
SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
EOF
```

## Running the Complete Application

With both environments properly configured, you can run the full stack application.

### Start the Backend Server

In one terminal:
```bash
cd /Volumes/Extreme\ Pro/Programming/Python/Portfolio-Projects/01-web-applications/dream-planner-mvp/backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

The backend will be available at:
- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs

### Start the Frontend Server

In another terminal:
```bash
cd /Volumes/Extreme\ Pro/Programming/Python/Portfolio-Projects/01-web-applications/dream-planner-mvp/frontend
npm run dev
```

The frontend will be available at http://localhost:3000

## Development Workflow

Since your project is already connected to GitHub, your workflow for saving progress is straightforward:

```bash
# After making changes, commit and push
git add .
git commit -m "Descriptive message about what you built"
git push origin main
```

Remember to commit frequently, especially after completing major features or before making significant changes.

## Troubleshooting Guide

### Unicode Decode Errors with pip

**Problem**: `UnicodeDecodeError` when running pip commands  
**Solution**: You're likely using venv instead of virtualenv. Delete the venv directory and recreate using virtualenv as shown above.

### Package Installation with Brackets

**Problem**: `zsh: no matches found: uvicorn[standard]`  
**Solution**: Quote the package name: `pip install "uvicorn[standard]"`

### Invalid Distribution Warnings

**Problem**: `WARNING: Ignoring invalid distribution -pip`  
**Solution**: This indicates corrupted metadata from previous attempts. Run the cleanup script to remove AppleDouble files.

### Virtual Environment Not Activating

**Problem**: Commands fail with "module not found" even after installation  
**Solution**: Ensure you've activated the virtual environment with `source venv/bin/activate`. You should see `(venv)` in your terminal prompt.

### Port Already in Use

**Problem**: "Address already in use" error when starting servers  
**Solution**: Either kill the existing process using the port or use a different port:
- Frontend: Modify port in `vite.config.ts`
- Backend: Use `uvicorn app.main:app --reload --port 8001`

## Key Differences from Original Instructions

1. **Python Version**: Using Python 3.12.2 (via pyenv) instead of Python 3.11
2. **Virtual Environment Tool**: Using virtualenv instead of built-in venv due to external drive compatibility
3. **External Drive Configuration**: Added macOS configuration to prevent metadata file creation
4. **Shell-Specific Instructions**: Added proper quoting for zsh when installing packages with brackets
5. **Git Setup**: Removed Git initialization steps since repository already exists
6. **Troubleshooting Section**: Added comprehensive troubleshooting based on actual issues encountered

## Verified Working Configuration

This setup has been tested and verified working with:
- macOS on MacBook Pro
- Python 3.12.2 (managed via pyenv)
- virtualenv 20.33.1
- External drive: SanDisk Extreme Pro (ExFAT formatted)
- FastAPI 0.116.1
- Node.js 18+
- Git repository successfully connected to GitHub

## Next Steps

With your development environment fully operational, you can proceed with building the Dream Planner features. The environment is stable and all technical hurdles have been resolved. Focus on implementing the core features outlined in your PRD and Implementation Roadmap documents.

Remember that the extensive troubleshooting you've gone through has given you deep insight into how development environments work. This knowledge will serve you well not just for this project, but throughout your development career.