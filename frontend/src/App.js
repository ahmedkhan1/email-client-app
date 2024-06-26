import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
// import { useParams } from 'react-router-dom';

let userId = "";
let ws = "";

function App() {

  const [emails, setEmails] = useState([]);
  const [account, setAccount] = useState("");
  const [loader, setLoader] = useState(false);
  const [provider, setProvider] = useState('Outlook'); // Default provider


  useEffect(() => {
    const fetchEmails = async () => {
      const params = new URLSearchParams(window.location.search);

      if(params.get('userId') && params.get('email')){
        userId= params.get('userId');
        localStorage.setItem("userId", userId);
        localStorage.setItem("email", params.get('email'))
        setAccount(params.get('email'));
        connectToSocket(fetchEmails);
      } else if(localStorage.getItem("userId")){
        userId= localStorage.getItem("userId");
        setAccount(params.get('email'))
        connectToSocket(fetchEmails);
      }
      
      try {
        const userId = localStorage.getItem("userId");
        if(userId){
          const mailBox = await fetchMailBoxes(userId); // Fetch MailBox here
          const response = await axios.get(process.env.REACT_APP_BASE_URL + '/api/emails?userId=' + userId);
          const emailsWithMailBox = response.data.data.map(email => {
            const folder = mailBox.find(f => f.id === email.parentFolderId); // Assuming email has a parentFolderId field
            return { ...email, mailBoxName: folder ? folder.displayName : 'Unknown' };
          });
          setEmails(emailsWithMailBox);
          setLoader(false);
        }

      } catch (error) {
        console.error('Error fetching emails:', error);
      }
    };

    fetchEmails();

    return () => {
      if(ws) ws.close();
    };

  }, []);

  const handleAddAccount = async () => {
    try {
      const response = await axios.post(process.env.REACT_APP_BASE_URL+`/auth/create_account`,{ provider });
      const { authUrl } = response.data;
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error fetching OAuth URL:', error);
    }
  };

  const connectToSocket = (fetchEmails) => {
    ws = new WebSocket('ws://localhost:3000');
    ws.onmessage = (event) => {
      setLoader(true);
      const message = JSON.parse(event.data);
      console.log('WebSocket message received:', message);
      if (message.type === 'syncStart') {
        console.log(`Sync started for user ${message.userId}`);
      } else if (message.type === 'mailboxSynced') {
        console.log(`Mailbox synced: ${message.mailbox.displayName}`);
      } else if (message.type === 'syncComplete') {
        console.log(`Sync complete for user ${message.userId}`);
        fetchEmails();
      }
    };
  }

  const fetchMailBoxes = async (userId) => {
    try {
      const response = await axios.get(process.env.REACT_APP_BASE_URL + `/api/mailboxes?userId=${userId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching folders:', error);
      return [];
    }
  };

  const getFlagStatus = (status) => {
    if(status === "notFlagged"){
      return "false";
    }
    return "true";
  };

  return (
    <div className="App">
      <div className='form-section'>
        <div className="provider-select">
          <label>Select Email Provider: </label>
          <select value={provider} onChange={(e) => setProvider(e.target.value)}>
            <option value="Outlook">Outlook</option>
          </select>
        </div>

        
        <button className="add-account-btn" onClick={handleAddAccount}>
          { (account)? " Update Account" : " Add Account" }
        </button>
      </div>
      
      {
        account && 
        <span>Linked account: {account}</span>
      }
      <div className='email-grid'>
        <div className='loader'>
          {
            loader &&
            <span>loading...</span>
          }
        </div>
        <table className="email-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Sender</th>
              <th>MailBox</th>
              <th>isRead</th>
              <th>isFlagged</th>
            </tr>
          </thead>
          <tbody>
            {emails && emails.map((email) => (
              <tr key={email.id}>
                <td>{email.subject}</td>
                {
                  email.sender &&
                  <td>{email.sender.emailAddress.address}</td>
                }
                <td>{email.mailBoxName}</td>
                <td>{(email.isRead)? "true": "false"}</td>
                <td>{getFlagStatus(email.flag.flagStatus)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
