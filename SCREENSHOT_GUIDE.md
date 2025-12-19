# Screenshot Guide

To complete the README documentation, please save your UI screenshots with the following names in the `screenshots/` folder:

## Required Screenshots

1. **student-dashboard.png**
   - Navigate to: `http://localhost:5173/student/dashboard`
   - Capture: The student dashboard showing stats and available exams

2. **available-exams.png**
   - Navigate to: `http://localhost:5173/student/exams`
   - Capture: The available exams list page

3. **student-results.png**
   - Navigate to: `http://localhost:5173/student/results`
   - Capture: The student results page with exam history

4. **teacher-dashboard.png**
   - Navigate to: `http://localhost:5173/teacher/dashboard`
   - Capture: The teacher dashboard with statistics and flagged students

5. **create-exam.png**
   - Navigate to: `http://localhost:5173/teacher/create-exam`
   - Capture: The create exam form page

6. **manage-questions.png**
   - Navigate to: `http://localhost:5173/teacher/exam/{exam-id}/questions`
   - Capture: The manage questions page showing question list and add modal

7. **teacher-exams.png**
   - Navigate to: `http://localhost:5173/teacher/exams`
   - Capture: The teacher's exam list page

8. **login.png**
   - Navigate to: `http://localhost:5173/login`
   - Capture: The login page

## How to Save Screenshots

### Method 1: Browser Screenshot Tool
1. Open the page you want to capture
2. Press `F12` to open Developer Tools
3. Press `Ctrl + Shift + P` (Windows) or `Cmd + Shift + P` (Mac)
4. Type "screenshot" and select "Capture full size screenshot"
5. Save with the appropriate filename in the `screenshots/` folder

### Method 2: Windows Snipping Tool
1. Press `Windows + Shift + S`
2. Select the area to capture
3. Save the screenshot to `screenshots/` folder with the appropriate name

### Method 3: Using Browser Extensions
1. Install a screenshot extension (e.g., "Awesome Screenshot", "FireShot")
2. Capture full page screenshots
3. Save with appropriate names

## After Saving Screenshots

Once you've saved all screenshots, commit and push them:

```bash
cd D:\senix\kavch
git add screenshots/
git commit -m "docs: add UI screenshots to README"
git push origin main
```

## Notes

- Make sure all screenshots are in PNG format
- Use consistent window size for all screenshots (preferably 1920x1080)
- Ensure the UI is in a clean state (no dev tools, no errors)
- Use the same theme (light or dark) for consistency
