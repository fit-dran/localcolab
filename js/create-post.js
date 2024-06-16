// Function to create a new post
async function createPost(event) {
    event.preventDefault();

    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const category = document.getElementById('category').value;
    const responseDiv = document.getElementById('response');

    // Retrieve user information from localStorage
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!loggedInUser) {
        responseDiv.innerHTML = '<div class="alert alert-danger">Error: Usuario no iniciado sesión.</div>';
        return;
    }

    const post = {
        title: title,
        content: content,
        category_id: category,
        email: loggedInUser.email
    };



    try {
        const response = await fetch('https://20dotpyrgj.execute-api.us-east-1.amazonaws.com/production/post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(post)
        });

        if (response.ok) {
            responseDiv.innerHTML = '<div class="alert alert-success">¡Publicación creada exitosamente!</div>';
            document.getElementById('create-post-form').reset(); // Reset the form
        } else {
            const errorText = await response.text();
            responseDiv.innerHTML = `<div class="alert alert-danger">Error: ${response.status} - ${errorText}</div>`;
        }
    } catch (error) {
        responseDiv.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
    }
}

// Attach the event listener to the form submission
document.getElementById('create-post-form').addEventListener('submit', createPost);
