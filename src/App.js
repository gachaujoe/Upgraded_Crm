// import { useState, useEffect } from 'react';
// import { initializeApp } from 'firebase/app';
// import { getAuth, signInWithCustomToken, signInAnonymously } from 'firebase/auth';
// import { getFirestore, doc, setDoc, onSnapshot, collection, addDoc, getDoc, serverTimestamp, query, where, updateDoc } from 'firebase/firestore';

// // Main App component
// export default function App() {
//   // State variables for Firebase services and user data
//   const [db, setDb] = useState(null);
//   const [auth, setAuth] = useState(null);
//   const [userId, setUserId] = useState(null);
//   const [appId, setAppId] = useState('');
//   const [isAuthReady, setIsAuthReady] = useState(false);

//   // State for application data and UIits 
//   const [clients, setClients] = useState([]);
//   const [newClientName, setNewClientName] = useState('');
//   const [newClientEmail, setNewClientEmail] = useState('');
//   const [selectedClientId, setSelectedClientId] = useState(null);
//   const [issueTitle, setIssueTitle] = useState('');
//   const [issueDescription, setIssueDescription] = useState('');

//   // ------------------
//   // Firebase Initialization & Authentication
//   // ------------------
//   useEffect(() => {
//     // This effect runs once to initialize Firebase and handle authentication
//     try {
//       // Accessing global variables for Firebase configuration and auth token
//       const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
//       const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
//       const currentAppId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

//       const app = initializeApp(firebaseConfig);
//       const firestore = getFirestore(app);
//       const authService = getAuth(app);

//       setDb(firestore);
//       setAuth(authService);
//       setAppId(currentAppId);

//       // Sign in the user using the custom token or anonymously if no token is available
//       const authenticate = async () => {
//         try {
//           if (initialAuthToken) {
//             await signInWithCustomToken(authService, initialAuthToken);
//           } else {
//             await signInAnonymously(authService);
//           }
//           setIsAuthReady(true);
//         } catch (error) {
//           console.error("Firebase Auth error:", error);
//           setIsAuthReady(true);
//         }
//       };

//       authenticate();
//     } catch (error) {
//       console.error("Failed to initialize Firebase:", error);
//     }
//   }, []);

//   // ------------------
//   // Real-time Data Fetching
//   // ------------------
//   useEffect(() => {
//     // This effect listens for real-time changes to the clients collection
//     if (!db || !isAuthReady) return;

//     // Get the user's ID
//     const userId = auth.currentUser?.uid;
//     setUserId(userId);

//     // Construct the Firestore query for the user's private clients
//     const clientsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/clients`);
//     const q = query(clientsCollectionRef);

//     // Set up a real-time listener (onSnapshot)
//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       const clientsList = [];
//       snapshot.forEach(doc => {
//         clientsList.push({ id: doc.id, ...doc.data() });
//       });
//       setClients(clientsList);
//     }, (error) => {
//       console.error("Error fetching clients:", error);
//     });

//     // Cleanup function to detach the listener when the component unmounts
//     return () => unsubscribe();
//   }, [db, auth, appId, isAuthReady]);

//   // ------------------
//   // CRUD Operations & Handlers
//   // ------------------

//   // Handler for adding a new client
//   const handleAddClient = async (e) => {
//     e.preventDefault();
//     if (!newClientName || !userId) return;

//     try {
//       const clientsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/clients`);
//       const newClient = {
//         name: newClientName,
//         email: newClientEmail,
//         issues: [],
//         createdAt: serverTimestamp(),
//       };
//       await addDoc(clientsCollectionRef, newClient);
//       setNewClientName('');
//       setNewClientEmail('');
//     } catch (error) {
//       console.error("Error adding client:", error);
//     }
//   };

//   // Handler for selecting a client to view/add issues
//   const handleSelectClient = (clientId) => {
//     setSelectedClientId(selectedClientId === clientId ? null : clientId);
//   };

//   // Handler for adding a new issue to a client
//   const handleAddIssue = async (e) => {
//     e.preventDefault();
//     if (!issueTitle || !issueDescription || !selectedClientId) return;

//     try {
//       const clientDocRef = doc(db, `artifacts/${appId}/users/${userId}/clients/${selectedClientId}`);
//       const clientDoc = await getDoc(clientDocRef);

