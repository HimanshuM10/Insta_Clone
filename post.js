function createPost() {
    var data = {
        title: document.getElementById('post-title').value,
        content: document.getElementById('post-content').value
    };
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:3000/posts', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' +
        localStorage.getItem('jwtToken'));
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 201) {
            alert('Post created successfully!');
            window.location.href = 'view-posts.html';
        } else if (xhr.readyState === 4) {
            alert('Error creating post');
        }
    };
    xhr.send(JSON.stringify(data));
}