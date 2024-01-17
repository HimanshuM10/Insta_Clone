function fetchPostDetails() {
    const postId = localStorage.getItem('editPostId');
    if (!postId) {
        alert('No post selected for editing');
        window.location.href = 'view-posts.html';
        return;
    }
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://localhost:3000/posts/' + postId, true);
    xhr.setRequestHeader('Authorization', 'Bearer ' +
        localStorage.getItem('jwtToken'));
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var post = JSON.parse(xhr.responseText);
            document.getElementById('edit-post-title').value = post.title;
            document.getElementById('edit-post-content').value = post.content;
        }
    };
    xhr.send();
}
function submitEdit() {
    var data = {
        title: document.getElementById('edit-post-title').value,
        content: document.getElementById('edit-post-content').value
    };
    var xhr = new XMLHttpRequest();
    xhr.open('PUT', 'http://localhost:3000/posts/' +
        localStorage.getItem('editPostId'), true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' +
        localStorage.getItem('jwtToken'));
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                alert('Post updated successfully!');
                window.location.href = 'view-posts.html';
            } else {
                alert('Error updating post');
            }
        }
    };
    xhr.send(JSON.stringify(data));
}
window.onload = fetchPostDetails;