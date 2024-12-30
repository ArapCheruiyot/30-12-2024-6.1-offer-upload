<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Google Drive File Upload</title>
    <script src="https://apis.google.com/js/api.js"></script>
</head>
<body>
    <button id="signInBtn">Sign In with Google</button>
    <input type="file" id="fileInput" style="display: none;">
    <div id="fileList"></div>
    <button id="uploadBtn" style="display: none;" disabled>Upload Files</button>
    <button id="deleteSelectedBtn" style="display: none;">Delete Selected Files</button>
    <div id="uploadStatus" style="display: none;"></div>

    <script>
        let gapiLoaded = false;

        // Initialize Google API and authentication client
        function initializeGoogleAuth() {
            gapi.load('client:auth2', () => {
                gapi.auth2.init({
                    client_id: 'YOUR_CLIENT_ID', // Replace with your actual client ID
                    scope: 'https://www.googleapis.com/auth/drive.file', // Google Drive file permissions
                }).then(() => {
                    gapiLoaded = true;
                    console.log('Google API initialized');
                    checkUserSignedIn(); // Check if user is signed in
                }).catch(error => {
                    console.error('Error initializing Google API:', error);
                });
            });
        }

        // Check if the user is signed in
        function checkUserSignedIn() {
            if (gapiLoaded) {
                const authInstance = gapi.auth2.getAuthInstance();
                const user = authInstance.currentUser.get();

                if (user.isSignedIn()) {
                    console.log('User is signed in');
                    showFileSelectionUI();
                } else {
                    console.log('User not signed in');
                    showSignInButton();
                }
            }
        }

        // Show file selection UI after successful login
        function showFileSelectionUI() {
            document.getElementById('signInBtn').style.display = 'none';
            document.getElementById('fileInput').style.display = 'inline-block';
            document.getElementById('uploadBtn').style.display = 'inline-block';
            document.getElementById('deleteSelectedBtn').style.display = 'inline-block';
        }

        // Show the Google Sign-In button if the user is not signed in
        function showSignInButton() {
            document.getElementById('signInBtn').style.display = 'inline-block';
        }

        // Handle Google Sign-In button click
        function handleSignInClick() {
            const authInstance = gapi.auth2.getAuthInstance();
            authInstance.signIn().then(() => {
                console.log('User signed in');
                showFileSelectionUI();
            }).catch(error => {
                console.error('Sign-In failed', error);
            });
        }

        // Handle file input changes (file selection)
        const fileInput = document.getElementById('fileInput');
        fileInput.addEventListener('change', () => {
            const files = Array.from(fileInput.files);
            displayFileList(files);
        });

        // Display selected files in the UI
        function displayFileList(files) {
            const fileList = document.getElementById('fileList');
            fileList.innerHTML = ''; // Clear previous file list

            files.forEach((file, index) => {
                const fileItem = document.createElement('div');
                fileItem.textContent = file.name;
                fileItem.dataset.index = index;
                fileList.appendChild(fileItem);
            });

            // Enable upload and delete buttons
            const uploadBtn = document.getElementById('uploadBtn');
            const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
            if (files.length > 0) {
                uploadBtn.disabled = false;
                uploadBtn.style.display = 'inline-block';
                deleteSelectedBtn.style.display = 'inline-block';
            } else {
                uploadBtn.disabled = true;
                uploadBtn.style.display = 'none';
                deleteSelectedBtn.style.display = 'none';
            }
        }

        // Handle file upload
        function uploadFiles() {
            const files = fileInput.files;
            const accessToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;

            if (files.length === 0) {
                alert('Please select files to upload.');
                return;
            }

            Array.from(files).forEach(file => {
                const metadata = {
                    name: file.name,
                    mimeType: file.type,
                };

                const formData = new FormData();
                formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
                formData.append('file', file);

                fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: formData,
                })
                .then(response => response.json())
                .then(data => {
                    console.log(`Uploaded file: ${data.name}`);
                    updateStatus(`Uploaded file: ${data.name}`);
                })
                .catch(error => {
                    console.error('Error uploading file:', error);
                    updateStatus('Error uploading file. See console for details.');
                });
            });
        }

        // Update the upload status
        function updateStatus(message) {
            const uploadStatus = document.getElementById('uploadStatus');
            uploadStatus.textContent = message;
            uploadStatus.style.display = 'block';

            // Hide the status after 5 seconds
            setTimeout(() => {
                uploadStatus.style.display = 'none';
            }, 5000);
        }

        // Event listeners for buttons
        document.getElementById('signInBtn').addEventListener('click', handleSignInClick);
        document.getElementById('uploadBtn').addEventListener('click', uploadFiles);

        // Initialize Google Auth when the page loads
        window.addEventListener('DOMContentLoaded', () => {
            initializeGoogleAuth();
        });
    </script>
</body>
</html>
