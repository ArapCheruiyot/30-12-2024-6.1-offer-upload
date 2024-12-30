// Load Google API and initialize authentication
function initializeGoogleAuth() {
    gapi.load('client:auth2', () => {
        gapi.auth2.init({
            client_id: 'YOUR_CLIENT_ID', // Replace with your actual client ID
            scope: 'https://www.googleapis.com/auth/drive.file',
        }).then(() => {
            console.log('Google API initialized');
        }).catch(error => {
            console.error('Error initializing Google API:', error);
        });
    });
}

// Event listener for DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    initializeGoogleAuth();

    // Set up event listeners here for the sign-in button
});

const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const uploadBtn = document.getElementById('uploadBtn');
const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');

// Handle file selection
fileInput.addEventListener('change', () => {
    const files = Array.from(fileInput.files);

    fileList.innerHTML = ''; // Clear existing file list
    files.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.textContent = file.name;
        fileItem.dataset.index = index;
        fileList.appendChild(fileItem);
    });

    // Enable upload and delete buttons
    if (files.length > 0) {
        uploadBtn.style.display = 'inline-block';
        deleteSelectedBtn.style.display = 'inline-block';
        uploadBtn.disabled = false;
    } else {
        uploadBtn.style.display = 'none';
        deleteSelectedBtn.style.display = 'none';
    }
});
function uploadFiles() {
    const files = fileInput.files;

    if (files.length === 0) {
        alert('Please select files to upload.');
        return;
    }

    const accessToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;

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
            headers: new Headers({ 'Authorization': `Bearer ${accessToken}` }),
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

uploadBtn.addEventListener('click', uploadFiles);
const uploadStatus = document.getElementById('uploadStatus');

// Update status messages
function updateStatus(message) {
    uploadStatus.style.display = 'block';
    uploadStatus.textContent = message;

    // Hide status after 5 seconds
    setTimeout(() => {
        uploadStatus.style.display = 'none';
    }, 5000);
}
