import { } from 'react';
import Navbar from '../components/Navbar';
import Copyright from '../components/Copyright';
import Editor from '../components/AltEditor';
import '../css/EditorPage.css';

const EditorPage = () => {

    return (
        <div className='editor-page'>
          <div className='banner'>
                <Navbar />
          </div>
            <section className='content'>
                <Editor />
            </section>
            <footer className='footer'>
                <Copyright />
            </footer>
        </div>
    );
};

export default EditorPage;
