# GitHub Pages Setup Instructions

## For Frontend Deployment

Your frontend is now ready on the `frontend-gh-pages` branch! Follow these steps to enable GitHub Pages:

### Step 1: Go to Repository Settings
1. Go to: https://github.com/kelvin741/lib
2. Click **Settings** (top right)
3. Select **Pages** from the left sidebar

### Step 2: Configure GitHub Pages
1. Under "Build and deployment":
   - **Source:** Select "Deploy from a branch"
   - **Branch:** Select `frontend-gh-pages`
   - **Folder:** Select `/ (root)`

2. Click **Save**

### Step 3: Wait for Deployment
- GitHub will deploy automatically
- You should see a green checkmark when complete
- Your frontend will be live at: **https://kelvin741.github.io/lib**

---

## Project Structure

### Main Branch (`main`)
```
main/
├── backend/
│   ├── index.js
│   ├── package.json
│   ├── .env
│   └── ...
├── frontend/          (OLD - can be deleted)
│   └── ...
├── README.md
└── Procfile
```

### Frontend Branch (`frontend-gh-pages`)
```
frontend-gh-pages/
├── index.html         ← GitHub Pages entry point
├── script.js
├── style.css
├── README.md
└── ...
```

---

## Important Notes

✅ **Backend:** Running on Render at https://lib-9gnv.onrender.com
✅ **Frontend:** Will run on GitHub Pages at https://kelvin741.github.io/lib
✅ **Both:** Connected via API calls in script.js

The frontend automatically detects the environment and uses the correct API endpoint:
- **Local (localhost):** Uses http://localhost:3003
- **Deployed:** Uses https://lib-9gnv.onrender.com

---

## Testing

After GitHub Pages is enabled, test by:
1. Visit https://kelvin741.github.io/lib
2. Register a new student account
3. Login and search for books
4. Test borrow/return functionality

If you see "Connection error", the backend API might be sleeping on Render. Give it a minute to wake up, then try again.

---

## Troubleshooting

### Frontend not loading?
- Clear browser cache (Ctrl+Shift+Del)
- Check GitHub Pages settings are correct
- Verify `frontend-gh-pages` branch is selected

### Can't login?
- Check backend is running on Render
- Open browser console (F12) for error messages
- Verify database URL in backend .env

### Still not working?
The files in `frontend/` folder (old) vs root (new) might be confusing Git. You can safely delete the old `frontend/` folder from the main branch.

---

## Summary

✅ Backend: Render (https://lib-9gnv.onrender.com)
✅ Frontend: GitHub Pages (https://kelvin741.github.io/lib)
✅ Branches: 
   - `main` = Backend code
   - `frontend-gh-pages` = Frontend code (for GitHub Pages)
