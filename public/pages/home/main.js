import {
  loggedUser,
  createPost,
  signOut,
  deletePost,
  updatePost,
  updateLike,
  updateComments,
} from './data.js';

export const home = () => {
  const container = document.createElement('div');

  container.className = ('feed-wrapper');

  container.innerHTML = `
  <div id='top-menu-home-wrapper' class='top-menu-wrapper'>
      <div id='top-menu-home-icon' class='top-menu-icon' >
        <a href='javascript:void(0);' id='menu-icon-home' class='icon' >
          <i class='fa fa-bars'></i>
        </a>
      </div>
      <div class='logo-texto'>
      <img class='logo-texto-img' src='./images/logotexto.png'>
      </div>
      <div id='navigation-wrapper-home' class='navigation-wrapper disable-display'>
        <div class='close-icon-wrapper'>
          <a href='javascript:void(0);' class='icon-x' id='close-menu-icon-home' class='close-menu-icon'>
            <i class='fa fa-times'></i>
          </a>
        </div>
        <nav class='top-menu'>
          <li>
            <div id='btn-profile' class='menu-hamburger-btn-style'>Perfil</div>
          </li>
          <li>
            <div id='sign-out' class='menu-hamburger-btn-style'>Sair</div>
          </li>
        </nav>
      </div>
      </div>
    </div>
    <div class='big-box'>
    <div class='left-side'>
      <div id='profile-box' class='profile-box'>
        <div class='profile-img'>
          <img src='./images/code-girls.png'>
        </div>
        <div class= 'user-informations'>
          <div id='name-information' class='name-information'></div>
        </div>
     </div>
    </div>
    <div class='right-side'>
      <div class='post-box'>
        <form id='post-send-form'>
          <textarea id='post' class='post-text' placeholder='Compartilhe aqui o seu conhecimento' type='text' required></textarea>
          <div class='all-buttons'>
            <div class='privacy-wrapper' id='privacy-options'>
              <div class='public-option icon-style'>
                <i class='fa fa-lock' ></i>
                <input type='radio' name='privacy' id='private-option' class='privacy-options' value="private">
              </div>
              <div class='private-option  icon-style'>
                <i class='fa fa-globe'></i>
                <input type='radio' name='privacy' id='public-option' class='privacy-options' checked="true" value="public">
              </div>
            </div>
            <button id='send-btn' class='btn-style'>Publicar</button>
          </div>
        </form>
      </div>
      <div id='all-posts'></div>
      </div>
    </div>
    </div>
    `;

  const newPost = (post) => {
    const postElement = document.createElement('div');

    const date = new Date(post.time.seconds * 1000);

    // imprimir simbolo no post
    let privacySymbol = '';
    if (post.public) {
      privacySymbol = "<i class='fa fa-globe icon-style' ></i>";
    } else {
      privacySymbol = "<i class='fa fa-lock icon-style' ></i>";
    }


    let deleteButton = '';
    let editButton = '';
    let privacyOptionButton = '';

    const user = firebase.auth().currentUser;
    if (post.userUid === user.uid) {
      deleteButton = `<button id='close-posted-box' class='close-box' data-id='${post.id}'> <i class="fa fa-times"></i> </button>`;
      editButton = `
       <button class='btn-edit-post icon-style'>
         <i class='fa fa-pencil'></i>
       </button>
      `;
      privacyOptionButton = `<form class='privacy-wrapper' id='privacy-options'>
      <div class='public-option  icon-style'>
        <i class='fa fa-lock' ></i>
        <input type='radio' name='privacy' id='private-option' class='privacy-options' value="private">
      </div>
        <div class='private-option icon-style'>
          <i class='fa fa-globe'></i>
          <input type='radio' name='privacy' id='public-option' class='privacy-options' checked="true" value="public">
        </div>
    </form>`;
    }

    postElement.innerHTML = `
        <div class='posted-box' >
          <div class='posted-elements'>
            <div class='published-by'>
              ${privacySymbol}
              <div class='by-line'>&nbsp${post.user} em ${date.toLocaleString('pt-BR')} </div>
              ${deleteButton}
            </div>
            <div class='posted-content'>
              <div class='posted-text' id='all-posts'>${post.text}</div>
              <div class='posted-text posted-text-editor display-none'>
                <input type='text' value='${post.text}' />
              </div>
              <div class='posted-text-edit-button'>
                ${editButton}
              </div>
            </div>
            ${privacyOptionButton}
                <div class='interaction-space'>
                  <div class='btn-space'>
                    <div class='like-space'>
                      <div class='like-number'>${post.likes}</div>
                      <a id='like-btn' class='like-btn' >
                        <i class="fa fa-heart"></i> </a>
                    </div>
                    <button id='comment-btn' class='btn-style btn-comment'> Comentar </button>
                  </div>
                </div>
              </div>
              <div class='space-comment'>${post.comments.map(comment => commentPosted(comment)).join('')}</div>
            </div>
  `;
    return postElement;
  };


  // Send post elements
  const postSendForm = container.querySelector('#post-send-form');
  const postText = postSendForm.querySelector('#post');
  const postPublic = postSendForm.querySelector('#public-option');
  const sendPostBtn = postSendForm.querySelector('#send-btn');

  // Post list elements
  const allPosts = container.querySelector('#all-posts');

  // User management elements
  const btnSignOut = container.querySelector('#sign-out');
  const btnProfile = container.querySelector('#btn-profile');

  function profile(name) {
    container.querySelector('#name-information').innerHTML = `${name}`;
  }

  loggedUser(profile);

  const isPostAllowed = (post) => {
    const currentUser = firebase.auth().currentUser;
    if (!currentUser) {
      return false;
    }
    // Se a usuária atual é a autora do post, ela é pode ver
    // Não é preciso conferir se é privado ou não
    if (post.userUid === currentUser.uid) {
      return true;
    }
    // Se a usuária atual não é a autora, a propriedade 'public' pode ser vista.
    return post.public;
  };

  const editTextPost = (post, postElement) => {
    const postedElem = postElement.querySelector('.posted-text');
    const editElement = postElement.querySelector('.posted-text-editor');
    const iconElem = postElement.querySelector('.btn-edit-post > i');
    const newText = editElement.querySelector('input').value;

    if (iconElem.classList.contains('fa-check')) {
      const formPrivacy = postElement.querySelector('#privacy-options');
      console.log(formPrivacy.privacy.value);
      updatePost(post.id, newText, formPrivacy.privacy.value).then(() => {
        createPost.readPosts(postTemplate);
      });
    } else {
      // Toggle classes para esconder ou mostrar a interface de editar
      postedElem.classList.toggle('display-none');
      editElement.classList.toggle('display-none');
      iconElem.classList.toggle('fa-pencil');
      iconElem.classList.toggle('fa-check');
    }
  };


  const postTemplate = (array) => {
    allPosts.innerHTML = '';
    // console.log(array);
    array.forEach((posts) => {
      if (!isPostAllowed(posts)) { // Se não se aplica aos casos de isPostAllowed, return para interromper.
        return;
      }
      const postElements = newPost(posts);

      const btnDelete = postElements.querySelector('.close-box');
      if (btnDelete) {
        btnDelete.addEventListener('click', () => {
          deletePost(posts.id);
          postElements.innerHTML = '';
        });
      }
      const btnEdit = postElements.querySelector('.btn-edit-post');
      if (btnEdit) {
        btnEdit.addEventListener('click', () => {
          editTextPost(posts, postElements);
        });
      }


      // if (formPrivacy) {

      /* formPrivacy.addEventListener('change', (event) => {
        console.log(event.target.value);
        //  editPrivacyPost
      }); */
      // }


      const btnLike = postElements.querySelector('.like-btn');
      btnLike.addEventListener('click', (event) => {
        event.preventDefault();
        updateLike(posts.id).then(() => {
          createPost.readPosts(postTemplate);
        });
      });
      const btnComment = postElements.querySelector('.btn-comment');
      btnComment.addEventListener('click', (event) => {
        event.preventDefault();
        const spaceComment = postElements.querySelector('.space-comment');
        const commentElements = newComment(posts.id);
        spaceComment.appendChild(commentElements);
      });
      allPosts.appendChild(postElements);
    });
  };

  createPost.readPosts(postTemplate);
  // CommentsCollection.readComments();

  const commentPosted = (text) => {
    // const templateCommentPosted = document.createElement('div');
    const templateCommentPosted = `
      <div class='commented-wrapper'>
        <div class='space-commented'>${text}</div>
      </div>      
    `;
    return templateCommentPosted;
  };

  const newComment = (id) => {
    const templateComment = document.createElement('div');
    templateComment.innerHTML = `
      <div class='space-wrapper'>
              <textarea id='write-space-comment' class='write-space-comment' type='text' required cols='25' placeholder='comente aqui'></textarea>
              <div class='comment-btn-space'>
                <button class='btn-save-comment'><i class='fa fa-paper-plane-o'></i></button>
              </div>
              <div class='comment-posted'></div>
            </div>
    `;
    const btnSaveComment = templateComment.querySelector('.btn-save-comment');

    btnSaveComment.addEventListener('click', () => {
      const subComment = templateComment.querySelector('.write-space-comment').value;
      updateComments(id, subComment).then(() => {
        createPost.readPosts(postTemplate);
      });
    });

    return templateComment;
  };

  sendPostBtn.addEventListener('click', (event) => {
    event.preventDefault();
    let isPublic = false;
    if (postPublic.checked) {
      isPublic = true;
    }
    const returnPosts = createPost.insertPosts(postText.value, isPublic);
    returnPosts
      .then(() => {
        createPost.readPosts(postTemplate);
      }).catch(error => error);

    document.getElementById('post').value = '';
  });

  btnSignOut.addEventListener('click', (event) => {
    event.preventDefault();
    signOut();
  });

  btnProfile.addEventListener('click', () => {
    window.location.href = '#profile';
  });

  /* -----------MENU HAMBURGER------------- */
  const navigationWrapperHome = container.querySelector('#navigation-wrapper-home');
  const homeHamburgerIcon = container.querySelector('#top-menu-home-icon');

  function toggleMenu() {
    navigationWrapperHome.classList.toggle('disable-display');
    homeHamburgerIcon.classList.toggle('hide-visibility');
  }

  container.querySelector('#menu-icon-home').addEventListener('click', toggleMenu);
  container.querySelector('#close-menu-icon-home').addEventListener('click', toggleMenu);
  /* -------------FIM MENU HAMBURGER----------- */

  return container;
};
