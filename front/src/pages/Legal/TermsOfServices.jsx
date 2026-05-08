import React from 'react';
import { Container, Card, CardBody, Button } from 'reactstrap';
import {useNavigate} from "react-router-dom";

export default function TermsOfService() {
    const navigate = useNavigate();

    return (
        <Container className="py-5 text-white text-start">
            <Button color="link" className="text-info mb-3 p-0" onClick={() => navigate('/')}>
                &larr; Back to Home
            </Button>
            <h1>Terms of Service</h1>
            <p className="lead">Last updated: {new Date().toLocaleDateString()}</p>

            <Card className="bg-dark text-white-50 border-secondary mb-4">
                <CardBody>
                    <h4>1. Acceptance of Terms</h4>
                    <p>
                        By accessing or using LoLSauce, you agree to be bound by these Terms of Service.
                        If you do not agree, please do not use our service.
                    </p>

                    <h4>2. Description of Service</h4>
                    <p>
                        LoLSauce is a fan-made web application offering interactive quizzes based on League of Legends.
                        The service is provided "as is" and is intended for personal, non-commercial entertainment purposes.
                    </p>
                    <p>
                        The game operates on a private "Room" basis. You are responsible for sharing your Room Code
                        only with users you wish to play with. We do not offer public matchmaking lists.
                    </p>

                    <h4>3. User Conduct</h4>
                    <p>
                        You agree not to use the service to:
                        <ul>
                            <li>Transmit any content that is unlawful, harmful, or abusive.</li>
                            <li>Harass or harm other users in the chat.</li>
                            <li>Attempt to reverse engineer or disrupt the service (e.g., spamming requests).</li>
                        </ul>
                    </p>

                    <h4>4. Riot Games Disclaimer</h4>
                    <p>
                        LoLSauce is not endorsed by Riot Games and does not reflect the views or opinions of Riot Games
                        or anyone officially involved in producing or managing Riot Games properties. Riot Games and all
                        associated properties are trademarks or registered trademarks of Riot Games, Inc.
                    </p>

                    <h4>5. Account & Data</h4>
                    <p>
                        Accounts are provided to track your in-game identity. We reserve the right to delete accounts
                        that have been inactive for more than 2 months to maintain server performance.
                    </p>

                    <h4>6. Liability</h4>
                    <p>
                        The service is provided by Gabin Legrand. We are not liable for any damages arising from the use
                        or inability to use the service.
                    </p>

                    <h4>7. Contact</h4>
                    <p>
                        For any legal inquiries, please contact: gabin.legrand@lolsauce.fr
                    </p>
                </CardBody>
            </Card>
        </Container>
    );
}