// --- DATA STRUCTURE: Node ---
class NoteNode {
    constructor(id, tag, title, image) {
        this.id = id;
        this.tag = tag;
        this.title = title;
        this.image = image;

        // Interaction State
        this.isLiked = false;
        this.isSaved = false;

        // For BST
        this.left = null;
        this.right = null;

        // For Linked List
        this.next = null;
    }
}

// --- DATA STRUCTURE: Binary Search Tree (BST) ---
class BinarySearchTree {
    constructor() {
        this.root = null;
    }

    insert(id, tag, title, image) {
        const newNode = new NoteNode(id, tag, title, image);
        if (this.root === null) {
            this.root = newNode;
        } else {
            this.insertNode(this.root, newNode);
        }
    }

    insertNode(node, newNode) {
        if (newNode.id < node.id) {
            if (node.left === null) node.left = newNode;
            else this.insertNode(node.left, newNode);
        } else {
            if (node.right === null) node.right = newNode;
            else this.insertNode(node.right, newNode);
        }
    }

    getSortedNotes(node = this.root, result = []) {
        if (node !== null) {
            this.getSortedNotes(node.left, result);
            result.push(node);
            this.getSortedNotes(node.right, result);
        }
        return result;
    }

    // ฟังก์ชันค้นหาโน้ต (Search/Filter) โดยรับ Query แล้วหาเทียบกับ title หรือ tag
    searchNotes(query) {
        const queryLower = query.toLowerCase();
        const allNotes = this.getSortedNotes();
        return allNotes.filter(note =>
            note.title.toLowerCase().includes(queryLower) ||
            note.tag.toLowerCase().includes(queryLower)
        );
    }
}

// --- DATA STRUCTURE: Linked List ---
class LinkedList {
    constructor() {
        this.head = null;
        this.size = 0;
        this.maxSize = 4;
    }

    addFirst(note) {
        // Only add if not same as most recent (prevent spamming same note)
        if (this.head && this.head.id === note.id) return;

        const newNode = new NoteNode(note.id, note.tag, note.title, note.image);
        newNode.next = this.head;
        this.head = newNode;
        this.size++;

        let current = this.head;
        let count = 1;
        while (current.next !== null) {
            if (count >= this.maxSize) {
                current.next = null;
                this.size = this.maxSize;
                break;
            }
            current = current.next;
            count++;
        }
    }

    getAll() {
        let result = [];
        let current = this.head;
        while (current !== null) {
            result.push(current);
            current = current.next;
        }
        return result;
    }
}

// Initialize
const notesTree = new BinarySearchTree();
const historyList = new LinkedList();

// Seed Data
notesTree.insert(4, "#CSI104", "สรุป Calculus 1 ฉบับคนไม่มีพื้นฐาน (เต็ม 10 ไม่หัก)", "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80");
notesTree.insert(1, "#USC10957", "เนื้อหาสถิติและความน่าจะเป็น (เนื้อหาออกสอบบ่อย)", "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=600&q=80");
notesTree.insert(3, "#CSI104", "ไม่ใช่เจ้าของกิจการอย่าหวังจะได้ใจไป...", "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=600&q=80");
notesTree.insert(2, "#CSI105", "ไม่มีแล้วจ้า 💔 (Data Structure แสนสาหัส)", "https://images.unsplash.com/photo-1555099962-4199c345e5dd?auto=format&fit=crop&w=600&q=80");


// Global Bio Content Variable
let currentBioContent = "Imagine a world where you can travel through time, experience different cultures, and live countless lives—all from the comfort of your own home. Books has been a source of knowledge, entertainment, and personal growth for centuries.";

document.addEventListener("DOMContentLoaded", () => {

    // 1. Setup Bio with Read More logic
    renderBio();

    // 2. Initial Render of Notes
    renderNotesGrid();

    // 3. Modals and Interactions Setup
    setupEditProfile();
    setupSearch();
    setupNoteViewerModal();

});

function renderBio() {
    const bioContainer = document.getElementById("profileBioContainer");
    if (!bioContainer) return;

    const maxLength = 100; // กำหนดขีดจำกัดตัวอักษร
    if (currentBioContent.length > maxLength) {
        const shortText = currentBioContent.substring(0, maxLength) + "...";
        bioContainer.innerHTML = `
            <span class="bio-text" id="visibleBio">${shortText}</span>
            <button class="read-more-btn" id="bioToggleBtn">more</button>
        `;

        const toggleBtn = document.getElementById("bioToggleBtn");
        const visibleBio = document.getElementById("visibleBio");

        let isExpanded = false;
        toggleBtn.addEventListener("click", () => {
            isExpanded = !isExpanded;
            if (isExpanded) {
                visibleBio.innerText = currentBioContent;
                toggleBtn.innerText = "less";
            } else {
                visibleBio.innerText = shortText;
                toggleBtn.innerText = "more";
            }
        });
    } else {
        bioContainer.innerHTML = `<span class="bio-text">${currentBioContent}</span>`;
    }
}

