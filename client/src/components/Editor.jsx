// src/Editor.jsx
import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import '../css/Editor.css';

const Editor = () => {
  const containerRef = useRef(null);
  const toolbarRef = useRef(null);

  useEffect(() => {
    console.clear();
    // Import and whitelist custom fonts
    const FontAttributor = Quill.import('formats/font');
    const fonts = ['impact', 'courier', 'comic'];
    FontAttributor.whitelist = fonts;
    Quill.register(FontAttributor, true);

    // Initialize the Quill editor with the custom toolbar
    new Quill(containerRef.current, {
      modules: {
        toolbar: toolbarRef.current
      },
      placeholder: 'Type something here',
      theme: 'snow'
    });
  }, []);

  return (
    <div className="editor-container">
      <div id="toolbar-container" ref={toolbarRef}>
        <select className="ql-line-height" defaultValue="1em">
          <option value="1em">1</option>
          <option value="1.1em">1.1</option>
          <option value="1.2em">1.2</option>
          <option value="1.3em">1.3</option>
          <option value="1.4em">1.4</option>
          <option value="1.5em">1.5</option>
          <option value="1.6em">1.6</option>
        </select>
        <select className="ql-font" defaultValue="impact">
          <option value="impact">Impact</option>
          <option value="courier">Courier</option>
          <option value="comic">Comic Sans MS</option>
        </select>
        <select className="ql-header" defaultValue="">
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
          <option value="4">Heading 4</option>
          <option value="">Normal</option>
        </select>
        <select className="ql-size" defaultValue="">
          <option value="small">Small</option>
          <option value="">Normal</option>
          <option value="large">Large</option>
          <option value="huge">Huge</option>
        </select>
        <button className="ql-bold"></button>
        <button className="ql-italic"></button>
        <button className="ql-underline"></button>
        <button className="ql-strike"></button>
        <button className="ql-script" value="sub"></button>
        <button className="ql-script" value="super"></button>
      </div>
      <div id="container" ref={containerRef} style={{ height: '300px' }}></div>
    </div>
  );
};

export default Editor;