//       if (clientDoc.exists()) {
//         const currentIssues = clientDoc.data().issues || [];
//         const newIssue = {
//           title: issueTitle,
//           description: issueDescription,
//           status: 'Open',
//           createdAt: serverTimestamp(),
//         };
//         const updatedIssues = [...currentIssues, newIssue];
//         await updateDoc(clientDocRef, { issues: updatedIssues });

//         setIssueTitle('');
//         setIssueDescription('');
//       }
//     } catch (error) {
//       console.error("Error adding issue:", error);
//     }
//   };

//   // ------------------
//   // UI Rendering
//   // ------------------

//   if (!isAuthReady) {
//     return (
//       <div className="flex items-center justify-center h-screen bg-gray-100">
//         <p className="text-gray-600 text-lg">Loading CRM...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-100 p-4 sm:p-8 flex flex-col items-center">
//       <div className="max-w-3xl w-full">
//         <header className="bg-white rounded-xl shadow-lg p-6 mb-8 text-center">
//           <h1 className="text-3xl font-bold text-gray-800">Simple Client CRM</h1>
//           <p className="text-sm text-gray-500 mt-1">User ID: <span className="font-mono text-xs break-all">{userId}</span></p>
//         </header>

//         {/* Client Creation Form */}
//         <section className="bg-white rounded-xl shadow-lg p-6 mb-8">
//           <h2 className="text-2xl font-semibold text-gray-800 mb-4">Add New Client</h2>
//           <form onSubmit={handleAddClient} className="flex flex-col sm:flex-row gap-4">
//             <input
//               type="text"
//               value={newClientName}
//               onChange={(e) => setNewClientName(e.target.value)}
//               placeholder="Client Name"
//               required
//               className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//             />
//             <input
//               type="email"
//               value={newClientEmail}
//               onChange={(e) => setNewClientEmail(e.target.value)}
//               placeholder="Client Email"
//               className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//             />
//             <button
//               type="submit"
//               className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out"
//             >
//               Add Client
//             </button>
//           </form>
//         </section>

//         {/* Client List */}
//         <section className="bg-white rounded-xl shadow-lg p-6">
//           <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Clients</h2>
//           {clients.length === 0 ? (
//             <p className="text-gray-500 italic text-center">No clients added yet. Start by adding one above!</p>
//           ) : (
//             <div className="flex flex-col gap-4">
//               {clients.map(client => (
//                 <div key={client.id} className="bg-gray-50 rounded-xl p-4 cursor-pointer hover:bg-gray-100 transition duration-200" onClick={() => handleSelectClient(client.id)}>
//                   <div className="flex items-center justify-between">
//                     <h3 className="text-xl font-medium text-gray-900">{client.name}</h3>
//                     <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 transform transition-transform ${selectedClientId === client.id ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
//                       <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
//                     </svg>
//                   </div>
//                   {/* Client Details and Issues Section */}
//                   {selectedClientId === client.id && (
//                     <div className="mt-4 border-t pt-4">
//                       <p className="text-sm text-gray-600"><strong>Email:</strong> {client.email}</p>
//                       <h4 className="text-lg font-semibold mt-4 mb-2">Issues</h4>
//                       {client.issues && client.issues.length > 0 ? (
//                         <div className="space-y-2">
//                           {client.issues.map((issue, index) => (
//                             <div key={index} className="bg-white border rounded-lg p-3">
//                               <p className="text-sm font-semibold text-gray-800">{issue.title}</p>
//                               <p className="text-xs text-gray-500 mt-1">{issue.description}</p>
//                             </div>
//                           ))}
//                         </div>
//                       ) : (
//                         <p className="text-gray-500 italic text-sm">No issues recorded for this client.</p>
//                       )}

