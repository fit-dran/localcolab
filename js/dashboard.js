// Function to load posts from the API
async function loadPosts() {
    const responseDiv = document.getElementById('notices');
    responseDiv.innerHTML = 'Loading notices...';

    try {
        const response = await fetch('https://20dotpyrgj.execute-api.us-east-1.amazonaws.com/production/posts');
        if (response.ok) {
            const data = await response.json();
            displayPosts(data.message);
        } else {
            const errorText = await response.text();
            responseDiv.innerHTML = `<div class="alert alert-danger">Error: ${response.status} - ${errorText}</div>`;
        }
    } catch (error) {
        responseDiv.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
    }
}

// Function to display posts
function displayPosts(posts) {
    const responseDiv = document.getElementById('notices');
    responseDiv.innerHTML = '';

    if (posts.length === 0) {
        responseDiv.innerHTML = '<div class="alert alert-info">No notices found.</div>';
        return;
    }

    posts.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.className = 'card mb-3';
        postDiv.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${post.title}</h5>
                <p class="card-text">${post.content}</p>
                <p class="card-text text-right"><small class="text-muted">Creado por: ${post.email}</small></p>
            </div>
        `;
        responseDiv.appendChild(postDiv);
    });
}

// Function to filter notices by category
function filterNotices(category) {
    const responseDiv = document.getElementById('notices');
    responseDiv.innerHTML = 'Loading filtered notices...';

    fetch('https://20dotpyrgj.execute-api.us-east-1.amazonaws.com/production/posts')
        .then(response => response.json())
        .then(data => {
            const filteredPosts = data.message.filter(post => post.category_id === category);
            displayPosts(filteredPosts);
        })
        .catch(error => {
            responseDiv.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
        });
}

// Load posts when the page is loaded
document.addEventListener('DOMContentLoaded', loadPosts);
