const bookForm = document.getElementById('book-form');
const bookList = document.getElementById('book-list');
const bookCountEl = document.getElementById('book-count');
const emptyStateEl = document.getElementById('empty-state');
const toastEl = document.getElementById('toast');
const searchInput = document.getElementById('search');
const emptyTitleEl = document.getElementById('empty-title');
const emptyMsgEl = document.getElementById('empty-message');

document.addEventListener('DOMContentLoaded', () => {
    // Only load list on pages that have book-list
    if (bookList) {
        loadBooks();
        updateUIState();
    }
    if (searchInput) {
        searchInput.addEventListener('input', handleSearchInput);
    }
});

// Add book
bookForm.addEventListener('submit', function(e){
    e.preventDefault();

    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const pdf = document.getElementById('pdf').files[0];

    if(!pdf) return alert("Please select the book PDF!");

    const readerPDF = new FileReader();
    readerPDF.readAsDataURL(pdf);

    readerPDF.onload = () => {
        const book = {
            title,
            author,
            pdf: readerPDF.result
        };
        addBookToList(book);
        saveBookToLocalStorage(book);
        bookForm.reset();
        if (typeof updateUIState === 'function') updateUIState();
        showToast('Book added to your library');
        setTimeout(() => { window.location.href = 'my-library.html'; }, 600);
    }
});

// Add book card
function addBookToList(book){
    if (!bookList) return; // safely no-op when list isn't on this page
    const card = document.createElement('div');
    card.classList.add('book-card');
    card.innerHTML = `
        <h3>${book.title}</h3>
        <p>${book.author}</p>
        <a href="${book.pdf}" download="${book.title}.pdf">Download PDF</a>
        <button class="delete-btn">Delete</button>
    `;
    bookList.appendChild(card);

    card.querySelector('.delete-btn').addEventListener('click', () => {
        card.remove();
        removeBookFromLocalStorage(book.title);
        updateUIState();
        showToast('Book removed');
    });
}

// LocalStorage functions
function saveBookToLocalStorage(book){
    let books = JSON.parse(localStorage.getItem('books')) || [];
    books.push(book);
    localStorage.setItem('books', JSON.stringify(books));
}

function loadBooks(){
    let books = JSON.parse(localStorage.getItem('books')) || [];
    books.forEach(addBookToList);
}

function removeBookFromLocalStorage(title){
    let books = JSON.parse(localStorage.getItem('books')) || [];
    books = books.filter(b => b.title !== title);
    localStorage.setItem('books', JSON.stringify(books));
}

function updateUIState(){
    const books = JSON.parse(localStorage.getItem('books')) || [];
    const count = books.length;
    if (bookCountEl) bookCountEl.textContent = count;
    const isEmpty = count === 0;
    if (emptyStateEl) emptyStateEl.hidden = !isEmpty;
}

function showToast(message){
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
        toastEl.classList.remove('show');
    }, 1800);
}

function handleSearchInput(){
    const query = searchInput.value.trim().toLowerCase();
    const cards = Array.from(bookList.querySelectorAll('.book-card'));

    let visibleCount = 0;
    cards.forEach(card => {
        const title = card.querySelector('h3')?.textContent?.toLowerCase() || '';
        const author = card.querySelector('p')?.textContent?.toLowerCase() || '';
        const matches = title.includes(query) || author.includes(query);
        card.style.display = matches ? '' : 'none';
        if (matches) visibleCount++;
    });

    const totalBooks = JSON.parse(localStorage.getItem('books'))?.length || 0;
    if (emptyStateEl) {
        const noItemsOnPage = visibleCount === 0;
        emptyStateEl.hidden = !(noItemsOnPage);
        if (noItemsOnPage) {
            if (totalBooks === 0) {
                if (emptyTitleEl) emptyTitleEl.textContent = 'No books yet';
                if (emptyMsgEl) emptyMsgEl.textContent = 'Add your first title by uploading a PDF. The cover image is optional.';
            } else {
                if (emptyTitleEl) emptyTitleEl.textContent = 'No matches found';
                if (emptyMsgEl) emptyMsgEl.textContent = 'Try a different search by title or author.';
            }
        } else {
            if (emptyTitleEl) emptyTitleEl.textContent = 'No books yet';
            if (emptyMsgEl) emptyMsgEl.textContent = 'Add your first title by uploading a PDF. The cover image is optional.';
        }
    }
}
