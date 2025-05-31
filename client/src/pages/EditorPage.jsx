// EditorPage.jsx

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { db } from '../firebaseConfig';
import { collection, addDoc, getDocs, query, where, serverTimestamp, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import Copyright from '../components/Copyright';
import Editor from '../components/Editor';
import LoadModal from '../components/LoadModal';
import AlertModal from '../components/AlertModal';
import '../css/EditorPage.css';

const EditorPage = () => {
    const navigate = useNavigate();
    const auth = getAuth();
    const editorRef = useRef(null);
    const [user, setUser] = useState(null);

    const [currentDocumentId, setCurrentDocumentId] = useState(null);
    const [documentTitleInput, setDocumentTitleInput] = useState("Untitled Document");

    const [isLoadModalVisible, setIsLoadModalVisible] = useState(false);
    const [documentsList, setDocumentsList] = useState([]);
    
    const [alertState, setAlertState] = useState({ isVisible: false, title: '', message: '', type: 'info' });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false); // For save button state

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                setIsLoading(false);
            } else {
                setUser(null);
                setIsLoading(false);
                navigate('/');
            }
        });
        return () => unsubscribe();
    }, [auth, navigate]);
    
    useEffect(() => {
        if (editorRef.current && !isLoading && user) {
            editorRef.current.resetEditor();
        }
        setDocumentTitleInput("Untitled Document");
    }, [isLoading, user]);


    const showAlert = (title, message, type = 'info', duration = 3000, onConfirmCallback = null, confirmBtnText = null) => {
        setAlertState({ isVisible: true, title, message, type, onConfirm: onConfirmCallback, confirmText: confirmBtnText });
        if (type !== 'loading' && type !== 'warning' && duration) { // Don't auto-close loading or warning with confirm
            setTimeout(() => setAlertState(prev => ({ ...prev, isVisible: false })), duration);
        }
    };
    const closeAlert = () => setAlertState(prev => ({ ...prev, isVisible: false }));

    const handleNew = () => {
        if (editorRef.current) editorRef.current.resetEditor();
        setCurrentDocumentId(null);
        setDocumentTitleInput("Untitled Document");
    };

    const handleTitleInputChange = (e) => {
        setDocumentTitleInput(e.target.value);
    };

    const updateTitleInFirestore = useCallback(async (newTitle) => {
        if (currentDocumentId && user && newTitle) {
            try {
                const docRef = doc(db, "documents", currentDocumentId);
                await updateDoc(docRef, {
                    title: newTitle,
                    updatedAt: serverTimestamp()
                });
            } catch (error) {
                console.error("Error updating title in Firestore: ", error);
                showAlert("Error", "Failed to update document title in database.", "error");
            }
        }
    }, [currentDocumentId, user]);

    const handleTitleInputBlur = () => {
        const newTitle = documentTitleInput.trim() || "Untitled Document";
        if (newTitle !== documentTitleInput) { // If only whitespace was trimmed
            setDocumentTitleInput(newTitle);
        }
        if (currentDocumentId) { // Only save if it's an existing document
            updateTitleInFirestore(newTitle);
        }
    };


    const handleSave = async () => {
        if (!user || !editorRef.current || isSaving) return;
        setIsSaving(true);
        showAlert("Saving...", "Please wait.", "loading", 0); 
        
        const editorContentHTML = editorRef.current.getContentHTML();
        // const editorContentJSON = editorRef.current.getContentJSON(); // Alternative format

        const titleToSave = documentTitleInput.trim() || "Untitled Document";
        
        const docData = {
            userId: user.uid,
            title: titleToSave,
            editorContent: editorContentHTML, // Save HTML content
            // editorContent: editorContentJSON, // Or save JSON
            updatedAt: serverTimestamp(),
        };

        try {
            let docIdToUpdate = currentDocumentId;
            if (currentDocumentId) {
                await setDoc(doc(db, "documents", currentDocumentId), docData, { merge: true });
            } else {
                const docRef = await addDoc(collection(db, "documents"), {
                    ...docData,
                    createdAt: serverTimestamp(),
                });
                setCurrentDocumentId(docRef.id);
                docIdToUpdate = docRef.id;
            }
            if (documentTitleInput !== titleToSave) setDocumentTitleInput(titleToSave);
            showAlert("Success!", `Document "${titleToSave}" saved.`, "success");
        } catch (error) {
            console.error("Error saving document: ", error);
            showAlert("Error", "Failed to save document.", "error");
        } finally {
            setIsSaving(false);
            // closeAlert() might happen too soon if showAlert has a timeout, handle carefully
            if (alertState.type === 'loading') closeAlert();
        }
    };
    
    const handleLoadClick = async () => {
        if (!user) return;
        showAlert("Loading Documents...", "Fetching your saved notes.", "loading", 0);
        try {
            const q = query(collection(db, "documents"), where("userId", "==", user.uid), where("title", "!=", null)); // Ensure title exists
            const querySnapshot = await getDocs(q);
            const docs = querySnapshot.docs.map(d => ({ id: d.id, data: d.data() }));
            setDocumentsList(docs.sort((a,b) => (b.data.updatedAt?.seconds || 0) - (a.data.updatedAt?.seconds || 0) ));
            setIsLoadModalVisible(true);
            closeAlert();
        } catch (error) {
            console.error("Error fetching documents: ", error);
            showAlert("Error", "Failed to fetch documents.", "error");
        }
    };

    const handleSelectDocument = (data, id, title) => {
        if (editorRef.current) {
            // Assuming data.editorContent is HTML string for TipTap
            editorRef.current.setContent(data.editorContent || '', 'html');
        }
        setCurrentDocumentId(id);
        setDocumentTitleInput(title || "Untitled Document");
        setIsLoadModalVisible(false);
    };

    const handleDeleteDocument = async (docIdToDelete) => {
        if (!user || !docIdToDelete) return;
        
        showAlert(
            "Confirm Deletion", 
            `Are you sure you want to delete "${documentsList.find(d=>d.id === docIdToDelete)?.data.title || 'this document'}"? This cannot be undone.`,
            "warning", 
            0, // No auto-close
            async () => { // onConfirm callback
                closeAlert(); // Close the confirmation modal first
                showAlert("Deleting...", "Please wait.", "loading", 0);
                try {
                    await deleteDoc(doc(db, "documents", docIdToDelete));
                    setDocumentsList(prevDocs => prevDocs.filter(d => d.id !== docIdToDelete));
                    if (currentDocumentId === docIdToDelete) handleNew();
                    showAlert("Success", "Document deleted.", "success");
                } catch (error) {
                    console.error("Error deleting document: ", error);
                    showAlert("Error", "Failed to delete document.", "error");
                }
            },
            "Delete" // confirmText
        );
    };

    const handleExport = () => {
        if (editorRef.current) {
            const editorContentHTML = editorRef.current.getContentHTML();
            const htmlContent = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${documentTitleInput || "Exported Document"}</title><style>body { margin: 20px; background-color: #1e1e1e; color: #d4d4d4; font-family: 'Inter', sans-serif; } .ProseMirror {outline: none;} /* Basic reset for ProseMirror wrapper if it's included */</style></head><body>${editorContentHTML}</body></html>`;
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${(documentTitleInput || "document").replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            // Navigation to '/' is handled by the auth state listener
        } catch (error) {
            console.error('Error signing out:', error);
            showAlert("Error", "Failed to sign out.", "error");
        }
    };

    if (isLoading && !user) { 
      return <AlertModal isVisible={true} title="Loading" message="Initializing Noted..." type="loading" onClose={() => {}} />;
    }

    return (
        <div className='editor-page'>
            <AlertModal {...alertState} onClose={closeAlert} />
            <div className='banner'>
                <Navbar 
                    onNew={handleNew}
                    onExport={handleExport}
                    onSave={handleSave}
                    onLoad={handleLoadClick}
                    onLogout={handleLogout}
                />
            </div>
            <div className="document-title-bar">
                <input 
                    type="text" 
                    className="document-title-input-field"
                    value={documentTitleInput}
                    onChange={handleTitleInputChange}
                    onBlur={handleTitleInputBlur}
                    placeholder="Untitled Document"
                    disabled={isSaving}
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