function renderNotesGrid(notesToRender = null) {
    const gridContainer = document.getElementById('mainNotesGrid');
    if (!gridContainer) return;
    gridContainer.innerHTML = '';

    // ถ้าไม่มีการส่งค่า notes เข้ามา ให้ดึงทั้งหมดจาก Tree
    const notes = notesToRender || notesTree.getSortedNotes();

    const countLabel = document.getElementById('notesCountLabel');
    if (countLabel && !notesToRender) countLabel.innerText = `Notes: ${notes.length}`;

    notes.forEach(note => {
        const card = createNoteCardUI(note);
        gridContainer.appendChild(card);
    });
}

function renderHistoryGrid() {
    const historyContainer = document.getElementById('historyNotesGrid');
    const historySection = document.getElementById('recentlyViewedSection');

    if (!historyContainer || !historySection) return;

    const recentNotes = historyList.getAll();
    if (recentNotes.length === 0) {
        historySection.style.display = 'none';
        return;
    }

    historySection.style.display = 'block';
    historyContainer.innerHTML = '';

    recentNotes.forEach(note => {
        const card = createNoteCardUI(note, true);
        historyContainer.appendChild(card);
    });
}

function createNoteCardUI(note, isHistory = false) {
    const article = document.createElement('article');
    article.className = 'note-card';

    // Check initial interaction states
    const heartIconClass = note.isLiked ? 'ph-fill ph-heart' : 'ph ph-heart';
    const heartText = note.isLiked ? 'โหวตแล้ว' : 'โหวต';
    const activeHeartColor = note.isLiked ? 'color: var(--color-cyclamen)' : '';

    const saveIconClass = note.isSaved ? 'ph-fill ph-download-simple' : 'ph ph-download-simple';
    const saveText = note.isSaved ? 'เซฟแล้ว' : 'เซฟ';
    const activeSaveColor = note.isSaved ? 'color: var(--color-cyclamen)' : '';

    article.innerHTML = `
        <div class="note-card-inner">
            <div class="note-summary">
                <span class="tag">${note.tag}</span>
                <h2 class="note-title">${note.title}</h2>
                <div class="note-actions">
                    <button class="action-btn btn-like" style="${activeHeartColor}">
                        <i class="${heartIconClass}"></i> <span class="btn-text">${heartText}</span>
                    </button>
                    <button class="action-btn btn-save" style="${activeSaveColor}">
                        <i class="${saveIconClass}"></i> <span class="btn-text">${saveText}</span>
                    </button>
                </div>
            </div>
            <img src="${note.image}" alt="Note thumbnail" class="note-image" style="cursor:zoom-in;">
        </div>
    `;

    // Click Image/Card functionality
    const imgElement = article.querySelector('.note-image');
    const titleElement = article.querySelector('.note-title');

    const openNoteViewer = () => {
        if (!isHistory) {
            historyList.addFirst(note);
            renderHistoryGrid();
        }
        openNoteViewerModal(note);
    };

    imgElement.addEventListener('click', openNoteViewer);
    titleElement.addEventListener('click', (e) => {
        e.stopPropagation();
        openNoteViewer();
    });

    // Interaction Functionalities
    const btnLike = article.querySelector('.btn-like');
    const btnSave = article.querySelector('.btn-save');

    btnLike.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent clicking card
        note.isLiked = !note.isLiked;

        // Update Node visually
        if (note.isLiked) {
            btnLike.style.color = 'var(--color-cyclamen)';
            btnLike.querySelector('i').className = 'ph-fill ph-heart';
            btnLike.querySelector('.btn-text').innerText = 'โหวตแล้ว';
        } else {
            btnLike.style.color = 'var(--color-cadet-gray)';
            btnLike.querySelector('i').className = 'ph ph-heart';
            btnLike.querySelector('.btn-text').innerText = 'โหวต';
        }
        // Force refresh grids to sync state if needed, but manual DOM update is cleaner
        if (isHistory) renderNotesGrid(); else renderHistoryGrid(); // keep them synced
    });

    btnSave.addEventListener('click', (e) => {
        e.stopPropagation();
        note.isSaved = !note.isSaved;

        if (note.isSaved) {
            btnSave.style.color = 'var(--color-cyclamen)';
            btnSave.querySelector('i').className = 'ph-fill ph-download-simple';
            btnSave.querySelector('.btn-text').innerText = 'เซฟแล้ว';
            alert(`นำโน้ต "${note.title}" อัปโหลดเข้าสมุดเรียบร้อย!`);
        } else {
            btnSave.style.color = 'var(--color-cadet-gray)';
            btnSave.querySelector('i').className = 'ph ph-download-simple';
            btnSave.querySelector('.btn-text').innerText = 'เซฟ';
        }
        if (isHistory) renderNotesGrid(); else renderHistoryGrid(); // keep them synced
    });

    return article;
}

// ---------------------- Modal Viewers & Inputs ---------------------- //

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (query === "") {
            renderNotesGrid(); // Show all
        } else {
            // Find in BST
            const filteredNotes = notesTree.searchNotes(query);
            renderNotesGrid(filteredNotes);
        }
    });
}

