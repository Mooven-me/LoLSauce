import React, { useEffect, useState } from "react";
import { useRef } from "react";

const RealtimeChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState("guest");
  const [message, setMessage] = useState("");
  const eventSourceRef = useRef(null);

  useEffect(() => {
    // Replace with the actual public Mercure URL
    const url = new URL("https://localhost/.well-known/mercure");
    url.searchParams.append("topic", "https://chat.example.com/conversation");

    const es = new EventSource(url.toString(), { withCredentials: true });
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, data]);
    };

    es.onerror = (err) => {
      console.error("Mercure error", err);
    };

    return () => {
      es.close();
    };
  }, []);

  const sendMessage = async () => {
    await fetch("https://localhost/api/send-message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, message }),
    });
    setMessage("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Mercure Chat</h1>
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ marginRight: 10 }}
      />
      <input
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{ marginRight: 10 }}
      />
      <button onClick={sendMessage}>Send</button>

      <ul style={{ marginTop: 20 }}>
        {messages.map((msg, index) => (
          <li key={index}>
            <strong>{msg.username}</strong>: {msg.message}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RealtimeChatApp;
