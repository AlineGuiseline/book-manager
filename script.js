// Elementos
const modal = document.querySelector(".overlay");
const openModalBtn = document.querySelector(".add-btn");
const closeModalBtn = document.querySelector(".close-btn");

const bookList = document.querySelector(".book-list");
const modalInputs = document.querySelectorAll(".input-field");
const titleInput = modalInputs[0];
const authorInput = modalInputs[1];
const imageInput = modalInputs[2];
const statusSelect = document.querySelector(".form-area select");
const commentArea = document.querySelector(".comment-area");
const addActionBtn = document.querySelector(".btn-area .add-btn");
const clearRatingBtn = document.querySelector(".clear-rating-btn");

const modalStarArea = document.querySelector(".add-modal .classification");
const starButtons = modalStarArea.querySelectorAll(".classificate-btn");

// Estado global
let books = [];
let editingId = null;
let currentRating = 0;

// Modal
function toggleModal(isEditing = false) {
  if (modal.style.display === "flex") {
    modal.style.display = "none";
    clearModal();
  } else {
    modal.style.display = "flex";
  }

  // Ajustar o título e botão
  const modalTitle = document.querySelector(".add-modal h2");

  if (isEditing) {
    modalTitle.textContent = "Editar Livro";
    addActionBtn.textContent = "Editar";
  } else {
    modalTitle.textContent = "Adicionar Livro";
    addActionBtn.textContent = "Adicionar";
  }
}

// Limpar modal após usar
function clearModal() {
  titleInput.value = "";
  authorInput.value = "";
  imageInput.value = "";
  commentArea.value = "";
  statusSelect.value = "wanna";
  currentRating = 0;
  editingId = null;
  updateStars(0);
}

// Abrir modal
openModalBtn.addEventListener("click", () => toggleModal(false));
closeModalBtn.addEventListener("click", toggleModal);

// Local Storage
function saveBooks() {
  localStorage.setItem("books", JSON.stringify(books));
}

function loadBooks() {
  const data = localStorage.getItem("books");
  books = data ? JSON.parse(data) : [];
  renderBooks();
}

// Avaliação
starButtons.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    currentRating = index + 1;
    updateStars(currentRating);
  });
});

function updateStars(amount) {
  starButtons.forEach((btn, index) => {
    const img = btn.querySelector("img");
    img.src =
      index < amount ? "./assets/star_fill.svg" : "./assets/star_empty.svg";
  });

  // Mostrar ou esconder o botão "Limpar"
  if (amount > 0) {
    clearRatingBtn.classList.remove("none");
  } else {
    clearRatingBtn.classList.add("none");
  }
}

clearRatingBtn.addEventListener("click", () => {
  currentRating = 0;
  updateStars(0);
});

// Adicionar/Editar Livro
addActionBtn.addEventListener("click", () => {
  if (!titleInput.value.trim() || !authorInput.value.trim()) {
    alert("Título e Autor são obrigatórios!");
    return;
  }

  const newBook = {
    id: editingId ?? Date.now(),
    title: titleInput.value,
    author: authorInput.value,
    image: imageInput.value || "./assets/cover.jpg",
    status: statusSelect.value,
    rating: currentRating,
    comment: commentArea.value,
  };

  if (editingId) {
    // Editar
    const index = books.findIndex((b) => b.id === editingId);
    books[index] = newBook;
  } else {
    // Adicionar
    books.push(newBook);
  }

  saveBooks();
  renderBooks();
  toggleModal();
});

// Mostrar Livros
function renderBooks() {
  bookList.innerHTML = "";

  if (books.length === 0) {
    bookList.innerHTML = `<p>Nenhum livro adicionado ainda. Comece adicionando seu primeiro livro!</p>`;
    return;
  }

  books.forEach((book) => {
    const div = document.createElement("div");
    div.classList.add("book-area");

    div.innerHTML = `
      <img src="${book.image}" alt="Capa do livro ${book.title}">
      
      <div class="book-info">
        <div class="basic-info">
          <h2 class="book-title">${book.title}</h2>
          <p class="book-author">${book.author}</p>
        </div>

        <span class="book-status ${book.status}">
          ${translateStatus(book.status)}
        </span>

        <div class="classification">
          ${renderStars(book.rating)}
        </div>

        <p class="comment">${book.comment || ""}</p>
      </div>

      <div class="book-actions">
        <button class="edit-btn">
          <img src="./assets/pencil.svg" alt="Ícone de lápis">
          Editar
        </button>

        <button class="delete-btn">
          <img src="./assets/trash.png" alt="Ícone de lixeira">
          Excluir
        </button>
      </div>
    `;

    // Editar
    div
      .querySelector(".edit-btn")
      .addEventListener("click", () => fillModalForEdit(book));

    // Deletar
    div
      .querySelector(".delete-btn")
      .addEventListener("click", () => deleteBook(book.id));

    bookList.appendChild(div);
  });

  updateCounters();
}

function renderStars(amount) {
  let html = "";
  for (let i = 1; i <= 5; i++) {
    html += `<img src="./assets/${
      i <= amount ? "star_fill" : "star_empty"
    }.svg">`;
  }
  return html;
}

function translateStatus(status) {
  return {
    wanna: "Quero ler",
    reading: "Lendo",
    read: "Lido",
  }[status];
}

// Editar Livro
function fillModalForEdit(book) {
  editingId = book.id;

  titleInput.value = book.title;
  authorInput.value = book.author;
  imageInput.value = book.image;
  commentArea.value = book.comment;
  statusSelect.value = book.status;
  currentRating = book.rating;

  updateStars(currentRating);

  toggleModal(true);
}

// Deletar
function deleteBook(id) {
  if (confirm("Tem certeza que deseja excluir este livro?")) {
    books = books.filter((b) => b.id !== id);
    saveBooks();
    renderBooks();
  }
}

// Atualizar Estatísticas
function updateCounters() {
  const total = document.querySelectorAll(".statics-item h2");

  total[0].textContent = books.length;
  total[1].textContent = books.filter((b) => b.status === "wanna").length;
  total[2].textContent = books.filter((b) => b.status === "reading").length;
  total[3].textContent = books.filter((b) => b.status === "read").length;
}

// Iniciar
loadBooks();
