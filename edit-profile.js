document.addEventListener("DOMContentLoaded", () => {
    // 1. Load data from local storage
    const saved = localStorage.getItem('noteDropProfile');
    let currentBioContent = "Imagine a world where you can travel through time, experience different cultures, and live countless lives—all from the comfort of your own home. Books has been a source of knowledge, entertainment, and personal growth for centuries.";
    let currentName = "bEauty_เจ้าของสวนอ้อย";
    let currentImage = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80";

    if (saved) {
        const profileInfo = JSON.parse(saved);
        if (profileInfo.bio) currentBioContent = profileInfo.bio;
        if (profileInfo.name) currentName = profileInfo.name;
        if (profileInfo.imageSrc) currentImage = profileInfo.imageSrc;
    }

    const imgPreview = document.getElementById("imgPreview");
    const navProfileImage = document.getElementById("navProfileImage");
    const picFileInput = document.getElementById("picFile");
    const profilePicContainer = document.getElementById("profilePicContainer");
    const usernameInput = document.getElementById("username");
    const bioInput = document.getElementById("bio");

    imgPreview.src = currentImage;
    if (navProfileImage) navProfileImage.src = currentImage;
    usernameInput.value = currentName;
    bioInput.value = currentBioContent;

    // Trigger file input when clicking the picture container
    profilePicContainer.addEventListener("click", () => {
        picFileInput.click();
    });

    // Update preview when new file is selected
    picFileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                imgPreview.src = evt.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // 2. Button actions
    const backBtn = document.getElementById("backBtn");
    const saveBtn = document.getElementById("saveProfileBtn");

    backBtn.addEventListener("click", () => {
        window.location.href = "index.html";
    });

    saveBtn.addEventListener("click", () => {
        const name = usernameInput.value.trim();
        const bio = bioInput.value;
        const imageSrc = imgPreview.src; // Save the base64 or URL currently in preview

        if (name === "") {
            alert("กรุณากรอกชื่อผู้ใช้งาน");
            return;
        }

        const profileInfo = {
            name: name,
            bio: bio,
            imageSrc: imageSrc
        };
        
        localStorage.setItem('noteDropProfile', JSON.stringify(profileInfo));
        alert("บันทึกการเปลี่ยนแปลงเรียบร้อย");
        window.location.href = "index.html";
    });
});
