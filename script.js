// Initialize Google Auth and authentication client
function initializeGoogleAuth() {
    gapi.load('client:auth2', () => {
        gapi.auth2.init({
            client_id: 'YOUR_CLIENT_ID', // Replace with your client ID
            scope: 'https://www.googleapis.com/auth/drive.file', // Permissions for Google Drive file access
        }).then(() => {
            console.log('Google API initialized');
            // Check if user is already signed in
            checkUserSignedIn();
        }).catch(error => {
            console.error('Error initializing Google API:', error);
        });
    });
}

// Check if user is signed in
function checkUserSignedIn() {
    const authInstance = gapi.auth2.getAuthInstance();
    const user = authInstance.currentUser.get();

    if (user.isSignedIn()) {
        showFileSelectionUI();
    } else {
        showSignInButton();
    }
}

// Show the file selection UI after successful login
function showFileSelectionUI() {
    // Hide Google Sign-In button and show file selection buttons
    document.querySelector('.g_id_signin').style.display = 'none';
    document.getElementById('fileInput').style.display = 'inline-block';
    document.getElementById('uploadBtn').style.display = 'inline-block';
    document.getElementById('deleteSelectedBtn').style.display = 'inline-block';
}

// Show Google Sign-In button if user is not signed in
function showSignInButton() {
    document.querySelector('.g_id_signin').style.display = 'inline-block';
    document.getElementById('fileInput').style.display = 'none';
    document.getElementById('uploadBtn').style.display = 'none';
    document.getElementById('deleteSelectedBtn').style.display = 'none';
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

// Event listener for file input changes (file selection)
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

// Update upload status
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
document.getElementById('uploadBtn').addEventListener('click', uploadFiles);
document.getElementById('deleteSelectedBtn').addEventListener('click', () => {
    // Add your file deletion logic here
    alert('Delete button clicked (functionality to be implemented).');
});

// Ensure Google API is initialized when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeGoogleAuth();
});
