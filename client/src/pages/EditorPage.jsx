import { } from 'react';
import Banner from '../components/Banner'
import Copyright from '../components/Copyright'
import Editor from '../components/Editor'
import '../css/EditorPage.css'

const EditorPage = () => {

    return (
        <div className='editor-page'>
            <header className='editor-header'>
                <Banner />
            </header>

            <main className='editor-content'>
                <h1>Untitled</h1>
                <Editor />
            </main>

            <footer className='editor-footer'>
                <Copyright />
            </footer>
        </div>
    );
};

export default EditorPage;
