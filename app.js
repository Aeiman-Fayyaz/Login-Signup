const supabaseUrl = "https://hwyofckifjeewvmagsgc.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3eW9mY2tpZmplZXd2bWFnc2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0Mzk0MDcsImV4cCI6MjA2NzAxNTQwN30.pvsjYctkRI7NHdJrSuatOb-oLoatl8dIZfHUKv74gvE";

const { createClient } = supabase;
const client = createClient(supabaseUrl, supabaseKey);
console.log(createClient);

// Display a user
async function userDisplay() {
  try {
    const {
      data: { user },
      error,
    } = await client.auth.getUser();
    if (error) throw error;
    if (user) {
      // Getting profile image
      if (document.getElementById("profile-avatar")) {
        document.getElementById("profile-avatar").src =
          user.raw_user_meta_data?.avatar_URL ||
          user.meta_data?.profile_URL ||
          "https://www.gravatar.com/avatar/?d=mp";
        document.getElementById("userName").textContent =
          user.meta_data?.full_name || user.email;
        document.getElementById("userEmail").textContent = user.email;
      }
      if (window.location.pathname.includes("index.html")) {
        window.location.href = "post.html";
      }
    } else if (
      !window.location.pathname.includes("index.html") &&
      !window.location.pathname.includes("login.html")
    ) {
      window.location.href = "index.html";
    }
  } catch (error) {
    console.log("Error:", error);
    if (
      !window.location.pathname.includes("index.html") &&
      !window.location.pathname.includes("login.html")
    ) {
      window.location.href = "index.html";
    }
  }
}

// Create account or Sign up

const signUpBtn = document.getElementById("SignupBtn");

signUpBtn &&
  signUpBtn.addEventListener("click", async () => {
    const userSignupEmail = document.getElementById("signupEmail");
    const userSignupPassword = document.getElementById("signupPassword");
    if (userSignupEmail && userSignupPassword) {
      try {
        const loader = document.getElementById("loader");
        loader.style.display = "block";
        const { data, error } = await client.auth.signUp({
          email: userSignupEmail.value,
          password: userSignupPassword.value,
        });
        loader.style.display = "none";
        console.log(data);
        // navigate to login page
        // window.location.href = "index.html";
      } catch (error) {
        console.error("signp error:", error);
        if (error.message.includes("invalid format")) {
          alert("please give us the right format of email address");
        }
      }
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please Filled all these fields",
      });
    }
  });

// Login or Already have account
const loginBtn = document.getElementById("loginBtn");

loginBtn &&
  loginBtn.addEventListener("click", async () => {
    const userLoginEmail = document.getElementById("loginEmail");
    const userLoginPassword = document.getElementById("loginPassword");

    if (userLoginEmail && userLoginPassword) {
      try {
        // const loader = document.getElementById("loader");
        // loader.style.display = "block";
        const { data, error } = await client.auth.signInWithPassword({
          email: userLoginEmail.value,
          password: userLoginPassword.value,
        });
        // loader.style.display = "none";
        if (data) window.location.href = "post.html";
        if (error) throw error;
      } catch (error) {
        console.error("Login Error:", error);
        if (error.message.includes("invalid format")) {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "please give us the right format of email address",
          });
        } else {
          alert("Filled all fields");
        }
      }
    }
  });

// Google Button
const googleBtn = document.getElementById("google-btn");
googleBtn &&
  googleBtn.addEventListener("click", async (e) => {
    const data = await client.auth.signInWithOAuth({
      provider: "google",
    });
    console.log(data);
  });

// Account Log out
const logoutBtn = document.getElementById("logoutBtn");
logoutBtn &&
  logoutBtn.addEventListener("click", async (e) => {
    try {
      const data = await client.auth.signOut();
      if (error) throw error;
      window.location.href = "index.html";
    } catch (error) {
      console.error("logout error:", error);
      alert("logout failed");
    }
  });

// Post App

let posts = [];
let currentLocation = null;

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Handle post submission
  document.getElementById("postForm").addEventListener("submit", function (e) {
    e.preventDefault();
    createPost();
  });

  // Handle edit post submission
  document
    .getElementById("editPostForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      updatePost();
    });
});

// Create a new post
function createPost() {
  let content = document.getElementById("postContent").value.trim();
  if (!content) return;

  let mediaPreview = document.getElementById("mediaPreview");
  let mediaType = null;
  let mediaUrl = null;

  // Check if there's media to upload
  if (mediaPreview.children.length > 0) {
    let mediaElement = mediaPreview.firstChild;
    if (mediaElement.tagName === "IMG") {
      mediaType = "image";
      mediaUrl = mediaElement.src;
    } else if (mediaElement.tagName === "VIDEO") {
      mediaType = "video";
      mediaUrl = mediaElement.src;
    } else if (mediaElement.classList.contains("uploaded-file")) {
      mediaType = "file";
      mediaUrl = mediaElement.getAttribute("data-filename");
    }
  }

  let newPost = {
    id: Date.now(),
    content: content,
    mediaType: mediaType,
    mediaUrl: mediaUrl,
    location: currentLocation,
    createdAt: new Date().toISOString(),
  };

  posts.unshift(newPost);
  renderPosts();
  resetForm();
}

// Update an existing post
function updatePost() {
  let postId = parseInt(document.getElementById("editPostId").value);
  let newContent = document.getElementById("editPostContent").value.trim();

  let postIndex = posts.findIndex(function (post) {
    return post.id === postId;
  });

  if (postIndex !== -1) {
    posts[postIndex].content = newContent;
    renderPosts();
  }

  // Hide the modal
  let modal = bootstrap.Modal.getInstance(
    document.getElementById("editPostModal")
  );
  modal.hide();
}

