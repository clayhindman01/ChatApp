import react, {useState, useRef, useEffect} from 'react';
import './App.css';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore'
import 'firebase/compat/auth'

import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'

firebase.initializeApp({
  apiKey: "AIzaSyBPLrb3chfyOKIaXkVw4JXnYZrC6dvDHJI",
  authDomain: "chat-app-19ad0.firebaseapp.com",
  projectId: "chat-app-19ad0",
  storageBucket: "chat-app-19ad0.appspot.com",
  messagingSenderId: "118720158759",
  appId: "1:118720158759:web:ae5d9d9ba9e7b45aa30202",
  measurementId: "G-YZ9YTB4MCS"
})

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {

  const [ user ] = useAuthState(auth);
  return (
    <div className='app'>
      <header>
        <SignOut />
      </header>
      <section>
        {user ? <Chatroom /> : <Signin /> }
      </section>
    </div>
  );
}

function Signin() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider;
    auth.signInWithPopup(provider);
  }

  return (
    <div className="sign-in-wrapper">
      <button onClick={signInWithGoogle} className="sign-in">Sign in with Google</button>
    </div>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()} className="sign-out">Sign Out</button>
  )
}

function Chatroom() {

  const dummy = useRef();

  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(50);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [ formValue, setFormValue ] = useState('');

  const sendMessage = async(e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;
    
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('')
    dummy.current.scrollIntoView({ behavior: 'smooth' })
  }
  
  useEffect(() => {
    dummy.current.scrollIntoView()
  })

  return (
    <>
      <div className="chat-room">
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

        <div ref={dummy}></div>
      </div>

      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />

        <button type="submit">Send</button>
    </form>
    </>
  );
}

function ChatMessage(props) {

  const { text, uid, photoURL } = props.message

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL}></img>
      <p>{text}</p> 
    </div>
  );
}

export default App;
