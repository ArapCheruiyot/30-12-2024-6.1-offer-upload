// Initialize Google API
function initializeGoogleAuth() {
    gapi.load('client:auth2', () => {
        gapi.auth2.init({
            client_id: '147934510488-2eeg7uct5hl78a29igth97057perrg3f.apps.googleusercontent.com', // Replace YOUR_CLIENT_ID
            scope: 'https://www.googleapis.com/auth/drive.file',
        }).then(() => {
            console.log('Google API initialized');
            updateUI(false);
        }).catch(error => {
            console.error('Error initializing Google API:', error);
        });
    });
}

// DOM Elements
const signInBtn = document.getElementById('signInBtn');
const signOutBtn = document.getElementById('signOutBtn');
const fileInput = document.getElementById('fileInput');
const selectFilesBtn = document.getElementById('selectFilesBtn');
const uploadBtn = document.getElementById('uploadBtn');
const fileList = document.getElementById('fileList');
const uploadStatus = document.getElementById('uploadStatus');

// Update UI based on sign-in status
function updateUI(isSignedIn) {
    signInBtn.style.display = isSignedIn ? 'none' : 'block';
    signOutBtn.style.display = isSignedIn ? 'inline-block' : 'none';
    selectFilesBtn.style.display = isSignedIn ? 'inline-block' : 'none';
    uploadBtn.style.display = 'none';
    fileInput.style.display = 'none';
}

// Handle Google Sign-In
signInBtn.addEventListener('click', () => {
    gapi.auth2.getAuthInstance().signIn().then(user => {
        console.log('Signed in as:', user.getBasicProfile().getName());
        updateUI(true);
    }).catch(error => {
        console.error('Sign-in error:', error);
    });
});

// Handle Google Sign-Out
signOutBtn.addEventListener('click', () => {
    gapi.auth2.getAuthInstance().signOut().then(() => {
        console.log('User signed out');
        updateUI(false);
        fileList.innerHTML = '';
        uploadStatus.textContent = '';
    }).catch(error => {
        console.error('Sign-out error:', error);
    });
});

// Handle File Selection
selectFilesBtn.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', () => {
    const files = Array.from(fileInput.files);
    fileList.innerHTML = ''; // Clear the file list
    files.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.textContent = file.name;
        fileList.appendChild(fileItem);
    });
    uploadBtn.style.display = files.length > 0 ? 'inline-block' : 'none';
    uploadBtn.disabled = files.length === 0;
});

// Upload Files
uploadBtn.addEventListener('click', () => {
    const files = Array.from(fileInput.files);

    if (files.length === 0) {
        alert('No files selected for upload');
        return;
    }

    const accessToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;

    files.forEach(file => {
        const metadata = {
            name: file.name,
            mimeType: file.type,
        };

        const formData = new FormData();
        formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        formData.append('file', file);

        fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: new Headers({ 'Authorization': `Bearer ${accessToken}` }),
            body: formData,
        })
            .then(response => response.json())
            .then(data => {
                console.log(`Uploaded: ${data.name}`);
                uploadStatus.textContent = `Uploaded: ${data.name}`;
            })
            .catch(error => {
                console.error('Upload error:', error);
                uploadStatus.textContent = 'Error uploading files';
            });
    });
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeGoogleAuth);
