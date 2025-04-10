import { useState, useRef } from "react";
import "../css/AltEditor.css";

const fonts = {
  Poppins: "Poppins",
  Roboto: "Roboto",
  "Open Sans": "Open+Sans",
  "Noto Sans Japanese": "Noto+Sans+Japanese",
  Montserrat: "Montserrat",
  Lato: "Lato",
  Inter: "Inter",
  "Roboto Condensed": "Roboto+Condensed",
  "Roboto Mono": "Roboto+Mono",
  Oswald: "Oswald",
  Raleway: "Raleway",
  "Nunito Sans": "Nunito+Sans",
  Nunito: "Nunito",
  Ubuntu: "Ubuntu",
  Rubik: "Rubik",
  "Playfair Display": "Playfair+Display",
  Merriweather: "Merriweather",
  "Noto Sans Korean": "Noto+Sans+Korean",
  "Roboto Slab": "Roboto+Slab",
  "PT Sans": "PT+Sans",
  Kanit: "Kanit",
  "Work Sans": "Work+Sans",
  Mulish: "Mulish",
  Lora: "Lora",
  "DM Sans": "DM+Sans",
  "Noto Sans Traditional Chinese": "Noto+Sans+Traditional+Chinese",
  "Fira Sans": "Fira+Sans",
  Quicksand: "Quicksand",
  Barlow: "Barlow",
  Inconsolata: "Inconsolata",
  Manrope: "Manrope",
  "Hind Siliguri": "Hind+Siliguri",
  Heebo: "Heebo",
  "Titillium Web": "Titillium+Web",
  "IBM Plex Sans": "IBM+Plex+Sans",
  "PT Serif": "PT+Serif",
  "Noto Serif": "Noto+Serif",
  Karla: "Karla",
  "Bebas Neue": "Bebas+Neue",
  "Nanum Gothic": "Nanum+Gothic",
  "Schibsted Grotesk": "Schibsted+Grotesk",
  "Libre Franklin": "Libre+Franklin",
  Outfit: "Outfit",
  "Noto Color Emoji": "Noto+Color+Emoji",
  "Josefin Sans": "Josefin+Sans",
  Jost: "Jost",
  "Libre Baskerville": "Libre+Baskerville",
  "Source Sans 3": "Source+Sans+3",
  Mukta: "Mukta",
};

