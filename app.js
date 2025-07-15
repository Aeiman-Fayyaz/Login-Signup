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
      const profileAvatar = document.getElementById("profile-avatar");
      const userName = document.getElementById("userName");
      const userEmail = document.getElementById("userEmail");

      if (profileAvatar) {
        profileAvatar.src =
          user.user_metadata?.avatar_url ||
          "https://www.gravatar.com/avatar/?d=mp" ||
          "https://play-lh.googleusercontent.com/7Ak4Ye7wNUtheIvSKnVgGL_OIZWjGPZNV6TP_3XLxHC-sDHLSE45aDg41dFNmL5COA";
      }
      if (userName) {
        userName.textContent = user.user_metadata?.full_name || user.email;
      }
      if (userEmail) {
        userEmail.textContent = user.email;
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
    console.error("Error in userDisplay:", error);
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
    if (!userSignupEmail || !userSignupPassword) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please fill all fields",
      });
      return;
    }
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
      if (error) throw error;
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Account Created",
      }).then(() => {
        window.location.href = "login.html";
      });
      console.log("Signup data:", data);
    } catch (error) {
      console.error("signp error:", error);
      loader.style.display = "none";
      if (error.message.includes("invalid format")) {
        Swal.fire({
          icon: "error",
          title: "Wrong Credentials",
          text: "Enter correct email or password",
        });
      } else if (
        error.message.includes("user already registered") ||
        "already exists" ||
        "User already registered"
      ) {
        Swal.fire({
          icon: "error",
          title: "Email Exists",
          text: "This email is already registered",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Please Filled all these fields",
        });
      }
    }
  });

// Login or Already have account
const loginBtn = document.getElementById("loginBtn");

loginBtn &&
  loginBtn.addEventListener("click", async () => {
    const userLoginEmail = document.getElementById("loginEmail");
    const userLoginPassword = document.getElementById("loginPassword");
    if (!userLoginEmail || !userLoginPassword) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please fill all fields",
      });
      return;
    }
    if (userLoginEmail && userLoginPassword) {
      try {
        const loader = document.getElementById("loader");
        loader.style.display = "block";
        const { data, error } = await client.auth.signInWithPassword({
          email: userLoginEmail.value,
          password: userLoginPassword.value,
        });
        loader.style.display = "none";
        if (error) throw error;
        if (data && data.user) window.location.href = "post.html";
      } catch (error) {
        console.error("Login Error:", error);
        if (error.message.includes("Invalid user credentials")) {
          Swal.fire({
            icon: "error",
            title: "Login failed",
            text: "Wrong email or password. Please try again.",
          });
        } else if (error.message.includes("invalid format")) {
          Swal.fire({
            icon: "error",
            title: "Wrong credentails",
            text: "Enter correct email or password",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Login failed. Please try again.",
          });
        }
      }
    }
  });

// Google OAuth
const googleBtn = document.getElementById("google-btn");
if (googleBtn) {
  googleBtn.addEventListener("click", async () => {
    await client.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/post.html",
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
  });
}

// Github Aouth
const githubBtn = document.getElementById("github-btn");
if (githubBtn) {
  githubBtn.addEventListener("click", async function signInWithGithub() {
    await client.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: window.location.origin + "/post.html",
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
  });
}

// Facebook OAuth
const facebookBtn = document.getElementById("facebook-btn");
if (facebookBtn) {
  facebookBtn.addEventListener("click", async function signInWithFacebook (){
    try {
      const {error} = await client.auth.signInWithOAuth({
        provider: 'facebook',
        options:{
          redirectTo: window.location.origin + "/post.html",
          queryParams: { access_type: "offline", prompt: "consent"}
        },
      });
      if(error) throw error
    } catch(error){
      console.log("login error" , error.message);
    }
  })
}
// Account Log out
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await client.auth.signOut();
      window.location.href = "index.html";
    } catch (error) {
      console.error("Logout error:", error);
      Swal.fire({
        icon: "error",
        title: "Logout Failed",
        text: "Please try again",
      });
    }
  });
}
// Post App

let posts = [];
let currentLocation = null;

