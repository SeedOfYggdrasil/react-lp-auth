import { useState, useEffect, useRef } from 'react';
import '../css/Navbar.css';

const Navbar = () => {
  const [menuActive, setMenuActive] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState({});
  const navbarRef = useRef(null);

  // Toggle the mobile menu
  const toggleMenu = () => {
    setMenuActive(prev => !prev);
  };

  // Toggle dropdown menus based on a unique id
  const toggleDropdown = (id) => {
    setDropdownOpen(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setDropdownOpen({});
  };

  // Close dropdowns if clicking outside the navbar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        closeAllDropdowns();
      }
    };

    window.addEventListener('mouseup', handleClickOutside);
    return () => {
      window.removeEventListener('mouseup', handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar" ref={navbarRef}>
      <div className="container">
        <div className="navbar-header">
          <button className="navbar-toggler" onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </button>
          <a href="#">
            <h4>
              Awesome<span>logo</span>
            </h4>
          </a>
        </div>

        <div className={`navbar-menu ${menuActive ? 'active' : ''}`}>
          <ul className="navbar-nav">
            <li className="active"><a href="#">Home</a></li>

            <li className="navbar-dropdown">
              <a
                href="#"
                className="dropdown-toggler"
                onClick={(e) => {
                  e.preventDefault();
                  toggleDropdown('categories');
                }}
              >
                Categories <i className="fa fa-angle-down"></i>
              </a>
              <ul className={`dropdown ${dropdownOpen['categories'] ? 'show' : ''}`}>
                <li><a href="#">Actions</a></li>
                <li><a href="#">Something else here</a></li>
                <li className="separator"></li>
                <li><a href="#">Seprated link</a></li>
                <li className="separator"></li>
                <li><a href="#">One more seprated link.</a></li>
              </ul>
            </li>

            <li className="navbar-dropdown">
              <a
                href="#"
                className="dropdown-toggler"
                onClick={(e) => {
                  e.preventDefault();
                  toggleDropdown('blog');
                }}
              >
                Blog <i className="fa fa-angle-down"></i>
              </a>
              <ul className={`dropdown ${dropdownOpen['blog'] ? 'show' : ''}`}>
                <li><a href="#">Some category</a></li>
                <li><a href="#">Some another category</a></li>
                <li className="separator"></li>
                <li><a href="#">Seprated link</a></li>
                <li className="separator"></li>
                <li><a href="#">One more seprated link.</a></li>
              </ul>
            </li>

            <li><a href="#">About</a></li>
            <li><a href="#">Contact</a></li>
            <li><a href="#">Signin</a></li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar
