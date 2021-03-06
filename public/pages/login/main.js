import { login, signGoogle } from './data.js';

export const appStart = () => {
  const menuLogin = document.createElement('div');

  menuLogin.className = ('login-wrapper');

  menuLogin.innerHTML = `
    <figure class='logo'> 
      <img src='./images/wecanlogo.png' alt='logo'>
    </figure>
    <div class='sign-box'> 
      <div class='welcome'>Bem vinda Dev!</div>
      <div>
       <input class='sign-login' type='email' name='email' id='email' placeholder='Email' required></input>
      </div>
      <div>
        <input class='sign-login' type='password' name='password' id='password' placeholder='Senha' required></input>
      </div>
      <div class='message-error' id='message-error'></div>
      <div class='btn-box'>
        <button class='btn-login' type='submit' name='btn-login' id='btn-login'>Entrar</button>
      </div>
      <div class='sign-google'>Ou entre com:</div>
      <div class='icon-google'>
        <input type=image src='./images/logo-google.png' id='input-google'></input>
      </div>
      <div class='create-account'>Quer entrar para a rede?<a href='/#register'>Cadastre-se</a></div>
    </div>
    `;

  const btnLogin = menuLogin.querySelector('#btn-login');
  const loginGoogle = menuLogin.querySelector('#input-google');

  btnLogin.addEventListener('click', () => {
    const email = menuLogin.querySelector('#email').value;
    const password = menuLogin.querySelector('#password').value;
    const loginAuth = login.signIn(email, password);
    loginAuth
      .then(() => {
        window.location.href = '#home';
      })
      .catch((error) => {
        let errorMessage = error.message;
        if (error.code === 'auth/wrong-password') {
          errorMessage = 'Credenciais inválidas';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'Formato do email inválido';
        }
        const errorElement = menuLogin.querySelector('#message-error');
        errorElement.innerHTML = errorMessage;
      });
  });

  loginGoogle.addEventListener('click', () => {
    signGoogle()
      .then((result) => {
        const user = {
          firstName: result.additionalUserInfo.profile.given_name,
          lastName: result.additionalUserInfo.profile.family_name,
          email: result.user.email,
        };
        firebase
          .firestore()
          .collection('users')
          .add(user);
        window.location.href = '#home';
      })
      .catch((error) => {
        let errorMessage = error.message;
        if (error.code === 'auth/account-exists-with-different-credential') {
          errorMessage = 'Você já se inscreveu com um provedor de autenticação diferente para esse email.';
        } else if (error.code === 'auth/popup-closed-by-user') {
          errorMessage = 'A janela foi fechada antes de finalizar a operação. Tente novamente.';
        } else if (error.code === 'auth/cancelled-popup-request') {
          errorMessage = 'A operação foi cancelada';
        } else {
          errorMessage = (error);
        }
        const errorElement = menuLogin.querySelector('#message-error');
        errorElement.innerHTML = errorMessage;
      });
  });

  return menuLogin;
};
