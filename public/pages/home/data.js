export const loggedUser = (profile) => {
  firebase
    .auth()
    .onAuthStateChanged(() => {
      profile(firebase.auth().currentUser.displayName,
        firebase.auth().currentUser.photoURL);
    });
};

export const createPost = {
  insertPosts(text) {
    return firebase
      .firestore()
      .collection('post')
      .add({
        text,
        likes: 0,
        userUid: firebase.auth().currentUser.uid,
        user: firebase.auth().currentUser.displayName,
        time: firebase.firestore.FieldValue.serverTimestamp(),
      });
  },
  readPosts(callback) {
    return firebase
      .firestore()
      .collection('post')
      .orderBy('time', 'desc')
      .get()
      .then((querySnapshot) => {
        const posts = [];
        querySnapshot.forEach((doc) => {
          // console.log(doc.data());
          posts.push({...doc.data(), id: doc.id });
        });
        callback(posts);
      });
  },
};

/* início da inclusão de collection p/likes, falta chamar no main.js

export const likeCollection = {
  insertLike(user) {
    return firebase
      .firestore()
      .collection('likes')
      .add({
        userUid: firebase.auth().currentUser.uid,
        user: firebase.auth().currentUser.displayName,
      });
  },
  readLike(callback) {
    return firebase
      .firestore()
      .collection('likes')
      .get()
      .then((querySnapshot) => {
        const likes = [];
        querySnapshot.forEach((doc) => {
          // console.log(doc.data());
          likes.push({...doc.data(), id: doc.id });
        });
        callback(likes);
      });
  },
}; */

export const signOut = () => {
  if (firebase.auth().currentUser) {
    firebase.auth().signOut()
      .then(() => {
        window.location.href = '#login';
      });
  }
};

export const deletePost = (post) => {
  firebase.firestore().collection('post').doc(post).delete()
    .then(() => {
      console.log('document sucessfully deleted');
    });
  // .catch(function (error) {
  //  console.log('error removing document:', error);
  // });
};

export const updateLike = (post) => {
  const db = firebase.firestore();
  const increment = firebase.firestore.FieldValue.increment(1);
  const storyRef = db.collection('post').doc(post);
  storyRef.update({
    likes: increment,
  });
};
