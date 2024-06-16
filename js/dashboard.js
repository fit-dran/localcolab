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

// Function to display posts and their comments
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
                <p class="card-text"><small class="text-muted">Categoria: ${post.category_id}</small></p>
                <p class="card-text"><small class="text-muted">Creado por: ${post.email}</small></p>
                <div id="comments-${post.post_id}" class="mt-3"></div>
            </div>
        `;
        responseDiv.appendChild(postDiv);
        displayComments(post.post_id, post.comments); // Display comments for each post
    });
}

// Function to display comments for a specific post
function displayComments(postId, comments) {
    const commentsDiv = document.getElementById(`comments-${postId}`);
    commentsDiv.innerHTML = '';

    if (comments.length === 0) {
        commentsDiv.innerHTML = '<div class="alert alert-info">No comments found.</div>';
        return;
    }

    comments.forEach(comment => {
        const commentDiv = document.createElement('div');
        commentDiv.className = 'card mb-2';
        commentDiv.innerHTML = `
            <div class="card-body">
                <p class="card-text">${comment.content}</p>
                <p class="card-text"><small class="text-muted">Creado por: ${comment.email}</small></p>
            </div>
        `;
        commentsDiv.appendChild(commentDiv);
    });
}

// Function to filter notices by category
function filterNotices(categoryName) {
    const categoryMap = {
        'Robo': 1,
        'Asalto': 2,
        'Casa sola': 3,
        'Festividades': 4
    };
    const categoryId = categoryMap[categoryName];

    const responseDiv = document.getElementById('notices');
    responseDiv.innerHTML = 'Loading filtered notices...';

    fetch('https://20dotpyrgj.execute-api.us-east-1.amazonaws.com/production/posts')
        .then(response => response.json())
        .then(data => {
            const filteredPosts = data.message.filter(post => post.category_id === categoryId);
            displayPosts(filteredPosts);
        })
        .catch(error => {
            responseDiv.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
        });
}

// Load posts when the page is loaded
document.addEventListener('DOMContentLoaded', loadPosts);
