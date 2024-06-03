import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
// import { useParams } from 'react-router-dom';

let userId = "";
function App() {

  const [emails, setEmails] = useState([]);
  const [account, setAccount] = useState("");
  const [provider, setProvider] = useState('Outlook'); // Default provider

  const handleAddAccount = async () => {
    try {
      const response = await axios.post(process.env.REACT_APP_BASE_URL+`/auth/create_account`,{ provider });
      const { authUrl } = response.data;
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error fetching OAuth URL:', error);
    }
  };

  useEffect(() => {
    const fetchEmails = async () => {
      const params = new URLSearchParams(window.location.search);

      if(params.get('userId') && params.get('email')){
        userId= params.get('userId');
        localStorage.setItem("userId", userId);
        localStorage.setItem("email", params.get('email'))
        setAccount(params.get('email'));
      } else if(localStorage.getItem("userId")){
        userId= localStorage.getItem("userId");
        setAccount(params.get('email'))
      }
      
      try {
        const userId = localStorage.getItem("userId");
        if(userId){
          const response = await axios.get(process.env.REACT_APP_BASE_URL+'/api/emails?userId='+userId);
          console.log(response.data.data);
          setEmails(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching emails:', error);
      }
    };

    fetchEmails();
  }, []);

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

      <table className="email-table">
        <thead>
          <tr>
            <th>Subject</th>
            <th>Sender</th>
            <th>isRead</th>
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
              <td>{email.isRead && email.isRead.toString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
