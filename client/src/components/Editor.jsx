import { useState, useRef, forwardRef, useImperativeHandle, useEffect } from "react";
import "../css/Editor.css"; // Renamed CSS import

const fonts = {
  Poppins: "Poppins", Roboto: "Roboto", "Open Sans": "Open+Sans", "Noto Sans Japanese": "Noto+Sans+Japanese",
  Montserrat: "Montserrat", Lato: "Lato", Inter: "Inter", "Roboto Condensed": "Roboto+Condensed",
  "Roboto Mono": "Roboto+Mono", Oswald: "Oswald", Raleway: "Raleway", "Nunito Sans": "Nunito+Sans",
  Nunito: "Nunito", Ubuntu: "Ubuntu", Rubik: "Rubik", "Playfair Display": "Playfair+Display",
  Merriweather: "Merriweather", "Noto Sans Korean": "Noto+Sans+Korean", "Roboto Slab": "Roboto+Slab",
  "PT Sans": "PT+Sans", Kanit: "Kanit", "Work Sans": "Work+Sans", Mulish: "Mulish", Lora: "Lora",
  "DM Sans": "DM+Sans", "Noto Sans Traditional Chinese": "Noto+Sans+Traditional+Chinese",
  "Fira Sans": "Fira+Sans", Quicksand: "Quicksand", Barlow: "Barlow", Inconsolata: "Inconsolata",
  Manrope: "Manrope", "Hind Siliguri": "Hind+Siliguri", Heebo: "Heebo", "Titillium Web": "Titillium+Web",
  "IBM Plex Sans": "IBM+Plex+Sans", "PT Serif": "PT+Serif", "Noto Serif": "Noto+Serif", Karla: "Karla",
  "Bebas Neue": "Bebas+Neue", "Nanum Gothic": "Nanum+Gothic", "Schibsted Grotesk": "Schibsted+Grotesk",
  "Libre Franklin": "Libre+Franklin", Outfit: "Outfit", "Noto Color Emoji": "Noto+Color+Emoji",
  "Josefin Sans": "Josefin+Sans", Jost: "Jost", "Libre Baskerville": "Libre+Baskerville",
  "Source Sans 3": "Source+Sans+3", Mukta: "Mukta",
};

const fontWeights = [
  { value: "100", label: "Thin" }, { value: "200", label: "Extra Light" }, { value: "300", label: "Light" },
  { value: "400", label: "Regular" }, { value: "500", label: "Medium" }, { value: "600", label: "Semi Bold" },
  { value: "700", label: "Bold" }, { value: "800", label: "Extra Bold" }, { value: "900", label: "Black" },
];

const fontSizes = [
  "8px","10px","12px","14px","16px","18px","20px","24px","28px","32px", "36px","40px",
  "48px","56px","64px","72px","80px","96px"
];

const initialContent = {
  h1Html: "Untitled Document",
  h2Html: "Subtitle",
  pHtml: "Start typing your notes here...",
};

const initialStyles = {
  h1: { fontFamily: '"Poppins", sans-serif', fontSize: "48px", fontWeight: "600", color: "#ffffff", fontStyle: "normal", textAlign: "left" },
  h2: { fontFamily: '"Poppins", sans-serif', fontSize: "32px", fontWeight: "600", color: "#ffffff", fontStyle: "normal", textAlign: "left" },
  p: { fontFamily: '"Poppins", sans-serif', fontSize: "18px", fontWeight: "400", color: "#ffffff", fontStyle: "normal", textAlign: "left" },
};