// Date in post
function formatDate(isoString) {
  let date = new Date(isoString);
  return (
    date.toLocaleDateString() +
    " at " +
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
}

function resetForm() {
  document.getElementById("postForm").reset();
  document.getElementById("mediaPreview").innerHTML = "";
  document.getElementById("locationPreview").innerHTML = "";
  currentLocation = null;
}

// Render media
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

// Render post
function renderPosts() {
  let postsFeed = document.getElementById("postsFeed");
  postsFeed.innerHTML = "";

  if (posts.length === 0) {
    postsFeed.innerHTML =
      '<p class="text-light text-center">No posts yet. Create your first post!</p>';
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
          <button class="edit-btn" onclick="openEditPost(${post.id})">
            <i class="bi bi-pencil"></i> Edit
          </button>
          <button class="dlt-btn" onclick="deletePost(${post.id})">
            <i class="bi bi-trash"></i> Delete
          </button>
        </div>
      </div>
    `;
    postsFeed.appendChild(postElement);
  });
}

// Post save in local storage
function savePostsToStorage() {
  localStorage.setItem("socialMediaPosts", JSON.stringify(posts));
}

function loadPostsFromStorage() {
  const savedPosts = localStorage.getItem("socialMediaPosts");
  if (savedPosts) {
    posts = JSON.parse(savedPosts);
  }
  renderPosts();
}

// POst Creation
function createPost() {
  let content = document.getElementById("postContent").value.trim();
  if (!content) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Post content cannot be empty!",
      confirmButtonColor: "#3085d6",
    });
    return;
  }

  let mediaPreview = document.getElementById("mediaPreview");
  let mediaType = null;
  let mediaUrl = null;

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
  savePostsToStorage();
  renderPosts();
  resetForm();

  Swal.fire({
    position: "top-end",
    icon: "success",
    title: "Post created successfully!",
    showConfirmButton: false,
    timer: 1500,
  });
}

// Update post
function updatePost() {
  let postId = parseInt(document.getElementById("editPostId").value);
  let newContent = document.getElementById("editPostContent").value.trim();

  let postIndex = posts.findIndex((post) => post.id === postId);
  if (postIndex !== -1) {
    posts[postIndex].content = newContent;
    savePostsToStorage();
    renderPosts();

    Swal.fire({
      position: "top-end",
      icon: "success",
      title: "Post updated!",
      showConfirmButton: false,
      timer: 1500,
    });
  }

  bootstrap.Modal.getInstance(document.getElementById("editPostModal")).hide();
}

// Delete post
function deletePost(postId) {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      posts = posts.filter((post) => post.id !== postId);
      savePostsToStorage();
      renderPosts();
      Swal.fire("Deleted!", "Your post has been deleted.", "success");
    }
  });
}

// Media
function previewMedia(input, type) {
  let mediaPreview = document.getElementById("mediaPreview");
  mediaPreview.innerHTML = "";

  if (input.files && input.files[0]) {
    let file = input.files[0];
    let reader = new FileReader();

    reader.onload = function (e) {
      if (type === "image") {
        let img = document.createElement("img");
        img.src = e.target.result;
        img.style.maxWidth = "100%";
        img.style.maxHeight = "200px";
        mediaPreview.appendChild(img);
      } else if (type === "video") {
        let video = document.createElement("video");
        video.src = e.target.result;
        video.controls = true;
        video.style.maxWidth = "100%";
        mediaPreview.appendChild(video);
      } else if (type === "file") {
        let fileElement = document.createElement("div");
        fileElement.className = "uploaded-file";
        fileElement.setAttribute("data-filename", file.name);
        fileElement.innerHTML = `<i class="bi bi-file-earmark"></i> ${file.name}`;
        mediaPreview.appendChild(fileElement);
      }
    };
    reader.readAsDataURL(file);
  }
}

function getLocation() {
  let locationPreview = document.getElementById("locationPreview");

  if (!navigator.geolocation) {
    locationPreview.innerHTML =
      '<div class="text-danger">Geolocation not supported</div>';
    return;
  }

  locationPreview.innerHTML =
    '<div class="text-muted">Getting location...</div>';

  navigator.geolocation.getCurrentPosition(
    (position) => {
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
    (error) => {
      locationPreview.innerHTML =
        '<div class="text-danger">Location access denied</div>';
      console.error("Geolocation error:", error);
    }
  );
}

function openEditPost(postId) {
  let post = posts.find((p) => p.id === postId);
  if (post) {
    document.getElementById("editPostId").value = post.id;
    document.getElementById("editPostContent").value = post.content;
    new bootstrap.Modal(document.getElementById("editPostModal")).show();
  }
}

// ========== INITIALIZATION ==========
document.addEventListener("DOMContentLoaded", function () {
  // Load existing posts
  loadPostsFromStorage();

  // Form submission handlers
  document.getElementById("postForm").addEventListener("submit", function (e) {
    e.preventDefault();
    createPost();
  });

  document
    .getElementById("editPostForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      updatePost();
    });

  // Media upload handlers
  document
    .getElementById("imageUpload")
    .addEventListener("change", function () {
      previewMedia(this, "image");
    });
  document
    .getElementById("videoUpload")
    .addEventListener("change", function () {
      previewMedia(this, "video");
    });
  document.getElementById("fileUpload").addEventListener("change", function () {
    previewMedia(this, "file");
  });
});