// Delete a post
function deletePost(postId) {
  if (
    Swal.fire({
      title: "Are you sure?",
      text: "You won't delete this post!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Deleted!",
          text: "Your post has been deleted.",
          icon: "success",
        });
      }
    })
  ) {
    posts = posts.filter(function (post) {
      return post.id !== postId;
    });
    renderPosts();
  }
}

// Load posts (in a real app, this would fetch from a server)
function loadPosts() {
  // For demo purposes, let's add some sample posts
  if (posts.length === 0) {
    posts = [
      {
        id: 1,
        content: "This is a sample post with an image!",
        mediaType: "image",
        mediaUrl: "https://via.placeholder.com/600x400",
        location: null,
        createdAt: "2023-05-01T10:00:00Z",
      },
      {
        id: 2,
        content: "Check out this document I found!",
        mediaType: "file",
        mediaUrl: "sample-document.pdf",
        location: { name: "New York, NY" },
        createdAt: "2023-05-02T15:30:00Z",
      },
    ];
  }

  renderPosts();
}

// Render all posts
function renderPosts() {
  let postsFeed = document.getElementById("postsFeed");
  postsFeed.innerHTML = "";

  if (posts.length === 0) {
    postsFeed.innerHTML =
      '<p class="text-muted text-center">No posts yet. Create your first post!</p>';
    return;
  }

  posts.forEach(function (post) {
    let postElement = document.createElement("div");
    postElement.className = "card post-card mb-3";
    postElement.innerHTML = `
            <div class="card-body">
                <p class="card-text">${post.content}</p>
                
                ${renderPostMedia(post)}
                
                ${
                  post.location
                    ? `<div class="location-badge mt-2">
                        <i class="bi bi-geo-alt"></i> ${post.location.name}
                    </div>`
                    : ""
                }
                
                <div class="text-muted small mt-2">
                    ${formatDate(post.createdAt)}
                </div>
                
                <div class="post-actions">
                    <button class = "edit-btn" onclick = "openEditPost(${
                      post.id
                    })">
                        <i class="bi bi-pencil"></i> Edit
                    </button>
                    <button class = "dlt-btn" onclick="deletePost(${post.id})">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;

    postsFeed.appendChild(postElement);
  });
}

// Render media for a post
function renderPostMedia(post) {
  if (!post.mediaType) return "";

  switch (post.mediaType) {
    case "image":
      return `<img src="${post.mediaUrl}" class="post-media" alt="Post image">`;
    case "video":
      return `<video controls class="post-media">
                <source src="${post.mediaUrl}" type="video/mp4">
                Your browser does not support the video tag.
            </video>`;
    case "file":
      return `<a href="#" class="post-file uploaded-file" data-filename="${post.mediaUrl}">
                <i class="bi bi-file-earmark"></i> ${post.mediaUrl}
            </a>`;
    default:
      return "";
  }
}

// Preview media before uploading
function previewMedia(input, type) {
  let mediaPreview = document.getElementById("mediaPreview");
  mediaPreview.innerHTML = "";

  if (input.files && input.files[0]) {
    let file = input.files[0];

    if (type === "image" || type === "video") {
      let reader = new FileReader();

      reader.onload = function (e) {
        if (type === "image") {
          let img = document.createElement("img");
          img.src = e.target.result;
          mediaPreview.appendChild(img);
        } else {
          let video = document.createElement("video");
          video.src = e.target.result;
          video.controls = true;
          mediaPreview.appendChild(video);
        }
      };

      reader.readAsDataURL(file);
    } else if (type === "file") {
      let fileElement = document.createElement("div");
      fileElement.className = "uploaded-file";
      fileElement.setAttribute("data-filename", file.name);
      fileElement.innerHTML = `<i class="bi bi-file-earmark"></i> ${file.name}`;
      mediaPreview.appendChild(fileElement);
    }
  }
}

// Get current location
function getLocation() {
  let locationPreview = document.getElementById("locationPreview");

  if (navigator.geolocation) {
    locationPreview.innerHTML =
      '<div class="text-muted">Getting location...</div>';

    navigator.geolocation.getCurrentPosition(
      function (position) {
        // In a real app, you'd reverse geocode to get a location name
        currentLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          name: "Your Current Location",
        };

        locationPreview.innerHTML = `
                    <div class="location-badge">
                        <i class="bi bi-geo-alt"></i> ${currentLocation.name}
                    </div>
                `;
      },
      function (error) {
        locationPreview.innerHTML =
          '<div class="text-danger">Unable to get location</div>';
        console.error("Geolocation error:", error);
      }
    );
  } else {
    locationPreview.innerHTML =
      '<div class="text-danger">Geolocation is not supported by this browser</div>';
  }
}

// Open edit post
function openEditPost(postId) {
  let post = posts.find(function (p) {
    return p.id === postId;
  });

  if (post) {
    document.getElementById("editPostId").value = post.id;
    document.getElementById("editPostContent").value = post.content;

    let modal = new bootstrap.Modal(document.getElementById("editPostModal"));
    modal.show();
  }
}

// Reset the post form
function resetForm() {
  document.getElementById("postForm").reset();
  document.getElementById("mediaPreview").innerHTML = "";
  document.getElementById("locationPreview").innerHTML = "";
  currentLocation = null;
}

// Format date for display
function formatDate(isoString) {
  let date = new Date(isoString);
  return (
    date.toLocaleDateString() +
    " at " +
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
}