const fontWeights = [
  { value: "100", label: "Thin" },
  { value: "200", label: "Extra Light" },
  { value: "300", label: "Light" },
  { value: "400", label: "Regular" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semi Bold" },
  { value: "700", label: "Bold" },
  { value: "800", label: "Extra Bold" },
  { value: "900", label: "Black" },
];

const fontSizes = [
  "8px","10px","12px","14px","16px","18px","20px","24px","28px","32px",
  "36px","40px","48px","56px","64px","72px","80px","96px"
];

const initialStyles = {
  h1: {
    fontFamily: '"Poppins", sans-serif',
    fontSize: "48px",
    fontWeight: "600",
    color: "#ffffff",
    fontStyle: "normal",
    textAlign: "left",
  },
  h2: {
    fontFamily: '"Poppins", sans-serif',
    fontSize: "32px",
    fontWeight: "600",
    color: "#ffffff",
    textAlign: "left",
  },
  p: {
    fontFamily: '"Poppins", sans-serif',
    fontSize: "18px",
    fontWeight: "400",
    color: "#ffffff",
    textAlign: "left",
  },
};

const Editor = () => {
  const [elementStyles, setElementStyles] = useState(initialStyles);
  const [activeElement, setActiveElement] = useState("h1");

  // Refs to keep track of loaded fonts and their URLs
  const loadedFontsRef = useRef(new Set());
  const googleFontLinksRef = useRef(new Set());

  const updateStyle = (property, value) => {
    setElementStyles((prevStyles) => {
      const newStyles = { ...prevStyles };
      newStyles[activeElement] = { ...newStyles[activeElement], [property]: value };
      return newStyles;
    });
  };

  const handleFontChange = (e) => {
    const font = e.target.value;
    const fontUrl = `https://fonts.googleapis.com/css2?family=${fonts[font]}:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900&display=swap`;
    if (!loadedFontsRef.current.has(font)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = fontUrl;
      link.className = "dynamic-font";
      document.head.appendChild(link);
      loadedFontsRef.current.add(font);
      googleFontLinksRef.current.add(fontUrl);
    }
    updateStyle("fontFamily", `"${font}", sans-serif`);
  };

  const handleFontWeightChange = (e) => {
    updateStyle("fontWeight", e.target.value);
  };

  const handleFontSizeChange = (e) => {
    updateStyle("fontSize", e.target.value);
  };

  const handleTextColorChange = (e) => {
    updateStyle("color", e.target.value);
  };

  const toggleItalic = () => {
    setElementStyles((prevStyles) => {
      const current = prevStyles[activeElement].fontStyle;
      const newStyle = current === "italic" ? "normal" : "italic";
      return {
        ...prevStyles,
        [activeElement]: { ...prevStyles[activeElement], fontStyle: newStyle },
      };
    });
  };

  // Handlers for alignment buttons
  const handleAlignment = (alignment) => {
    updateStyle("textAlign", alignment);
  };

  // Helper to determine if a button is active for the current active element
  const isActive = (property, value) =>
    elementStyles[activeElement][property] === value ? "active" : "";

  return (
    <div id="main" className="edutir-wrappper">
      <div className="form-group">
        <div className="toolbar d-flex align-items-center">
          <div className="font-switcher">
            <select
              id="fontSelector"
              className="form-select"
              value={
                // Remove quotes from fontFamily for select value matching
                elementStyles[activeElement].fontFamily.replace(/"/g, "").split(",")[0]
              }
              onChange={handleFontChange}
            >
              {Object.keys(fonts).map((fontName) => (
                <option key={fontName} value={fontName}>
                  {fontName}
                </option>
              ))}
            </select>
          </div>
          <select
            id="fontWeight"
            className="form-select"
            value={elementStyles[activeElement].fontWeight}
            onChange={handleFontWeightChange}
          >
            {fontWeights.map((fw) => (
              <option key={fw.value} value={fw.value}>
                {fw.label}
              </option>
            ))}
          </select>
          <select
            id="fontSize"
            className="form-select"
            value={elementStyles[activeElement].fontSize}
            onChange={handleFontSizeChange}
          >
            {fontSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <div>
            <div id="textFormat">
              <input
                type="color"
                id="textColor"
                className="form-control"
                title="Text Color"
                value={elementStyles[activeElement].color}
                onChange={handleTextColorChange}
              />
              <button
                id="styleItalic"
                className={`btn ${isActive("fontStyle", "italic")}`}
                title="Italic"
                onClick={toggleItalic}
              >
                <span className="material-symbols-rounded">format_italic</span>
              </button>
              <button
                id="alignLeft"
                className={`btn ${isActive("textAlign", "left")}`}
                title="Align Left"
                onClick={() => handleAlignment("left")}
              >
                <span className="material-symbols-rounded">format_align_left</span>
              </button>
              <button
                id="alignCenter"
                className={`btn ${isActive("textAlign", "center")}`}
                title="Align Center"
                onClick={() => handleAlignment("center")}
              >
                <span className="material-symbols-rounded">format_align_center</span>
              </button>
              <button
                id="alignRight"
                className={`btn ${isActive("textAlign", "right")}`}
                title="Align Right"
                onClick={() => handleAlignment("right")}
              >
                <span className="material-symbols-rounded">format_align_right</span>
              </button>
              <button
                id="alignJustify"
                className={`btn ${isActive("textAlign", "justify")}`}
                title="Justify"
                onClick={() => handleAlignment("justify")}
              >
                <span className="material-symbols-rounded">format_align_justify</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="text-area">
        <h1
          id="editableHeading"
          contentEditable
          suppressContentEditableWarning
          onClick={() => setActiveElement("h1")}
          style={elementStyles.h1}
        >
        </h1>
        <h2
          contentEditable
          suppressContentEditableWarning
          onClick={() => setActiveElement("h2")}
          style={elementStyles.h2}
        >
        </h2>
        <p
          contentEditable
          suppressContentEditableWarning
          onClick={() => setActiveElement("p")}
          style={elementStyles.p}
        >
          <br />
          <br />

        </p>
      </div>
    </div>
  );
}

export default Editor;