function setupEditProfile() {
    const editBtn = document.getElementById("btnEditProfile");
    const modal = document.getElementById("editProfileModal");
    const closeBtn = document.getElementById("closeEditModalBtn");
    const saveBtn = document.getElementById("saveProfileBtn");

    const editPicWrapper = document.getElementById("editPicWrapper");
    const editPicFileInput = document.getElementById("editPicFileInput");
    const editPicPreview = document.getElementById("editPicPreview");

    const nameInput = document.getElementById("editNameInput");
    const bioInput = document.getElementById("editBioInput");

    const profileImage = document.getElementById("profileImage");
    const navProfileImage = document.getElementById("navProfileImage");
    const displayName = document.getElementById("profileName");

    if (!editBtn || !modal) return;

    let currentPreviewSrc = "";

    if (editPicWrapper && editPicFileInput) {
        editPicWrapper.addEventListener("click", () => {
            editPicFileInput.click();
        });

        editPicFileInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (evt) {
                    currentPreviewSrc = evt.target.result;
                    if (editPicPreview) editPicPreview.src = currentPreviewSrc;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    editBtn.addEventListener("click", () => {
        if (profileImage) {
            currentPreviewSrc = profileImage.src;
            if (editPicPreview) editPicPreview.src = currentPreviewSrc;
        }
        nameInput.value = displayName.innerText;
        bioInput.value = currentBioContent; // load full real bio text
        modal.classList.add("show");
    });

    const closeModalCallback = () => {
        modal.classList.remove("show");
        if (editPicFileInput) editPicFileInput.value = "";
    };
    closeBtn.addEventListener("click", closeModalCallback);
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModalCallback();
    });

    saveBtn.addEventListener("click", () => {
        if (nameInput.value.trim() !== "") {
            if (currentPreviewSrc && currentPreviewSrc.trim() !== "") {
                if (profileImage) profileImage.src = currentPreviewSrc;
                if (navProfileImage) navProfileImage.src = currentPreviewSrc;
            }
            displayName.innerText = nameInput.value;
            currentBioContent = bioInput.value;
            renderBio();
            closeModalCallback();
        } else {
            alert("กรุณากรอกชื่อโปรไฟล์");
        }
    });
}

let activeViewingNote = null;

function setupNoteViewerModal() {
    const viewerModal = document.getElementById("noteViewerModal");
    const closeBtn = document.getElementById("closeViewerBtn");

    // Interactions within the Viewer
    const viewerLikeBtn = document.getElementById("viewerLikeBtn");
    const viewerSaveBtn = document.getElementById("viewerSaveBtn");

    if (!viewerModal) return;

    const closeModalCallback = () => {
        viewerModal.classList.remove("show");
        // Update main screen syncs when modal closes
        renderNotesGrid();
        renderHistoryGrid();
    }

    closeBtn.addEventListener("click", closeModalCallback);
    viewerModal.addEventListener("click", (e) => {
        if (e.target === viewerModal) closeModalCallback();
    });

    // Sync Note interactions inside modal
    viewerLikeBtn.addEventListener("click", () => {
        if (!activeViewingNote) return;
        activeViewingNote.isLiked = !activeViewingNote.isLiked;
        updateViewerActionState();
    });

    viewerSaveBtn.addEventListener("click", () => {
        if (!activeViewingNote) return;
        activeViewingNote.isSaved = !activeViewingNote.isSaved;
        updateViewerActionState();
        if (activeViewingNote.isSaved) alert(`นำโน้ตเข้าไปเก็บในคอลเลกชันส่วนตัวสำเร็จ!`);
    });
}

function openNoteViewerModal(note) {
    const viewerModal = document.getElementById("noteViewerModal");
    if (!viewerModal) return;

    activeViewingNote = note;

    document.getElementById("viewerNoteTitle").innerText = note.title;
    document.getElementById("viewerNoteTag").innerText = note.tag;
    document.getElementById("viewerNoteImage").src = note.image;

    updateViewerActionState();
    viewerModal.classList.add("show");
}

function updateViewerActionState() {
    const viewerLikeBtn = document.getElementById("viewerLikeBtn");
    const viewerSaveBtn = document.getElementById("viewerSaveBtn");
    const note = activeViewingNote;

    if (note.isLiked) {
        viewerLikeBtn.classList.add('active');
        viewerLikeBtn.querySelector('i').className = 'ph-fill ph-heart';
        viewerLikeBtn.querySelector('span').innerText = 'โหวตถูกใจแล้ว';
    } else {
        viewerLikeBtn.classList.remove('active');
        viewerLikeBtn.querySelector('i').className = 'ph ph-heart';
        viewerLikeBtn.querySelector('span').innerText = 'โหวตถูกใจ';
    }

    if (note.isSaved) {
        viewerSaveBtn.classList.add('active');
        viewerSaveBtn.querySelector('i').className = 'ph-fill ph-download-simple';
        viewerSaveBtn.querySelector('span').innerText = 'เซฟเรียบร้อย';
    } else {
        viewerSaveBtn.classList.remove('active');
        viewerSaveBtn.querySelector('i').className = 'ph ph-download-simple';
        viewerSaveBtn.querySelector('span').innerText = 'เซฟเข้าสมุด';
    }
}