//                       {/* Add New Issue Form */}
//                       <form onSubmit={handleAddIssue} className="mt-6 flex flex-col gap-3">
//                         <h5 className="text-md font-semibold text-gray-800">Add New Issue</h5>
//                         <input
//                           type="text"
//                           value={issueTitle}
//                           onChange={(e) => setIssueTitle(e.target.value)}
//                           placeholder="Issue Title"
//                           required
//                           className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                         />
//                         <textarea
//                           value={issueDescription}
//                           onChange={(e) => setIssueDescription(e.target.value)}
//                           placeholder="Issue Description"
//                           required
//                           rows="3"
//                           className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                         ></textarea>
//                         <button
//                           type="submit"
//                           className="bg-green-600 text-white font-semibold py-2 rounded-lg hover:bg-green-700 transition duration-300 ease-in-out"
//                         >
//                           Add Issue
//                         </button>
//                       </form>
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}
//         </section>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from 'react';
// import { initializeApp } from 'firebase/app';
// import { getAuth, signInWithCustomToken, signInAnonymously } from 'firebase/auth';
// import { getFirestore, doc, setDoc, onSnapshot, collection, addDoc, getDoc, serverTimestamp, query, where, updateDoc } from 'firebase/firestore';

// Main App component
export default function App() {
  // State variables for Firebase services and user data
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [appId, setAppId] = useState('');
  const [isAuthReady, setIsAuthReady] = useState(true); // Changed to true to skip Firebase loading

  // State for application data and UIits 
  const [clients, setClients] = useState([]);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDescription, setIssueDescription] = useState('');

  // ------------------
  // Firebase Initialization & Authentication
  // ------------------
  useEffect(() => {
    // This effect is now disabled to prevent Firebase initialization.
    // If you want to re-enable Firebase, uncomment this entire block.
    /*
    try {
      const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
        // --- REPLACE WITH YOUR OWN FIREBASE CONFIG ---
        // apiKey: "YOUR_API_KEY",
        // authDomain: "YOUR_AUTH_DOMAIN",
        // projectId: "YOUR_PROJECT_ID",
        // storageBucket: "YOUR_STORAGE_BUCKET",
        // messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        // appId: "YOUR_APP_ID",
        // measurementId: "YOUR_MEASUREMENT_ID"
        // ----------------------------------------------
      };
      const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
      const currentAppId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

      const app = initializeApp(firebaseConfig);
      const firestore = getFirestore(app);
      const authService = getAuth(app);

      setDb(firestore);
      setAuth(authService);
      setAppId(currentAppId);

      const authenticate = async () => {
        try {
          if (initialAuthToken) {
            await signInWithCustomToken(authService, initialAuthToken);
          } else {
            await signInAnonymously(authService);
          }
          setIsAuthReady(true);
        } catch (error) {
          console.error("Firebase Auth error:", error);
          setIsAuthReady(true);
        }
      };

      authenticate();
    } catch (error) {
      console.error("Failed to initialize Firebase:", error);
    }
    */
  }, []);

  // ------------------
  // Real-time Data Fetching
  // ------------------
  useEffect(() => {
    // This real-time data fetching is disabled.
    // To re-enable, uncomment this entire block.
    /*
    if (!db || !isAuthReady) return;

    const userId = auth.currentUser?.uid;
    setUserId(userId);

    const clientsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/clients`);
    const q = query(clientsCollectionRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const clientsList = [];
      snapshot.forEach(doc => {
        clientsList.push({ id: doc.id, ...doc.data() });
      });
      setClients(clientsList);
    }, (error) => {
      console.error("Error fetching clients:", error);
    });

    return () => unsubscribe();
    */

    // Placeholder data for the UI to function without Firebase
    setClients([
        { id: '1', name: 'John Doe', email: 'john@example.com', issues: [{ title: 'Example Issue', description: 'This is a test issue.' }] },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', issues: [] }
    ]);
  }, []);

  // ------------------
  // CRUD Operations & Handlers
  // ------------------

  // Handler for adding a new client
  const handleAddClient = async (e) => {
    e.preventDefault();
    if (!newClientName) return;

    const newClient = {
      id: Math.random().toString(36).substr(2, 9), // Generate a random ID
      name: newClientName,
      email: newClientEmail,
      issues: [],
    };
    setClients(prevClients => [...prevClients, newClient]);
    setNewClientName('');
    setNewClientEmail('');
    
    // The Firebase logic below is disabled
    /*
    if (!userId) return;
    try {
      const clientsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/clients`);
      const newClient = {
        name: newClientName,
        email: newClientEmail,
        issues: [],
        createdAt: serverTimestamp(),
      };
      await addDoc(clientsCollectionRef, newClient);
      setNewClientName('');
      setNewClientEmail('');
    } catch (error) {
      console.error("Error adding client:", error);
    }
    */
  };

  // Handler for selecting a client to view/add issues
  const handleSelectClient = (clientId) => {
    setSelectedClientId(selectedClientId === clientId ? null : clientId);
  };

  // Handler for adding a new issue to a client
  const handleAddIssue = async (e) => {
    e.preventDefault();
    if (!issueTitle || !issueDescription || !selectedClientId) return;

    const updatedClients = clients.map(client => {
      if (client.id === selectedClientId) {
        const newIssue = { title: issueTitle, description: issueDescription };
        return { ...client, issues: [...client.issues, newIssue] };
      }
      return client;
    });
    setClients(updatedClients);
    setIssueTitle('');
    setIssueDescription('');
    
    // The Firebase logic below is disabled
    /*
    if (!userId) return;
    try {
      const clientDocRef = doc(db, `artifacts/${appId}/users/${userId}/clients/${selectedClientId}`);
      const clientDoc = await getDoc(clientDocRef);

      if (clientDoc.exists()) {
        const currentIssues = clientDoc.data().issues || [];
        const newIssue = {
          title: issueTitle,
          description: issueDescription,
          status: 'Open',
          createdAt: serverTimestamp(),
        };
        const updatedIssues = [...currentIssues, newIssue];
        await updateDoc(clientDocRef, { issues: updatedIssues });

        setIssueTitle('');
        setIssueDescription('');
      }
    } catch (error) {
      console.error("Error adding issue:", error);
    }
    */
  };

  // ------------------
  // UI Rendering
  // ------------------

  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-gray-600 text-lg">Loading CRM...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 flex flex-col items-center">
      <div className="max-w-3xl w-full">
        <header className="bg-white rounded-xl shadow-lg p-6 mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Simple Client CRM</h1>
          <p className="text-sm text-gray-500 mt-1">User ID: <span className="font-mono text-xs break-all">{userId}</span></p>
        </header>

        {/* Client Creation Form */}
        <section className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Add New Client</h2>
          <form onSubmit={handleAddClient} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              placeholder="Client Name"
              required
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              type="email"
              value={newClientEmail}
              onChange={(e) => setNewClientEmail(e.target.value)}
              placeholder="Client Email"
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out"
            >
              Add Client
            </button>
          </form>
        </section>

        {/* Client List */}
        <section className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Clients</h2>
          {clients.length === 0 ? (
            <p className="text-gray-500 italic text-center">No clients added yet. Start by adding one above!</p>
          ) : (
            <div className="flex flex-col gap-4">
              {clients.map(client => (
                <div key={client.id} className="bg-gray-50 rounded-xl p-4 cursor-pointer hover:bg-gray-100 transition duration-200" onClick={() => handleSelectClient(client.id)}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-medium text-gray-900">{client.name}</h3>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 transform transition-transform ${selectedClientId === client.id ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  {/* Client Details and Issues Section */}
                  {selectedClientId === client.id && (
                    <div className="mt-4 border-t pt-4">
                      <p className="text-sm text-gray-600"><strong>Email:</strong> {client.email}</p>
                      <h4 className="text-lg font-semibold mt-4 mb-2">Issues</h4>
                      {client.issues && client.issues.length > 0 ? (
                        <div className="space-y-2">
                          {client.issues.map((issue, index) => (
                            <div key={index} className="bg-white border rounded-lg p-3">
                              <p className="text-sm font-semibold text-gray-800">{issue.title}</p>
                              <p className="text-xs text-gray-500 mt-1">{issue.description}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic text-sm">No issues recorded for this client.</p>
                      )}

                      {/* Add New Issue Form */}
                      <form onSubmit={handleAddIssue} className="mt-6 flex flex-col gap-3">
                        <h5 className="text-md font-semibold text-gray-800">Add New Issue</h5>
                        <input
                          type="text"
                          value={issueTitle}
                          onChange={(e) => setIssueTitle(e.target.value)}
                          placeholder="Issue Title"
                          required
                          className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <textarea
                          value={issueDescription}
                          onChange={(e) => setIssueDescription(e.target.value)}
                          placeholder="Issue Description"
                          required
                          rows="3"
                          className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        ></textarea>
                        <button
                          type="submit"
                          className="bg-green-600 text-white font-semibold py-2 rounded-lg hover:bg-green-700 transition duration-300 ease-in-out"
                        >
                          Add Issue
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}


