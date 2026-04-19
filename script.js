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

    insert(id, tag, title, image, isLiked = false, isSaved = false) {
        const newNode = new NoteNode(id, tag, title, image);
        newNode.isLiked = isLiked;
        newNode.isSaved = isSaved;
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

// Global Bio Content Variable
let currentBioContent = "Imagine a world where you can travel through time, experience different cultures, and live countless lives—all from the comfort of your own home. Books has been a source of knowledge, entertainment, and personal growth for centuries.";

document.addEventListener("DOMContentLoaded", () => {

    // 0. Load Local Storage Data
    initData();

    // 1. Setup Bio with Read More logic
    renderBio();

    // 2. Initial Render of Notes & History
    renderNotesGrid();
    renderHistoryGrid();

    // 3. Modals and Interactions Setup
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
            saveHistoryToStorage();
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
        saveNotesToStorage();
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
        saveNotesToStorage();
    });

    return article;
}

// ---------------------- LocalStorage Functions ---------------------- //

function initData() {
    loadProfileFromStorage();
    
    // โหลดโน้ตจาก Storage ถ้าไม่มีให้ใส่เนื้อหาเริ่มต้น
    const hasNotes = loadNotesFromStorage();
    if (!hasNotes) {
        // Seed Data
        notesTree.insert(4, "#CSI104", "สรุป Calculus 1 ฉบับคนไม่มีพื้นฐาน (เต็ม 10 ไม่หัก)", "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80");
        notesTree.insert(1, "#USC10957", "เนื้อหาสถิติและความน่าจะเป็น (เนื้อหาออกสอบบ่อย)", "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=600&q=80");
        notesTree.insert(3, "#CSI104", "ไม่ใช่เจ้าของกิจการอย่าหวังจะได้ใจไป...", "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=600&q=80");
        notesTree.insert(2, "#CSI105", "ไม่มีแล้วจ้า 💔 (Data Structure แสนสาหัส)", "https://images.unsplash.com/photo-1555099962-4199c345e5dd?auto=format&fit=crop&w=600&q=80");
    }

    loadHistoryFromStorage();
}

function saveProfileToStorage() {
    const profileImage = document.getElementById("profileImage");
    const profileInfo = {
        name: document.getElementById("profileName") ? document.getElementById("profileName").innerText : "bEauty_เจ้าของสวนอ้อย",
        bio: currentBioContent,
        imageSrc: profileImage ? profileImage.src : ""
    };
    localStorage.setItem('noteDropProfile', JSON.stringify(profileInfo));
}

function loadProfileFromStorage() {
    const saved = localStorage.getItem('noteDropProfile');
    if (saved) {
        const profileInfo = JSON.parse(saved);
        currentBioContent = profileInfo.bio;
        
        const profileName = document.getElementById("profileName");
        if (profileName) profileName.innerText = profileInfo.name;
        
        const profileImage = document.getElementById("profileImage");
        if (profileImage && profileInfo.imageSrc) profileImage.src = profileInfo.imageSrc;
        
        const navProfileImage = document.getElementById("navProfileImage");
        if (navProfileImage && profileInfo.imageSrc) navProfileImage.src = profileInfo.imageSrc;
    }
}

function saveNotesToStorage() {
    const allNotes = notesTree.getSortedNotes();
    // เก็บแค่ข้อมูลและสถานะ ไม่เอาความสัมพันธ์ลูกๆของ Node ไปเพื่อเลี่ยงปัญหา JSON structure
    const notesData = allNotes.map(n => ({
        id: n.id, tag: n.tag, title: n.title, image: n.image, isLiked: n.isLiked, isSaved: n.isSaved
    }));
    localStorage.setItem('noteDropNotesTree', JSON.stringify(notesData));
}

function loadNotesFromStorage() {
    const saved = localStorage.getItem('noteDropNotesTree');
    if (saved) {
        const notesData = JSON.parse(saved);
        notesTree.root = null; // Clear tree
        notesData.forEach(d => {
            notesTree.insert(d.id, d.tag, d.title, d.image, d.isLiked, d.isSaved);
        });
        return true;
    }
    return false;
}

function saveHistoryToStorage() {
    const recentNotes = historyList.getAll();
    const historyIds = recentNotes.map(n => n.id);
    localStorage.setItem('noteDropHistory', JSON.stringify(historyIds));
}

function loadHistoryFromStorage() {
    const saved = localStorage.getItem('noteDropHistory');
    if (saved) {
        const historyIds = JSON.parse(saved);
        const allNotes = notesTree.getSortedNotes();
        // Insert ย้อนกลับเพื่อรักษาลำดับเข้าชม
        for (let i = historyIds.length - 1; i >= 0; i--) {
            const noteData = allNotes.find(n => n.id === historyIds[i]);
            if (noteData) {
                historyList.addFirst(noteData);
            }
        }
    }
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
        saveNotesToStorage();
    });

    viewerSaveBtn.addEventListener("click", () => {
        if (!activeViewingNote) return;
        activeViewingNote.isSaved = !activeViewingNote.isSaved;
        updateViewerActionState();
        saveNotesToStorage();
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
