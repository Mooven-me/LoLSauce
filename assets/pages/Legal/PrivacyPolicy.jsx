import React from 'react';
import { Container, Card, CardBody, Button } from 'reactstrap';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
    const navigate = useNavigate();

    return (
        <Container className="py-5 text-white">
            <Button color="link" className="text-info mb-3 p-0" onClick={() => navigate('/')}>
                &larr; Back to Home
            </Button>
            <h1>Privacy Policy</h1>
            <p className="lead">Last updated: {new Date().toLocaleDateString()}</p>

            <Card className="bg-dark text-white-50 border-secondary mb-4 text-start">
                <CardBody>
                    <h4>1. Information We Collect</h4>
                    <p>
                        We collect the minimum amount of data necessary to provide the game service:
                        <ul>
                            <li><strong>Account Data:</strong> Username, email (for authentication only), and encrypted password.</li>
                            <li><strong>Game Data:</strong> Scores and chat messages (stored temporarily during the game session).</li>
                        </ul>
                    </p>

                    <h4>2. How We Use Your Information</h4>
                    <p>
                        Your data is used strictly to:
                        <ul>
                            <li>Authenticate you and maintain your session.</li>
                            <li>Display your username and score to other players in your private room.</li>
                        </ul>
                        We <strong>do not</strong> sell your data, analyze it for marketing, or share it with third parties.
                        We do not use Google Analytics or similar tracking tools.
                    </p>

                    <h4>3. Data Retention</h4>
                    <p>
                        <strong>Inactive Accounts:</strong> We retain user data for a maximum of 2 months of inactivity.
                        After this period, your account and associated data may be permanently deleted.
                        <br />
                        <strong>Chat Data:</strong> Chat messages are non-persistent. They are broadcast to the room
                        in real-time and are not stored in a permanent database history.
                    </p>

                    <h4>4. Cookies & Local Storage</h4>
                    <p>
                        We use strict <code>HttpOnly</code> cookies to manage your secure session and refresh tokens.
                        These cookies are essential for the application to function and cannot be accessed by client-side scripts.
                    </p>

                    <h4>5. Technical Clarifications</h4>
                    <p>
                        <strong>"Notifications":</strong> Our system uses internal signaling (Mercure protocol) to update
                        the game state in real-time. We do not send push notifications to your device or browser outside of the active game window.
                    </p>

                    <h4>6. Third-Party Services</h4>
                    <p>
                        This application is hosted independently using Docker. We do not share data with external ad networks or data brokers.
                    </p>

                    <h4>7. Owner Information</h4>
                    <p>
                        Data Controller: Gabin Legrand<br/>
                        Contact: gabinlegrand56@gmail.com
                    </p>
                </CardBody>
            </Card>
        </Container>
    );
}