const Editor = forwardRef((props, ref) => {
  const [elementStyles, setElementStyles] = useState(JSON.parse(JSON.stringify(initialStyles))); // Deep copy
  const [activeElement, setActiveElement] = useState("h1");
  const [content, setContent] = useState(JSON.parse(JSON.stringify(initialContent)));

  const loadedFontsRef = useRef(new Set());
  const h1Ref = useRef(null);
  const h2Ref = useRef(null);
  const pRef = useRef(null);

  const ensureFontLoaded = (fontFamilyValue) => {
    const fontName = fontFamilyValue.replace(/"/g, "").split(",")[0].trim();
    if (fonts[fontName] && !loadedFontsRef.current.has(fontName)) {
      const fontQueryParam = fonts[fontName].replace(/\s/g, '+');
      const fontUrl = `https://fonts.googleapis.com/css2?family=${fontQueryParam}:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap`;
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = fontUrl;
      link.className = "dynamic-font";
      document.head.appendChild(link);
      loadedFontsRef.current.add(fontName);
    }
  };
  
  useEffect(() => {
    if (h1Ref.current) h1Ref.current.innerHTML = content.h1Html;
    if (h2Ref.current) h2Ref.current.innerHTML = content.h2Html;
    if (pRef.current) pRef.current.innerHTML = content.pHtml;
  }, [content]);

  useImperativeHandle(ref, () => ({
    getContent: () => {
      return {
        h1: { html: h1Ref.current?.innerHTML || '', style: elementStyles.h1 },
        h2: { html: h2Ref.current?.innerHTML || '', style: elementStyles.h2 },
        p: { html: pRef.current?.innerHTML || '', style: elementStyles.p },
      };
    },
    resetEditor: () => {
      setContent(JSON.parse(JSON.stringify(initialContent)));
      setElementStyles(JSON.parse(JSON.stringify(initialStyles)));
      setActiveElement("h1");
    },
    loadDocument: (docData) => {
      const newStyles = {
        h1: docData.h1Style || initialStyles.h1,
        h2: docData.h2Style || initialStyles.h2,
        p: docData.pStyle || initialStyles.p,
      };
      const newContent = {
        h1Html: docData.h1Html || initialContent.h1Html,
        h2Html: docData.h2Html || initialContent.h2Html,
        pHtml: docData.pHtml || initialContent.pHtml,
      };

      ensureFontLoaded(newStyles.h1.fontFamily);
      ensureFontLoaded(newStyles.h2.fontFamily);
      ensureFontLoaded(newStyles.p.fontFamily);
      
      setElementStyles(newStyles);
      setContent(newContent);
      setActiveElement("h1");
    },
    getStylesForExport: () => {
        const fontLinks = Array.from(document.head.querySelectorAll('link.dynamic-font'))
                                .map(link => link.outerHTML)
                                .join('\n');
        return fontLinks;
    }
  }));

  const updateStyle = (property, value) => {
    setElementStyles((prevStyles) => ({
      ...prevStyles,
      [activeElement]: { ...prevStyles[activeElement], [property]: value },
    }));
  };

  const handleFontChange = (e) => {
    const font = e.target.value;
    ensureFontLoaded(font);
    updateStyle("fontFamily", `"${font}", sans-serif`);
  };

  const handleContentChange = (elementType, newHtml) => {
    setContent(prev => ({...prev, [`${elementType}Html`]: newHtml}));
  };

  const handleFontWeightChange = (e) => updateStyle("fontWeight", e.target.value);
  const handleFontSizeChange = (e) => updateStyle("fontSize", e.target.value);
  const handleTextColorChange = (e) => updateStyle("color", e.target.value);

  const toggleItalic = () => {
    const current = elementStyles[activeElement].fontStyle;
    updateStyle("fontStyle", current === "italic" ? "normal" : "italic");
  };

  const handleAlignment = (alignment) => updateStyle("textAlign", alignment);
  const isActive = (property, value) => elementStyles[activeElement]?.[property] === value ? "active" : "";

  return (
    <div id="main" className="editor-wrapper"> {/* Renamed class */}
      <div className="form-group">
        <div className="toolbar d-flex align-items-center">
          <div className="font-switcher">
            <select id="fontSelector" className="form-select"
              value={elementStyles[activeElement]?.fontFamily.replace(/"/g, "").split(",")[0] || Object.keys(fonts)[0]}
              onChange={handleFontChange}>
              {Object.keys(fonts).map((fontName) => <option key={fontName} value={fontName}>{fontName}</option>)}
            </select>
          </div>
          <select id="fontWeight" className="form-select" value={elementStyles[activeElement]?.fontWeight || "400"} onChange={handleFontWeightChange}>
            {fontWeights.map((fw) => <option key={fw.value} value={fw.value}>{fw.label}</option>)}
          </select>
          <select id="fontSize" className="form-select" value={elementStyles[activeElement]?.fontSize || "16px"} onChange={handleFontSizeChange}>
            {fontSizes.map((size) => <option key={size} value={size}>{size}</option>)}
          </select>
          <div>
            <div id="textFormat">
              <input type="color" id="textColor" className="form-control" title="Text Color" value={elementStyles[activeElement]?.color || "#ffffff"} onChange={handleTextColorChange}/>
              <button id="styleItalic" className={`btn ${isActive("fontStyle", "italic")}`} title="Italic" onClick={toggleItalic}><span className="material-symbols-rounded">format_italic</span></button>
              <button id="alignLeft" className={`btn ${isActive("textAlign", "left")}`} title="Align Left" onClick={() => handleAlignment("left")}><span className="material-symbols-rounded">format_align_left</span></button>
              <button id="alignCenter" className={`btn ${isActive("textAlign", "center")}`} title="Align Center" onClick={() => handleAlignment("center")}><span className="material-symbols-rounded">format_align_center</span></button>
              <button id="alignRight" className={`btn ${isActive("textAlign", "right")}`} title="Align Right" onClick={() => handleAlignment("right")}><span className="material-symbols-rounded">format_align_right</span></button>
              <button id="alignJustify" className={`btn ${isActive("textAlign", "justify")}`} title="Justify" onClick={() => handleAlignment("justify")}><span className="material-symbols-rounded">format_align_justify</span></button>
            </div>
          </div>
        </div>
      </div>
      <div className="text-area">
        <h1 ref={h1Ref} id="editableHeading" contentEditable suppressContentEditableWarning
            onClick={() => setActiveElement("h1")} style={elementStyles.h1}
            onBlur={(e) => handleContentChange('h1', e.currentTarget.innerHTML)}
        />
        <h2 ref={h2Ref} contentEditable suppressContentEditableWarning
            onClick={() => setActiveElement("h2")} style={elementStyles.h2}
            onBlur={(e) => handleContentChange('h2', e.currentTarget.innerHTML)}
        />
        <p ref={pRef} contentEditable suppressContentEditableWarning
            onClick={() => setActiveElement("p")} style={elementStyles.p}
            onBlur={(e) => handleContentChange('p', e.currentTarget.innerHTML)}
        />
      </div>
    </div>
  );
});
Editor.displayName = 'Editor';
export default Editor;
