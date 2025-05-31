import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { db } from '../firebaseConfig'; // Import db
import { collection, addDoc, getDocs, query, where, serverTimestamp, doc, setDoc, deleteDoc } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import Copyright from '../components/Copyright';
import Editor from '../components/Editor'; // Renamed import
import LoadModal from '../components/LoadModal';
import '../css/EditorPage.css';

const EditorPage = () => {
    const navigate = useNavigate();
    const auth = getAuth();
    const editorRef = useRef(null);
    const [user, setUser] = useState(null);

    const [currentDocumentId, setCurrentDocumentId] = useState(null);
    const [currentDocumentTitle, setCurrentDocumentTitle] = useState("Untitled Document");
    const [isLoadModalVisible, setIsLoadModalVisible] = useState(false);
    const [documentsList, setDocumentsList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                setUser(null);
                navigate('/');
            }
        });
        return () => unsubscribe();
    }, [auth, navigate]);
    
    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.resetEditor(); // Initialize with default content
        }
    }, []);


    const handleNew = () => {
        if (editorRef.current) {
            editorRef.current.resetEditor();
        }
        setCurrentDocumentId(null);
        setCurrentDocumentTitle("Untitled Document");
    };

    const handleSave = async () => {
        if (!user || !editorRef.current) return;
        setIsLoading(true);
        const content = editorRef.current.getContent();
        
        let titleToSave = currentDocumentTitle;
        if (!currentDocumentId && (titleToSave === "Untitled Document" || !titleToSave)) {
             titleToSave = content.h1.html.replace(/<[^>]+>/g, '').trim() || `Doc ${new Date().toLocaleTimeString()}`;
             if (titleToSave.length > 50) titleToSave = titleToSave.substring(0, 50) + "...";
        }
        
        const docData = {
            userId: user.uid,
            title: titleToSave,
            h1Html: content.h1.html, h1Style: content.h1.style,
            h2Html: content.h2.html, h2Style: content.h2.style,
            pHtml: content.p.html, pStyle: content.p.style,
            updatedAt: serverTimestamp(),
        };

        try {
            if (currentDocumentId) {
                await setDoc(doc(db, "documents", currentDocumentId), docData, { merge: true });
            } else {
                const docRef = await addDoc(collection(db, "documents"), {
                    ...docData,
                    createdAt: serverTimestamp(),
                });
                setCurrentDocumentId(docRef.id);
            }
            setCurrentDocumentTitle(titleToSave);
            alert(`Document "${titleToSave}" saved successfully!`);
        } catch (error) {
            console.error("Error saving document: ", error);
            alert("Failed to save document.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleLoadClick = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const q = query(collection(db, "documents"), where("userId", "==", user.uid));
            const querySnapshot = await getDocs(q);
            const docs = querySnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }));
            setDocumentsList(docs.sort((a,b) => (b.data.updatedAt?.seconds || 0) - (a.data.updatedAt?.seconds || 0) ));
            setIsLoadModalVisible(true);
        } catch (error) {
            console.error("Error fetching documents: ", error);
            alert("Failed to fetch documents.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectDocument = (data, id, title) => {
        if (editorRef.current) {
            editorRef.current.loadDocument(data);
        }
        setCurrentDocumentId(id);
        setCurrentDocumentTitle(title);
        setIsLoadModalVisible(false);
    };

    const handleDeleteDocument = async (docIdToDelete) => {
        if (!user || !docIdToDelete) return;
        if (!window.confirm("Are you sure you want to delete this document? This action cannot be undone.")) return;
        
        setIsLoading(true);
        try {
            await deleteDoc(doc(db, "documents", docIdToDelete));
            setDocumentsList(prevDocs => prevDocs.filter(doc => doc.id !== docIdToDelete));
            if (currentDocumentId === docIdToDelete) {
                handleNew(); // Reset editor if current doc is deleted
            }
            alert("Document deleted successfully.");
        } catch (error) {
            console.error("Error deleting document: ", error);
            alert("Failed to delete document.");
        } finally {
            setIsLoading(false);
        }
    };


    const handleExport = () => {
        if (editorRef.current) {
            const content = editorRef.current.getContent();
            const loadedFontLinks = editorRef.current.getStylesForExport();
            const convertStyleObjectToString = (styleObj) => Object.entries(styleObj).map(([key, value]) => `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value};`).join(" ");
            const htmlContent = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${currentDocumentTitle || "Exported Document"}</title>${loadedFontLinks}<style>body { margin: 20px; background-color: #1e1e1e; color: #d4d4d4; font-family: 'Poppins', sans-serif; } h1, h2, p { margin-bottom: 1em; }</style></head><body><h1 style="${convertStyleObjectToString(content.h1.style)}">${content.h1.html}</h1><h2 style="${convertStyleObjectToString(content.h2.style)}">${content.h2.html}</h2><p style="${convertStyleObjectToString(content.p.style)}">${content.p.html}</p></body></html>`;
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${(currentDocumentTitle || "document").replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Error signing out:', error);
        }
        navigate('/');
    };

    if (!user || isLoading) {
        return <div className="loading-overlay">Loading Noted...</div>; // Basic loading state
    }

    return (
        <div className='editor-page'>
            <div className='banner'>
                <Navbar 
                    onNew={handleNew}
                    onExport={handleExport}
                    onSave={handleSave}
                    onLoad={handleLoadClick}
                    onLogout={handleLogout}
                />
            </div>
            <section className='content'>
                <Editor ref={editorRef} />
            </section>
            <footer className='footer'>
                <Copyright />
            </footer>
            <LoadModal
                isVisible={isLoadModalVisible}
                onClose={() => setIsLoadModalVisible(false)}
                documents={documentsList}
                onSelectDocument={handleSelectDocument}
                onDeleteDocument={handleDeleteDocument}
            />
        </div>
    );
};

export default EditorPage;
