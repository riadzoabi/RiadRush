document.getElementById('uploadButton').addEventListener('click', uploadFile);

function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    console.log('Selected file:', file ? file.name : 'No file selected');

    if (file) {
        const formData = new FormData();
        formData.append('file', file);

        fetch('/upload', {
            method: 'POST',
            body: formData,
        })
        .then(response => {
            console.log('Response received:', response);

            const contentType = response.headers.get('content-type');
            console.log('Response Content-Type:', contentType);

            if (contentType && contentType.includes('application/json')) {
                return response.json();
            } else {
                return response.text().then(text => {
                    console.warn('Received non-JSON response:', text);
                    return { success: true, message: text };
                });
            }
        })
        .then(data => {
            console.log('Response data:', data);

            if (data.success) {
                const fileUrl = `/download.html?file=${encodeURIComponent(file.name)}`;
                const fileSize = `${(file.size / 1024).toFixed(2)} KB`;

                console.log('Opening modal for:', file.name);
                openModal(file.name, fileUrl, fileSize);
            } else {
                throw new Error('File upload failed according to server response.');
            }
        })
        .catch(error => {
            console.error('Error during fetch or upload:', error);
            alert(`Upload error: ${error.message}`);
        });
    } else {
        alert("Please select a file to upload.");
    }
}

function openModal(fileName, fileUrl, fileSize) {
    console.log('Opening modal...');
    const modal = document.getElementById('modal');
    
    if (!modal) {
        throw new Error('Modal element not found.');
    }

    modal.style.display = 'block';

    const fileInfo = document.getElementById('fileInfo');
    const fileLink = document.getElementById('fileLink');
    const qrCode = document.getElementById('qr-code');
    
    if (!fileInfo || !fileLink || !qrCode) {
        throw new Error('One or more modal elements not found.');
    }

    // Create the long URL including the size parameter
    const longUrl = `${window.location.origin + fileUrl}&size=${fileSize}`;

    // Call the TinyURL API to shorten the URL
    shortenUrl(longUrl)
        .then(shortenedUrl => {
            // Update all elements with the shortened URL
            fileInfo.textContent = `${fileName} - ${fileSize}`;
            fileLink.value = shortenedUrl;
            loadingAni.style.display = 'none';
            // Generate the QR code for the shortened URL
            new QRCode(qrCode, {
                
                text: shortenedUrl,
                width: 80,
                height: 80
            });
            

            console.log('QR code generated for:', shortenedUrl);

            // Add event listener for copy button to copy shortened link to clipboard
            const copyButton = document.getElementById('copyButton');
            if (!copyButton) {
                throw new Error('Copy button not found.');
            }

            copyButton.addEventListener('click', function() {
                navigator.clipboard.writeText(shortenedUrl)
                    .then(() => {
                        document.getElementById('copyButton').style.backgroundColor = "#5DC129";
                        document.getElementById('copyIc').src = "/graphics/Tcopy.svg";

                    })
                    .catch(err => {
                        console.error('Failed to copy text: ', err);
                        document.getElementById('copyButton').style.backgroundColor = "#C12929";
                        document.getElementById('copyIc').src = "/graphics/!!copy.svg";

                    });
            });
        })
        .catch(error => {
            console.error('Error shortening URL:', error);
            document.getElementById('statusMessage').textContent = "Failed to shorten URL.";
        });

    document.querySelector('.close').addEventListener('click', () => {
        modal.style.display = 'none';
        qrCode.innerHTML = '';  // Clear QR code after closing
        console.log('Modal closed');
    });
}

// Function to shorten the URL using TinyURL API
function shortenUrl(longUrl) {
    return fetch(`https://api.tinyurl.com/create?url=${encodeURIComponent(longUrl)}`, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer yd23guPrEjKUVPPYJCYURetasZtaVGSkd4F2Z0OXzkaJD8JfpXElvXY8mHcY', // Replace with your TinyURL API key
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            url: longUrl,
            domain: "tinyurl.com"
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data && data.data && data.data.tiny_url) {
            return data.data.tiny_url; // Return the shortened URL
        } else {
            throw new Error('Failed to shorten the URL');
        }
    });
}

window.addEventListener('DOMContentLoaded', (event) => {
    // Parse the file name and size from the URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const fileName = urlParams.get('file');
    const fileSize = urlParams.get('size'); // Size can be passed in the URL

    // Set the file name and download URL
    if (fileName) {
        document.getElementById('fileName').textContent = `${fileName} - ${fileSize}`;

        // Add click event listener to the download button
        document.getElementById('downloadButton').addEventListener('click', function() {
            // Create an anchor element to initiate the download
            const downloadLink = document.createElement('a');
            downloadLink.href = `/uploads/${fileName}`; // Path to the uploaded file
            downloadLink.download = fileName; // Set download attribute
            downloadLink.click(); // Programmatically click the link to download the file
        });
    } else {
        document.body.innerHTML = '<p>File not found.</p>';
    }
});


