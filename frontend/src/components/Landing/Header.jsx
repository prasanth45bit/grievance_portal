import React, { useState } from "react";
import Icon from "../common/Icon";

export default function Header({ onLogin, onRegister }) {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-300 shadow-sm h-20 flex items-center">
      <div className="flex justify-between items-center w-full px-8 max-w-7xl mx-auto">
        {/* Logos */}
        <div className="flex items-center gap-6">
          <img
            alt="GoI Grievance Portal Logo"
            className="h-10 w-auto"
            src="https://lh3.googleusercontent.com/aida/AP1WRLs0O2MXUB_U1ZbXDzIyF0Pquo0pRWf3XQUJTj-gX0pYGuz9SQxBvNnx9jq5FvH46BlW-VVqwjCZKjitlH1D3M-Nppt59g0dip1xPo2q5tZZOQXNQJQwe4XJEdOvTz5j1t57ZzClV1kq8pJAFqLgVWMYXIdQLVCOQ1agjynsbuK3bAorTKEA_zczRIgmNbYg-pc4tS0elfHswCPh4XpdNaY-LZahktOdiWZIbMipwq2FWYQg-kvPhEGZmp4"
          />

          <div className="h-8 w-px bg-gray-300" />

          <img
            alt="Digital India Logo"
            className="h-8 w-auto"
            src="https://lh3.googleusercontent.com/aida/AP1WRLvtvZkuBna0i50eymX2KGCtCg9Q1NrOwB96rbxBiSu0BoV3KiEpkUKRTyaQYq9IG2PIP8E4LM-5UEpAq6kG1D4oB9nPk0pqLlOTRCKh4Xuc5J0QbhuxHZAkJfdD_Wu7lr1MtY_YIQmOoTalIeZN6jWuvSaf864s0stAeuqH3qOlNIypUxiMtjsgIv4eNJD_s1jc-pOvAgUYm2PQpoCeZ67pNDgoMx1NOlNeSgG8Feq4RB7NMgJSmdW-gHTQ"
          />
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#home"
            className="text-primary font-bold border-b-2 border-primary pb-1"
          >
            Home
          </a>
          <a href="#complaint" className="nav-link">
            File Complaint
          </a>
          <a href="#track" className="nav-link">
            Track Status
          </a>
          <a href="#about" className="nav-link">
            About
          </a>
          <a href="#contact" className="nav-link">
            Contact
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button className="icon-button">
            <Icon>language</Icon>
          </button>

          <div className="hidden sm:flex gap-3">
            <button className="login-button" onClick={onLogin}>
              Login
            </button>
            <button className="register-button" onClick={onRegister}>
              Register
            </button>
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            <Icon>{mobileMenu ? "close" : "menu"}</Icon>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenu && (
        <div className="absolute top-20 left-0 w-full bg-white border-b shadow-lg md:hidden animate-fade-in">
          <nav className="flex flex-col p-6 gap-4">
            <a
              href="#home"
              onClick={() => setMobileMenu(false)}
              className="hover:text-primary transition-colors"
            >
              Home
            </a>
            <a
              href="#complaint"
              onClick={() => {
                setMobileMenu(false);
                if (onLogin) onLogin();
              }}
              className="hover:text-primary transition-colors"
            >
              File Complaint
            </a>
            <a
              href="#track"
              onClick={() => {
                setMobileMenu(false);
                if (onLogin) onLogin();
              }}
              className="hover:text-primary transition-colors"
            >
              Track Status
            </a>
            <a
              href="#about"
              onClick={() => setMobileMenu(false)}
              className="hover:text-primary transition-colors"
            >
              About
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenu(false)}
              className="hover:text-primary transition-colors"
            >
              Contact
            </a>
            <hr className="border-gray-200" />
            <button
              className="login-button w-full text-center py-2"
              onClick={() => {
                setMobileMenu(false);
                if (onLogin) onLogin();
              }}
            >
              Login
            </button>
            <button
              className="register-button w-full text-center py-2"
              onClick={() => {
                setMobileMenu(false);
                if (onRegister) onRegister();
              }}
            >
              Register
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
