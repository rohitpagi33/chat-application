import React from "react";
import "../assets/css/NotFound.css";

const NotFound = () => {
  return (
    <div className="notfound">
      <img
        src="https://github.com/bedimcode/animated-login-form/blob/main/assets/img/login-bg.png?raw=true"
        alt="Background"
        className="notfound__img"
      />

      <div className="notfound__content">
        <h1 className="notfound__title">404</h1>
        <p className="notfound__message">Oops! Page Not Found</p>
        <a href="/" className="notfound__button">
          Go Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
