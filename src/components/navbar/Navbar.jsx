import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import styles from "./Navbar.module.scss";
import useLoadingA from "@/components/funciones/loadingBar/useLoadingA";

import logo from "@/assets/simbols/logo.webp";
import hamburgerIcon from "@/assets/simbols/hamburger.webp";
import campusIcon from "@/assets/simbols/egresados.webp";
import searchIcon from "@/assets/simbols/searchBl.webp";
import closeIcon from "@/assets/simbols/close.webp";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(window.scrollY > 500);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(window.scrollY);
  const [isVisible, setIsVisible] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (!isSidebarVisible) {
        setIsVisible(currentScrollY < lastScrollY);
      }
      setLastScrollY(currentScrollY);
      setIsScrolled(currentScrollY > 700);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, isSidebarVisible]);

  const toggleSidebar = () => {
    if (isSidebarVisible) {
      setIsClosing(true);
      setTimeout(() => {
        setIsSidebarVisible(false);
        setIsClosing(false);
        setIsVisible(true);
      }, 500);
    } else {
      setIsSidebarVisible(true);
      setIsVisible(false);
    }
  };

  const handleLoadingClick = useLoadingA();

  const handleSidebarClick = (originalClick) => {
    return (event) => {
      handleLoadingClick(event);
      originalClick(event);
    };
  };

  // Mostrar la barra de búsqueda al hacer clic en el ícono de búsqueda
  const toggleSearchBar = () => {
    setIsSearchVisible(!isSearchVisible);
  };

  // Manejar la búsqueda cuando se presiona el ícono o Enter
  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/Search?q=${searchQuery}`);
    }
  };

  // Manejar la tecla Enter en el input
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div
      className={`${styles.container} bl ${
        isVisible ? styles.visible : styles.hidden
      }`}
    >
      <nav
        className={`${styles.navBar} ${isScrolled ? styles.scrolled : ""} ${
          isVisible ? styles.visible : styles.hidden
        }`}
      >
        <Link to="/" onClick={handleLoadingClick} className={styles.logo}>
          <img src={logo} alt="Logo" />
          <span>I.S.E.F. San Luís</span>
        </Link>

        <div className={styles.menuBar}>
          {/* <div className={styles.searchCont} >
                        <div className={styles.searchIcon} onClick={toggleSearchBar}>
                            <img src={searchIcon} alt="Buscar"  />
                            <h3>Buscar</h3>
                        </div>

                        <div className={`${styles.searchBar} ${isSearchVisible ? styles.visible : ''}`}>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Buscar en la página del I.S.E.F."
                            />
                            <div className={styles.searchMenu}>
                                <div className={styles.searchMenuIcon} >
                                    <img src={searchIcon} alt="Cerrar" onClick={handleSearch} />
                                </div>
                                <div className={styles.closeSearchIcon} >
                                    <img src={closeIcon} alt="Cerrar" onClick={toggleSearchBar} />
                                </div>
                            </div>
                        </div>

                    </div> */}
          <a
            className={styles.menuIcon}
            href="https://campus.isefsanluis.net/"
            onClick={handleSidebarClick()}
          >
            <img src={campusIcon} alt="" />
            <h4>Campus</h4>
          </a>

          <div className={styles.menuIcon} onClick={toggleSidebar}>
            <img src={hamburgerIcon} alt="" />
            <h4>Menú</h4>
          </div>
        </div>
      </nav>

      {isSidebarVisible && (
        <ul
          className={`${styles.sideBar} ${
            isClosing ? styles.close : styles.open
          }`}
        >
          <div className={styles.closeSidebar} onClick={toggleSidebar}>
            <img src={closeIcon} alt="" />
          </div>
          <li className={styles.navLink}>
            <Link to="/Carrera" onClick={handleSidebarClick(toggleSidebar)}>
              La carrera
            </Link>
          </li>
          <li className={styles.navLink}>
            <Link
              to="/Especializaciones"
              onClick={handleSidebarClick(toggleSidebar)}
            >
              Especializaciones
            </Link>
          </li>
          {/* <li className={styles.navLink}>
            <Link
              to="/Noticias"
              onClick={handleSidebarClick(toggleSidebar)}
            >
              Noticias
            </Link>
          </li> */}
          <li className={styles.navLink}>
            <Link to="/Aranceles" onClick={handleSidebarClick(toggleSidebar)}>
              Aranceles
            </Link>
          </li>
          <li className={styles.navLink}>
            <Link
              to="/Institucional/Contacto"
              onClick={handleSidebarClick(toggleSidebar)}
            >
              Contacto
            </Link>
          </li>
          {/* <li className={styles.navLink}><Link to='/Institucional/Historia' onClick={handleSidebarClick(toggleSidebar)}>Nuestra historia</Link></li> */}
          <li className={styles.navLink}>
            <Link to="/" onClick={handleSidebarClick(toggleSidebar)}>
              Inicio
            </Link>
          </li>
        </ul>
      )}
    </div>
  );
};

export default Navbar;
